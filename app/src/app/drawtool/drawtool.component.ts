import { Component, OnInit } from '@angular/core';
import { LoggerService } from '../service/logger.service';
import { PopoverController } from '@ionic/angular';
import { PencilComponent } from '../popover/pencil/pencil.component';
import { DrawtoolService, DrawtoolType } from '../service/drawtool.service';
import { DocselectComponent } from '../popover/docselect/docselect.component';
import { EventbusService, IEventType, EventType } from '../service/eventbus.service';

@Component({
  selector: 'app-drawtool',
  templateUrl: './drawtool.component.html',
  styleUrls: ['./drawtool.component.scss'],
})
export class DrawtoolComponent implements OnInit {
  popoverPencil;
  drawtoolType = DrawtoolType;
  popoverDocselect;

  constructor(
    public drawtool: DrawtoolService,
    private logger: LoggerService,
    private popoverController: PopoverController,
    private eventbus: EventbusService,

  ) { }

  ngOnInit() {
    this.eventbus.popover$.subscribe((event: IEventType) => {
      if (event.type === EventType.popover_docSelectClosed && this.popoverDocselect) {
        this.popoverDocselect.dismiss();
        this.popoverDocselect = null;
      }

      if (event.type === EventType.popover_selectPencilClosed && this.popoverPencil) {
        this.popoverPencil.dismiss();
        this.popoverPencil = null;
      }

    });

  }

  async selectColor(ev) {
    const popover = await this.popoverController.create({
      component: PencilComponent,
      translucent: false,
      event: ev,
      cssClass: '',
      componentProps: {props: 'color'}
    });
    popover.present();
    this.popoverPencil = popover;

  }

  async selectLineWeight(ev) {
    const popover = await this.popoverController.create({
      component: PencilComponent,
      translucent: false,
      event: ev,
      cssClass: '',
      componentProps: {props: 'lineweight'}
    });
    popover.present();
    this.popoverPencil = popover;
  }

  drawtoolButton(button) {
    if (this.drawtool.selectedTool === button ) {
      return 'primary';
    }
    return 'light';
  }

  async openDocSelect(ev) {
    const popover = await this.popoverController.create({
      component: DocselectComponent,
      translucent: false,
      event: ev,
      cssClass: 'popoverDocselect'
    });
    popover.present();
    this.popoverDocselect = popover;
  }
}
