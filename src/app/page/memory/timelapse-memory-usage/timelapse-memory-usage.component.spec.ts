import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelapseMemoryUsageComponent } from './timelapse-memory-usage.component';

describe('TimelapseMemoryUsageComponent', () => {
  let component: TimelapseMemoryUsageComponent;
  let fixture: ComponentFixture<TimelapseMemoryUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimelapseMemoryUsageComponent]
    });
    fixture = TestBed.createComponent(TimelapseMemoryUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
