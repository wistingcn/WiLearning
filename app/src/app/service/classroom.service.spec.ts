import { TestBed } from '@angular/core/testing';

import { ClassroomService } from './classroom.service';

describe('ClassroomService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ClassroomService = TestBed.get(ClassroomService);
    expect(service).toBeTruthy();
  });
});
