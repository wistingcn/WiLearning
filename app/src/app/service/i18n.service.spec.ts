import { TestBed } from '@angular/core/testing';

import { I18nService } from './i18n.service';

describe('I18nService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: I18nService = TestBed.get(I18nService);
    expect(service).toBeTruthy();
  });
});
