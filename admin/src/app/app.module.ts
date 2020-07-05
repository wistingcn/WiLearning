import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { SharedModule } from './misc/shared.module';
import { QuillModule } from 'ngx-quill';
import { RoomComponent } from './room/room.component';
import { AddroomComponent } from './addroom/addroom.component';
import { RoomlinkComponent } from './roomlink/roomlink.component';
import { SigninComponent } from './signin/signin.component';
import { MonitorComponent } from './monitor/monitor.component';

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    RoomComponent,
    AddroomComponent,
    RoomlinkComponent,
    SigninComponent,
    MonitorComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    QuillModule.forRoot(),
    SharedModule,
  ],
  entryComponents: [
    AddroomComponent,
    RoomlinkComponent,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
