import {Answer, DecodedPacket, Packet} from "dns-packet";
import * as dnsPacket from "dns-packet";

type PacketType = 'response' | 'query';

export class PacketResponse {

    readonly packet:Packet;

    constructor(answers: Answer[], request: DecodedPacket) {
        this.packet = {
            id: request.id,
            type: 'response' as PacketType,
            flags: dnsPacket.RECURSION_DESIRED | dnsPacket.RECURSION_AVAILABLE,
            questions: request.questions,
            answers: answers,
        }
    }
}