import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StreaminfoComponent } from './streaminfo.component';

describe('StreaminfoComponent', () => {
  let component: StreaminfoComponent;
  let fixture: ComponentFixture<StreaminfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StreaminfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StreaminfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
