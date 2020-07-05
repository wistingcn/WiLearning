import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  public en = {
    setting: 'setting',
    shareScreen: 'Screen share',
    stopShareScreen: 'Stop screen share',
    shareMedia: 'ShareMedia',
    chat: 'Chat',
    member: 'Member',
    inpubMessage: 'Input your messages',
    language: 'Language',
    document: 'Document',
    whiteBoard: 'White Board',
    selectPdfDialogTitle: 'Please select your pdf file',
    select: 'Select',
    import: 'Import',
    open: 'Open',
    close: 'Close',
    save: 'Save',
    addNewFile: 'Add New File',
    userLogin: 'User Login',
    login: 'Login',
    inputUsername: 'Please input your username',
    inputRoom: 'Please input room id',
    selectRole: 'Please select role',
    inputPassword: 'Please input your password(3-10)',
    inputNickname: 'Please input your nickname',
    roleSpeaker: 'Speaker',
    roleAttendee: 'Attendee',
    roleAudience: 'Audience',
    roleAssistant: 'Assistant',
    addOrOpenDoc: 'add or open document',
    addNewTab:  'add new tab',
    start: 'Start',
    stop: 'Stop',
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
    setting: '设置',
    shareScreen: '屏幕共享',
    stopShareScreen: '关闭屏幕共享',
    shareMedia: '媒体共享',
    chat: '聊天',
    member: '成员',
    inpubMessage: '请输入聊天信息',
    language: '语言',
    document: '文档',
    whiteBoard: '白板',
    selectPdfDialogTitle: '请选择Pdf文件',
    select: '选择',
    import: '导入',
    open: '打开',
    close: '关闭',
    save: '保存',
    addNewFile: '添加新文件',
    userLogin: '用户登录',
    login: '登录',
    inputUsername: '请输入您的用户名',
    inputRoom: '请输入房间Id',
    selectRole: '请选择角色',
    inputPassword: '请输入您的密码(3-10)',
    inputNickname: '请输入你的昵称',
    roleSpeaker: '主讲人',
    roleAttendee: '参与人',
    roleAudience: '旁观人',
    roleAssistant: '助手',
    addOrOpenDoc: '添加或打开文档',
    addNewTab:  '添加新的Tab页',
    start: '开始',
    stop: '停止',
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
