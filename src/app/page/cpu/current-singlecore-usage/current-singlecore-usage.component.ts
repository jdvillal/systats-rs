import { Component } from '@angular/core';

@Component({
  selector: 'app-current-singlecore-usage',
  templateUrl: './current-singlecore-usage.component.html',
  styleUrls: ['./current-singlecore-usage.component.css'],
  standalone: true
})
export class CurrentSinglecoreUsageComponent {
  private socket!: WebSocket;
  public current_utilization = 0;


  ngOnInit() {

    this.socket = new WebSocket("ws://127.0.0.1:9001");

    this.socket.onopen = () => {
      this.socket.send("cpu_current_singlecore_usage");
    }

    this.socket.onmessage = (event) => {
      console.log(event.data);
      let data = JSON.parse(event.data) as number[];
      this.current_utilization = Math.round(data[0] * 10) / 10
    }
  }

}
