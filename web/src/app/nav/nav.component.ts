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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { PeerService } from '../service/peer.service';
import { LoggerService } from '../service/logger.service';
import { I18nService } from '../service/i18n.service';
import { DrawtoolService } from '../service/drawtool.service';
import { ProfileService } from '../service/profile.service';
import { EventbusService, IEventType } from '../service/eventbus.service';
import { WebsocketService } from '../service/websocket.service';
import { CONNECT_VIDEO_STATUS } from '../defines';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css'],
})
export class NavComponent implements OnInit, OnDestroy {
  tab = {
    index: 0,
    header: 'Document',
  };
  tabs = [this.tab];
  memberBadgeNum = 0;

  constructor(
    public peer: PeerService,
    public i18n: I18nService,
    public drawtool: DrawtoolService,
    public profile: ProfileService,
    private logger: LoggerService,
    public eventbus: EventbusService,
    private socket: WebsocketService,
    ) {
    }

    async ngOnInit() {
      this.eventbus.nav$.subscribe((event: IEventType) => {
        if ( event.type === 'navAddTab') {
        this.addNavTab();
        }
      });

      this.checkMemberBadge();

    }

    ngOnDestroy() {
      this.logger.debug('Nav Destory!');
    }

    checkMemberBadge() {
      setInterval(() => {
        this.memberBadgeNum = 0;
        for ( const peer of this.peer.peersInfo ) {
          if ( peer.connectVideoStatus === CONNECT_VIDEO_STATUS.Requested ) {
            this.memberBadgeNum++;
          }
        }
      }, 2000);
    }

    addNavTab() {
      const tab = {
        index: this.tabs.length,
        header : 'Document-' + this.tabs.length
      };

      this.tabs.push(tab);
      this.tabIndexChange(this.tabs.length - 1 );

      setTimeout(() => {
        const element = document.getElementById('cla-tab-header' + tab.index);
        element.focus();
        element.click();
        document.execCommand('selectAll', false , null);
      }, 300);
    }

    tabIndexChange(event) {
      this.eventbus.selectedTab.setValue(+event);
    }

    tabHeaderChange(id, event) {
      const tab = this.tabs[id];
      const text = event.target.innerText;
      tab.header = text;
      this.logger.debug('tab: %s, %s', tab.index, tab.header);
      this.logger.debug('event.target.innerText: %o', event.target.innerText);
    }

    getTabId(index) {
      return 'cla-tab-header' + index;
    }

    newTabDoc(index, event) {
      this.logger.debug('tab index : %s, open file : %s', index , event);
      const element = document.getElementById('cla-tab-header' + index);
      element.innerText = event;
      element.contentEditable = 'false';
    }
}
