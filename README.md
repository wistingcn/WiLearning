[English](README-en.md)

[演示系统](https://rtc.liweix.com/admin)
# WiLearning
WiLearning 是一个开源、免费的在线课堂及视频会议系统，具备以下功能：
* 多人视频会议 - 进行多人实时音视频及聊天
* 共享桌面 - 支持共享桌面，支持在共享桌面和课件间进行切换
* 共享媒体 - 共享本地音频或视频，本地音视频可拖动，实时同步
* 课件&白板 - 上传本地课件，文件在客户端自动转码，并上传到服务器端，在多端自动同步
* 实时画笔 - 实时画笔、课件批注，并共享给其他参与人。画笔实时展示，延时小于200ms
* 课件预览 - 预览课件，并在预览页实时显示课件上的画笔和批注
* 课件/白板导出 - 将包含画笔、批注的课件/白板导出为pdf文档
* 私聊、全体禁言等主持人管理功能
* 课堂信息、网络信息等提示
* 同时支持多个房间 - 可支持任意多个房间，每个房间参与人数不限定，最终取决于硬件条件
* 中英文切换 - 根据浏览器设置自动选择语言，也可以手动切换
* 全终端支持 - 支持Windows/Mac/Android/IOS平台，支持Chrome/Firfox/Safari浏览器，自动适配终端环境
* 支持在微信中使用（Android）

WiLearning使用了WebRTC技术，服务器端使用Typescript + Nodejs + MediaSoup开发,App端使用Angular + Ionic.

# 安装注意事项
* 推荐在Ubuntu18.04下进行安装
* 要求Nodejs版本大于v12
* 理论上支持部署在Linux/Mac操作系统
* 服务器主机有公网IP + 域名 + SSL证书
* 客户端连接服务器地址定义在 app/src/app/config.ts ，编译代码前请先修改服务器地址，连接到默认地址将会出现“房间不存在”的错误！
* 服务器配置文件地址定义在 server/config/config.ts, 里面包含了端口设置等服务器相关的配置

# 常见问题
* "房间不存在" --- 在app/src/app/config.ts修改服务器地址，重新编译app
* "不显示视频" --- 网络配置错误，修改start.sh文件，将默认使用的eth0改成可用的网卡名

# 代码
```
git clone https://github.com/wistingcn/WiLearning
```

## 安装cnpm
```
node -v #版本需要大于v12
npm install -g cnpm
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

# 默认使用网卡名称 eth0 ，如果你的网卡名不同，须用 --eth 指定
node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key --eth <ifname>
```

## 方法二： 直接运行start.sh(使用默认证书)
```
./start.sh
```

## 后台运行
使用pm2后台运行：
```
npx pm2 start start.sh
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
* 默认从eth0获取本地IP地址，如果系统没有eth0，将导致后续推流失败。可以通过--eth修改默认值
* WebRTC出于安全性考虑，要求必须使用HTTPS，直接使用IP地址进行访问会报错
* 推荐使用自己的域名和证书，在aliyun可以申请免费证书
* 当访问出现问题时，在浏览器打开开发者工具，在控制台(Console)里查看出错原因
* 未能解决的问题，请提交issue，并附上问题截图

# WiLearning 交流及技术支持
* 加微信：bjliwei，备注：进群，我拉你入微信群

# 进一步了解
本项目使用到的webrtc技术在作者的书中进行了详细说明：
* 《WebRTC技术详解：从0到1构建多人视频会议系统》，该书由机械工业出版社出版，各大网站均有出售


