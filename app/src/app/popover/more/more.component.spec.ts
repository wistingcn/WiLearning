import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { MoreComponent } from './more.component';

describe('MoreComponent', () => {
  let component: MoreComponent;
  let fixture: ComponentFixture<MoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoreComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(MoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
