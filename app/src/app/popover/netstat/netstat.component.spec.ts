import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NetstatComponent } from './netstat.component';

describe('NetstatComponent', () => {
  let component: NetstatComponent;
  let fixture: ComponentFixture<NetstatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetstatComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NetstatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
