import { Component } from '@angular/core';
import { ProcessInformation } from 'src/app/types/process';

@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.css']
})
export class ProcessesComponent {

  private socket!: WebSocket;
  private order_by = 'pid';
  private order_desc = false;
  private processes: ProcessInformation[] = [];
  
  ngOnInit(){
    this.socket = new WebSocket("ws://127.0.0.1:9001");

    this.socket.onopen = () => {
      this.socket.send("current_running_processes");
      this.socket.send(this.order_by);
    }

    this.socket.onmessage = (event) => {
      let value = JSON.parse(event.data) as ProcessInformation[];
      console.log(value)
      if(this.order_desc){
        value = value.reverse();
      }
      this.processes = value;
      this.socket.send(this.order_by);
    }
  }
}
