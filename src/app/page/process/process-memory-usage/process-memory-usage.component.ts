import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { invoke } from '@tauri-apps/api';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';
import { MemoryInfo } from 'src/app/types/memory-types';
@Component({
  selector: 'app-process-memory-usage',
  templateUrl: './process-memory-usage.component.html',
  styleUrls: ['./process-memory-usage.component.css'],
  standalone: true,
  imports: [CommonModule, NgChartsModule]
})
export class ProcessMemoryUsageComponent {
  private onDataUpdateEventSubscription!: Subscription;
  @Input() total_mem!: number;
  @Input() data!: number[];
  @Input() data_update_observable!: Observable<void>;


  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public line_color = '#ff0000';

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
    this.lineChartData.datasets[0].borderColor = this.line_color;
    this.chart.update();
  }
}
