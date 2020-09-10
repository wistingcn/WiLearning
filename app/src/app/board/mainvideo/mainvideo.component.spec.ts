import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MainvideoComponent } from './mainvideo.component';

describe('MainvideoComponent', () => {
  let component: MainvideoComponent;
  let fixture: ComponentFixture<MainvideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainvideoComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MainvideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
