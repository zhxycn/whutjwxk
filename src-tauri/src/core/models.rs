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
