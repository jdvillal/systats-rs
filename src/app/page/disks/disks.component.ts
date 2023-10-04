import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { DiskInfo, FileTree, TreeMap } from 'src/app/types/disk-types';
import { DiskChartComponent } from './disk-chart/disk-chart.component';
import { TranslateModule } from '@ngx-translate/core';
import { TreemapComponent } from './treemap/treemap.component';

@Component({
  selector: 'app-disks',
  templateUrl: './disks.component.html',
  styleUrls: ['./disks.component.css'],
  standalone: true,
  imports: [DiskChartComponent, CommonModule, TranslateModule, TreemapComponent]
})
export class DisksComponent {

  disks: DiskInfo[] = [];

  ngOnInit(){
    this.get_cpu_information();
  }

  get_cpu_information(): void {
    invoke<DiskInfo[]>("get_system_disks_information", {}).then((res) => {
      this.disks = res;
    });
    /* invoke<any>("get_filetree_from_path", {path: "/home/daniel/Desktop/Cfiles", maxDepth: 5}).then((res)=>{
      let file_tree = res as FileTree;
      console.log(file_tree);
    }) */
    
  }

  public format_disk_space(bytes: number): string{
    if(bytes < 1024){
      return `bytes ${bytes}`
    }else if(bytes >= 1024 && bytes < (1024*1024)){
      return Math.round((bytes/ (1024)) * 10) / 10 + ' KiB';
    }else if(bytes >= (1024*1024) && bytes < (1024*1024*1024)){
      return Math.round((bytes/ (1024 * 1024)) * 10) / 10 + ' MiB'
    }else{
      return Math.round((bytes/ (1024 * 1024 * 1024)) * 10) / 10 + ' GiB'
    }
  }

  public format_disk_name(index: number, mount_point: string): string{
    let name = "Disk "+ index.toString() + " (" + mount_point.replace("/", "").replace("\\","") + ")";
    return name; 
  }

}
