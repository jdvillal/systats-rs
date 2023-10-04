import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DiskComponent } from './disk.component';

describe('DiskComponent', () => {
  let component: DiskComponent;
  let fixture: ComponentFixture<DiskComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DiskComponent]
    });
    fixture = TestBed.createComponent(DiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
