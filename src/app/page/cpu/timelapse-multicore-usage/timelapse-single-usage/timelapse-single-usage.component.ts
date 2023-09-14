import { Component, Input, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';
import { CpuDataUpdateServiceService } from '../service/cpu-data-update-service.service';

@Component({
  selector: 'app-timelapse-single-usage',
  templateUrl: './timelapse-single-usage.component.html',
  styleUrls: ['./timelapse-single-usage.component.css'],
  standalone: true,
  imports: [NgChartsModule]
})
export class TimelapseSingleUsageComponent {
  private eventsSubscription!: Subscription;

  @Input() core_number: number = 0;
  @Input() core_data: number[] = [];

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Usage',
        //fill: false,
        //tension: 0.1,
        borderWidth: 1,
        pointRadius: 0,
        //borderColor: 'black',
        backgroundColor: 'limegreen'
      },
    ]
  };
  public lineChartOptions: ChartOptions<'line'> = {
    //parsing: false,
    responsive: false,
    animation: false,
    //spanGaps: true,
    scales: {
      x: { display: false, min:0, max: 120},
      y: { display: true, min:0, max: 100, beginAtZero: false }
    },
    plugins: { legend: { display: false } }
  };
  public lineChartLegend = false;

  constructor(
    private signalService: CpuDataUpdateServiceService
  ) { }

  ngOnInit() {
    this.eventsSubscription = this.signalService.message$.subscribe(() => {
      this.on_core_data_updated();
    });
  }
  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
  }

  private labels_updated: boolean = false;
  private on_core_data_updated() {
    this.lineChartData.labels = [];
    
      
    for (let i = 0; i < this.core_data.length; i++) {
      this.lineChartData.labels.push('');
    }
    
    this.lineChartData.datasets[0].data = this.core_data;
    //let start = Date.now();
    this.chart.update('none');
    //this.chart.render();
    //let end = Date.now();

    
    //console.log("Time elapsed ===>", end - start);
  }

}
