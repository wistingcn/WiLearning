import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NavComponent } from './nav/nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { VideoComponent } from './video/video.component';
import { ngfModule } from 'angular-file';
import { ChatComponent } from './chat/chat.component';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { PERFECT_SCROLLBAR_CONFIG } from 'ngx-perfect-scrollbar';
import { PerfectScrollbarConfigInterface } from 'ngx-perfect-scrollbar';
import { SharedModule } from './misc/shared.module';
import { MemberComponent } from './member/member.component';
import { TopVideoComponent } from './video/top-video/top-video.component';
import { ContainerComponent } from './container/container.component';
import { ShareVideoComponent } from './container/share-video/share-video.component';
import { LeftsideComponent } from './leftside/leftside.component';
import {OverlayModule} from '@angular/cdk/overlay';
import {PortalModule} from '@angular/cdk/portal';
import { DocumentComponent } from './container/document/document.component';
import { DrawtoolComponent } from './container/drawtool/drawtool.component';
import { PdfSelectComponent } from './container/pdf-select/pdf-select.component';
import { SigninComponent } from './signin/signin.component';
import { ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { SettingComponent } from './container/setting/setting.component';
import {PlatformModule} from '@angular/cdk/platform';
import { StreaminfoComponent } from './container/streaminfo/streaminfo.component';

const DEFAULT_PERFECT_SCROLLBAR_CONFIG: PerfectScrollbarConfigInterface = {
  suppressScrollX: true
};

@NgModule({
  declarations: [
    AppComponent,
    NavComponent,
    VideoComponent,
    ChatComponent,
    MemberComponent,
    TopVideoComponent,
    ContainerComponent,
    ShareVideoComponent,
    LeftsideComponent,
    DocumentComponent,
    DrawtoolComponent,
    PdfSelectComponent,
    SigninComponent,
    SettingComponent,
    StreaminfoComponent,
  ],
  entryComponents: [
    ShareVideoComponent,
    PdfSelectComponent,
    SettingComponent,
    StreaminfoComponent,
  ],
  imports: [
    HttpClientModule,
    SharedModule,
    BrowserModule,
    BrowserAnimationsModule,
    LayoutModule,
    ngfModule,
    PerfectScrollbarModule,
    OverlayModule,
    PortalModule,
    ReactiveFormsModule,
    AppRoutingModule,
    PlatformModule,
  ],
  providers: [
    {
      provide: PERFECT_SCROLLBAR_CONFIG,
      useValue: DEFAULT_PERFECT_SCROLLBAR_CONFIG
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
