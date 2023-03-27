extern crate argon2;
mod auth;
mod db;
mod mailer;
mod pages;
mod users;

use crate::db::MongoDatabase;
use crate::mailer::LettreMailer;
use axum::routing::get;
use axum::{Json, Router};
use dotenvy::{dotenv, var};
use serde_json::{json, Value};
use tower_http::compression::CompressionLayer;

#[derive(Debug, Clone)]
pub struct AppState {
    database: MongoDatabase,
    mailer: LettreMailer,
}

#[tokio::main]
async fn main() {
    dotenv().expect(".env file not found");
    let port = var("PORT").unwrap_or("3000".to_owned());

    let state = AppState {
        database: MongoDatabase::new().await,
        mailer: LettreMailer::new().await,
    };

    let api_routes = Router::new()
        .route("/health", get(health_handler))
        .nest("/auth", auth::routes())
        .nest("/users", users::routes())
        .nest("/pages", pages::routes());

    let app = Router::new()
        .nest("/api/v1", api_routes)
        .with_state(state)
        .layer(CompressionLayer::new());

    axum::Server::bind(&format!("0.0.0.0:{port}").parse().unwrap())
        .serve(app.into_make_service())
        .await
        .unwrap();
}

async fn health_handler() -> Json<Value> {
    Json(json!({"isOk": "healthy ❤️" }))
}
