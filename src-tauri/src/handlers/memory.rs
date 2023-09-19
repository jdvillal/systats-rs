use serde::{Serialize, Deserialize};
use sysinfo::{System, SystemExt};

#[derive(Debug, Serialize, Deserialize)]
pub struct MemoryInfo {
    pub total: u64,

    pub total_swap: u64
}

#[tauri::command]
pub fn get_memory_information() -> serde_json::Value {
    let mut sys = System::new_all();
    sys.refresh_memory();

    let memory_info = MemoryInfo {
        total: sys.total_memory(),
        total_swap: sys.total_swap()
    };
    let res = serde_json::to_string(&memory_info);
    match res {
        Ok(s) => {
            return serde_json::from_str(&s).unwrap();
        }
        Err(_e) => {
            return serde_json::from_str("{}").unwrap();
        }
    };
}