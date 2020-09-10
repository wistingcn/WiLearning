import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { DocselectComponent } from './docselect.component';

describe('DocselectComponent', () => {
  let component: DocselectComponent;
  let fixture: ComponentFixture<DocselectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocselectComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(DocselectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
