import { Component } from '@angular/core';

@Component({
  selector: 'app-page',
  templateUrl: './page.component.html',
  styleUrls: ['./page.component.css']
})
export class PageComponent {
  current_tab = "";
  current_page = "cpu";

  dark_mode = false;

  /*greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    invoke<string>("greet", { name }).then((text) => {
      //this.greetingMessage = text;
    });
  }*/

  on_page_clicked(page: string){
    this.current_page = page;
  }

  ngOnInit() {
    
  }
}
