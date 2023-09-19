use std::{
    ops::DerefMut,
    sync::{Arc, Mutex},
    thread,
};

use sysinfo::{CpuExt, System, SystemExt};

pub fn start_cpu_monitor(cpu_timelapse_data_arc: Arc<Mutex<Vec<Vec<f32>>>>) {
    thread::spawn(move || {
        let mut sys = System::new_all();
        loop {
            sys.refresh_cpu();
            let mut current_usage: Vec<f32> = Vec::new();
            for cpu in sys.cpus() {
                current_usage.push(cpu.cpu_usage());
            }
            {
                let mut data_mutex_guard = cpu_timelapse_data_arc.lock().unwrap();
                let data = data_mutex_guard.deref_mut();
                data.push(current_usage);
                if data.len() > 120 {
                    data.remove(0);
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}
