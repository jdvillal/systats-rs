import { Component, Input, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions, Tick } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';
import { MemoryInfo } from 'src/app/types/memory-types';
import { AppearanceSettingComponent } from './appearance-setting/appearance-setting.component';
import { MemoryPreferencesService } from 'src/app/services/memory-preferences.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-timelapse-memory-usage',
  templateUrl: './timelapse-memory-usage.component.html',
  styleUrls: ['./timelapse-memory-usage.component.css'],
  standalone: true,
  imports: [NgChartsModule, AppearanceSettingComponent, CommonModule, TranslateModule]
})
export class TimelapseMemoryUsageComponent {
  private eventsSubscription!: Subscription;
  @Input() mem_info_ready_observable!: Observable<MemoryInfo>;
  @Input() total_memory!: number;

  private socket!: WebSocket;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public line_color = '';
  public background_color = '';

  constructor(private preferencesService: MemoryPreferencesService){
    this.line_color = this.preferencesService.get_memory_preferences().timelapse.line_color;
    this.background_color = this.preferencesService.get_memory_preferences().timelapse.background_color;
  }

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: ' usage',
        fill: false,
        pointRadius: 0,
        borderWidth: 1,
        borderColor: '',
      }
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {};
  public lineChartLegend = false;

  ngOnInit() {
    if (this.total_memory) {
      this.on_memInfo_ready(this.total_memory);
      return;
    }
    this.eventsSubscription = this.mem_info_ready_observable.subscribe((memInfo) => {
      this.on_memInfo_ready(memInfo.total);
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

  private on_memInfo_ready(total_mem: number) {
    this.lineChartOptions = {
      animation: false,
      scales: {
        x: { display: false }, y: {
          min: 0, max: total_mem, ticks: {
            callback: function (value, index, ticks) {
              let v = value as number;
              //return Math.round((v * 9.3132e-10) * 10) / 10 + ' GiB';
              return Math.round((v/total_mem * 100)) + '%'
            }, stepSize: total_mem/5
          },
        }
      },
      plugins: { legend: { display: false }}
    };

    this.socket = new WebSocket("ws://127.0.0.1:9001");
    this.socket.onopen = () => {
      this.socket.send(AppComponent.app_session_id);
      this.socket.send("memory_timelapse_usage");
    }
    this.socket.onmessage = (event) => {
      let data: number[] = JSON.parse(event.data) as number[];
      let labels = []
      for (let i = 0; i < data.length; i++) {
        labels.push('')
      }
      this.lineChartData.labels = labels;
      this.lineChartData.datasets[0].data = data;
      this.lineChartData.datasets[0].borderColor = this.line_color;
      this.chart.update();
    }
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
}
