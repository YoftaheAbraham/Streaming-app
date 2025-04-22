
import * as mediasoup from 'mediasoup';
import { types as mediasoupTypes } from "mediasoup"

let worker: mediasoupTypes.Worker;
let router: mediasoupTypes.Router;


async function initMediasoup() {
  try {
    if (!worker) {
      worker = await mediasoup.createWorker({
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
      });
      worker.on('died', () => {
        console.error('Mediasoup worker has died!');
        process.exit(1); // Exit to let process manager (like PM2) restart it
      });
      console.log(`Mediasoup Worker PID: ${worker.pid}`);
      router = await worker.createRouter({
        mediaCodecs: [
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
        ]
      });
      console.log('Mediasoup Router created');
    }
  } catch (error) {
    console.log("Error occured!");
    
    console.log(error);
  }
}



export { initMediasoup, worker, router };
