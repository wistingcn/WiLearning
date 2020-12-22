/*
 * Copyright (c) 2020 liwei<linewei@gmail.com>
 *
 * This program is free software: you can use, redistribute, and/or modify
 * it under the terms of the GNU Affero General Public License, version 3
 * or later ("AGPL"), as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
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
