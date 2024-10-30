import * as dgram from 'dgram';
import * as dnsPacket from 'dns-packet';
import {Answer, Packet} from 'dns-packet';
import {PacketResponse} from "./packet-response";

export class NameServer {
    private readonly server: dgram.Socket;

    private readonly PORT = 53;
    private readonly HOST = '0.0.0.0';
    private readonly DOMAIN = 'WaTChdUcKS-TesT.Shop';
    private readonly IP = '192.0.2.1';

    constructor() {
        this.server = dgram.createSocket('udp4');
    }

    startServer() {
        this.server.on('message', (msg, remoteInfo) => this.messageHandler(msg, remoteInfo));
        this.server.on('error', (err) => this.errorHandler(err));
        this.server.on('listening', () => this.listeningHandler());

        this.server.bind(this.PORT, this.HOST);
    }

    messageHandler(msg: Buffer, remoteInfo: dgram.RemoteInfo) {
        const request = dnsPacket.decode(msg);

        if (!request.questions) {
            throw new Error("invalid request, not found questions");
        }

        const domain = request.questions[0].name;

        console.log(
            `DNS 요청 from ${remoteInfo.address}:${remoteInfo.port} for ${domain}`,
        );

        if (domain === this.DOMAIN) {
            const answers: Answer[] = [{
                type: 'A',
                name: this.DOMAIN,
                ttl: 600,
                data: this.IP,
            }]
            const packetResponse = new PacketResponse(answers, request);

            this.send(packetResponse.packet, remoteInfo);
        } else {
            console.log(`지원하지 않는 도메인: ${domain}`);
        }
    }

    errorHandler(err: Error) {
        console.error(`서버 에러:\n${err.stack}`);
        this.server.close();
    }

    listeningHandler() {
        const address = this.server.address();
        console.log(
            `DNS 서버가 ${address.address}:${address.port}에서 듣고 있습니다.`,
        );
    }

    private send(response: Packet, remoteInfo: dgram.RemoteInfo) {
        const responseBuffer = dnsPacket.encode(response);

        this.server.send(responseBuffer, remoteInfo.port, remoteInfo.address, (err) => {
            if (err) console.error('응답 전송 에러:', err);
            else console.log(`응답 전송 to ${remoteInfo.address}:${remoteInfo.port}`);
        });
    }
}