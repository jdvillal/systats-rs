import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { OS_type } from './types/app-types';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  //title = 'systats-rs';

  dark_mode = false;
  selected_language!: string;

  supported_languages = [
    {language: 'English', abbreviation: 'en'},
    {language: 'Español', abbreviation: 'es'}
  ]

  
  constructor(private translate: TranslateService){
    let lang = localStorage.getItem('lang');
    if(lang){
      this.selected_language = lang;
      this.set_language(lang);
      return;
    }
    localStorage.setItem('lang', 'en');
    translate.setDefaultLang('en');
    translate.use('en');
    this.selected_language = 'en';
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

  public set_language(language: string){
    localStorage.setItem('lang', language);
    this.selected_language = language;
    this.translate.setDefaultLang(language);
    this.translate.use(language)
  }

}
