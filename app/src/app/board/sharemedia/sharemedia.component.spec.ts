import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SharemediaComponent } from './sharemedia.component';

describe('SharemediaComponent', () => {
  let component: SharemediaComponent;
  let fixture: ComponentFixture<SharemediaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharemediaComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SharemediaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
