import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { LoggerService } from '../../service/logger.service';
import { DrawtoolService } from '../../service/drawtool.service';
import { EventbusService, EventType } from '../../service/eventbus.service';

@Component({
  selector: 'app-pencil',
  templateUrl: './pencil.component.html',
  styleUrls: ['./pencil.component.scss'],
})
export class PencilComponent implements OnInit {
  prop = '';
  constructor(
    private drawtool: DrawtoolService,
    private navparams: NavParams,
    private logger: LoggerService,
    private eventbus: EventbusService,
  ) {
    this.prop = this.navparams.data.props;
    this.logger.debug(this.prop);
  }

  ngOnInit() {
    this.logger.debug(this.navparams);
  }

  setColor(color) {
    this.drawtool.setColor(color);
    this.eventbus.popover$.next({
      type: EventType.popover_selectPencilClosed
    });
  }

  setLineWeight(weight) {
    this.drawtool.setLineWeight(weight);
    this.eventbus.popover$.next({
      type: EventType.popover_selectPencilClosed
    });
  }
}
