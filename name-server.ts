import * as dgram from 'dgram';
import * as dnsPacket from 'dns-packet';
import {Answer} from 'dns-packet';

type PacketType = 'response' | 'query';

export class NameServer {
    private readonly server: dgram.Socket;

    private readonly PORT = 5300; // 테스트 용도로 5353번 포트 사용 (실제 DNS는 53번)
    private readonly HOST = '0.0.0.0';
    private readonly DOMAIN = 'WaTChdUcKS-TesT.Shop';
    private readonly IP = '192.0.2.1'; // 응답할 IP 주소

    constructor() {
        this.server = dgram.createSocket('udp4');
    }

    startServer() {

        this.server.on('error', (err) => {
            console.error(`서버 에러:\n${err.stack}`);
            this.server.close();
        });

        this.server.on('message', (msg, rinfo) => {
            try {
                const request = dnsPacket.decode(msg);
                if (!request.questions) {
                    throw new Error("no questions");
                }

                console.log(
                    `DNS 요청 from ${rinfo.address}:${rinfo.port} for ${request.questions[0].name}`,
                );

                // 단순히 특정 도메인에 대해 고정된 IP 응답
                if (request.questions[0].name === this.DOMAIN) {
                    const response = {
                        id: request.id,
                        type: 'response' as PacketType,
                        flags: dnsPacket.RECURSION_DESIRED | dnsPacket.RECURSION_AVAILABLE,
                        questions: request.questions,
                        answers: [
                            {
                                type: 'A',
                                name: this.DOMAIN,
                                ttl: 600,
                                data: this.IP,
                            },
                        ] as unknown as Answer[],
                    };

                    const responseBuffer = dnsPacket.encode(response);
                    this.server.send(responseBuffer, rinfo.port, rinfo.address, (err) => {
                        if (err) console.error('응답 전송 에러:', err);
                        else console.log(`응답 전송 to ${rinfo.address}:${rinfo.port}`);
                    });
                } else {
                    console.log(`지원하지 않는 도메인: ${request.questions[0].name}`);
                }
            } catch (error) {
                console.error('메시지 처리 중 에러:', error);
            }
        });

        this.server.on('listening', () => {
            const address = this.server.address();
            console.log(
                `DNS 서버가 ${address.address}:${address.port}에서 듣고 있습니다.`,
            );
        });

        this.server.bind(this.PORT, this.HOST);
    }
}