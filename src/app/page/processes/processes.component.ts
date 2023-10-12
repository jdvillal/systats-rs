import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';
import { ProcessInformation, ProcessesOrderBy } from 'src/app/types/process';

@Component({
  selector: 'app-processes',
  templateUrl: './processes.component.html',
  styleUrls: ['./processes.component.css'],
  standalone: true,
  imports: [CommonModule, TranslateModule]
})
export class ProcessesComponent {
  socket!: WebSocket;

  public processes: ProcessInformation[] = [];

  public order_by: string = "pid";//order by process (struct/type) attribute
  public order_by_: ProcessesOrderBy = 'pid';
  public order_desc: boolean = true;//order descending if true

  public memory_selected_unit: string = "MiB";

  constructor(
    private router: Router
  ){}

  ngOnInit(){
    this.socket = new WebSocket("ws://127.0.0.1:9001");

    this.socket.onopen = () => {
      this.socket.send(AppComponent.app_session_id);
      this.socket.send("current_running_processes");
      this.socket.send(this.order_by);
    }

    this.socket.onmessage = (event) => {
      let value = JSON.parse(event.data) as ProcessInformation[];
      if(this.order_desc){
        value = value.reverse();
      }
      this.processes = value;
      this.socket.send(this.order_by);
    }
  }

  ngOnDestroy(){
    this.socket.close();
  }


  set_order_by(order_by: ProcessesOrderBy){
    if(this.order_by == order_by){
      this.order_desc = !this.order_desc;
    }
    this.order_by = order_by;
  }

  order_by_name(){
    if(this.order_by = 'name'){
      this.order_desc = !this.order_desc;
    }
    this.order_by = 'name'
  }

  order_by_pid(){
    if(this.order_by === "pid"){
      this.order_desc = !this.order_desc;
      return;
    }
    this.order_by = "pid";
  }
  order_by_parent_pid(){
    if(this.order_by === "parent_pid"){
      this.order_desc = !this.order_desc;
      return;
    }
    this.order_by = "parent_pid";
  }
  order_by_cpu_usage(){
    if(this.order_by === "cpu_usage"){
      this.order_desc = !this.order_desc;
      return;
    }
    this.order_by = "cpu_usage";
  }
  order_by_memory_usage(){
    if(this.order_by === "memory_usage"){
      this.order_desc = !this.order_desc;
      return;
    }
    this.order_by = "memory_usage";
  }

  bytes_to_byte(bytes: number): number{
    return bytes;
  }
  bytes_to_KiB(bytes: number): number{
    return (bytes / 1024)
  }
  bytes_to_MiB(bytes: number): number{
    return (bytes / (1024 * 1024))
  }
  bytes_to_GiB(bytes: number): number{
    return (bytes / (1024 * 1024 * 1024))
  }

  format_memory_usage(bytes: number): number | string{
    if(this.memory_selected_unit === "GiB"){
      return (Math.round(this.bytes_to_GiB(bytes) * 10) / 10).toFixed(1);
    }else if(this.memory_selected_unit === "MiB"){
      return (Math.round(this.bytes_to_MiB(bytes) * 10) / 10).toFixed(1);
    }else if (this.memory_selected_unit === "KiB"){
      return (Math.round(this.bytes_to_KiB(bytes) * 10) / 10).toFixed(1);
    }else if( this.memory_selected_unit === "B") {
      return (Math.round(bytes * 10) / 10).toFixed(1);
    }
    return bytes;
  }

  format_cpu_usage(usage: number){
    if(usage === 100) return "100";
    return (Math.round(usage * 100) /100).toFixed(2);
  }

  show_process_details(pid: number){
    this.router.navigate([`process/${pid}`]);
  }
}
