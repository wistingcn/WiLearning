# WiMeeting
WiMeeting 服务器端使用Typescript + Nodejs + MediaSoup开发,Web端使用Angular + Angular Material，目前具备以下功能：
* 多人视频会议 - 进行多人实时音视频及文字互动
* 共享桌面 - 共享自己的桌面内容
* 共享媒体 - 共享自己电脑上的音频或视频
* 共享课件 - 共享自己的ppt及pdf文件
* 实时画笔 - 课件批注、添加内容，并共享给其他参与人
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

在Admin界面创建房间,通过Admin界面跳转到房间地址

