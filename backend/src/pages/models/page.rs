use crate::pages::models::node::Node;
use bson::doc;
use bson::oid::ObjectId;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Page {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,
    #[serde(with = "bson::serde_helpers::uuid_1_as_binary")]
    pub uuid: Uuid,
    pub author: ObjectId,
    pub title: String,
    pub nodes: Vec<Node>,
    pub created_at: i64,
    pub updated_at: i64,
}
