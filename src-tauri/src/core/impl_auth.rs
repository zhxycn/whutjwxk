use super::client::JwxkClient;
use super::models::{CaptchaResponse, LoginResponse};
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE, ORIGIN, REFERER};

impl JwxkClient {
    pub async fn get_captcha(&self) -> Result<CaptchaResponse, String> {
        let url = "https://jwxk.whut.edu.cn/xsxk/auth/captcha";
        let resp = self
            .client
            .post(url)
            .send()
            .await
            .map_err(|e| e.to_string())?;
        let json: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;

        if json["code"].as_i64() == Some(200) {
            let data = &json["data"];
            Ok(CaptchaResponse {
                uuid: data["uuid"].as_str().unwrap_or("").to_string(),
                image_base64: data["captcha"].as_str().unwrap_or("").to_string(),
            })
        } else {
            Err("Failed to get captcha".to_string())
        }
    }

    pub async fn login(
        &self,
        loginname: &str,
        password: &str,
        captcha: &str,
        uuid: &str,
    ) -> Result<LoginResponse, String> {
        let url = "https://jwxk.whut.edu.cn/xsxk/auth/login";
        let encrypted_password = Self::aes_encrypt(password);

        let params = [
            ("loginname", loginname),
            ("password", &encrypted_password),
            ("captcha", captcha),
            ("uuid", uuid),
        ];

        let mut headers = HeaderMap::new();
        headers.insert(
            CONTENT_TYPE,
            HeaderValue::from_static("application/x-www-form-urlencoded"),
        );
        headers.insert(ORIGIN, HeaderValue::from_static("https://jwxk.whut.edu.cn"));
        headers.insert(
            REFERER,
            HeaderValue::from_static("https://jwxk.whut.edu.cn"),
        );
        headers.insert(
            "Accept",
            HeaderValue::from_static("application/json, text/plain, */*"),
        );
        headers.insert(
            "Accept-Language",
            HeaderValue::from_static("zh-CN,zh;q=0.9,en;q=0.8"),
        );

        let resp = self
            .client
            .post(url)
            .headers(headers)
            .body(serde_urlencoded::to_string(&params).unwrap_or_default())
            .send()
            .await
            .map_err(|e| e.to_string())?;

        let json: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;

        if json["code"].as_i64() == Some(200) {
            let token = json["data"]["token"].as_str().unwrap_or("").to_string();
            let student_info = json["data"]["student"].clone();

            let mut t = self.token.lock().await;
            *t = Some(token.clone());

            let mut s = self.student_info.lock().await;
            *s = Some(student_info.clone());

            Ok(LoginResponse {
                success: true,
                msg: None,
                token: Some(token),
                student_info: Some(student_info),
            })
        } else {
            Ok(LoginResponse {
                success: false,
                msg: json["msg"].as_str().map(|s| s.to_string()),
                token: None,
                student_info: None,
            })
        }
    }

    pub async fn check_session(&self) -> Result<LoginResponse, String> {
        let token_guard = self.token.lock().await;
        let student_guard = self.student_info.lock().await;

        if let (Some(token), Some(student)) = (token_guard.as_ref(), student_guard.as_ref()) {
            Ok(LoginResponse {
                success: true,
                msg: Some("Session restored".to_string()),
                token: Some(token.clone()),
                student_info: Some(student.clone()),
            })
        } else {
            Ok(LoginResponse {
                success: false,
                msg: Some("No active session".to_string()),
                token: None,
                student_info: None,
            })
        }
    }
}
