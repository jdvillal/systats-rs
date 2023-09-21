import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  //title = 'systats-rs';

  dark_mode = false;

  constructor(private translate: TranslateService){
    translate.setDefaultLang('en');
    translate.use('en');
  }

  ngOnInit() { 
    let color_mode = localStorage.getItem("color_mode");
    if(color_mode === undefined || color_mode === null){
      localStorage.setItem("color_mode", "dark");
      color_mode = "dark";
    }
    let doc = document.getElementsByTagName("html")[0];
    if(color_mode == "dark"){
      this.dark_mode = true;
    }else {
      this.dark_mode = false;
    }
    doc.setAttribute("data-bs-theme", color_mode);

  }

  onDarkModeToggle(){
    let doc = document.getElementsByTagName("html")[0];
    
    if(!this.dark_mode){
      doc.setAttribute("data-bs-theme","dark");
      localStorage.setItem("color_mode", "dark");
      this.dark_mode = true;
    }else{
      doc.setAttribute("data-bs-theme","light");
      localStorage.setItem("color_mode", "light");
      this.dark_mode = false;
    }
  }


}
