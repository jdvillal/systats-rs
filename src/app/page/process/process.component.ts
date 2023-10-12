import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-process',
  templateUrl: './process.component.html',
  styleUrls: ['./process.component.css']
})
export class ProcessComponent {
  public pid = this.route.snapshot.paramMap.get("pid");

  constructor(
    private route: ActivatedRoute
  ){}

  ngOnInit(){
    console.log("pid ==> ", this.pid);
  }

}
