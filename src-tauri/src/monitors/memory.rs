use std::{
    ops::DerefMut,
    sync::{Arc, Mutex},
    thread,
};

use sysinfo::{System, SystemExt};
pub fn start_memory_monitor(memory_timelapse_data_arc: Arc<Mutex<Vec<u64>>>) {
    thread::spawn(move || {
        let mut sys = System::new_all();
        loop {
            sys.refresh_memory();
            let used_memory = sys.used_memory();
            {
                let mut data_mutex_guard = memory_timelapse_data_arc.lock().unwrap();
                let data = data_mutex_guard.deref_mut();
                data.push(used_memory);
                if data.len() > 120 {
                    data.remove(0);
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}
