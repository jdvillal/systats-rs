use std::fs;

use fs_extra::{dir::get_size, file};
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

#[derive(Debug, Serialize, Deserialize)]
struct FileTree {
    size: u64,
    name: String,
    path: String,
    children: Option<Vec<FileTree>>,
}

//Recursively construct a FileTree given a Path
//TODO: should not call so many unwraps
//TODO: for Windows, using ____ should be faster
fn get_filetree(path: &str, name: &str, current_depth: usize, max_depth: usize) -> FileTree {
    let mut dir_tree = FileTree {
        size: 0,
        name: name.to_string(),
        path: path.to_string(),
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
                        children: None,
                    };
                    dir_tree.size += filetree.size;
                    children.push(filetree);
                } else {
                    let dir_name = entry.file_name().to_str().unwrap().to_string();
                    let dir_path = entry.path().to_str().unwrap().to_string();
                    if current_depth <  max_depth {
                        let dir_children = get_filetree(
                            &dir_path,
                            &dir_name,
                            current_depth + 1,
                            max_depth
                        );
                        dir_tree.size += dir_children.size; //+ entry.metadata().unwrap().len(); not considering folder size
                        children.push(dir_children);
                    }
                    //when deeper than max_depth we stop recursion and use fs_extra crate to get dir size
                    else {
                        if let Ok(size) = get_size(entry.path()){
                            dir_tree.size += size;
                            let dir_children = FileTree {
                                size: size,
                                name: dir_name,
                                path: dir_path,
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



#[derive(Debug)]
pub enum Orientation {
    Horizontal,
    Vertical,
}

impl Orientation {
    fn next(&self) -> Self {
        match self {
            Self::Horizontal => Self::Vertical,
            Self::Vertical => Self::Horizontal,
        }
    }
}

#[derive(Debug)]
struct Point {
    x: f64,
    y: f64,
}
impl Point {
    fn new(x: f64, y: f64) -> Self {
        Point { x, y }
    }
}
#[derive(Clone, Copy, Debug)]
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
    fn from(rectangle: &Rectangle) -> Self {
        Rectangle::new(rectangle.x, rectangle.y, rectangle.width, rectangle.height)
    }
}

#[derive(Debug)]
struct TreeMap {
    root: Rectangle,
    children: Option<Vec<TreeMap>>,
}
impl TreeMap {
    fn leaft(root: Rectangle) -> Self {
        Self {
            root,
            children: None,
        }
    }
    fn non_leaft(root: Rectangle, children: Vec<TreeMap>) -> Self {
        Self {
            root,
            children: Some(children),
        }
    }
}

fn get_treemap(
    filetree: &FileTree,
    parent_size: f64,
    bounds: &Rectangle,
    start_from: Point,
    divide_axis: Orientation,
    depth: usize
) -> TreeMap {
    let portion: f64 = filetree.size as f64 / parent_size;
    let (width, height) = match divide_axis {
        Orientation::Horizontal => (portion * bounds.width, bounds.height),
        Orientation::Vertical => (bounds.width, portion * bounds.height),
    };
    let rectangle = Rectangle::new(start_from.x, start_from.y, width, height);
    //is file (leaft)
    if filetree.children.is_none() {
        let treemap = TreeMap::leaft(rectangle);
        return treemap;
    }
    if let Some(children) = &filetree.children {
        //if dir is a leaft
        if children.len() == 0 {
            let treemap = TreeMap::leaft(rectangle);
            return treemap;
        }
        //if dir is not a leaft
        let mut deeper_children: Vec<TreeMap> = Vec::new();
        let (mut child_start_x, mut child_start_y) = (start_from.x, start_from.y);
        for i in 0..children.len() {
            let child_treemap = get_treemap(
                filetree.children.as_ref().unwrap().get(i).unwrap(),
                filetree.size as f64,
                &rectangle,
                Point::new(child_start_x, child_start_y),
                divide_axis.next(),
                depth + 1
            );
            match divide_axis.next() {
                Orientation::Horizontal => {
                    child_start_x += child_treemap.root.width;
                },
                Orientation::Vertical => {
                    child_start_y += child_treemap.root.height;
                }
            }
            deeper_children.push(child_treemap);
        }
        let treemap = TreeMap::non_leaft(Rectangle::from(&bounds), deeper_children);
        return treemap;
    } else {
        unreachable!()
    }
}


#[tauri::command]
pub fn get_filetree_from_path(path: &str, max_depth: usize) -> serde_json::Value {
    let file_tree = get_filetree(path, "Cfiles", 0, max_depth);
    json!(file_tree)
}
