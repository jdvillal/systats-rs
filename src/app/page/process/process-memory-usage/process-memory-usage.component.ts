import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { ColorPickerModule } from 'ngx-color-picker';
import { Observable, Subscription } from 'rxjs';
import { ProcessPreferencesService } from 'src/app/services/process-preferences.service';
import { MemoryInfo } from 'src/app/types/memory-types';
@Component({
  selector: 'app-process-memory-usage',
  templateUrl: './process-memory-usage.component.html',
  styleUrls: ['./process-memory-usage.component.css'],
  standalone: true,
  imports: [CommonModule, NgChartsModule, ColorPickerModule]
})
export class ProcessMemoryUsageComponent {
  private onDataUpdateEventSubscription!: Subscription;
  @Input() total_mem!: number;
  @Input() data!: number[];
  @Input() data_update_observable!: Observable<void>;


  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public preferences = this.process_preferences.get_preferences();

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

  constructor(private process_preferences: ProcessPreferencesService){}

  ngOnInit() {}
  ngAfterViewInit(){
    // fetch memory info to set y scale ticks
    invoke<MemoryInfo>("get_memory_information").then((res: MemoryInfo) => {
      let mem_info = res;
      let total_mem = res.total;
      this.lineChartOptions = {
        animation: false,
        scales: { x: { display: false }, y: {
          min: 0, max: total_mem, ticks: {
            callback: function (value, index, ticks) {
              let v = value as number;
              return Math.round((v/total_mem * 100)) + '%'
            }, stepSize: total_mem/5
          },
        } },
        plugins: { legend: { display: false } }
      };

      this.onDataUpdateEventSubscription = this.data_update_observable.subscribe(() => {
        this.update_chart();
      })

    });
  }

  ngOnDestroy() {
    if(this.onDataUpdateEventSubscription){
      this.onDataUpdateEventSubscription.unsubscribe()
    }
  }

  update_chart() {
    let labels = []
    for (let i = 0; i < this.data.length; i++) {
      labels.push('')
    }
    this.lineChartData.labels = labels;
    this.lineChartData.datasets[0].data = this.data;
    this.lineChartData.datasets[0].borderColor = this.preferences.memory_usage_chart.process_lines_color;
    this.chart.update();
  }

  public format_memory_usage(bytes: number): string{
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

  /****************Appearance settings logic*****************/

  public demo_process_lines_color = this.preferences.memory_usage_chart.process_lines_color;
  public demo_background_color = this.preferences.memory_usage_chart.background_color;

  reset_settings(){
    this.demo_process_lines_color = this.preferences.memory_usage_chart.process_lines_color;
    this.demo_background_color = this.preferences.memory_usage_chart.background_color;
  }

  apply_settings(){
    this.preferences.memory_usage_chart.process_lines_color = this.demo_process_lines_color;
    this.preferences.memory_usage_chart.background_color = this.demo_background_color;
    this.process_preferences.save();
  }
}
