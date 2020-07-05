import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfSelectComponent } from './pdf-select.component';

describe('PdfSelectComponent', () => {
  let component: PdfSelectComponent;
  let fixture: ComponentFixture<PdfSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PdfSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PdfSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
