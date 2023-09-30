use std::{sync::{Mutex, Arc}, ops::Deref};

use tauri::State;
use uuid::Uuid;

pub mod cpu;
pub mod disk;
pub mod memory;



#[tauri::command]
pub fn get_app_session_id(state: State<Arc<Uuid>>) -> serde_json::Value {
    let id = state.inner().deref().as_bytes().clone();
    let res = serde_json::to_string(&id);
    match res {
        Ok(s) => {
            println!("{:?}", &s);
            return serde_json::from_str(&s).unwrap();
        }
        Err(_e) => {
            return serde_json::from_str("{}").unwrap();
        }
    };
}
