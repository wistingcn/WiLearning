import { TestBed } from '@angular/core/testing';

import { PdfService } from './pdf.service';

describe('PdfService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PdfService = TestBed.get(PdfService);
    expect(service).toBeTruthy();
  });
});
