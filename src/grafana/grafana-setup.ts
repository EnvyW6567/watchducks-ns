import axios from 'axios';

const grafanaPort = 3000;
const grafanaUrl = `http://localhost:${grafanaPort}`;
const grafanaUser = 'admin';
const grafanaPassword = 'admin';

const axiosInstance = axios.create({
    baseURL: grafanaUrl,
    auth: {
        username: grafanaUser,
        password: grafanaPassword
    }
});

export async function setupGrafana() {
    console.log('Setting up Grafana...');

    await waitForGrafana();

    try {
        const datasourceName = 'Prometheus';
        const existingDatasources = await axiosInstance.get('/api/datasources');
        const existingPrometheus = existingDatasources.data.find((ds: any) => ds.name === datasourceName);

        if (existingPrometheus) {
            await axiosInstance.put(`/api/datasources/${existingPrometheus.id}`, {
                name: datasourceName,
                type: 'prometheus',
                url: 'http://prometheus:9090',
                access: 'proxy',
                isDefault: true,
            });
            console.log('Prometheus data source updated');
        } else {
            await axiosInstance.post('/api/datasources', {
                name: datasourceName,
                type: 'prometheus',
                url: 'http://prometheus:9090',
                access: 'proxy',
                isDefault: true,
            });
            console.log('Prometheus data source added');
        }
    } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 409) {
            console.log('Prometheus data source already exists. Skipping creation.');
        } else {
            console.error('Error managing Prometheus data source:', (error as Error).message);
        }
    }

    console.log(`Grafana is running at ${grafanaUrl}`);
}

async function waitForGrafana(retries = 30, interval = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            await axiosInstance.get('/api/health');

            console.log('Grafana is ready');

            return;
        } catch (error) {
            console.log('Waiting for Grafana to be ready...');

            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
    throw new Error('Grafana did not become ready in time');
}