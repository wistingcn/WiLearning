import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms';
import { MemberComponent } from './member/member.component';
import { ChatComponent } from './chat/chat.component';
import { WelcomeComponent } from './board/welcome/welcome.component';
import { MainvideoComponent } from './board/mainvideo/mainvideo.component';
import { DocumentComponent } from './board/document/document.component';
import { WhiteboardComponent } from './board/whiteboard/whiteboard.component';
import { SharedeskComponent } from './board/sharedesk/sharedesk.component';
import { SharemediaComponent } from './board/sharemedia/sharemedia.component';
import { MoreComponent } from './popover/more/more.component';
import { SettingComponent } from './popover/setting/setting.component';
import { NetstatComponent } from './popover/netstat/netstat.component';
import { SharepopoverComponent } from './popover/sharepopover/sharepopover.component';
import { VideoplayerComponent } from './videoplayer/videoplayer.component';
import { EmojiComponent } from './popover/emoji/emoji.component';
import { MainComponent } from './main/main.component';

@NgModule({
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: environment.production
    })
  ],
  declarations: [
    AppComponent,
    MainComponent,
    MemberComponent,
    ChatComponent,

    WelcomeComponent,
    MainvideoComponent,
    DocumentComponent,
    WhiteboardComponent,
    SharedeskComponent,
    SharemediaComponent,

    MoreComponent,
    SettingComponent,
    NetstatComponent,
    SharepopoverComponent,
    EmojiComponent,

    VideoplayerComponent,
  ],
  entryComponents: [
    MoreComponent,
    SettingComponent,
    NetstatComponent,
    SharepopoverComponent,
    EmojiComponent,
  ],
  providers: [InAppBrowser, SplashScreen, StatusBar],
  bootstrap: [AppComponent]
})
export class AppModule {}
