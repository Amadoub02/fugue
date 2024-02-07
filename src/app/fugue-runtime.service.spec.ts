import { TestBed } from '@angular/core/testing';

import { FugueRuntimeService } from './fugue-runtime.service';

describe('FugueRuntimeService', () => {
  let service: FugueRuntimeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FugueRuntimeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
