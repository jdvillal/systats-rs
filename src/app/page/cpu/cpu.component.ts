import { Component } from '@angular/core';

@Component({
  selector: 'app-cpu',
  templateUrl: './cpu.component.html',
  styleUrls: ['./cpu.component.css']
})
export class CpuComponent {
  socket!: WebSocket;

  ngOnInit(){

      this.socket = new WebSocket("ws://127.0.0.1:9001");

      this.socket.onopen = ()=>{
        this.socket.send("cpu_timelapse_multicore_usage")
      }
  
      this.socket.onmessage = (event) =>{
        //console.log(event.data)
        console.log(JSON.parse(event.data))
      }


    }


}
