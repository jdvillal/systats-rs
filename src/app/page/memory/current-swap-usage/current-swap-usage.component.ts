import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, ViewChild } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';
import { MemoryInfo } from 'src/app/types/memory-types';

@Component({
  selector: 'app-current-swap-usage',
  templateUrl: './current-swap-usage.component.html',
  styleUrls: ['./current-swap-usage.component.css'],
  standalone: true,
  imports: [NgChartsModule, CommonModule]
})
export class CurrentSwapUsageComponent {
  private eventsSubscription!: Subscription;
  @Input() mem_info_ready_observable!: Observable<MemoryInfo>;
  @Input() total_swap!: number;

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
      { data: [ ], label: 'Swap', borderColor: 'white', backgroundColor: ['rgb(255, 99, 132)','rgb(54, 162, 235)']},
      //{ data: [ ], label: 'Swap', borderColor: 'white', backgroundColor: ['rgb(255, 99, 132)','rgb(54, 162, 235)'] },
    ];

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: false,
    cutout: '70%',
    plugins: {legend: {position: 'top', align: 'center'}}
  };

  ngOnInit(){
    if (this.total_swap) {
      this.on_memInfo_ready(this.total_swap);
      return;
    }
    this.eventsSubscription = this.mem_info_ready_observable.subscribe((memInfo) => {
      this.on_memInfo_ready(memInfo.total_swap);
    });
  }
  ngOnDestroy() {
    if (this.eventsSubscription) {
      this.eventsSubscription.unsubscribe();
    }
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }

  private on_memInfo_ready(total_mem: number){
    this.socket = new WebSocket('ws://127.0.0.1:9001');
    this.socket.onopen = () => {
      this.socket.send("memory_swap_current_usage");
    }
    this.socket.onmessage = (event) => {
      let data = JSON.parse(event.data) as number[];
      this.used = data[1];
      this.used_perc = total_mem - data[1];
      this.doughnutChartDatasets[0].data = [data[1], total_mem - data[1]]
      this.chart.update();

    }
  }

  public format_meassure_unit(bytes: number): string{
    if(bytes < 1024){
      return `${bytes} bytes`
    }else if(bytes >= 1024 && bytes < (1024*1024)){
      return Math.round((bytes/ (1024)) * 10) / 10 + ' KiB';
    }else if(bytes >= (1024*1024) && bytes < (1024*1024*1024)){
      return Math.round((bytes/ (1024 * 1024)) * 10) / 10 + ' MiB'
    }else{
      return Math.round((bytes/ (1024 * 1024 * 1024)) * 10) / 10 + ' GiB'
    }
  }

  public format_meassure_percent(bytes: number): string{
    return Math.round((bytes/this.total_swap * 100)) + '%'
  }
}
