export const lConfig =
{
	listeningPort         : 443,
	listeningRedirectPort : 80,

	worker: {
		logLevel : 'warn',
		rtcMinPort : 40000,
		rtcMaxPort : 49999
	},

	webRtcTransport : {
		listenIps : [],
		maxIncomingBitrate              : 350000,
		initialAvailableOutgoingBitrate : 200000
	},

	databaseFile : '/var/run/wilearning/database',
	roomStatusInterval: 300, // seconds
	publicDirectory : '/var/run/wilearning/public/'
};
