use std::fs;

use fs_extra::dir::get_size;
use serde::{Deserialize, Serialize};
use serde_json::json;
use sysinfo::{DiskExt, System, SystemExt};

#[derive(Debug, Serialize, Deserialize)]
pub struct DiskInfo {
    pub name: String,
    pub disk_type: String,
    pub mount_point: String,
    pub total_space: u64,
    pub available_space: u64,
    pub removable: bool,
    pub file_system: String,
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
    let disk_arr = sys.disks();
    for i in 0..disk_arr.len() {
        let type_str = match disk_arr[i].kind() {
            sysinfo::DiskKind::SSD => "SSD",
            sysinfo::DiskKind::HDD => "HDD",
            _ => "Unknown",
        };
        let file_sys: String = String::from_utf8_lossy(disk_arr[i].file_system()).to_string();
        let disk_info = DiskInfo {
            name: String::from(disk_arr[i].name().to_str().unwrap_or_else(|| "")),
            disk_type: String::from(type_str),
            mount_point: String::from(disk_arr[i].mount_point().to_str().unwrap_or_else(|| "")),
            total_space: disk_arr[i].total_space(),
            available_space: disk_arr[i].available_space(),
            removable: disk_arr[i].is_removable(),
            file_system: file_sys,
        };
        system_disks_list.push(disk_info);
    }
    json!(system_disks_list)
}

//Treemap handler

#[derive(Debug, Serialize)]
struct FileTree {
    size: u64,
    name: String,
    path: String,
    rectangle: Option<Rectangle>,
    children: Option<Vec<FileTree>>,
}
impl FileTree {
    fn is_leaft(&self) -> bool {
        if self.children.is_none() {
            return true;
        } else if self.children.as_ref().unwrap().len() == 0 {
            return true;
        }
        false
    }
}

//Recursively construct a FileTree given a Path
//TODO: should not call so many unwraps
//TODO: for Windows, using ____ should be faster
fn get_filetree(path: &str, name: &str, current_depth: usize, max_depth: usize) -> FileTree {
    let mut dir_tree = FileTree {
        size: 0,
        name: name.to_string(),
        path: path.to_string(),
        rectangle: None,
        children: None,
    };
    if let Ok(entries) = fs::read_dir(path) {
        let mut children: Vec<FileTree> = Vec::new();
        for entry in entries {
            if let Ok(entry) = entry {
                //Ignore the /proc dir in linux, witch for some reason takes A LOT of time to scan
                //TODO: try fix this
                if entry.file_name() == "proc" {
                    continue;
                }
                if entry.file_type().unwrap().is_file() {
                    let filetree = FileTree {
                        size: entry.metadata().unwrap().len(),
                        name: entry.file_name().to_str().unwrap().to_string(),
                        path: entry.path().to_str().unwrap().to_string(),
                        rectangle: None,
                        children: None,
                    };
                    dir_tree.size += filetree.size;
                    children.push(filetree);
                } else {
                    let dir_name = entry.file_name().to_str().unwrap().to_string();
                    let dir_path = entry.path().to_str().unwrap().to_string();
                    if current_depth < max_depth {
                        let dir_children =
                            get_filetree(&dir_path, &dir_name, current_depth + 1, max_depth);
                        dir_tree.size += dir_children.size; //+ entry.metadata().unwrap().len(); not considering folder size
                        children.push(dir_children);
                    }
                    //when deeper than max_depth we stop recursion and use fs_extra crate to get dir size
                    else {
                        if let Ok(size) = get_size(entry.path()) {
                            dir_tree.size += size;
                            let dir_children = FileTree {
                                size: size,
                                name: dir_name,
                                path: dir_path,
                                rectangle: None,
                                children: Some(Vec::new()),
                            };
                            children.push(dir_children);
                        }
                    }
                };
            }
        }
        dir_tree.children = Some(children);
    }
    return dir_tree;
}

struct Point {
    x: f64,
    y: f64,
}
impl Point {
    fn new(x: f64, y: f64) -> Self {
        Point { x, y }
    }
}
#[derive(Clone, Copy, Serialize, Debug)]
struct Rectangle {
    x: f64,
    y: f64,
    width: f64,
    height: f64,
}
impl Rectangle {
    fn new(x: f64, y: f64, width: f64, height: f64) -> Self {
        Rectangle {
            x,
            y,
            width,
            height,
        }
    }
}

fn get_treemap_rectangles(
    filetree: &mut FileTree,
    parent_rect: Rectangle,
    parent_size: u64,
    depth: u16,
    start_at: &mut Point,
) -> Vec<Rectangle> {
    //Rectangle rectangle = Rectangle::new(x, y, width, height);
    let portion = filetree.size as f64 / parent_size as f64;
    let x_len = parent_rect.width;
    let y_len = parent_rect.height;
    let x_pos = parent_rect.x;
    let y_pos = parent_rect.y;
    let rectangle = if depth % 2 == 1 {
        //Divide the parent rectangle horizontally
        let rectangle = Rectangle::new(x_pos + start_at.x, y_pos, portion * x_len, y_len);
        start_at.x = start_at.x + rectangle.width;
        rectangle
    } else {
        //Divide the parent rectangle vertically
        let rectangle = Rectangle::new(x_pos, y_pos + start_at.y, x_len, portion * y_len);
        start_at.y = start_at.y + rectangle.height;
        rectangle
    };
    //Also record individual directory or file rectangle at any level
    //This is used by the treemap hightlight functionality in the frontend 
    filetree.rectangle = Some(rectangle);
    let mut rectangles: Vec<Rectangle> = Vec::new();
    if filetree.is_leaft() {
        rectangles.push(rectangle);
    } else {
        let mut child_start_at = Point::new(0.0, 0.0);
        for child in filetree.children.as_mut().unwrap() {
            let mut child_rectangles = get_treemap_rectangles(
                child,
                rectangle,
                filetree.size,
                depth + 1,
                &mut child_start_at,
            );
            rectangles.append(&mut child_rectangles);
        }
    }
    return rectangles;
}

#[tauri::command]
pub fn get_filetree_from_path(path: &str, max_depth: usize) -> serde_json::Value {
    let file_tree = get_filetree(path, path, 0, max_depth);
    json!(file_tree)
}

#[derive(Serialize)]
struct TreeMapHandlerResponse {
    file_tree: FileTree,
    tree_map: Vec<Rectangle>,
}

//this handler is async to avoid blocking UI
#[tauri::command]
pub async fn get_treemap_from_path(path: &str, max_depth: usize, width: f64, height: f64) -> Result<serde_json::Value, ()> {
    let mut file_tree = get_filetree(path, path, 0, max_depth);
    let total_size = file_tree.size;
    let tree_map = get_treemap_rectangles(
        &mut file_tree,
        Rectangle::new(0f64, 0f64, width, height),
        total_size,
        0,
        &mut Point::new(0.0, 0.0),
    );

    let response = TreeMapHandlerResponse {
        file_tree,
        tree_map,
    };
    Ok(json!(response))
}
