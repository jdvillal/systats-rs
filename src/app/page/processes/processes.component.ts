import { CommonModule } from '@angular/common';
import { Component, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { invoke } from '@tauri-apps/api';
import { UnlistenFn, listen } from '@tauri-apps/api/event';
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
  public processes: ProcessInformation[] = [];

  public order_by: string = "pid";//order by process (struct/type) attribute
  public order_desc: boolean = true;//order descending if true

  public memory_selected_unit: string = "MiB";

  constructor(
    private ngZone: NgZone,
    private router: Router
  ){}

  private unlisten_update_event!: UnlistenFn;

  ngOnInit(){
    invoke<any>('emit_current_running_processes', {orderBy: this.order_by}).then(async () => {
      this.unlisten_update_event = await listen('current_running_processes', (event) => {
        this.update_ui(event.payload as ProcessInformation[])
      }) 
    })
  }

  ngOnDestroy(){
    this.unlisten_update_event();
    invoke<any>('stop_current_running_processes');
  }

  async set_order_by(order_by: ProcessesOrderBy){
    if(this.order_by == order_by){
      this.order_desc = !this.order_desc;
      return;
    }
    this.order_by = order_by;
  }

  private update_ui(value: ProcessInformation[]){
    this.ngZone.run(() => {
      if(this.order_by == 'name'){
        value.sort(this.compare_by_name);
      }else if(this.order_by == 'parent_pid'){
        value.sort(this.compare_by_parent_pid);
      }else if(this.order_by == 'cpu_usage'){
        value.sort(this.compare_by_cpu_usage);
      }else if(this.order_by == 'memory_usage'){
        value.sort(this.compare_by_mem_usage)
      }

      if(this.order_desc){
        value = value.reverse();
      }
      this.processes = value;
    })
  }

  compare_by_name(a:ProcessInformation, b:ProcessInformation): number {
    if (a.name < b.name) {
      return -1;
    } else if (a.name > b.name) {
      return 1;
    }
    return 0;
  }

  compare_by_parent_pid(a:ProcessInformation, b:ProcessInformation):number {
    if(!a.parent_pid && !b.parent_pid){
      return 0;
    }
    if(!a.parent_pid && b.parent_pid){
      return -1;
    }
    if(a.parent_pid && !b.parent_pid){
      return 1;
    }
    if(a.parent_pid && b.parent_pid){
      if (a.parent_pid < b.parent_pid) {
        return -1;
      } else if (a.parent_pid > b.parent_pid) {
        return 1;
      }
    }
    return 0;
  }

  compare_by_cpu_usage(a:ProcessInformation, b:ProcessInformation):number {
    if(a.cpu_usage < b.cpu_usage){
      return -1;
    }
    if(a.cpu_usage > b.cpu_usage){
      return 1;
    }
    return 0;
  }

  compare_by_mem_usage(a:ProcessInformation, b:ProcessInformation):number {
    if(a.memory_usage < b.memory_usage){
      return -1;
    }
    if(a.memory_usage > b.memory_usage){
      return 1;
    }
    return 0;
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
