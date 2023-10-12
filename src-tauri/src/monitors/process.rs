use std::{
    collections::HashMap,
    ops::{Deref, DerefMut},
    sync::{Arc, RwLock},
    thread,
};

use serde::Serialize;
use sysinfo::{ProcessExt, System, SystemExt};

#[derive(Clone, Serialize)]
pub struct ProcessHistory {
    cpu_usage: Vec<f32>,
    mem_usage: Vec<u64>,
    disk_read_usage: Vec<u64>,
    disk_write_usage: Vec<u64>,
}

impl ProcessHistory {
    pub fn new() -> Self {
        ProcessHistory {
            cpu_usage: Vec::with_capacity(120),
            mem_usage: Vec::with_capacity(120),
            disk_read_usage: Vec::with_capacity(120),
            disk_write_usage: Vec::with_capacity(120),
        }
    }
    pub fn push_cpu_usage(&mut self, value: f32){
        self.cpu_usage.rotate_left(1);
        self.cpu_usage.push(value);
    }
    pub fn push_memory_usage(&mut self, value: u64){
        self.mem_usage.rotate_left(1);
        self.mem_usage.push(value);
    }
    pub fn push_disk_read_usage(&mut self, value: u64){
        self.disk_read_usage.rotate_left(1);
        self.disk_read_usage.push(value);
    }
    pub fn push_disk_write_usage(&mut self, value: u64){
        self.disk_write_usage.rotate_left(1);
        self.disk_write_usage.push(value);
    }
}

pub fn start_processes_monitor(recorded_processes: Arc<RwLock<HashMap<usize, ProcessHistory>>>) {
    thread::spawn(move || {
        //use rayon::prelude::*;
        let mut sys = System::new_all();
        loop {
            sys.refresh_processes();

            //println!("{}", sys.processes().len());
            let processes = sys.processes();
            for (key, process) in processes{
                let key: usize = (*key).into();
                
                let is_new = {
                    let p = recorded_processes.read().unwrap();
                    let p = p.deref();
                    if p.get(&key).is_none() {
                        true
                    } else {
                        false
                    }
                };

                if is_new {
                    let mut new_proc_hist = ProcessHistory::new();
                    new_proc_hist.push_cpu_usage(process.cpu_usage());
                    new_proc_hist.push_memory_usage(process.memory());
                    new_proc_hist.push_disk_read_usage(process.disk_usage().read_bytes);
                    new_proc_hist.push_disk_write_usage(process.disk_usage().written_bytes);
                    let mut p = recorded_processes.write().unwrap();
                    let p = p.deref_mut();
                    p.insert(key, new_proc_hist);
                } else {
                    let mut recorded_processes = recorded_processes.write().unwrap();
                    let mut recorded_processes = recorded_processes.deref_mut();
                    let process_hist = recorded_processes.deref_mut().get_mut(&key).unwrap();
                    process_hist.push_cpu_usage(process.cpu_usage());
                    process_hist.push_memory_usage(process.memory());
                    process_hist.push_disk_read_usage(process.disk_usage().read_bytes);
                    process_hist.push_disk_write_usage(process.disk_usage().written_bytes);
                }
            }
            std::thread::sleep(std::time::Duration::from_millis(500));
        }
    });
}
