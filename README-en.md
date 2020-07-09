[中文版本](README-cn.md)
# WiLearning
WiLearning is an open source, free e-learning and conferencing system. WiLearning uses WebRTC technology, The server side uses Typescript + Nodejs + MediaSoup and web side uses Angular + Angular Material, WiLearning has the following functions:
* Multi-person video conference,or text interaction
* Share desktop
* Share local media * Share pdf files, pdf files are automatically transcoded in the web
* Realtime brush-courseware annotation, add content, and share to other participants
* Add video filter,logo setting, announcement and other functions
* Support multiple rooms at the same time, the number of participants in one room is not limited, depends on the hardware conditions
* Support Chinese and English
* Automatic recovery when switching network
* Easy to install,no dependence on external tools, can be deployed on Linux/Mac server
* Support Chrome/Safari in Windows/Mac/Linux/Android/IOS

# Install
Requirement: Nodejs>v12
```
# install dependence
npm install -g cnpm

# Build all
./build.sh all

# build subsystem
./build.sh [server/web/admin]

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

# Or you can run start.sh with default SSL certificate
```
./start.sh
```
# Access
* Access WiLearning admin use Chrom/FireFox/Safari:
```
https://[your public ip]/admin/
```
* Create room in Admin, open the 'Link' of room
* Now it has two roler, 'Speaker' and 'Attendee','Speaker' act as the adminstrator of room.
* Login the same room , choose your roler, begin your conference, enjoy!
![Admin screenshot](res/admin.png?raw=true)
![Web screenshot](res/web.png?raw=true)

# Support WiLearning
* Use it, and report Bug!
* Tell me you feeling and your want.
* Recommend it to your boss.
* Give it a STAR

# Roadmap
the vision of WiLearning is to be a future-oriented private cloud system for e-learning and video conference. It should have the following characteristics:
* Easy to deploy and use
* High-quality audio and video calls, compatible with multiple networks
* Provide a set of collaboration tools suitable for remote office
* Integrate VR/AR in real-time communication

