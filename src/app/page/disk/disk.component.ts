import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { TreemapComponent } from '../disks/treemap/treemap.component';
import { DiskInfo } from 'src/app/types/disk-types';
@Component({
    selector: 'app-disk',
    templateUrl: './disk.component.html',
    styleUrls: ['./disk.component.css'],
    standalone: true,
    imports: [CommonModule, TreemapComponent]
})
export class DiskComponent {
  public disk_index = this.route.snapshot.paramMap.get("index");
  public disk_info!: DiskInfo;
  //public mount_point! : string;

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ){}

  ngOnInit(){
    this.disk_info =  JSON.parse(localStorage.getItem(`disk-${this.disk_index}`) as string);
  }

  public go_back(){
    this.location.back();
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


  get_used_perc(){
    let num = 100 - this.get_free_perc();
    return Math.round(num * 100) / 100
  }

  get_free_perc(){
    let num = (this.disk_info.available_space / this.disk_info.total_space) * 100;
    return Math.round(num * 100 ) / 100
  }

}
