import { TestBed } from '@angular/core/testing';

import { CpuPreferencesService } from './cpu-preferences.service';

describe('CpuPreferencesService', () => {
  let service: CpuPreferencesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CpuPreferencesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
