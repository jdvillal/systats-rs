import { TestBed } from '@angular/core/testing';

import { CpuDataUpdateServiceService } from './cpu-data-update-service.service';

describe('CpuDataUpdateServiceService', () => {
  let service: CpuDataUpdateServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CpuDataUpdateServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
