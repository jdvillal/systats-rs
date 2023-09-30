use std::{sync::Arc, ops::Deref};

use tauri::State;
use uuid::Uuid;

pub mod cpu;
pub mod disk;
pub mod memory;



#[tauri::command]
pub fn get_app_session_id(state: State<Arc<Uuid>>) -> String {
    state.inner().deref().to_string()
}
