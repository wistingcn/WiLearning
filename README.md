# WiMeeting
WiMeeting是一个在线学习及视频会议系统。WiMeeting核心是使用了WebRTC技术，服务器端使用Typescript + Nodejs开发,Web端使用Angular + Angular Material，目前具备以下功能：
* 多人视频会议 - 进行多人实时音视频及文字互动
* 共享桌面 - 共享自己的桌面内容
* 共享媒体 - 共享自己电脑上的音频或视频
* 共享课件 - 共享自己的ppt及pdf文件
* 实时画笔 - 课件批注、添加内容，并共享给其他参与人
* 同时支持多个房间 - 可支持任意多个房间，每个房间参与人数不限定，最终取决于硬件条件
* 多语言支持 - 目前支持中文和英文，可扩展
* 稳定 - 切换网络时自动恢复
* 独立部署 - 安装简单,对外部工具没有依赖，可以独立部署于Linux/Mac服务器上
* 全终端支持 - 支持PC/Android/IOS平台，自动适配Pad平板电脑

# 安装&运行
支持Linux/Mac操作系统,要求Nodejs版本大于V12.
```
npm install -g cnpm
./build-all.sh
```

## 运行
代码里提供了示例SSL证书,实际运行时,请提供自己的证书,证书要与访问域名一致.
```
cd dist

# 运行server
node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key

# 如果获取公网IP地址失败,则可以使用--publicIp 手动提供公网IP地址

## 也可以直接运行start.sh
./start.sh

```

## 浏览器访问
在浏览器中打开admin地址:
```
https://x.x.x.x/admin/
```

在Admin界面创建房间,通过Admin界面跳转到房间地址，多人登录到同一个房间即可开始视频会议。

# 参与开发
您可以通过以下方式参与WiMeeting的开发：
* 使用WiMeeting，提Bug以及改进建议
* 提您的需求。我们不一定会接受所有需求，但所有需求都会认真分析并给予回复
* 贡献您的代码
* 加入WiMeeting团队，如果您具备Angular或者Nodejs技能，对WebRTC技术感兴趣，欢迎加入我们。请给linewei@gmail.com发邮件。

# Roadmap
Wisting的愿景是打造一个面向未来的远程办公、远程教学私有云系统，它应该具备以下特性：
* 易于部署和使用
* 高质量音视频通话，能够兼容多种网络
* 提供一套适用于远程办公的协同工具
* 在实时音视频中整合VR/AR，提供超出现实的视觉效果