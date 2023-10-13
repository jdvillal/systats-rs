import { CommonModule, Location } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { ProcessHistory, ProcessInformation } from 'src/app/types/process';
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

  // Stream of historic resource utilization of the process
  private resources_socket!: WebSocket;
  public process_info!: ProcessInformation;

  // Stream of current resource state
  private information_socket!: WebSocket;
  public process_history!: ProcessHistory;

  public data_update_subject: Subject<void> = new Subject();

  public total_memory! :number;

  constructor(
    private route: ActivatedRoute,
    private location: Location,
    private router: Router
  ){}

  ngOnInit(){
    this.start_info_socket();
    this.start_resource_socket();

  }
  ngOnDestroy(){
    if (this.resources_socket){
      this.resources_socket.close();
    }
  }

  start_info_socket(){
    this.information_socket = new WebSocket("ws://127.0.0.1:9001");
    this.information_socket.onopen = () => {
      this.information_socket.send(AppComponent.app_session_id);
      this.information_socket.send("process_information");
      this.information_socket.send(String(this.pid));
    }
    this.information_socket.onmessage = (event) =>{
      this.process_info = JSON.parse(event.data);
    }
  }

  start_resource_socket(){
    this.resources_socket = new WebSocket("ws://127.0.0.1:9001");
    this.resources_socket.onopen = () =>{
      this.resources_socket.send(AppComponent.app_session_id);
      this.resources_socket.send("process_resources_usage");
      this.resources_socket.send(String(this.pid));
    }
    this.resources_socket.onmessage = (event) => {
      this.process_history = JSON.parse(event.data);
      this.data_update_subject.next();
    }
    this.resources_socket.onclose = ()=>{
      console.log("CLOSED")
    }
  }

  public go_back(){
    this.location.back();
  }

  //TODO: Fixme, this is changing the param but not reloading the page
  public go_to_process(pid: number){
    /* this.router.navigate([`process/${pid}`])
    window.location.reload(); */
    //this.location.go(`process/${pid}`);
  }

}
