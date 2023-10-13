import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { ProcessHistory } from 'src/app/types/process';
import { ProcessCpuUsageComponent } from './process-cpu-usage/process-cpu-usage.component';
import { ProcessMemoryUsageComponent } from './process-memory-usage/process-memory-usage.component';
import { ProcessDiskUsageComponent } from './process-disk-usage/process-disk-usage.component';

@Component({
    selector: 'app-process',
    templateUrl: './process.component.html',
    styleUrls: ['./process.component.css'],
    standalone: true,
    imports: [
      CommonModule,
      ProcessCpuUsageComponent,
      ProcessMemoryUsageComponent,
      ProcessDiskUsageComponent
    ]
})
export class ProcessComponent {
  public pid = this.route.snapshot.paramMap.get("pid");

  private socket!: WebSocket;
  public process_history!: ProcessHistory;

  public data_update_subject: Subject<void> = new Subject();
  my_obs = this.data_update_subject.asObservable()

  public total_memory! :number;

  constructor(
    private route: ActivatedRoute
  ){}

  ngOnInit(){
    
    this.socket = new WebSocket("ws://127.0.0.1:9001");
    this.socket.onopen = () =>{
      this.socket.send(AppComponent.app_session_id);
      this.socket.send("process_resources_usage");
      this.socket.send(String(this.pid));
    }
    this.socket.onmessage = (event) => {
      //console.log("Received ===> ",JSON.parse(event.data));
      this.process_history = JSON.parse(event.data);
      this.data_update_subject.next();
    }
    this.socket.onclose = ()=>{
      console.log("CLOSED")
    }

  }
  ngOnDestroy(){
    if (this.socket){
      this.socket.close();
    }
  }

}
