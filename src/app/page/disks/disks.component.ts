import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { DiskInfo, FileTree, TreeMap } from 'src/app/types/disk-types';
import { DiskChartComponent } from './disk-chart/disk-chart.component';
import { TranslateModule } from '@ngx-translate/core';
import { TreemapComponent } from './treemap/treemap.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-disks',
  templateUrl: './disks.component.html',
  styleUrls: ['./disks.component.css'],
  standalone: true,
  imports: [DiskChartComponent, CommonModule, TranslateModule, TreemapComponent]
})
export class DisksComponent {

  disks: DiskInfo[] = [];

  constructor(
    private router: Router
  ){}

  ngOnInit(){
    this.get_cpu_information();
  }

  get_cpu_information(): void {
    invoke<DiskInfo[]>("get_system_disks_information", {}).then((res) => {
      this.disks = res;
      for(let index = 0; index < this.disks.length; index++){
        localStorage.setItem(`disk-${index}`, JSON.stringify(this.disks[index]));
      }
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

  open_disk_info(index: number, mount_point: string){
    this.router.navigate([`disk/${index}`])
  }

}
