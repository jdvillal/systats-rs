import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelapseSingleUsageComponent } from './timelapse-single-usage.component';

describe('TimelapseSingleUsageComponent', () => {
  let component: TimelapseSingleUsageComponent;
  let fixture: ComponentFixture<TimelapseSingleUsageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimelapseSingleUsageComponent]
    });
    fixture = TestBed.createComponent(TimelapseSingleUsageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
