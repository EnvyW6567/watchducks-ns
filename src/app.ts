import { NameServer } from "./name-server/name-server";
import { setupGrafana } from './grafana/grafana-setup';

const ns = new NameServer();

async function startServer() {
    try {
        ns.startServer();

        await setupGrafana();
        console.log('Grafana setup completed');
    } catch (e) {
        console.log("error : ", e);
    }
}

startServer();