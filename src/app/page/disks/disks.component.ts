import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { DiskInfo } from 'src/app/types/disk-types';
import { DiskChartComponent } from './disk-chart/disk-chart.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-disks',
  templateUrl: './disks.component.html',
  styleUrls: ['./disks.component.css'],
  standalone: true,
  imports: [DiskChartComponent, CommonModule]
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
