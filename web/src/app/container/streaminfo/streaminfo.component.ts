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
import { Component, OnInit, Inject, OnDestroy, AfterViewInit } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ClaMedia } from 'src/app/defines';
import { LoggerService } from 'src/app/service/logger.service';
import { PeerService } from 'src/app/service/peer.service';
import { Chart } from 'chart.js';
import { EventbusService, IEventType, EventType } from 'src/app/service/eventbus.service';
import { I18nService } from 'src/app/service/i18n.service';

const chartColors = {
  red: 'rgb(255, 99, 132)',
  orange: 'rgb(255, 159, 64)',
  yellow: 'rgb(255, 205, 86)',
  green: 'rgb(75, 192, 192)',
  blue: 'rgb(54, 162, 235)',
  purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)'
};

@Component({
  selector: 'app-streaminfo',
  templateUrl: './streaminfo.component.html',
  styleUrls: ['./streaminfo.component.css']
})
export class StreaminfoComponent implements OnInit, OnDestroy, AfterViewInit {
  stream: ClaMedia;
  source: string;
  rtcInboundVideoStats: RTCStatsReport;
  rtcInboundAudioStats: RTCStatsReport;
  rtcOutboundVideoStats: RTCStatsReport;
  rtcOutboundAudioStats: RTCStatsReport;
  videoWidth;
  videoHeight;

  inboundVideoTrack;
  outboundVideoTrack;
  videoCodec;
  videoFrameRate;
  videoKbpsRecv;
  videoKbpsSent;

  audioTrack;
  audioCodec;
  audioKbpsRecv;
  audioKbpsSent;

  intervalHander;
  inboundRtpVideoStream;
  inboundRtpAudioStream;
  outboundRtpVideoStream;
  outboundRtpAudioStream;

  myChart: Chart;

  constructor(
    public dialogRef: MatDialogRef<StreaminfoComponent>,
    public i18n: I18nService,
    @Inject(MAT_DIALOG_DATA) public data,
    private logger: LoggerService,
    private peer: PeerService,
    private eventbus: EventbusService,
  ) {
    this.stream = data.stream;
    this.source = this.stream.source.split('_')[1];

    this.getMediaParams();

    this.eventbus.media$.subscribe((event: IEventType ) => {
      if (event.type === EventType.media_consumerScore ) {
        const {consumerId, score } = event.data;
        if ( this.stream.videoConsumer && this.stream.videoConsumer.id === consumerId ) {
          setTimeout(() => {
            this.myChart.data.datasets[0].data = this.stream.producerScore;
            this.myChart.data.datasets[1].data = this.stream.consumerScore;
            this.myChart.data.labels = this.stream.scoreIndex;
            this.myChart.update();
          }, 1000);
        }
      }
    });
   }

  async ngOnInit() {
    let videoFrameRecv = 0;
    let videoBpsRecv = 0;
    let audioBpsRecv = 0;
    let videoBpsSent = 0;
    let audioBpsSent = 0;
    this.intervalHander = setInterval(async () => {
      await this.getStats();

      // video
      if ( videoFrameRecv === 0 ) {
        videoFrameRecv = this.inboundVideoTrack.framesReceived;
      } else {
        this.videoFrameRate = this.inboundVideoTrack.framesReceived - videoFrameRecv;
        videoFrameRecv = this.inboundVideoTrack.framesReceived;
      }

      if ( videoBpsRecv === 0 ) {
        videoBpsRecv = this.inboundRtpVideoStream.bytesReceived;
      } else {
        this.videoKbpsRecv = Math.floor((this.inboundRtpVideoStream.bytesReceived - videoBpsRecv) * 8 / 1024);
        if ( this.videoKbpsRecv < 0 ) {
          this.videoKbpsRecv = 0;
        }
        videoBpsRecv = this.inboundRtpVideoStream.bytesReceived;
      }

      // audio
      if ( this.inboundRtpAudioStream ) {
        if ( audioBpsRecv === 0 ) {
          audioBpsRecv = this.inboundRtpAudioStream.bytesReceived;
        } else {
          this.audioKbpsRecv = Math.floor((this.inboundRtpAudioStream.bytesReceived - audioBpsRecv) * 8 / 1024);
          if ( this.audioKbpsRecv < 0 ) {
            this.audioKbpsRecv = 0;
          }
          audioBpsRecv = this.inboundRtpAudioStream.bytesReceived;
        }
      }

      if ( this.outboundRtpVideoStream ) {
        if ( videoBpsSent === 0) {
          videoBpsSent = this.outboundRtpVideoStream.bytesSent;
        } else {
          this.videoKbpsSent = Math.floor((this.outboundRtpVideoStream.bytesSent - videoBpsSent) * 8 / 1024);
          if ( this.videoKbpsSent < 0 ) {
            this.videoKbpsSent = 0;
          }
          videoBpsSent = this.outboundRtpVideoStream.bytesSent;
        }
      }

      if ( this.outboundRtpAudioStream ) {
        if ( audioBpsSent === 0) {
          audioBpsSent = this.outboundRtpAudioStream.bytesSent;
        } else {
          this.audioKbpsSent = Math.floor((this.outboundRtpAudioStream.bytesSent - audioBpsSent ) * 8 / 1024);
          if ( this.audioKbpsSent < 0 ) {
            this.audioKbpsSent = 0;
          }
          audioBpsSent = this.outboundRtpAudioStream.bytesSent;
        }
      }
    }, 1000);

  }

  ngAfterViewInit() {
    this.drawScoreChart();
  }

  ngOnDestroy() {
    clearInterval(this.intervalHander);
  }

  async getMediaParams() {
    await this.getStats();

    // video
    const videoCodec = this.getRtcSubStats(
      this.rtcInboundVideoStats,
      this.inboundRtpVideoStream.codecId
    );

    this.videoCodec = videoCodec.mimeType;
    this.videoWidth = this.inboundVideoTrack.frameWidth;
    this.videoHeight = this.inboundVideoTrack.frameHeight;

    // audio
    if ( this.rtcInboundAudioStats && this.inboundRtpAudioStream ) {
      const audioCodec = this.getRtcSubStats(
        this.rtcInboundAudioStats,
        this.inboundRtpAudioStream.codecId
      );

      this.audioCodec = audioCodec.mimeType;
    }
  }

  async getStats() {
    this.rtcInboundVideoStats = await this.stream.videoConsumer.getStats();

    this.inboundRtpVideoStream = this.getRtcSubStats(
      this.rtcInboundVideoStats,
      'RTCInboundRTPVideoStream'
    );

    this.inboundVideoTrack = this.getRtcSubStats(
      this.rtcInboundVideoStats,
      this.inboundRtpVideoStream.trackId
    );

    if ( this.stream.audioConsumer ) {
      this.rtcInboundAudioStats = await this.stream.audioConsumer.getStats();
      this.inboundRtpAudioStream = this.getRtcSubStats(
        this.rtcInboundAudioStats,
        'RTCInboundRTPAudioStream'
      );
    }

    // if local has producer
    const videoProducer = this.peer.getProducer(this.stream.videoConsumer.producerId);

    if ( videoProducer) {
      this.rtcOutboundVideoStats = await videoProducer.getStats();

      this.outboundRtpVideoStream = this.getRtcSubStats(
        this.rtcOutboundVideoStats,
        'RTCOutboundRTPVideoStream'
      );

      this.outboundVideoTrack = this.getRtcSubStats(
        this.rtcOutboundVideoStats,
        this.outboundRtpVideoStream.trackId
      );
    }

    if ( this.stream.audioConsumer ) {
      const audioProducer = this.peer.getProducer(this.stream.audioConsumer.producerId);
      if ( audioProducer ) {
        this.rtcOutboundAudioStats = await audioProducer.getStats();

        this.outboundRtpAudioStream = this.getRtcSubStats(
          this.rtcOutboundAudioStats,
          'RTCOutboundRTPAudioStream'
        );
      }
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

  drawScoreChart() {
    const ctx = document.getElementById('myChart') as HTMLCanvasElement;
    this.myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.stream.scoreIndex,
        datasets: [{
          label: 'Producer Score',
          borderColor: chartColors.red,
          backgroundColor: chartColors.red,
          fill: false,
          data: this.stream.producerScore,
          yAxisID: 'producer-score',
        }, {
          label: 'Consumer Score',
          borderColor: chartColors.blue,
          backgroundColor: chartColors.blue,
          fill: false,
          data: this.stream.consumerScore,
          yAxisID: 'producer-score'
        }]
      },
      options: this.lineChartOptions(),
    });
  }

  lineChartOptions() {
    const options = {
      responsive: true,
      hoverMode: 'index',
      stacked: false,
      title: {
        display: true,
        text: 'Video Score'
      },
      scales: {
        yAxes: [{
          type: 'linear',
          display: true,
          position: 'left',
          id: 'producer-score',
          ticks: {
            suggestedMin: 0,
            suggestedMax: 10
        }
        }],
      }
    };
    return options;
  }

  close() {
    this.dialogRef.close();
  }
}
