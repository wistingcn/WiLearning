import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShareVideoComponent } from './share-video.component';

describe('ShareVideoComponent', () => {
  let component: ShareVideoComponent;
  let fixture: ComponentFixture<ShareVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShareVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShareVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
