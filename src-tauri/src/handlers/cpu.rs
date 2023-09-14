use serde::{Serialize, Deserialize};
use sysinfo::{System, SystemExt, CpuExt};

#[derive(Debug, Serialize, Deserialize)]
pub struct CpuInfo {
    pub vendor_id: String,
    pub brand: String,
    pub max_frequency: u64,
    pub physical_core_count: Option<usize>,
    pub logical_core_count: usize,
}

#[tauri::command]
pub fn get_cpu_information() -> serde_json::Value {
    let mut sys = System::new_all();
    sys.refresh_cpu();
    let cpus = sys.cpus();

    let cpu_info = CpuInfo {
        vendor_id: cpus[0].vendor_id().to_owned(),
        brand: cpus[0].brand().to_owned(),
        max_frequency: cpus[0].frequency(),
        physical_core_count: sys.physical_core_count(),
        logical_core_count: cpus.len(),
    };
    let res = serde_json::to_string(&cpu_info);
    match res {
        Ok(s) => {
            return serde_json::from_str(&s).unwrap();
        }
        Err(_e) => {
            return serde_json::from_str("{}").unwrap();
        }
    };
}