use std::{sync::{Arc, Mutex}, net::TcpStream, ops::DerefMut};

use serde::Serialize;
use sysinfo::{System, SystemExt, CpuExt};
use tungstenite::WebSocket;

//MULTICORE
pub fn handle_timelapse_multicore_utilization_websocket(
    timelapse_data_arc: Arc<Mutex<Vec<Vec<f32>>>>,
    mut websocket: WebSocket<TcpStream>,
) {
    loop{
        let mut resp_msg = String::new();
        {
            let mut data_mutex_guard = timelapse_data_arc.lock().unwrap();
            let timelapse_data = data_mutex_guard.deref_mut();
            resp_msg.push_str(format!("{:?}", timelapse_data).as_str());
        }
        let res = websocket.send(resp_msg.into());
        if res.is_err() {
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
    println!("websocket closed");
}

pub fn handle_current_multicore_utilization_websocket(
    mut websocket: WebSocket<TcpStream>,
) {
    let mut sys = System::new_all();
    loop{
        sys.refresh_cpu();
        let mut resp_msg = String::new();
        let mut current_usage: Vec<f32> = Vec::new();
        for cpu in sys.cpus() {
            current_usage.push(cpu.cpu_usage());
        }
        resp_msg.push_str(format!("{:?}", current_usage).as_str());
        let res = websocket.send(resp_msg.into());
        if res.is_err(){
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
    println!("websocket closed");
}
//END MULTICORE


//SINGLE CORE
pub fn handle_timelapse_singlecore_utilization_websocket(
    timelapse_data_arc: Arc<Mutex<Vec<Vec<f32>>>>,
    mut websocket: WebSocket<TcpStream>,
) {
    loop{
        let mut resp_msg = String::new();
        let mut resp_data: Vec<f32> = Vec::new();
        //TODO: check timelapse of critic zone
        {
            let mut data_mutex_guard = timelapse_data_arc.lock().unwrap();
            let timelapse_data = data_mutex_guard.deref_mut();
            let core_count = timelapse_data.get(0).unwrap().len();
            for i in 0..timelapse_data.len(){
                let mut usage_sum = 0f32;
                for j in 0..core_count{
                    usage_sum += timelapse_data.get(i).unwrap().get(j).unwrap();
                }
                resp_data.push(usage_sum / core_count as f32);
            }
        }
        resp_msg.push_str(format!("{:?}", resp_data).as_str());
        let res = websocket.send(resp_msg.into());
        if res.is_err() {
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
    println!("websocket closed");
}

pub fn handle_current_singlecore_utilization_websocket(
    mut websocket: WebSocket<TcpStream>,
) {
    let mut sys = System::new_all();
    sys.refresh_cpu();
    let core_count = sys.cpus().len();
    loop{
        sys.refresh_cpu();
        let mut resp_msg = String::new();
        //let mut current_usage: Vec<f32> = Vec::new();
        let mut usage_sum = 0f32;
        for cpu in sys.cpus() {
            usage_sum += cpu.cpu_usage();
        }
        let current_usage = usage_sum / core_count as f32;
        resp_msg.push_str(format!("[{}]", current_usage).as_str());
        let res = websocket.send(resp_msg.into());
        if res.is_err(){
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(500));
    }
    println!("websocket closed");
}
//END SINGLECORE


//START SYSTEM GENERAL INFO

#[derive(Serialize)]
pub struct SystemStateInfo{
    frequency: u64,
    running_processes: usize,
    avg_load_one: f64,
    avg_load_five: f64,
    avg_load_fifteen: f64,
    uptime: u64,
    boot_time: u64,
    distribution_id: String,
    os_version: Option<String>
}

pub fn handle_current_system_state_websocket(
    mut websocket: WebSocket<TcpStream>,
) {
    let mut sys = System::new_all();
    sys.refresh_cpu();
    loop{
        sys.refresh_all();
        
        let mut max_freq = 0;
        for cpu in sys.cpus(){
            if cpu.frequency() > max_freq {
                max_freq = cpu.frequency();
            }
        }

        let sys_state_info = SystemStateInfo{
            frequency: max_freq,
            running_processes: sys.processes().len(),
            avg_load_one: sys.load_average().one,
            avg_load_five: sys.load_average().five,
            avg_load_fifteen: sys.load_average().fifteen,
            uptime: sys.uptime(),
            boot_time: sys.boot_time(),
            distribution_id: sys.distribution_id(),
            os_version: sys.os_version()
        };
        let resp_msg = serde_json::to_string(&sys_state_info).unwrap();
        //let mut current_usage: Vec<f32> = Vec::new();
        let res = websocket.send(resp_msg.into());
        if res.is_err(){
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(1000));
    }
    println!("websocket closed");
}
//END SYSTEM GENERAL INFO