use super::client::JwxkClient;
use super::CommandError;
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};

impl JwxkClient {
    pub async fn grab_course_with_type(
        &self,
        clazz_id: &str,
        secret_val: &str,
        batch_id: &str,
        clazz_type: &str,
    ) -> Result<serde_json::Value, CommandError> {
        let url = "https://jwxk.whut.edu.cn/xsxk/elective/clazz/add";
        let token_guard = self.token.lock().await;
        let token = token_guard
            .as_ref()
            .ok_or_else(|| CommandError::from("Not logged in".to_string()))?;

        let mut headers = HeaderMap::new();
        headers.insert("Authorization", HeaderValue::from_str(token).unwrap());
        headers.insert("batchId", HeaderValue::from_str(batch_id).unwrap());
        headers.insert(
            CONTENT_TYPE,
            HeaderValue::from_static("application/x-www-form-urlencoded"),
        );

        let params = [
            ("clazzType", clazz_type),
            ("clazzId", clazz_id),
            ("secretVal", secret_val),
        ];

        let resp = self
            .client
            .post(url)
            .headers(headers)
            .body(serde_urlencoded::to_string(&params).unwrap_or_default())
            .send()
            .await
            .map_err(|e| {
                CommandError::new("Network error during grab_course", format!("{:?}", e))
            })?;

        let json: serde_json::Value = resp.json().await.map_err(|e| {
            CommandError::new("Failed to parse grab_course response", format!("{:?}", e))
        })?;
        Ok(json)
    }

    pub async fn drop_course(
        &self,
        clazz_id: &str,
        secret_val: &str,
        batch_id: &str,
    ) -> Result<serde_json::Value, CommandError> {
        let url = "https://jwxk.whut.edu.cn/xsxk/elective/clazz/del";
        let token_guard = self.token.lock().await;
        let token = token_guard
            .as_ref()
            .ok_or_else(|| CommandError::from("Not logged in".to_string()))?;

        let mut headers = HeaderMap::new();
        headers.insert("Authorization", HeaderValue::from_str(token).unwrap());
        headers.insert("batchId", HeaderValue::from_str(batch_id).unwrap());
        headers.insert(
            CONTENT_TYPE,
            HeaderValue::from_static("application/x-www-form-urlencoded"),
        );

        let params = [
            ("clazzType", "YXKC"),
            ("clazzId", clazz_id),
            ("secretVal", secret_val),
            ("source", "yxkcyx"),
        ];

        let resp = self
            .client
            .post(url)
            .headers(headers)
            .body(serde_urlencoded::to_string(&params).unwrap_or_default())
            .send()
            .await
            .map_err(|e| {
                CommandError::new("Network error during drop_course", format!("{:?}", e))
            })?;

        let json: serde_json::Value = resp.json().await.map_err(|e| {
            CommandError::new("Failed to parse drop_course response", format!("{:?}", e))
        })?;
        Ok(json)
    }
}
