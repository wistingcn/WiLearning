"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lConfig = void 0;
exports.lConfig = {
    listeningPort: 443,
    listeningRedirectPort: 80,
    worker: {
        logLevel: 'warn',
        rtcMinPort: 40000,
        rtcMaxPort: 49999
    },
    webRtcTransport: {
        listenIps: [],
        maxIncomingBitrate: 350000,
        initialAvailableOutgoingBitrate: 200000
    }
};
