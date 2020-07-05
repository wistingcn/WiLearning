# WiMeeting
WiMeeting是一款开源、免费的视频会议私有云系统，目前具备以下功能：
* 多人视频会议 - 使用Wisting进行多人实时音视频及文字互动
* 共享桌面 - 共享自己的桌面内容
* 共享媒体 - 共享自己电脑上的音频或视频
* 共享课件 - 共享自己的ppt及pdf文件
* 实时画笔 - 课件批注、添加内容，并共享给其他参与人
* 独立部署 - Wisting对外部工具没有依赖，可以独立部署于Linux服务器上
* 基于P2SP技术 - 降低了服务器的带宽成本，同时避免了服务器瓶颈造成的网络卡顿
* 全终端支持 - Wisting支持PC/Android/IOS平台，自动适配Pad平板电脑

## 安装
```
npm install -g cnpm
cnpm install
```

## 运行
### 使用ts-node
```
sudo npm start
```

### 或者使用NodeJs
```
# 生成NodeJS文件
npm run build

# 生成的NodeJS文件位于dist目录
cd dist

# 运行server
node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key

# 如果获取公网IP地址失败,则可以使用--publicIp 手动提供公网IP地址

# 也可以直接运行start.sh
./start.sh

```
