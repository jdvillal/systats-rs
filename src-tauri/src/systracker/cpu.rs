use std::{sync::{Mutex, Arc, atomic::AtomicBool}, time::{Duration, Instant}, thread, ops::{DerefMut, Deref}};

use serde::Serialize;
use sysinfo::{System, SystemExt, CpuExt};

use super::TrackerCapacity;



/// Wraps a vector that contains the historial CPU-core usage recorded by the CpuTracker
/// over the lapse specified when `new_cpu_tracker()` or `new_cpu_tracker_with_capacity()`
/// was called.
#[derive(Debug, Clone, Serialize)]
pub struct CoreBuffer{
    buffer: Vec<f32>
}

impl CoreBuffer{
    fn new(capacity: usize) -> Self{
        let mut cb = CoreBuffer { buffer: Vec::with_capacity(capacity) };
        for _ in 0..capacity{
            cb.buffer.push(0f32)
        }
        cb
    }
}

/// A struct that represents a CPU usage tracker.
/// When created, it spawns a background thread that records the usage of each CPU-Core on the system.
/// The information is updated twice per second.
/// 
/// To get the recorded data up to 'now', call `fetch_usage()`
/// and to stop recording CPU usage, call `stop()`.
/// 
/// Once stoped, the `fetch_usage()` method will always return `None` 
pub struct CpuTracker{
    buffer: Arc<Mutex<Vec<CoreBuffer>>>,
    stop_flag: Arc<AtomicBool>,
    capacity: TrackerCapacity
}

impl CpuTracker{
    pub (crate) fn default() -> CpuTracker{
        CpuTracker::with_capacity(TrackerCapacity::ONE) 
    }

    //
    //Create a tracker that records each cpu on the system for the specified lapse
    //
    pub (crate) fn with_capacity(minutes: TrackerCapacity) -> CpuTracker{
        let capacity: usize = minutes.to_buffer_size();
        let mut sys = System::new_all();
        sys.refresh_cpu();

        let mut buff: Vec<CoreBuffer> = Vec::with_capacity(sys.cpus().len());
        for _ in sys.cpus(){
            buff.push(CoreBuffer::new(capacity));
        }
        let tracker = CpuTracker{
            buffer: Arc::new(Mutex::new(buff)),
            stop_flag: Arc::new(AtomicBool::new(false)),
            capacity: minutes
        };
        let tracker_buffer = Arc::clone(&tracker.buffer);
        let stop_flag = Arc::clone(&tracker.stop_flag);
        refresh_loop(sys, tracker.capacity, tracker_buffer, stop_flag);
        tracker
    }
    /// Stop the background thread that updates the buffer where
    /// historical CPU usage information is saved.
    /// 
    /// Consider that calling this method will make later calls to `fetch_usage()`
    /// always return `None`.
    pub fn stop(&mut self){
        self.stop_flag.store(true, std::sync::atomic::Ordering::Relaxed);
    }
    /// Fetch the the historical CPU usage information recorded from 'capacity' ago
    /// up until 'now'. Consider that if the `CpuTracker` was crated recently,
    /// depending of the tracker capacity, the first positions of the buffer will be
    /// filled with 0s for quite some time.
    /// 
    /// Also, consider that calling `stop()` will make later calls to this method
    /// always return `None`.
    pub fn fetch_usage(&mut self) -> Option<Vec<CoreBuffer>>{
        if self.stop_flag.load(std::sync::atomic::Ordering::Relaxed) {
            return None;
        }
        let resp: Vec<CoreBuffer> = {    
            let try_buffers = self.buffer.lock();
            let buffers = match try_buffers {
                Err(_) => return None,
                Ok(b) => b,
            };
            let r = buffers.deref().clone();
            r
        };
        Some(resp)
    }
}

fn refresh_loop(mut sys: System, capacity: TrackerCapacity, buffer: Arc<Mutex<Vec<CoreBuffer>>>, stop_flag: Arc<AtomicBool>){
    thread::spawn(move ||{
        loop{
            let now = Instant::now();
            sys.refresh_cpu();
            let buffer_size: usize = capacity.to_buffer_size();
            {
                let try_buffers = buffer.lock();
                let mut buffers = match try_buffers {
                    Err(_) => continue,
                    Ok(b) => b,
                };
                let buffers = buffers.deref_mut();
                for (i, core_buff) in buffers.iter_mut().enumerate(){
                    let core_buffer = &mut core_buff.buffer;
                    core_buffer.rotate_left(1);
                    let cpu_usage = match sys.cpus().get(i){
                        Some(c) => c.cpu_usage(),
                        None => 0f32,
                    } ;
                    core_buffer[buffer_size - 1] = cpu_usage;
                }
            }
            let elapsed = now.elapsed().as_millis();
            if elapsed >= 500 {
                continue;
            }
            if stop_flag.load(std::sync::atomic::Ordering::Relaxed) {
                break;
            }
            thread::sleep(Duration::from_millis(500))
        }
    });
    
}