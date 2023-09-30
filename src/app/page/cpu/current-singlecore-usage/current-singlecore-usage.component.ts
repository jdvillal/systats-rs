import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-current-singlecore-usage',
  templateUrl: './current-singlecore-usage.component.html',
  styleUrls: ['./current-singlecore-usage.component.css'],
  standalone: true,
  imports: [TranslateModule]
})
export class CurrentSinglecoreUsageComponent {
  private socket!: WebSocket;
  public current_utilization = 0;


  ngOnInit() {
    this.socket = new WebSocket("ws://127.0.0.1:9001");

    this.socket.onopen = () => {
      this.socket.send(AppComponent.app_session_id);
      this.socket.send("cpu_current_singlecore_usage");
    }

    this.socket.onmessage = (event) => {
      let data = JSON.parse(event.data) as number[];
      this.current_utilization = Math.round(data[0] * 10) / 10
    }
  }

  ngOnDestroy(){
    if(this.socket && this.socket.readyState === WebSocket.OPEN){
      this.socket.close();
    }
  }

}
