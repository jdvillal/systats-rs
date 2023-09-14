import { Component, ViewChild, HostListener, Input, EventEmitter } from '@angular/core';
import { event } from '@tauri-apps/api';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-current-multicore-usage',
  templateUrl: './current-multicore-usage.component.html',
  styleUrls: ['./current-multicore-usage.component.css'],
  standalone: true,
  imports: [NgChartsModule]
})
export class CurrentMulticoreUsageComponent {
  private eventsSubscription!: Subscription;
  @Input() core_count_ready_event!: Observable<number>;

  @ViewChild(BaseChartDirective) chart!: BaseChartDirective;

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    // Handle the resize event here
    console.log('Window resized!');

    this.chart.chart?.resize();
    // Add your code to handle the resize event
  }

  socket!: WebSocket;
  public barChartLegend = false;
  public barChartPlugins = [];

  public barChartData: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: [
      { data: [], label: 'Usage' }
    ]
  };

  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    //responsive:true,
    //maintainAspectRatio: false,
    //aspectRatio: 5.0, 
    scales: {
      x: { display: true, },
      y: { display: true, max: 100 }
    },
    plugins: { legend: { display: false } }
  };

  constructor() {
  }

  ngOnInit() {
    this.eventsSubscription = this.core_count_ready_event.subscribe((core_count) => {
      this.onCoreCountReady(core_count);
    });
  }

  public onCoreCountReady(core_count: number) {
    this.barChartData.labels = [];
    for (let i = 0; i < core_count; i++) {
      this.barChartData.labels.push(`core-${i + 1}`);
    }
    this.socket = new WebSocket("ws://127.0.0.1:9001");
    this.socket.onopen = () => {
      this.socket.send("cpu_current_multicore_usage")
    }
    this.socket.onmessage = (event) => {
      let data = JSON.parse(event.data) as number[]
      this.barChartData.datasets[0].data = data;
      if (this.chart) this.chart.update();
    }
  }

  ngOnDestroy(){
    this.eventsSubscription.unsubscribe();
    this.socket.close();
  }
}
