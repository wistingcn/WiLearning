import { Injectable } from '@angular/core';
import { Consumer, Producer } from 'mediasoup-client/lib/types';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root'
})
export class StatsService {
  videoCodec;
  audioCodec;

  videoWidth;
  videoHeight;

  videoFrameRate = 0;
  videoKbpsRecv = 0;
  videoKbpsSent = 0;

  audioKbpsRecv = 0;
  audioKbpsSent = 0;

  private inboundVideoTrack;
  private outboundVideoTrack;
  private rtcInboundVideoStats: RTCStatsReport;
  private rtcInboundAudioStats: RTCStatsReport;
  private rtcOutboundVideoStats: RTCStatsReport;
  private rtcOutboundAudioStats: RTCStatsReport;
  private intervalHander;
  private inboundRtpVideoStream;
  private inboundRtpAudioStream;
  private outboundRtpVideoStream;
  private outboundRtpAudioStream;

  private videoProducer: Producer;
  private audioProducer: Producer;
  private videoConsumer: Consumer;
  private audioConsumer: Consumer;

  private videoFrameRecv = 0;
  private videoBytesRecv = 0;
  private audioBytesRecv = 0;
  private videoBytesSent = 0;
  private audioBytesSent = 0;

  producerScore: number[] = [];
  consumerScore: number[] = [];

  constructor(
    private logger: LoggerService,
  ) {
    this.intervalHander = setInterval(() => {
      this.check();
    }, 1000);
  }

  async setVideoProducer(producer: Producer) {
    this.videoProducer = producer;
  }

  private async reportVideoProducer() {
    if (!this.videoProducer) {
      return;
    }

    try {
      this.rtcOutboundVideoStats = await this.videoProducer.getStats();
    } catch (e) {
      this.videoProducer = null;
      this.outboundRtpVideoStream = null;
      this.outboundVideoTrack = null;
      return;
    }

    this.outboundRtpVideoStream = this.getRtcSubStats(this.rtcOutboundVideoStats, 'RTCOutboundRTPVideoStream');
    this.outboundVideoTrack = this.getRtcSubStats(this.rtcOutboundVideoStats, this.outboundRtpVideoStream.trackId);
  }

  async setAudioProducer(producer: Producer) {
    this.audioProducer = producer;
  }

  private async reportAudioProducer() {
    if (!this.audioProducer) {
      return;
    }

    try {
      this.rtcOutboundAudioStats = await this.audioProducer.getStats();
    } catch (e) {
      this.audioProducer = null;
      this.outboundRtpAudioStream = null;
      return;
    }
    this.outboundRtpAudioStream = this.getRtcSubStats(this.rtcOutboundAudioStats, 'RTCOutboundRTPAudioStream');
  }

  async setVideoConsumer(consumer: Consumer) {
    this.videoConsumer = consumer;
  }

  private async reportVideoConsumer() {
    if (!this.videoConsumer) {
      return;
    }

    try {
      this.rtcInboundVideoStats = await this.videoConsumer.getStats();
    } catch (e) {
      this.videoConsumer = null;
      this.videoWidth = null;
      this.videoHeight = null;
      this.videoCodec = null;
      return;
    }

    this.inboundRtpVideoStream = this.getRtcSubStats(this.rtcInboundVideoStats, 'RTCInboundRTPVideoStream');

    this.inboundVideoTrack = this.getRtcSubStats(this.rtcInboundVideoStats, this.inboundRtpVideoStream.trackId);
    this.videoWidth = this.inboundVideoTrack.frameWidth;
    this.videoHeight = this.inboundVideoTrack.frameHeight;

    const videoCodec = this.getRtcSubStats(this.rtcInboundVideoStats, this.inboundRtpVideoStream.codecId);
    if (videoCodec) {
      this.videoCodec = videoCodec.mimeType;
    }
  }

  async setAudioConsumer(consumer: Consumer) {
    this.audioConsumer = consumer;
  }

  private async reportAudioConsumer() {
    if (!this.audioConsumer) {
      return;
    }

    try {
      this.rtcInboundAudioStats = await this.audioConsumer.getStats();
    } catch (e) {
      this.audioConsumer = null;
      this.inboundRtpAudioStream = null;
      this.audioCodec = null;
      return;
    }

    this.inboundRtpAudioStream = this.getRtcSubStats(this.rtcInboundAudioStats, 'RTCInboundRTPAudioStream');
    const audioCodec = this.getRtcSubStats(this.rtcInboundAudioStats, this.inboundRtpAudioStream.codecId);
    if (audioCodec) {
      this.audioCodec = audioCodec.mimeType;
    }
  }

  getRtcSubStats(rtcStats: RTCStatsReport, subkey: string): any {
    let foundValue;
    rtcStats.forEach((value, key ) => {
      if ( key.indexOf(subkey) > -1 ) {
        foundValue = value;
      }
    });

    return foundValue;
  }

  reportStats(stats: RTCStatsReport) {
    stats.forEach((value, key) => {
      this.logger.debug(key, value);
    });
  }

  bitrate() {
    this.videoFrameRate = 0;
    this.videoKbpsRecv = 0;
    this.videoKbpsSent = 0;
    this.audioKbpsRecv = 0;
    this.audioKbpsSent = 0;

    // video
    if (this.inboundVideoTrack) {
      if ( this.videoFrameRecv === 0 ) {
        this.videoFrameRecv = this.inboundVideoTrack.framesReceived;
      } else {
        this.videoFrameRate = this.inboundVideoTrack.framesReceived - this.videoFrameRecv;
        this.videoFrameRecv = this.inboundVideoTrack.framesReceived;
      }
    }

    if (this.inboundRtpVideoStream) {
      if ( this.videoBytesRecv === 0 ) {
        this.videoBytesRecv = this.inboundRtpVideoStream.bytesReceived;
      } else {
        this.videoKbpsRecv = Math.floor((this.inboundRtpVideoStream.bytesReceived - this.videoBytesRecv) * 8 / 1024);
        if ( this.videoKbpsRecv < 0 ) {
          this.videoKbpsRecv = 0;
        }
        this.videoBytesRecv = this.inboundRtpVideoStream.bytesReceived;
      }
    }

    if ( this.outboundRtpVideoStream ) {
      if ( this.videoBytesSent === 0) {
        this.videoBytesSent = this.outboundRtpVideoStream.bytesSent;
      } else {
        this.videoKbpsSent = Math.floor((this.outboundRtpVideoStream.bytesSent - this.videoBytesSent) * 8 / 1024);
        if ( this.videoKbpsSent < 0 ) {
          this.videoKbpsSent = 0;
        }
        this.videoBytesSent = this.outboundRtpVideoStream.bytesSent;
      }
    }

    // audio
    if ( this.inboundRtpAudioStream ) {
      if ( this.audioBytesRecv === 0 ) {
        this.audioBytesRecv = this.inboundRtpAudioStream.bytesReceived;
      } else {
        this.audioKbpsRecv = Math.floor((this.inboundRtpAudioStream.bytesReceived - this.audioBytesRecv) * 8 / 1024);
        if ( this.audioKbpsRecv < 0 ) {
          this.audioKbpsRecv = 0;
        }
        this.audioBytesRecv = this.inboundRtpAudioStream.bytesReceived;
      }
    }

    if ( this.outboundRtpAudioStream ) {
      if ( this.audioBytesSent === 0) {
        this.audioBytesSent = this.outboundRtpAudioStream.bytesSent;
      } else {
        this.audioKbpsSent = Math.floor((this.outboundRtpAudioStream.bytesSent - this.audioBytesSent ) * 8 / 1024);
        if ( this.audioKbpsSent < 0 ) {
          this.audioKbpsSent = 0;
        }
        this.audioBytesSent = this.outboundRtpAudioStream.bytesSent;
      }
    }
  }

  check() {
    this.reportAudioConsumer();
    this.reportAudioProducer();
    this.reportVideoConsumer();
    this.reportVideoProducer();
    this.bitrate();
  }
}
