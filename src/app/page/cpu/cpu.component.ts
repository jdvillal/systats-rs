import { Component } from '@angular/core';
import { CurrentMulticoreUsageComponent } from './current-multicore-usage/current-multicore-usage.component';
import { TimelapseMulticoreUsageComponent } from './timelapse-multicore-usage/timelapse-multicore-usage.component';

@Component({
  selector: 'app-cpu',
  templateUrl: './cpu.component.html',
  styleUrls: ['./cpu.component.css'],
  standalone: true,
  imports: [CurrentMulticoreUsageComponent]
})
export class CpuComponent {
  socket!: WebSocket;

  ngOnInit(){

      /* this.socket = new WebSocket("ws://127.0.0.1:9001");

      this.socket.onopen = ()=>{
        this.socket.send("cpu_timelapse_multicore_usage")
      }
  
      this.socket.onmessage = (event) =>{
        //console.log(event.data)
        console.log(JSON.parse(event.data))
      } */
    }

}
