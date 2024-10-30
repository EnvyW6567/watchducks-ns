import {NameServer} from "./name-server";

const ns = new NameServer();

try {
    ns.startServer();
} catch (e) {
    console.log("error : ", e);
}
