use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct CaptchaResponse {
    pub uuid: String,
    pub image_base64: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct LoginResponse {
    pub success: bool,
    pub msg: Option<String>,
    pub token: Option<String>,
    pub student_info: Option<serde_json::Value>,
}

#[derive(Serialize, Debug)]
pub struct CommandError {
    pub msg: String,
    pub details: Option<String>,
}

impl CommandError {
    pub fn new(msg: impl Into<String>, details: impl Into<String>) -> Self {
        Self {
            msg: msg.into(),
            details: Some(details.into()),
        }
    }
}

impl From<String> for CommandError {
    fn from(msg: String) -> Self {
        Self { msg, details: None }
    }
}

impl From<&str> for CommandError {
    fn from(msg: &str) -> Self {
        Self {
            msg: msg.to_string(),
            details: None,
        }
    }
}
