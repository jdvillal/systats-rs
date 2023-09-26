import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CpuCombustorComponent } from './cpu-combustor.component';

describe('CpuCombustorComponent', () => {
  let component: CpuCombustorComponent;
  let fixture: ComponentFixture<CpuCombustorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CpuCombustorComponent]
    });
    fixture = TestBed.createComponent(CpuCombustorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
