import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DrawtoolComponent } from './drawtool.component';

describe('DrawtoolComponent', () => {
  let component: DrawtoolComponent;
  let fixture: ComponentFixture<DrawtoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DrawtoolComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DrawtoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
