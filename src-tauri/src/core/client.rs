use aes::cipher::{block_padding::Pkcs7, BlockEncryptMut, KeyInit};
use aes::Aes128;
use base64::{engine::general_purpose, Engine as _};
use ecb::Encryptor;
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

    pub fn aes_encrypt(plain_text: &str) -> String {
        let key = AES_KEY;
        let pt = plain_text.as_bytes();
        let cipher = Encryptor::<Aes128>::new(key.into());
        let ct = cipher.encrypt_padded_vec_mut::<Pkcs7>(pt);
        general_purpose::STANDARD.encode(ct)
    }
}
