import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { FileTree, Rectangle, TreeMap, TreeMapHandlerResponse } from 'src/app/types/disk-types';

@Component({
  selector: 'app-treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class TreemapComponent {
  @Input() path!: string;
  @ViewChild('treemap_chart') chart?: ElementRef<HTMLCanvasElement>;
  private chart_context!: CanvasRenderingContext2D;
  
  public treemap_rectangles: Rectangle[] = [];
  public canvas_ready  = false;
  public filetree!: FileTree;

  public width = 400.0;
  public height = 400.0;

  public progress = 0;

  ngOnInit(){

  }

  ngAfterViewInit(){
    if (!this.chart) return;
    this.chart_context = this.chart?.nativeElement.getContext("2d") as CanvasRenderingContext2D;

    if(!this.path) return;
    invoke<any>("get_treemap_from_path", {path: this.path, maxDepth: 2, width: this.width, height: this.height}).then((res)=>{
      let tree_map_resp = res as TreeMapHandlerResponse;
      this.filetree = tree_map_resp.file_tree;
      this.treemap_rectangles = tree_map_resp.tree_map;
      console.log(this.treemap_rectangles);
      this.update_chart();
    })
  }



  private update_chart() {
    //this.chart_context.clearRect(0, 0, 200, 200);
    this.chart_context.beginPath();
    this.chart_context.lineWidth = 1;
    this.chart_context.strokeStyle = "#ff4797"
    //this.chart_context.rect(20, 20, 150, 100);
   for (let rectangle of this.treemap_rectangles) {
      this.chart_context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }
    this.chart_context?.stroke();
    this.canvas_ready = true;
  }


  public animate_progress_bar(){

  }

  public stop_progress_bar(){

  }
}
