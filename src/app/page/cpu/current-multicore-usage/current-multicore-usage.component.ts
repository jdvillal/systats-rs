import { Component, ViewChild, HostListener, Input } from '@angular/core';
import { ChartConfiguration } from 'chart.js';
import { BaseChartDirective, NgChartsModule } from 'ng2-charts';

@Component({
  selector: 'app-current-multicore-usage',
  templateUrl: './current-multicore-usage.component.html',
  styleUrls: ['./current-multicore-usage.component.css'],
  standalone: true,
  imports: [NgChartsModule]
})
export class CurrentMulticoreUsageComponent {
  @Input() core_count: number = 0;
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
      x: {display: true,},
      y: {display: true, max: 100}
    },
    plugins: { legend: { display: false }}
  };

  constructor() {
  }

  ngOnInit() {
    //Wait for the parent component to get cpu information (core count is needed to start rendering this component canvas)
    //TODO: find a way to not depend on timeouts
    this.sleep(100).then(() => {
      this.barChartData.labels = [];
      for (let i = 0; i < this.core_count; i++) {
        this.barChartData.labels.push(`core-${i+1}`);
      }
  
      this.socket = new WebSocket("ws://127.0.0.1:9001");
      this.socket.onopen = () => {
        this.socket.send("cpu_current_multicore_usage")
      }
      this.socket.onmessage = (event) => {
        //console.log(event.data)
        let data = JSON.parse(event.data) as number[]
        this.barChartData.datasets[0].data = data;
        if (this.chart) this.chart.update();
      }
    })
  }

  sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
  
}
