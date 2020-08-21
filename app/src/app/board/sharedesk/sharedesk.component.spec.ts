import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SharedeskComponent } from './sharedesk.component';

describe('SharedeskComponent', () => {
  let component: SharedeskComponent;
  let fixture: ComponentFixture<SharedeskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharedeskComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SharedeskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
