import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentSwapUsageComponent } from './current-swap-usage.component';

describe('CurrentSwapUsageComponent', () => {
  let component: CurrentSwapUsageComponent;
  let fixture: ComponentFixture<CurrentSwapUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CurrentSwapUsageComponent]
    });
    fixture = TestBed.createComponent(CurrentSwapUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
