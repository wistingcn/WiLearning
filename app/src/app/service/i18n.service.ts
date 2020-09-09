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
    username: 'username',
    password: 'password',
    roomid: 'roomid',
    userLogin: 'User Login',
    login: 'Login',
    inputUsername: 'Please input your username',
    inputRoom: 'Please input room id',
    inputPassword: 'Please input your password(3-10)',

    welcome: 'Welcome',

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

    setting: 'setting',
    inpubMessage: 'Input your messages',
    language: 'Language',
    whiteBoard: 'White Board',
    selectPdfDialogTitle: 'Please select your pdf file',
    select: 'Select',
    import: 'Import',
    open: 'Open',
    addNewFile: 'Add New File',
    inputNickname: 'Please input your nickname',
    roleSpeaker: 'Speaker',
    roleAttendee: 'Attendee',
    roleAudience: 'Audience',
    roleAssistant: 'Assistant',
    addOrOpenDoc: 'add or open document',
    addNewTab:  'add new tab',
    started: 'Started',
    stopped: 'Stopped',
    waitForStart: 'Waiting for start',
    startConnectVideo: 'Connect',
    stopConnectVideo: 'Stop',
    waitForAccept: 'Waiting for accept',
    acceptConnectVideo: 'Accept connect video',
    refuseConnectVideo: 'Refuse connect video',
    disconnectVideo: 'Disconnect video',
    closeCamera: 'Close Camera',
    closeMic: 'Close Microphone',
    openCamera: 'Open Camera',
    recordMainCamera: 'Record Main Camera',
    stopRecording: 'Stop Recording',
    openMic: 'Open Microphone',
    toggleVideoNav: 'Toggle on/off video sidenav',
    openFullscreen: 'Open Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    addMp4File: 'Add Mp4 File',
    setLogoUrl: 'Set Logo Url(http or https)',
    mediaSetting: 'Media Setting',
    roomSetting: 'Room Setting',
    announcement: 'Announcement',
    announcementInput: 'Please input announcement',
    videoFilter: 'Video Filter',
  };

  public cn = {
    userLogin: '用户登录',
    username: '用户名',
    password: '密码',
    roomid: '房间ID',
    login: '登录',
    inputUsername: '请输入用户名',
    inputRoom: '请输入房间Id',
    inputPassword: '请输入密码(3-10)',

    welcome: '欢迎',

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

    setting: '设置',
    language: '语言',
    whiteBoard: '白板',
    selectPdfDialogTitle: '请选择Pdf文件',
    select: '选择',
    import: '导入',
    open: '打开',
    addNewFile: '添加新文件',
    roleSpeaker: '主讲人',
    roleAttendee: '参与人',
    roleAudience: '旁观人',
    roleAssistant: '助手',
    addOrOpenDoc: '添加或打开文档',
    addNewTab:  '添加新的Tab页',
    started: '已开始',
    stopped: '已结束',
    waitForStart: '等待课程开始',
    startConnectVideo: '连麦',
    stopConnectVideo: '下麦',
    waitForAccept: '等待接受连麦请求',
    acceptConnectVideo: '接受连麦请求',
    refuseConnectVideo: '拒绝连麦请求',
    disconnectVideo: '断开连麦',
    closeCamera: '关闭摄像头',
    closeMic: '关闭麦克风',
    openCamera: '开启摄像头',
    recordMainCamera: '录制主摄像头',
    stopRecording: '停止录制',
    openMic: '开启麦克风',
    toggleVideoNav: '开启或关闭视频侧边栏',
    openFullscreen: '进入全屏模式',
    exitFullscreen: '退出全屏模式',
    addMp4File: '添加MP4文件',
    setLogoUrl: '设置Logo路径(http或https)',
    mediaSetting: '媒体设置',
    roomSetting: '房间设置',
    announcement: '系统公告',
    announcementInput: '请输入系统公告',
    videoFilter: '视频滤镜',
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
       console.log('set to en');
     }

     console.log(locale);
     console.log(this.lang);
   }
}
