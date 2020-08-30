import { Component, OnInit, AfterViewInit } from '@angular/core';
import { LoggerService } from '../service/logger.service';
import { PopoverController } from '@ionic/angular';
import { PencilComponent } from '../popover/pencil/pencil.component';
import { DrawtoolService, DrawtoolType } from '../service/drawtool.service';

@Component({
  selector: 'app-drawtool',
  templateUrl: './drawtool.component.html',
  styleUrls: ['./drawtool.component.scss'],
})
export class DrawtoolComponent implements OnInit, AfterViewInit {
  popoverPencil;
  drawtoolType = DrawtoolType;

  constructor(
    public drawtool: DrawtoolService,
    private logger: LoggerService,
    private popoverController: PopoverController,

  ) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
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
}
