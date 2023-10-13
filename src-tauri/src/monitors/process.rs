use std::{
    collections::HashMap,
    ops::{Deref, DerefMut},
    sync::{Arc, RwLock},
    thread,
    time::Instant,
};

use serde::Serialize;
use sysinfo::{ProcessExt, System, SystemExt};

#[derive(Clone, Serialize)]
pub struct ProcessHistory {
    pid: usize,
    parent_pid: Option<usize>,
    name: String,
    cpu_usage: Vec<f32>,
    mem_usage: Vec<u64>,
    disk_read_usage: Vec<u64>,
    disk_write_usage: Vec<u64>,
}

impl ProcessHistory {
    pub fn new(pid: usize, parent_pid: Option<usize>, name: String) -> Self {
        let mut ph = ProcessHistory {
            pid,
            parent_pid,
            name,
            cpu_usage: Vec::with_capacity(120),
            mem_usage: Vec::with_capacity(120),
            disk_read_usage: Vec::with_capacity(120),
            disk_write_usage: Vec::with_capacity(120),
        };
        for _ in 0..120 {
            ph.cpu_usage.push(0.0);
            ph.mem_usage.push(0);
            ph.disk_read_usage.push(0);
            ph.disk_write_usage.push(0);
        }
        ph
    }
    pub fn push_cpu_usage(&mut self, value: f32) {
        self.cpu_usage.rotate_left(1);
        self.cpu_usage[119] = value;
    }
    pub fn push_memory_usage(&mut self, value: u64) {
        self.mem_usage.rotate_left(1);
        self.mem_usage[119] = value;
    }
    pub fn push_disk_read_usage(&mut self, value: u64) {
        self.disk_read_usage.rotate_left(1);
        self.disk_read_usage[119] = value;
    }
    pub fn push_disk_write_usage(&mut self, value: u64) {
        self.disk_write_usage.rotate_left(1);
        self.disk_write_usage[119] = value;
    }
}

pub fn start_processes_monitor(recorded_processes: Arc<RwLock<HashMap<usize, ProcessHistory>>>) {
    thread::spawn(move || {
        //use rayon::prelude::*;
        let mut sys = System::new_all();
        sys.refresh_cpu();
        let cpu_count = sys.cpus().len() as f32;
        loop {
            let now = Instant::now();
            sys.refresh_processes();

            let processes = sys.processes();
            //FIXME: use parallel iterators instead
            for (key, process) in processes {
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
                    let parent_pid: Option<usize> = match process.parent(){
                        Some(pid) => Some(pid.into()),
                        None => None,
                    };
                    let mut new_proc_hist = ProcessHistory::new(process.pid().into(), parent_pid, process.name().into());
                    new_proc_hist.push_cpu_usage(process.cpu_usage() / cpu_count);
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
                    process_hist.push_cpu_usage(process.cpu_usage() / cpu_count);
                    process_hist.push_memory_usage(process.memory());
                    process_hist.push_disk_read_usage(process.disk_usage().read_bytes);
                    process_hist.push_disk_write_usage(process.disk_usage().written_bytes);
                }
            }
            let elapsed = now.elapsed().as_millis() as u64;
            if elapsed >= 500 {
                continue;
            };
            std::thread::sleep(std::time::Duration::from_millis(500 - elapsed));
        }
    });
}
