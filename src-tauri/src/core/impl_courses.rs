use super::client::JwxkClient;
use super::models::CommandError;
use reqwest::header::{HeaderMap, HeaderValue, CONTENT_TYPE};

impl JwxkClient {
    pub async fn get_course_list(
        &self,
        batch_code: &str,
        class_type: &str,
        page: i32,
    ) -> Result<serde_json::Value, CommandError> {
        let url = "https://jwxk.whut.edu.cn/xsxk/elective/clazz/list";
        let token_guard = self.token.lock().await;
        let token = token_guard.as_ref().ok_or("Not logged in")?;

        let mut headers = HeaderMap::new();
        headers.insert("Authorization", HeaderValue::from_str(token).unwrap());
        headers.insert("Batchid", HeaderValue::from_str(batch_code).unwrap());

        let payload = serde_json::json!({
            "teachingClassType": class_type,
            "pageNumber": page,
            "pageSize": 1000,
            "orderBy": "",
            "campus": "02"
        });

        let resp = self
            .client
            .post(url)
            .headers(headers)
            .json(&payload)
            .send()
            .await
            .map_err(|e| CommandError::new("Network error during get_course_list", format!("{:?}", e)))?;

        let status = resp.status();
        let text = resp.text().await.map_err(|e| CommandError::new("Failed to read response text", format!("{:?}", e)))?;

        if !status.is_success() {
             return Err(CommandError::new(format!("Server returned error {}", status), text));
        }

        match serde_json::from_str::<serde_json::Value>(&text) {
            Ok(json) => Ok(json),
            Err(e) => Err(CommandError::new(format!("Failed to parse JSON: {}", e), text)),
        }
    }

    pub async fn get_class_types(
        &self,
        batch_id: &str,
    ) -> Result<serde_json::Value, CommandError> {
        let url = format!(
            "https://jwxk.whut.edu.cn/xsxk/elective/grablessons?batchId={}",
            batch_id
        );
        let token_guard = self.token.lock().await;
        let token = token_guard.as_ref().ok_or("Not logged in")?;

        let mut headers = HeaderMap::new();
        headers.insert("Authorization", HeaderValue::from_str(token).unwrap());
        headers.insert("batchId", HeaderValue::from_str(batch_id).unwrap());

        let resp = self
            .client
            .get(&url)
            .headers(headers)
            .send()
            .await
            .map_err(|e| CommandError::new("Network error during get_class_types", format!("{:?}", e)))?;

        let status = resp.status();
        let text = resp.text().await.map_err(|e| CommandError::new("Failed to read response text", format!("{:?}", e)))?;

        if !status.is_success() {
            return Err(CommandError::new(format!("Server returned error {}", status), text));
        }

        let marker = "grablessonsVue.menuData.menuList";
        let pos = text.find(marker).ok_or_else(|| CommandError::new("menuList not found".to_string(), text.clone()))?;
        let after = &text[pos..];
        let eq_pos = after.find('=').ok_or_else(|| CommandError::new("menuList assignment not found".to_string(), after.to_string()))?;
        let after_eq = &after[eq_pos + 1..];
        let start_bracket = after_eq.find('[').ok_or_else(|| CommandError::new("menuList array start not found".to_string(), after_eq.to_string()))?;
        let slice = &after_eq[start_bracket..];
        let end_pos = slice.find("];").ok_or_else(|| CommandError::new("menuList array end not found".to_string(), slice.to_string()))?;
        let array_str = slice[..end_pos + 1].trim().trim_end_matches(';');

        match serde_json::from_str::<serde_json::Value>(array_str) {
            Ok(list) => Ok(serde_json::json!({ "list": list })),
            Err(e) => Err(CommandError::new(format!("Failed to parse menuList JSON: {}", e), array_str.to_string())),
        }
    }

    pub async fn get_selected_courses(&self, batch_id: &str) -> Result<serde_json::Value, CommandError> {
        let url = "https://jwxk.whut.edu.cn/xsxk/elective/select";
        let token_guard = self.token.lock().await;
        let token = token_guard.as_ref().ok_or("Not logged in")?;

        let mut headers = HeaderMap::new();
        headers.insert("Authorization", HeaderValue::from_str(token).unwrap());
        headers.insert(
            CONTENT_TYPE,
            HeaderValue::from_static("application/json;charset=UTF-8"),
        );

        let payload = serde_json::json!({
            "batchId": batch_id
        });

        let resp = self
            .client
            .post(url)
            .headers(headers)
            .json(&payload)
            .send()
            .await
            .map_err(|e| CommandError::new("Network error during get_selected_courses", format!("{:?}", e)))?;

        let status = resp.status();
        let text = resp.text().await.map_err(|e| CommandError::new("Failed to read response text", format!("{:?}", e)))?;

        if !status.is_success() {
            return Err(CommandError::new(format!("Server returned error {}", status), text));
        }

        match serde_json::from_str::<serde_json::Value>(&text) {
            Ok(json) => Ok(json),
            Err(e) => Err(CommandError::new(format!("Failed to parse JSON: {}", e), text)),
        }
    }
}
