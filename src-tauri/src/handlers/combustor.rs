use std::{sync::{Mutex, Arc}, net::TcpListener, thread, time::Instant, ops::{Deref, DerefMut}, rc::Rc};
use tauri::State;
use tungstenite::accept;
use sysinfo::{System, SystemExt, CpuExt};

fn compute_mandelbrot(mut result: Box<[u8;1920000]>, a0: f64, b0: f64, af: f64, bf: f64, width: usize, height: usize, max_iterations: i32) -> Box<[u8; 1920000]>{
    //let now = Instant::now();
    let a_step: f64 = (af - a0).abs() / width as f64;
    let b_step: f64 = (bf - b0).abs() / height as f64;

    //let mut result = Box::new([0;1920000]);
    let mut index = 0;
    for i in 0..height{
        let py: f64 = b0 + (i as f64 * b_step);
        for j in 0..width{
            
            let px: f64 = a0 + (j as f64 * a_step);
            let mut iteration: i32 = 0;

            let mut x = 0.0;
            let mut y = 0.0;
            
            let mut x2 = 0f64;
            let mut y2 = 0f64;

            while x2 + y2 <= 4f64 && iteration < max_iterations {
                y = 2f64 * x * y + py;
                x = x2 - y2 + px;
                x2 = x * x;
                y2 = y * y;
                iteration = iteration + 1;
            }
            let n = iteration as f64;
            let red: f64 = 0.5 * (0.1 * n).sin() + 0.5;
            let green = 0.5 * (0.1 * n + 2.094).sin() + 0.5;
            let blue = 0.5 * (0.1 * n + 4.188).sin() + 0.5;

            result[index] = (red * 255 as f64) as u8;
            index += 1;
            result[index] = (green * 255 as f64) as u8;
            index += 1;
            result[index] = (blue * 255 as f64) as u8;
            index += 1;
        }
    }
    //println!("{}", now.elapsed().as_millis());
    result
}


#[tauri::command]
pub fn get_combustor_port(combustor_port: State<u16>) -> u16 {
    return *combustor_port.inner();
}

pub struct CombustorState{
    is_on: Box<bool>,
    thread_count: Mutex<u32>
}

impl CombustorState{
    pub fn new() -> Self{
        Self{is_on: Box::new(true), thread_count: Mutex::new(0)}
    }

}

#[tauri::command]
pub fn stop_combustor(combustor_state: State<Arc<CombustorState>>) -> bool {
    let mut is_on = Box::clone(&combustor_state.is_on);
    let is_on = is_on.deref_mut();
    if !*is_on{
        return false;
    }
    *is_on = false;
    return true;
}

pub fn initialize_combustor_service(combustor_state: Arc<CombustorState>) -> Result<u16,()>{
    let mut sys = System::new_all();
    sys.refresh_cpu();
    let max_threads = sys.cpus().len();
    let try_server = TcpListener::bind("127.0.0.1:0");
    let server = match try_server{
        Ok(s) => s,
        Err(_e) => return Err(()),
    };
    let try_port = server.local_addr();
    let port = match try_port {
        Ok(p) => p.port(),
        Err(_) => return Err(()), 
    };

    thread::spawn(move||{
        for stream in server.incoming(){
            println!("combustor-flag");
            let combustor_state_2 = Arc::clone(&combustor_state);
            thread::spawn(move||{
                let mut websocket = accept(stream.unwrap()).unwrap();
                let mut result = Box::new([0;1920000]);
                let is_on = Box::clone(&combustor_state_2.is_on);
                loop {
                    if !*is_on{
                        break;
                    }
                    result = compute_mandelbrot(result,-2f64, -2f64, 2f64, 2f64, 200, 200, 100);
                    let res = websocket.send(result.as_slice().into());
                    if res.is_err(){
                        _ = websocket.close(None);
                        break;
                    }
                    std::thread::sleep(std::time::Duration::from_millis(500));
                }
            });
            {
                let mut count = combustor_state.thread_count.lock().unwrap();
                *count = *count + 1;
                if *count >= max_threads as u32{
                    break
                }
            }
        }
    });
    Ok(port)
}