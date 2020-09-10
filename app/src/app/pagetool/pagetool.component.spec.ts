import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { PagetoolComponent } from './pagetool.component';

describe('PagetoolComponent', () => {
  let component: PagetoolComponent;
  let fixture: ComponentFixture<PagetoolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PagetoolComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(PagetoolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
