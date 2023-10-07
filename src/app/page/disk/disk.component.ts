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
  public mount_point! : string;

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ){}

  ngOnInit(){
    let disk: DiskInfo = JSON.parse(localStorage.getItem(`disk-${this.disk_index}`) as string);
    this.mount_point = disk.mount_point;
  }

  public go_back(){
    this.location.back();
  }

}
