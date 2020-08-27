import { TestBed } from '@angular/core/testing';

import { SharemediaService } from './sharemedia.service';

describe('SharemediaService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SharemediaService = TestBed.get(SharemediaService);
    expect(service).toBeTruthy();
  });
});
