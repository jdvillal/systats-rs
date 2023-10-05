import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, Signal, ViewChild, WritableSignal, computed, signal } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { FileTree, Rectangle, TreeMap, TreeMapHandlerResponse } from 'src/app/types/disk-types';
import { TreeviewComponent } from './treeview/treeview.component';

@Component({
  selector: 'app-treemap',
  templateUrl: './treemap.component.html',
  styleUrls: ['./treemap.component.css'],
  standalone: true,
  imports: [CommonModule, TreeviewComponent]
})
export class TreemapComponent {
  @Input() path!: string;
  @ViewChild('treemap_chart') chart?: ElementRef<HTMLCanvasElement>;
  private chart_context!: CanvasRenderingContext2D;

  public treemap_rectangles: Rectangle[] = [];//the rectangles to be drawn in canvas
  public canvas_ready = false;//tells if all rectangle have been drawn already
  public filetree!: FileTree;//the filetree fetched from rust

  //canvas dimention
  public width = 400.0;
  public height = 400.0;

  public hl_rectangle: Rectangle = { x: 0, y: 0, width: 0, height: 0};

  ngAfterViewInit() {
    if (!this.chart) return;
    this.chart_context = this.chart?.nativeElement.getContext("2d") as CanvasRenderingContext2D;

    if (!this.path) return;
    //invoke tauri command to get a disk filetree and treemap rectangles
    invoke<any>("get_treemap_from_path", { path: this.path, maxDepth: 2, width: this.width, height: this.height }).then((res) => {
      let tree_map_resp = res as TreeMapHandlerResponse;
      this.filetree = tree_map_resp.file_tree;
      this.treemap_rectangles = tree_map_resp.tree_map;
      this.update_chart();
    })
  }

  //this function draws the treemap retangles calculated in rust
  private update_chart() {
    //this.chart_context.clearRect(0,0,this.width, this.height);
    this.chart_context.beginPath();
    this.chart_context.lineWidth = 1;
    this.chart_context.strokeStyle = "#ff4797"
    for (let rectangle of this.treemap_rectangles) {
      this.chart_context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
    }
    this.chart_context?.stroke();
    this.canvas_ready = true;
  }

  highlight_rectangle(treemap: FileTree){
    this.blink_rectangle(treemap.rectangle, 10);
  }

  blink_rectangle(rectangle: Rectangle, count: number){
    setTimeout(() => {
      this.chart_context.beginPath();
      this.chart_context.lineWidth = 1;
      this.chart_context.strokeStyle = ""
      this.chart_context.fillStyle = ""
      if (count % 2 == 0){
        this.chart_context.strokeStyle = "#ffffff"
        this.chart_context.fillStyle = "#ffffff"
      }else{
        this.chart_context.strokeStyle = "#000000"
        this.chart_context.fillStyle = "#000000"
      }
      this.chart_context.rect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      this.chart_context.fillRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
      this.chart_context?.stroke();
      if (count == 0) {
        this.chart_context.clearRect(0,0,this.width, this.height);
        this.update_chart();
        return;
      };
      this.blink_rectangle(rectangle, count-1);
    }, 50);
  }



}
