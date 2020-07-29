[English](README-en.md)

[演示系统](https://rtc.liweix.com/admin)
# WiLearning
WiLearning 是一个开源、免费的在线学习及视频会议系统。WiLearning音视频模块使用了WebRTC技术，服务器端使用Typescript + Nodejs + MediaSoup开发,Web端使用Angular + Angular Material，目前具备以下功能：
* 多人视频会议 - 进行多人实时音视频及文字互动
* 共享桌面 - 共享自己的桌面内容
* 共享媒体 - 共享自己电脑上的音频或视频
* 共享课件 - 共享pdf文件，pdf文件在客户端自动转码
* 实时画笔 - 课件批注、添加内容，并共享给其他参与人
* 视频滤镜、设置logo、公告等功能
* 同时支持多个房间 - 可支持任意多个房间，每个房间参与人数不限定，最终取决于硬件条件
* 多语言支持 - 目前支持中文和英文，可扩展
* 稳定 - 切换网络时自动恢复
* 独立部署 - 安装简单,对外部工具没有依赖，可以独立部署于Linux/Mac服务器上
* 全终端支持 - 支持PC/Android/IOS平台，自动适配Pad平板电脑

# 安装
支持Linux/Mac操作系统,要求Nodejs版本大于V12.
## 安装依赖包
```
npm install -g cnpm
```

## 构建所有
```
./build.sh all
```

## 构建单个子系统
```
./build.sh [server/web/admin]
# 编译后的代码位于dist目录
```

# 运行
代码里提供了示例SSL证书,该证书对应的域名是rtc.liweix.com,实际运行时,请提供自己的证书,证书要与访问域名一致.
## 进入dist目录
```
cd dist
```

## 方法一： 运行server.js
```
node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key

# 如果获取公网IP地址失败,则可以使用--publicIp 手动提供公网IP地址
node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key --publicIp x.x.x.x
```

## 方法二： 直接运行start.sh(使用默认证书)
```
./start.sh
```

# 开启BBR拥塞控制
服务器端执行(linux kernel > 4.9):
```
wget --no-check-certificate https://github.com/teddysun/across/raw/master/bbr.sh && chmod +x bbr.sh && ./bbr.sh
```

# 浏览器访问
WiLearning 支持Chrome、FireFox、Safari浏览器，推荐使用最新版本的Chrome浏览器。
* 在浏览器中打开admin地址
```
https://[你的公网IP地址]/admin/
```
* 在Admin界面创建房间,在链接中找到主持人和参与人的地址,主持人可以开始/结束会议
* 多人登录到同一个房间即可开始视频会议
* 系统截图
![Admin 截图](res/admin.png?raw=true)
![Web 截图](res/web.png?raw=true)

# 错误排查
* WebRTC处于安全性考虑，要求必须使用HTTPS，当自己使用IP地址访问时会报错
* 项目提供的是rtc.liweix.com域名的HTTPS证书，可以使用该证书进行测试，在客户端修改/etc/hosts，将该域名指向自己的服务器地址即可
* 推荐使用自己的域名和证书，在aliyun可以申请免费证书
* 当访问出现问题时，在浏览器打开开发者工具，在控制台(Console)里查看出错原因
* 未能解决的问题，请提交issue

# 支持WiLearning
毫无疑问，WiLearning的成长需要你的支持，你可以通过以下方式支持WiLearning：
* 使用WiLearning，提Bug以及改进建议
* 提需求。我们不一定会接受所有需求，但所有需求都会认真分析并给予回复
* 将WiLearning推荐给你的同事或老板，并为WiLearning加颗星

# Roadmap
我们的愿景是打造一个面向未来的远程办公、远程教学私有云系统，它应该具备以下特性：
* 易于部署和使用
* 高质量音视频通话，能够兼容多种网络
* 提供一套协同工具
* 在实时音视频中整合VR/AR，提供超出现实的视觉效果


# 技术交流
加QQ群: 1043056267, 验证信息里请注明WiLearning
