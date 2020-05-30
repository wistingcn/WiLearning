# wiser-server

## 安装
```
npm install -g cnpm
cnpm install -g typescript
cnpm install -g ts-node
cnpm install
```

## 运行

### 生成NodeJS文件
```
npm run build
```
### 生成的NodeJS文件位于dist目录
```
cd dist
```
### 运行wise-server
```
 node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key  --publicIp [服务器公网IP]
 ```
### 也可以直接运行start.sh，自动从ip.taobao.com获取公网IP
```
./start.sh

```
