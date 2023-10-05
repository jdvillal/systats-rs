import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, Location } from '@angular/common';
import { TreemapComponent } from '../disks/treemap/treemap.component';
@Component({
    selector: 'app-disk',
    templateUrl: './disk.component.html',
    styleUrls: ['./disk.component.css'],
    standalone: true,
    imports: [CommonModule, TreemapComponent]
})
export class DiskComponent {
  public disk_index = this.route.snapshot.paramMap.get("index");
  public mount_point = this.route.snapshot.paramMap.get("mount_point");

  constructor(
    private route: ActivatedRoute,
    private location: Location
  ){}

  ngOnInit(){
  }

  public go_back(){
    this.location.back();
  }
  
}
