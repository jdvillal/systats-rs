import { TestBed } from '@angular/core/testing';

import { CpuDataUpdateNotifierService } from './cpu-data-update-notifier.service';

describe('CpuDataUpdateNotifierService', () => {
  let service: CpuDataUpdateNotifierService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CpuDataUpdateNotifierService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
