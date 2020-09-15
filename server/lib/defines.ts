/*
 * Copyright (c) 2020 Wisting Team. <linewei@gmail.com>
 *
 * This program is free software: you can use, redistribute, and/or modify
 * it under the terms of the GNU Affero General Public License, version 3
 * or later ("AGPL"), as published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */ 
export enum ROLE {
    SPEAKER = 1,
    ATTENDEE,
    AUDIENCE,
    ASSISTANT,
  }
  
  export enum RoomStatus {
    started = 'started',
    paused = 'paused',
    stopped = 'stopped',
  }

  export enum RequestMethod {
    getRouterRtpCapabilities =  'getRouterRtpCapabilities' ,
    join = 'join',
    createWebRtcTransport = 'createWebRtcTransport',
    connectWebRtcTransport = 'connectWebRtcTransport',
    restartIce = 'restartIce',
    produce = 'produce',
    closeProducer = 'closeProducer',
    pauseProducer = 'pauseProducer',
    resumeProducer = 'resumeProducer',
    pauseConsumer = 'pauseConsumer',
    resumeConsumer = 'resumeConsumer',
    requestConsumerKeyFrame = 'requestConsumerKeyFrame',
    getProducerStats = 'getProducerStats',
    getConsumerStats = 'getConsumerStats',
    getTransportStats = 'getTransportStats',
    changeDisplayName = 'changeDisplayName',
    changePicture = 'changePicture',
    changeRoler = 'changeRoler',
    chatMessage = 'chatMessage',
    closePeer = 'closePeer',
  
    syncDocInfo = 'syncDocInfo',
  
    classStart = 'classStart',
    classStop = 'classStop',
  
    roomInfo = 'roomInfo',
    changeLogo = 'changeLogo',
    announcementText = 'announcementText',
    videoFilter = 'videoFilter',
  
    connectVideo = 'connectVideo',
    connectApproval = 'connectApproval',
    disconnectVideo = 'disconnectVideo',
  
    switchComponent = 'switchComponent',
  }