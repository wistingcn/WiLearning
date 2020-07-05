import { Component, OnInit, OnDestroy } from '@angular/core';
import { PeerService } from '../../service/peer.service';
import { EventbusService, EventType, IEventType } from 'src/app/service/eventbus.service';
import { LoggerService } from 'src/app/service/logger.service';

@Component({
  selector: 'app-top-video',
  templateUrl: './top-video.component.html',
  styleUrls: ['./top-video.component.css']
})
export class TopVideoComponent implements OnInit, OnDestroy {

  volume = 0;
  constructor(
    public peer: PeerService,
    private eventbus: EventbusService,
    private logger: LoggerService,
  ) {
  }

  ngOnInit() {
    this.eventbus.nav$.next({
      type: EventType.nav_topVideoViewInit,
    });
  }

  ngOnDestroy(): void {
    this.eventbus.nav$.next({
      type: EventType.nav_topVideoViewDestroy,
    });
  }
}
