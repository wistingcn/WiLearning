/*
 * Copyright (c) 2020 Wisting Team. <linewei@gmail.com>
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
import { Component, OnInit, Inject } from '@angular/core';
import { DrawtoolService } from 'src/app/service/drawtool.service';
import { I18nService } from 'src/app/service/i18n.service';
import { ProfileService } from 'src/app/service/profile.service';
import { PdfSelectComponent } from '../pdf-select/pdf-select.component';
import { LoggerService } from 'src/app/service/logger.service';
import { Overlay } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { EventbusService, EventType, IEventType } from 'src/app/service/eventbus.service';

@Component({
  selector: 'app-drawtool',
  templateUrl: './drawtool.component.html',
  styleUrls: ['./drawtool.component.css']
})
export class DrawtoolComponent implements OnInit {

  pageButtonValid: boolean;

  constructor(
    public drawtool: DrawtoolService,
    public i18n: I18nService,
    public profile: ProfileService,
    private logger: LoggerService,
    private overlay: Overlay,
    private eventbus: EventbusService,
  ) { }

  ngOnInit() {
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          this.prevPage();
          break;
        case 'ArrowRight':
          this.nextPage();
          break;
      }
    });
  }

  lineWeightSelect(weight: number) {
    this.drawtool.setLineWeight(weight);
  }

  colorSelect(color: string) {
    this.drawtool.setColor(color);
  }

  openFileDialog() {
    const globalPosition = this.overlay.position().global();
    globalPosition
      .top('100px')
      .left('30vw');

    const overlayRef = this.overlay.create({
      positionStrategy: globalPosition,
      hasBackdrop: true,
      height: '50vh',
      width: '30vw',
    });
    const portal = new ComponentPortal(PdfSelectComponent);
    overlayRef.attach(portal);

    this.eventbus.overlay$.subscribe((event: IEventType) => {
      if ( event.type === EventType.overlay_pdfSelectClosed) {
        overlayRef.detach();
      }
    });
  }

  async prevPage() {
    this.pageButtonValid = true;
    await this.drawtool.document.prevPage();
    this.pageButtonValid = false;
  }
  async nextPage() {
    this.pageButtonValid = true;
    await this.drawtool.document.nextPage();
    this.pageButtonValid = false;
  }

  addNavTab() {
    this.eventbus.nav$.next({
      type: 'navAddTab',
    });
  }
}
