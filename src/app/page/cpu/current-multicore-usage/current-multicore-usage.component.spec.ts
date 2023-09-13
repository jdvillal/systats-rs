import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentMulticoreUsageComponent } from './current-multicore-usage.component';

describe('CurrentMulticoreUsageComponent', () => {
  let component: CurrentMulticoreUsageComponent;
  let fixture: ComponentFixture<CurrentMulticoreUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentMulticoreUsageComponent]
    });
    fixture = TestBed.createComponent(CurrentMulticoreUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
