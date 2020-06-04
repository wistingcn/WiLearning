# wiser-server

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

# 运行wise-server
node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key

# 如果获取公网IP地址失败,则可以使用--publicIp 手动提供公网IP地址

# 也可以直接运行start.sh
./start.sh

```
