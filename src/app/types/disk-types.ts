export interface DiskInfo{
    name: string,
    disk_type: string,
    mount_point: string,
    total_space: number,
    available_space: number,
    removable: boolean,
    file_system: string
}


//******* TreeMap types *****/
export interface FileTree{
    size: number,
    name: string,
    path: string,
    rectangle: Rectangle,
    children: FileTree[] | null
}

export interface Rectangle{
    x: number,
    y: number,
    width: number,
    height: number
}

export interface TreeMap{
    root: Rectangle,
    children: TreeMap[] | null
}

export interface TreeMapHandlerResponse{
    file_tree: FileTree,
    tree_map: Rectangle[]
}