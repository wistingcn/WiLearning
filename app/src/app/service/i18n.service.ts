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
    username: 'nickname',
    password: 'login password',
    roomid: 'roomid',
    userLogin: 'User Login',
    login: 'Login',
    inputUsername: 'Please input your username',
    inputRoom: 'Please input room id',
    inputPassword: 'Please input your password(3-10)',
    inputPresenterPassword: 'Please input presenter password.',

    welcome: 'Welcome',
    welcomePrompt: 'Presenter has more privileges.',

    chat: 'Chat',
    member: 'Member',
    mutedAll: 'Muted All',
    inputMessage: 'Please enter the message and press Enter to send.',
    sendTo: 'Send to',
    all: 'All',
    send: 'Send',
    start: 'Start',
    stop: 'Stop',

    shareScreen: 'Screen Share',
    stopShareScreen: 'Stop screen share',
    shareMedia: 'Media Share',
    document: 'Document&Whiteboard',
    mainVideo: 'Main Video',

    videoAudioSetting: 'Video&Audio Setting',
    close: 'Close',
    save: 'Save',

    videoCodec: 'Video Codec',
    videoResolution: 'Video Resolution',
    videoFrame: 'FrameRate',
    videoRecvRate: 'Video Receive',
    videoSendRate: 'Video Send',
    audioCodec: 'Audio Codec',
    audioRecvRate: 'Audio Receive',
    audioSendRate: 'Audio Send',

    setAsPresenter: 'Set As Presenter',
    darkTheme: 'Dark Theme',

    chinese: 'Chinese',

    selectFile: 'Select File',
    addFile: 'Add File',
    select: 'Select',
    empty: 'Empty',

    loginErrorRoomNotExist: 'Room do not existed!',
    loginErrorPassword: 'Password error!',
    alert: 'Alert!',
    ok: 'OK',
    unKnownError: 'Unknown Error!',
    mutedPrompt: 'The room is set to muted!',

    confirm: 'Confirm!',
    cancel: 'Cancel',
    exitConfirm: 'Are you sure you want to exit?',

    copy: 'Copy',
    getCameraFailed: 'Get camera failed!',
    getMicFailed: 'Get mic failed!',
  };

  public cn = {
    userLogin: '用户登录',
    username: '昵称（任意）',
    password: '登录密码',
    roomid: '房间ID',
    login: '登录',
    inputUsername: '请输入用户名',
    inputRoom: '请输入房间Id',
    inputPassword: '请输入密码(3-10)',
    inputPresenterPassword: '请输入主持人密码',

    welcome: '欢迎',
    welcomePrompt: '升级为主持人可以享有更多课堂控制权限。',

    chat: '聊天',
    member: '成员',
    mutedAll: '全体禁言',
    inputMessage: '请输入信息，按回车发送',
    sendTo: '发送至',
    all: '所有人',
    send: '发送',
    start: '开始',
    stop: '停止',

    shareScreen: '共享桌面',
    stopShareScreen: '关闭桌面共享',
    shareMedia: '共享媒体',
    document: '课件与白板',
    mainVideo: '主视频',

    videoAudioSetting: '音视频设置',
    close: '关闭',
    save: '保存',

    videoCodec: '视频编码',
    videoResolution: '视频分辨率',
    videoFrame: '视频帧率',
    videoRecvRate: '视频接收码率',
    videoSendRate: '视频发送码率',
    audioCodec: '音频编码',
    audioRecvRate: '音频接收码率',
    audioSendRate: '音频发送码率',

    setAsPresenter: '设为主持人',
    darkTheme: '黑色主题',

    chinese: '中文',

    selectFile: '选择文件',
    addFile: '添加文件',
    select: '选择',
    empty: '没有文件',

    loginErrorRoomNotExist: '房间不存在,请先创建房间。',
    loginErrorPassword: '登录密码错误！',
    alert: '警告！',
    ok: '确定',
    unKnownError: '未知错误！',
    mutedPrompt: '主持人设置了禁言！',

    confirm: '请确认',
    cancel: '取消',
    exitConfirm: '你确定退出吗？',

    copy: '复制',

    getCameraFailed: '获取摄像头失败，请检查设备！',
    getMicFailed: '获取麦克风失败，请检查设备！',
  };

  public lang = this.cn;

  constructor() {
    this.setLocale(navigator.language.toLowerCase());
   }

   setLocale(locale: string) {
     if (locale.indexOf('zh') >= 0 ) {
      this.lang = this.cn;
     } else {
       this.lang = this.en;
     }
   }
}
