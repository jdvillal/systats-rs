use std::fs;

use fs_extra::{dir::get_size, file};
use serde::{Deserialize, Serialize};
use serde_json::json;
use sysinfo::{DiskExt, System, SystemExt};
use treemap::{Rect, Mappable, MapItem, TreemapLayout};

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


fn get_rectangles(filetree: &FileTree, bounds: Rect) -> Vec<Rect> {
    println!("{} ", filetree.name);
    let mut layout = TreemapLayout::new();
    //is file (leaft)
    let mut rectangles: Vec<Rect> = Vec::new();
    if filetree.children.is_none() {
        let mut items: Vec<Box<dyn Mappable>> =
            vec![Box::new(MapItem::with_size(filetree.size as f64))];
        layout.layout_items(&mut items, bounds);
        for item in items {
            let item_bounds = item.bounds();
            println!("{:?}", item_bounds);
            rectangles.push(item_bounds.clone());
        }
        return rectangles;
    }
    if let Some(children) = &filetree.children {
        //if dir is a leaft
        if children.len() == 0 {
            let mut items: Vec<Box<dyn Mappable>> =
                vec![Box::new(MapItem::with_size(filetree.size as f64))];
            layout.layout_items(&mut items, bounds);
            for item in items {
                let item_bounds = item.bounds();
                println!("{:?}", item_bounds);
                rectangles.push(item_bounds.clone());
            }
            return rectangles;
        }
        //if dir is not a leaft
        //TODO: use iterator instead
        let mut items: Vec<Box<dyn Mappable>> = Vec::with_capacity(children.len());
        for child in children {
            println!("flag");
            items.push(Box::new(MapItem::with_size(child.size as f64)));
        }
        layout.layout_items(&mut items, bounds);
        /* for item in items {
            let item_bounds = item.bounds();
            //rectangles.push(item_bounds.clone());
        } */
        for i in 0..children.len() {
            let mut child_rectangles = get_rectangles(
                filetree.children.as_ref().unwrap().get(i).unwrap(),
                *items[i].bounds(),
            );
            
            rectangles.append(&mut child_rectangles);
        }
    }
    rectangles
}

#[tauri::command]
pub fn get_filetree_from_path(path: &str) -> serde_json::Value {
    let file_tree = get_filetree(path, "Cfiles", 0, 5);
    let rcs = get_rectangles(&file_tree, Rect::from_points(0.0, 0.0, 200.0, 200.0));
    for rc in rcs{
        println!("{:?}", rc);
    }
    json!(file_tree)
}
