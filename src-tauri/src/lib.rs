pub mod api;
pub mod core;
use core::JwxkClient;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .manage(JwxkClient::new())
        .invoke_handler(tauri::generate_handler![
            api::get_captcha,
            api::login,
            api::check_session,
            api::get_course_list,
            api::grab_course,
            api::get_selected_courses,
            api::drop_course,
            api::get_class_types
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
