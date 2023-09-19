import { Injectable } from '@angular/core';
import { PageState } from '../types/page-state';

@Injectable({
  providedIn: 'root'
})
export class PagesStateService {
  public static page_state: PageState = {
    current_cpu_chart_type: undefined,
  }

  constructor() { }

  public get_page_state(){
    return PagesStateService.page_state;
  }

}
