import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomlinkComponent } from './roomlink.component';

describe('RoomlinkComponent', () => {
  let component: RoomlinkComponent;
  let fixture: ComponentFixture<RoomlinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RoomlinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RoomlinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
