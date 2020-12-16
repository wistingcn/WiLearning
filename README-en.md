[Demo](https://rtc.liweix.com/admin)

# WiLearning
WiLearning is an open source, free e-learning and conferencing system. WiLearning uses WebRTC technology, The server side uses Typescript + Nodejs + MediaSoup and client side uses Angular + Ionic, WiLearning has the following features:
* Multi-person video conference,or text interaction
* Share desktop
* Share local media 
* WhiteBoard & files, files are automatically transcoded in the web
* Realtime brush-courseware annotation, add content, and share to other participants
* Document preview , display annotation in preview
* Export document, export document to pdf include brush & annotation
* Support multiple rooms at the same time, the number of participants in one room is not limited, depends on the hardware conditions
* Support Chinese and English
* Automatic recovery when switching network
* Support Chrome/Safari in Windows/Mac/Linux/Android/IOS

# Install
Requirement: Nodejs>v12
```
# Build all
./build.sh all

# build subsystem
./build.sh [server/app/admin]

# build result locate in 'dist' directory
```

# Run
The sample SSL certificate is provided in the code. Please provide your own certificate when it is actually running.The certificate must be consistent with the domain name you visit.

* enter the dist directory
```
cd dist
````

* Method 1: run server.js
```
node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key
```

* WiLearning get your public ip from 'https://api.ipify.org'. Alternatively, you can specify on in command line.
```
node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key --publicIp x.x.x.x
```
* ```eth0``` is used as default interface name. If you have a different interface name, you must specify it using ```--eth```
```
node server.js --cert ../certs/rtc.liweix.com.pem --key ../certs/rtc.liweix.com.key --eth <ifname>
```
* Or you can run start.sh with default SSL certificate
```
./start.sh
```

* run with pm2
```
npx pm2 start start.sh
```

# enable google bbr 
run the follow command line in server console(linux kernel > 4.9):
```
wget --no-check-certificate https://github.com/teddysun/across/raw/master/bbr.sh && chmod +x bbr.sh && ./bbr.sh
```

# Access
* Access WiLearning admin use Chrom/FireFox/Safari:
```
https://[your public ip]/admin/
```
* Create room in Admin, open the 'Link' of room
* Now it has two roler, 'Speaker' and 'Attendee','Speaker' act as the adminstrator of room.
* Login the same room , choose your roler, begin your conference, enjoy!

# Support WiLearning
* Use it, and report Bug!
* Tell me you feeling and your want.
* Give it a STAR

![Give me a cup of coffee](res/appreciate.png)
