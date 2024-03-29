use crate::api_error::ApiError;
use crate::auth::hash_utils;
use crate::users::models::user::User;
use crate::AppState;
use axum::extract::State;
use axum::{http::StatusCode, Json};
use axum_extra::extract::WithRejection;
use dotenvy::var;
use log::info;
use mongodb::error::{ErrorKind, WriteFailure};
use serde::{Deserialize, Serialize};
use validator::Validate;

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(length(min = 3, max = 200))]
    pub username: String,
    #[validate(email)]
    pub email: String,
    #[validate(length(min = 8, max = 1024))]
    pub password: String,
    pub age: bool,
    pub cgu: bool,
}

#[derive(Debug, Serialize)]
pub struct RegisterResponse {
    pub message: String,
}

pub async fn register_handler(
    State(state): State<AppState>,
    WithRejection(Json(payload), _): WithRejection<Json<RegisterRequest>, ApiError>,
) -> Result<(StatusCode, Json<RegisterResponse>), ApiError> {
    payload
        .validate()
        .map_err(|_| ApiError::new(StatusCode::BAD_REQUEST, "Invalid or missing fields"))?;
    if !payload.age || !payload.cgu {
        return Err(ApiError::new(
            StatusCode::BAD_REQUEST,
            "Invalid or missing fields",
        ));
    }

    let hashed_password = hash_utils::hash(payload.password)?;
    let new_user = User::new(payload.username, payload.email, hashed_password);

    // Save user
    state
        .database
        .get_collection::<User>("users")
        .insert_one(&new_user, None)
        .await
        .map_err(|err| match *err.kind {
            ErrorKind::Write(WriteFailure::WriteError(error)) if error.code == 11000 => {
                ApiError::new(
                    StatusCode::CONFLICT,
                    "User with the same email already exists",
                )
            }
            _ => ApiError::new(
                StatusCode::INTERNAL_SERVER_ERROR,
                "Could not create your account due to a problem in the server",
            ),
        })?;

    // Send verification link
    let frontend_host = var("FRONTEND_HOST").unwrap_or("http://localhost:5173".to_owned());
    let link = format!(
        "{frontend_host}/verify-email/{}/{}",
        new_user.uuid,
        new_user.nonce.unwrap(),
    );
    let _ = state
        .mailer
        .send_mail(
            format!("{} <{}>", new_user.username, new_user.email),
            "Bienvenue sur Polynotes !".to_owned(),
            format!(
                "<h1>Bienvenue {} sur Polynotes ! 👋️<h1>\
                <p>Cliquez sur ce <a href=\"{link}\" target=\"_blank\">lien</a> pour vérifier ce compte.</p>\
                <p><small>\
                    Si vous n'êtes pas à l'origine de cette demande, \
                    aucune action supplémentaire de votre part n'est requise. \
                    Ignorez simplement ce message.\
                </small></p>",
                new_user.username,
            ),
        )
        .await;

    let user_email = &new_user.email;
    let user_uuid = new_user.uuid.to_string();
    info!("User \"{user_email}\" [{user_uuid}] registered in");

    Ok((
        StatusCode::CREATED,
        Json(RegisterResponse {
            message: "Verification email sent".to_owned(),
        }),
    ))
}
