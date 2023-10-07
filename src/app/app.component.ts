import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppColorMode, OS_type } from './types/app-types';
import { appWindow } from '@tauri-apps/api/window';
import { invoke } from '@tauri-apps/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  //No component should be loaded until app_session_id value has been fetch from rust
  static app_session_id: string;
  public app_id_ready = false;

  dark_mode = false;
  color_mode: AppColorMode = 'OS';
  unlisten: any;

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

  async ngOnInit() {
    this.get_app_session_id();
    let color_mode = localStorage.getItem("color_mode");
    this.color_mode = color_mode as AppColorMode;
    if(color_mode === undefined || color_mode === null){
      localStorage.setItem("color_mode", "OS");
      this.color_mode = "OS";
    }
    this.update_color_mode();
    
  }

  async update_color_mode(){
    if(this.color_mode == 'dark'){
      this.dark_mode = true;
    }else if(this.color_mode == 'light'){
      this.dark_mode = false;
    }else {
      let theme = await appWindow.theme();
      if(theme == 'dark'){
        this.dark_mode = true;
      }else{
        this.dark_mode = false;
      }
      this.unlisten = await appWindow.onThemeChanged(({ payload: theme }) => {
        this.color_mode = theme;
        this.update_color_mode();
      });
    }
    let doc = document.getElementsByTagName("html")[0];
    if(this.dark_mode){
      doc.setAttribute('data-bs-theme', 'dark');
    }else {
      doc.setAttribute('data-bs-theme', 'light');
    }
  }

  async onDarkModeToggle(){
    //let doc = document.getElementsByTagName("html")[0];
    if(this.color_mode == 'dark'){
      this.color_mode = 'light'
    }else if (this.color_mode == 'light'){
      this.color_mode = 'OS'
    }else if (this.color_mode == 'OS') {
      this.color_mode = 'dark'
      this.unlisten();
    }
    localStorage.setItem('color_mode', this.color_mode);
    this.update_color_mode();
  }

  public set_language(language: string){
    localStorage.setItem('lang', language);
    this.selected_language = language;
    this.translate.setDefaultLang(language);
    this.translate.use(language)
  }

  get_app_session_id(): void {
    invoke<string>("get_app_session_id", {}).then((resp) => {
      AppComponent.app_session_id = resp;
      this.app_id_ready = true;
    });
  }

}
