import { CommonModule, Location } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { ProcessHistPayload, ProcessHistory, ProcessInfoPayload, ProcessInformation } from 'src/app/types/process';
import { ProcessCpuUsageComponent } from './process-cpu-usage/process-cpu-usage.component';
import { ProcessMemoryUsageComponent } from './process-memory-usage/process-memory-usage.component';
import { ProcessDiskUsageComponent } from './process-disk-usage/process-disk-usage.component';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';

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

  public process_info!: ProcessInformation;
  public process_history!: ProcessHistory;

  public data_update_subject: Subject<void> = new Subject();

  public total_memory! :number;

  constructor(
    private ngZone: NgZone,
    private route: ActivatedRoute,
    private location: Location,
  ){}

  ngOnInit(){
    this.listen_resource_usage();
    this.listen_process_info();

  }
  ngOnDestroy(){
    this.unlisten_resource_updates();
    invoke<any>('stop_process_historical_resource_usage');
    this.unlisten_process_info();
    invoke<any>('stop_process_information');
  }

  private unlisten_resource_updates: any;
  private listen_resource_usage(){
    if(!this.pid){return}
    invoke<any>('emit_process_historical_resource_usage', {pid: Number.parseInt(this.pid)}).then(async ()=>{
      this.unlisten_resource_updates = await listen('process_historical_resource_usage', (event)=>{
        this.ngZone.run(()=>{
          let resp = JSON.parse(event.payload as string) as ProcessHistPayload;
          if(resp.status){
            this.process_history = resp.data;
            this.data_update_subject.next();
          }else{
            //TODO: show error when procces has terminated
          }
        })
      })
    })
  }

  private unlisten_process_info!: any;
  private listen_process_info(){
    if(!this.pid){return}
    invoke<any>('emit_process_information', {pid: Number.parseInt(this.pid)}).then(async ()=>{
      this.unlisten_process_info = await listen('process_information', (event)=>{
        console.log("received");
        this.ngZone.run(()=>{
          let resp = event.payload  as ProcessInfoPayload;
          if(resp.status){
            this.process_info = resp.data;
          }else{
            //TODO: show error when procces has terminated
          }
        })
      })
    })
  }




  /* start_resource_socket(){
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
  } */

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
