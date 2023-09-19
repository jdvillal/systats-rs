use serde::{Serialize, Deserialize};
use serde_json::json;
use sysinfo::{DiskExt, System, SystemExt};

#[derive(Debug, Serialize, Deserialize)]
pub struct DiskInfo {
    pub name: String,
    pub disk_type: String,
    pub moun_point: String,
    pub total_space: u64,
    pub available_space: u64,
    pub removable: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemDisksInformation {
    disks: Vec<DiskInfo>,
}

#[tauri::command]
pub fn get_system_disks_information() -> serde_json::Value {
    let mut system_disks_list: Vec<DiskInfo> = Vec::new();
    let mut sys = System::new_all();
    sys.refresh_disks_list();
    println!("Components: {:?}", sys.components().len());
    let disk_arr = sys.disks();
    for i in 0..disk_arr.len() {
        let type_str = match disk_arr[i].kind() {
            sysinfo::DiskKind::SSD => "SSD",
            sysinfo::DiskKind::HDD => "HDD",
            _ => "Unknown",
        };
        let disk_info = DiskInfo {
            name: String::from(disk_arr[i].name().to_str().unwrap_or_else(|| "")),
            disk_type: String::from(type_str),
            moun_point: String::from(disk_arr[i].mount_point().to_str().unwrap_or_else(|| "")),
            total_space: disk_arr[i].total_space(),
            available_space: disk_arr[i].available_space(),
            removable: disk_arr[i].is_removable(),
        };
        system_disks_list.push(disk_info);
    }
    json!(system_disks_list)
}