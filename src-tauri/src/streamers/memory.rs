use std::{sync::{Arc, Mutex}, net::TcpStream, ops::DerefMut};
use sysinfo::{System, SystemExt, CpuExt};
use tungstenite::WebSocket;

pub fn handle_timelapse_memory_utilization_websocket(
    timelapse_data_arc: Arc<Mutex<Vec<u64>>>,
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

pub fn handle_current_mememory_swap_usage_websocket(
    mut websocket: WebSocket<TcpStream>,
){
    let mut sys = System::new_all();
    loop{
        sys.refresh_memory();
        let current_mem = sys.used_memory();
        let current_swap = sys.used_swap();
        let resp_msg = format!("[{},{}]", current_mem, current_swap);
        let res = websocket.send(resp_msg.into());
        if res.is_err(){
            break;
        }
        std::thread::sleep(std::time::Duration::from_millis(500))
    }
    println!("websocket closed");
}