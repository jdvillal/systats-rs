import { CommonModule } from '@angular/common';
import { Component, Input, ViewChild } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';
import { DiskInfo } from 'src/app/types/disk-types';

@Component({
  selector: 'app-disk-chart',
  templateUrl: './disk-chart.component.html',
  styleUrls: ['./disk-chart.component.css'],
  standalone: true,
  imports: [CommonModule, NgChartsModule]
})
export class DiskChartComponent {
  private eventsSubscription!: Subscription;
  @Input() disk_info_ready_observable!: Observable<DiskInfo>;
  @Input() disk_info!: DiskInfo;
  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  public doughnutChartLabels: string[] = [ 'Used', 'Available'];
  public doughnutChartDatasets: ChartConfiguration<'doughnut'>['data']['datasets'] = [
      { data: [ ], label: 'Memory', borderColor: 'white', backgroundColor: ['rgb(255, 99, 132)','rgb(54, 162, 235)']},
    ];

  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: false,
    cutout: '70%',
    plugins: {legend: {position: 'top', align: 'center'}}
  };

  ngOnInit(){
    let available = this.disk_info.available_space;
    let used = this.disk_info.total_space - available;
    this.doughnutChartDatasets[0].data = [available, used]
  }

}
