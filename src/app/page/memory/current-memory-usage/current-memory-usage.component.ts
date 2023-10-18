import { Component, HostListener, Input, QueryList, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { invoke } from '@tauri-apps/api';
import { listen } from '@tauri-apps/api/event';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';
import { AppComponent } from 'src/app/app.component';
import { MemoryInfo } from 'src/app/types/memory-types';

@Component({
  selector: 'app-current-memory-usage',
  templateUrl: './current-memory-usage.component.html',
  styleUrls: ['./current-memory-usage.component.css'],
  standalone: true,
  imports: [NgChartsModule, TranslateModule]
})
export class CurrentMemoryUsageComponent {
  @Input() total_memory!: number;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  @HostListener('window:resize', ['$event'])
  onResize(_event: Event) {
    this.chart.chart?.resize();
  }

  public used = 0;
  public used_perc = 0;

  private socket!: WebSocket;

  public doughnutChartLabels: string[] = [ 'Used', 'Available'];
  public doughnutChartDatasets: ChartConfiguration<'doughnut'>['data']['datasets'] = [
      { data: [ ], label: 'Memory', borderColor: 'white', backgroundColor: ['rgb(255, 99, 132)','rgb(54, 162, 235)']},
      //{ data: [ ], label: 'Swap', borderColor: 'white', backgroundColor: ['rgb(255, 99, 132)','rgb(54, 162, 235)'] },
    ];

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: false,
    cutout: '70%',
    plugins: {legend: {position: 'top', align: 'center'}}
  };

  ngOnInit(){
    if (this.total_memory) {
      this.on_memInfo_ready(this.total_memory);
      return;
    }

  }
  ngOnDestroy() {
    this.unlisten_update_event();
    invoke<any>('stop_current_memory_usage');
  }

  private unlisten_update_event : any;

  private on_memInfo_ready(total_mem: number){
    invoke<any>('emit_current_memory_usage').then(async ()=>{
      this.unlisten_update_event = await listen('current_memory_usage', (event)=>{
        this.used = event.payload as number;
        this.used_perc = total_mem - this.used;
        this.doughnutChartDatasets[0].data = [this.used, total_mem - this.used]
        this.chart.update();
      })
    })
  }

  public format_meassure_unit(bytes: number): string{
    if(bytes < 1024){
      return `bytes ${bytes}`
    }else if(bytes >= 1024 && bytes < (1024*1024)){
      return Math.round((bytes/ (1024)) * 10) / 10 + ' KiB';
    }else if(bytes >= (1024*1024) && bytes < (1024*1024*1024)){
      return Math.round((bytes/ (1024 * 1024)) * 10) / 10 + ' MiB'
    }else{
      return Math.round((bytes/ (1024 * 1024 * 1024)) * 10) / 10 + ' GiB'
    }
  }

  public format_meassure_percent(bytes: number): string{
    return Math.round((bytes/this.total_memory * 100)) + '%'
  }

  

}
