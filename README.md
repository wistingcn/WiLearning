[English](README-en.md)

[演示系统](https://rtc.liweix.com/admin)
# WiLearning
WiLearning 是一个开源、免费的在线学习及视频会议系统。WiLearning音视频模块使用了WebRTC技术，服务器端使用Typescript + Nodejs + MediaSoup开发,Web端使用Angular + Ionic，目前具备以下功能：
* 多人视频会议 - 进行多人实时音视频及文字互动
* 共享桌面 - 共享自己的桌面内容
* 共享媒体 - 共享自己电脑上的音频或视频
* 共享课件 - 共享pdf文件，pdf文件在客户端自动转码
* 实时画笔 - 课件批注、添加内容，并共享给其他参与人
* 课件预览 - 预览课件，并实时显示课件上的画笔和批注
* 同时支持多个房间 - 可支持任意多个房间，每个房间参与人数不限定，最终取决于硬件条件
* 多语言支持 - 自动探测并设置语言环境，也可以手动设置
* 独立部署 - 安装简单,对外部工具没有依赖，可以独立部署于Linux/Mac服务器上
* 全终端支持 - 支持PC/Android/IOS平台，自动适配终端环境

# 安装
* 服务器及客户端代码支持部署在Linux/Mac操作系统,要求Nodejs版本大于V12.
* 支持在Windows/Linux/Mac等操作系统使用Chrome/FireFox/Safari等浏览器打开Web客户端
## 安装依赖包
```
npm install -g cnpm
cnpm i
```

## 构建所有
```
./build.sh all
```

## 构建单个子系统
```
./build.sh [server/app/admin]
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
* 在Admin界面创建房间,打开或复制房间地址,主持人可以开始/结束会议
* 多人登录到同一个房间即可开始视频会议

# 错误排查
* Demo部署环境：Ubuntu 18.04.4 LTS, 在该环境测试通过
* 由于依赖包的版本可能会经常更新，所以建议更新代码时，在新的目录下重新拉取源代码，重新安装依赖包。避免在原目录下使用git pull,这样会导致代码与依赖包版本不一致
* WebRTC处于安全性考虑，要求必须使用HTTPS，当自己使用IP地址访问时会报错
* 项目提供的是rtc.liweix.com域名的HTTPS证书，可以使用该证书进行测试，在客户端修改/etc/hosts，将该域名指向自己的服务器地址即可
* 推荐使用自己的域名和证书，在aliyun可以申请免费证书
* 当访问出现问题时，在浏览器打开开发者工具，在控制台(Console)里查看出错原因
* 未能解决的问题，请提交issue

# 技术交流
加QQ群: 1043056267, 验证信息里请注明WiLearning
