import { TestBed } from '@angular/core/testing';

import { WlhttpService } from './wlhttp.service';

describe('WlhttpService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: WlhttpService = TestBed.get(WlhttpService);
    expect(service).toBeTruthy();
  });
});
