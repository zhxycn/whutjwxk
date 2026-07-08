use super::models::CommandError;
use aes::cipher::{block_padding::Pkcs7, BlockEncryptMut, KeyInit};
use aes::Aes128;
use base64::{engine::general_purpose, Engine as _};
use ecb::Encryptor;
use reqwest::header::{HeaderMap, HeaderValue};
use reqwest::Client;
use std::sync::Arc;
use tokio::sync::Mutex;

const AES_KEY: &[u8; 16] = b"MWMqg2tPcDkxcm11";

#[derive(Clone)]
pub struct JwxkClient {
    pub client: Client,
    pub token: Arc<Mutex<Option<String>>>,
    pub student_info: Arc<Mutex<Option<serde_json::Value>>>,
}

impl JwxkClient {
    pub fn new() -> Self {
        let client = Client::builder()
            .cookie_store(true)
            .user_agent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
            .build()
            .unwrap();

        JwxkClient {
            client,
            token: Arc::new(Mutex::new(None)),
            student_info: Arc::new(Mutex::new(None)),
        }
    }

    /// 取出 token 副本并立即释放锁，避免网络请求期间串行化所有命令
    pub async fn auth_headers(&self, batch_id: Option<&str>) -> Result<HeaderMap, CommandError> {
        let token = self
            .token
            .lock()
            .await
            .clone()
            .ok_or_else(|| CommandError::from("Not logged in"))?;

        let mut headers = HeaderMap::new();
        headers.insert(
            "Authorization",
            HeaderValue::from_str(&token)
                .map_err(|e| CommandError::new("Invalid token", format!("{:?}", e)))?,
        );
        if let Some(batch_id) = batch_id {
            headers.insert(
                "batchId",
                HeaderValue::from_str(batch_id)
                    .map_err(|e| CommandError::new("Invalid batchId", format!("{:?}", e)))?,
            );
        }
        Ok(headers)
    }

    pub fn aes_encrypt(plain_text: &str) -> String {
        let key = AES_KEY;
        let pt = plain_text.as_bytes();
        let cipher = Encryptor::<Aes128>::new(key.into());
        let ct = cipher.encrypt_padded_vec_mut::<Pkcs7>(pt);
        general_purpose::STANDARD.encode(ct)
    }
}
