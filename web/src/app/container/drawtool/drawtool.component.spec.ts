import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DrawtoolComponent } from './drawtool.component';

describe('DrawtoolComponent', () => {
  let component: DrawtoolComponent;
  let fixture: ComponentFixture<DrawtoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawtoolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DrawtoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
