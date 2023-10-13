import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';
@Component({
  selector: 'app-process-cpu-usage',
  templateUrl: './process-cpu-usage.component.html',
  styleUrls: ['./process-cpu-usage.component.css'],
  standalone: true,
  imports: [CommonModule, NgChartsModule]
})
export class ProcessCpuUsageComponent {
  private onDataUpdateEventSubscription!: Subscription;
  @Input() data!: number[];
  @Input() data_update_observable!: Observable<void>;


  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public line_color = 'ffffff';

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
    this.lineChartOptions = {
      animation: false,
      scales: { x: { display: false }, y: { max: 100 } },
      plugins: { legend: { display: false } }
    };
    this.onDataUpdateEventSubscription = this.data_update_observable.subscribe(() => {
      console.log(this.data)
      this.update_chart();
    })
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
