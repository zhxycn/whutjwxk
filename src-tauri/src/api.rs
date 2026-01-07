use crate::core::{CaptchaResponse, CommandError, JwxkClient, LoginResponse};
use tauri::State;

#[tauri::command]
pub async fn get_captcha(state: State<'_, JwxkClient>) -> Result<CaptchaResponse, CommandError> {
    state.get_captcha().await
}

#[tauri::command]
pub async fn login(
    state: State<'_, JwxkClient>,
    loginname: String,
    password: String,
    captcha: String,
    uuid: String,
) -> Result<LoginResponse, CommandError> {
    state.login(&loginname, &password, &captcha, &uuid).await
}

#[tauri::command]
pub async fn check_session(state: State<'_, JwxkClient>) -> Result<LoginResponse, CommandError> {
    state.check_session().await
}

#[tauri::command]
pub async fn get_course_list(
    state: State<'_, JwxkClient>,
    batch_code: String,
    class_type: String,
    page: i32,
) -> Result<serde_json::Value, CommandError> {
    state.get_course_list(&batch_code, &class_type, page).await
}

#[tauri::command]
pub async fn grab_course(
    state: State<'_, JwxkClient>,
    clazz_id: String,
    secret_val: String,
    batch_id: String,
    clazz_type: String,
) -> Result<serde_json::Value, CommandError> {
    state
        .grab_course_with_type(&clazz_id, &secret_val, &batch_id, &clazz_type)
        .await
}

#[tauri::command]
pub async fn get_selected_courses(
    state: State<'_, JwxkClient>,
    batch_id: String,
) -> Result<serde_json::Value, CommandError> {
    state.get_selected_courses(&batch_id).await
}

#[tauri::command]
pub async fn drop_course(
    state: State<'_, JwxkClient>,
    clazz_id: String,
    secret_val: String,
    batch_id: String,
) -> Result<serde_json::Value, CommandError> {
    state.drop_course(&clazz_id, &secret_val, &batch_id).await
}

#[tauri::command]
pub async fn get_class_types(
    state: State<'_, JwxkClient>,
    batch_id: String,
) -> Result<serde_json::Value, CommandError> {
    state.get_class_types(&batch_id).await
}
