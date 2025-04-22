import { WorkerSettings } from "mediasoup/types";
export const workerSettings: WorkerSettings = {
    logLevel: 'warn', // Options: 'debug', 'warn', 'error', 'none'
    logTags: [
        'info',
        'ice',
        'dtls',
        'rtp',
        'srtp',
        'rtcp'
    ],
    rtcMinPort: 40000,
    rtcMaxPort: 49999 // Configure according to your firewall/NAT
};

export const mediaCodecs= [
    {
      kind: 'audio',
      mimeType: 'audio/opus',
      clockRate: 48000,
      channels: 2
    },
    {
      kind: 'video',
      mimeType: 'video/VP8',
      clockRate: 90000,
      parameters: {
        'x-google-start-bitrate': 1000
      }
    }
];
 
export const transportOptions = {
    listenIps: [
      {
        ip: '0.0.0.0', // Listen on all interfaces (use public IP in prod)
        announcedIp: 'YOUR_PUBLIC_IP' // Required if behind NAT/cloud like AWS
      }
    ],
    enableUdp: true,
    enableTcp: true,
    preferUdp: true,
    initialAvailableOutgoingBitrate: 1000000, // 1 Mbps
    minimumAvailableOutgoingBitrate: 300000,
    maxIncomingBitrate: 1500000 // (optional) Limit upload bandwidth per client
  };
  
