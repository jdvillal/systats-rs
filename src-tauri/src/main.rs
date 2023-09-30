// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

use uuid::Uuid;
pub mod handlers;
pub mod streamers;
pub mod monitors;

fn main() {
    let session_id = Arc::new(Uuid::new_v4());
    monitors::initialize_monitors(Arc::clone(&session_id));
    tauri::Builder::default()
        .manage(session_id)
        .invoke_handler(tauri::generate_handler![
          handlers::get_app_session_id,
          handlers::cpu::get_cpu_information,
          handlers::memory::get_memory_information,
          handlers::disk::get_system_disks_information
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
