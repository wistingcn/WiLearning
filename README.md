# WiMeeting
WiMeeting 服务器端使用Typescript + Nodejs + MediaSoup开发,Web端使用Angular + Angular Material，目前具备以下功能：
* 多人视频会议 - 进行多人实时音视频及文字互动
* 共享桌面 - 共享自己的桌面内容
* 共享媒体 - 共享自己电脑上的音频或视频
* 共享课件 - 共享自己的ppt及pdf文件
* 实时画笔 - 课件批注、添加内容，并共享给其他参与人
* 独立部署 - 安装简单,对外部工具没有依赖，可以独立部署于Linux/Mac服务器上
* 全终端支持 - 支持PC/Android/IOS平台，自动适配Pad平板电脑

# 安装
```
npm install -g cnpm
cnpm install
```

# 运行
## 使用ts-node
```
sudo npm start
```

## 或者使用NodeJs
```
# 生成NodeJS文件
npm run build

# 生成的NodeJS文件位于dist目录
cd dist

# 运行server
node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key

# 如果获取公网IP地址失败,则可以使用--publicIp 手动提供公网IP地址

## 也可以直接运行start.sh
./start.sh

```
