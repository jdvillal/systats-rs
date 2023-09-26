import { Component, ElementRef, Input, ViewChild, WritableSignal, computed } from '@angular/core';
import { invoke } from '@tauri-apps/api';

@Component({
  selector: 'app-core-combustor',
  templateUrl: './core-combustor.component.html',
  styleUrls: ['./core-combustor.component.css'],
  standalone: true,
  imports: []
})
export class CoreCombustorComponent {
  @ViewChild('core_combust_chart') chart?: ElementRef<HTMLCanvasElement>;

  private socket!: WebSocket;

  private chart_context!: CanvasRenderingContext2D;
  private image_data!: ImageData;
  public chart_width = 200;
  public chart_height = 200;

  ngOnInit(){
    
  }

  ngAfterViewInit(){
    this.chart_context = this.chart?.nativeElement.getContext("2d") as CanvasRenderingContext2D;
    this.image_data = this.chart_context.createImageData(this.chart_width, this.chart_height);
    invoke<number>("get_combustor_port", {}).then((value) => {
      let port = value;
      console.log(port);
      //this.greetingMessage = text;
      this.socket = new WebSocket(`ws://127.0.0.1:${port}`);
      this.socket.binaryType = 'arraybuffer'
      this.socket.onopen = ()=>{
        console.log("websocket connection ready");
      }
      this.socket.onmessage = (event) =>{
        //console.log(event.data);
        //let arr = new Uint8Array(event.data);
        //console.log(arr)
        this.draw_fractal(new Uint8Array(event.data));
      }
    });
  }

  draw_fractal(result: Uint8Array){
    let ctx = this.chart_context;
    let off = 0;
    let lenght = this.chart_width*this.chart_height*3;
    for(let i = 0; i < lenght; i+=3){
      this.image_data.data[i+off] = result[i];
      this.image_data.data[i+off + 1] = result[i+1];
      this.image_data.data[i+off + 2] = result[i+2];
      this.image_data.data[i+off + 3] = 255;
      off = off + 1;
    }
    ctx.putImageData(this.image_data, 0, 0);
    //let ts = Date.now();
    //fps_elem.innerText = String(1000/(ts - last_draw )) + 'fps';
    //last_draw = ts;
  }
  
}
