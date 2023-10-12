import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppComponent } from 'src/app/app.component';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent {
  public pid = this.route.snapshot.paramMap.get("pid");

  private socket!: WebSocket;

  constructor(
    private route: ActivatedRoute
  ){}

  ngOnInit(){
    console.log("pid ==> ", this.pid);
    this.socket = new WebSocket("ws://127.0.0.1:9001");
    this.socket.onopen = () =>{
      this.socket.send(AppComponent.app_session_id);
      this.socket.send("process_resources_usage");
      this.socket.send(String(this.pid));
    }
    this.socket.onmessage = (event) => {
      console.log("Received ===> ",JSON.parse(event.data));
    }
    this.socket.onclose = ()=>{
      console.log("CLOSED")
    }
  }
  ngOnDestroy(){
    if (this.socket){
      this.socket.close();
    }
  }

}
