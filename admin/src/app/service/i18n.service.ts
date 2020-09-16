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
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  public en = {
    roomManage: 'Manage Room',
    createRoom: 'Create Room',
    updateRoom: 'Update Room',
    roomName: 'Room Name',
    speakerPasswordInput: 'Presenter password',
    attendeePasswordInput: 'Login password',
    roomDesc: 'Room description',
    create: 'Create',
    edit: 'Edit',
    link: 'Link',
    update: 'Update',
    name: 'Name',
    createTime: 'Create Time',
    lastActiveTime: 'Last Active Time',
    operation: 'Operation',
    add: 'Add',
    delete: 'Delete',
    search: 'Search',
    speaker: 'Speaker',
    attendee: 'Attendee',
    copy: 'Copy',
    open: 'Open',
    password: 'Password',
    userLogin: 'User Login',
    roomMonitor: 'Room Monitor',
    whetherClose: 'Whether Close',
    durationTime: 'Duration Time(min)',
    lastActionTime: 'Last Active(min)',
    classStatus: 'Class Status',
    peersNumber: 'Peers Number',

    close: 'Close',
    save: 'Save',
    login: 'Login',
    inputUsername: 'Please input your username',
    inputPassword: 'Please input your password(3-10)',
    setLogoUrl: 'Set Logo Url(http or https)',
    announcementInput: 'Please input announcement',
    videoFilter: 'Video Filter',
  };

  public cn = {
    roomManage: '房间管理',
    createRoom: '创建房间',
    updateRoom: '更新房间',
    roomName: '房间名称',
    speakerPasswordInput: '主持人密码',
    attendeePasswordInput: '登录密码',
    roomDesc: '房间描述',
    create: '创建',
    edit: '编辑',
    link: '链接',
    update: '更新',
    name: '名称',
    createTime: '创建时间',
    lastActiveTime: '上次使用时间',
    operation: '操作',
    add: '添加',
    delete: '删除',
    search: '搜索',
    speaker: '讲师',
    attendee: '参与人',
    copy: '复制',
    open: '打开',
    password: '密码',
    userLogin: '用户登录',
    roomMonitor: '房间监控',
    whetherClose: '是否关闭',
    durationTime: '持续时长（分）',
    lastActionTime: '上次活动（分）',
    classStatus: '课堂状态',
    peersNumber: '参与人数',

    close: '关闭',
    save: '保存',
    login: '登录',
    inputUsername: '请输入您的用户名',
    inputPassword: '请输入您的密码(3-10)',
    setLogoUrl: '设置Logo路径(http或https)',
    announcementInput: '请输入系统公告',
    videoFilter: '视频滤镜',
  };

  public lang = this.cn;
  public locale = 'cn';

  constructor() {
   }

   setLocale(locale: string) {
     switch ( locale ) {
       case 'en' :
         this.lang = this.en;
         this.locale = locale;
         break;
      case 'cn' :
        this.lang = this.cn;
        this.locale = locale;
        break;
      default:
        this.lang = this.en;
     }
   }
}
