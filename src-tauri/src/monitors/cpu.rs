use std::{
    net::TcpStream,
    ops::DerefMut,
    sync::{Arc, Mutex},
    thread,
};

use sysinfo::{CpuExt, System, SystemExt};
use tungstenite::WebSocket;

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
}
//END SINGLECORE