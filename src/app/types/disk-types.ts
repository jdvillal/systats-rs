export interface DiskInfo{
    name: string,
    disk_type: string,
    mount_point: string,
    total_space: number,
    available_space: number,
    removable: boolean,
    file_system: string
}