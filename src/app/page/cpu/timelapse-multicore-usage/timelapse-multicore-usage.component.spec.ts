import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelapseMulticoreUsageComponent } from './timelapse-multicore-usage.component';

describe('TimelapseMulticoreUsageComponent', () => {
  let component: TimelapseMulticoreUsageComponent;
  let fixture: ComponentFixture<TimelapseMulticoreUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimelapseMulticoreUsageComponent]
    });
    fixture = TestBed.createComponent(TimelapseMulticoreUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
