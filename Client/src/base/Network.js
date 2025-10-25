const net = require('net');
const Log = require("./Log");

class Network {
    constructor(host, port) {
        this.host = host;
        this.port = port;
        this.client = null;
    }

    Connect() {
        if (this.client && !this.client.destroyed) {
            console.error(`Client already exists. ${this.host}:${this.port}`);
            return;
        }
        this.client = new net.Socket();

        this.client.on('connect', () => {
            Log.ERROR(`Connected to server ${this.host}:${this.port}`);
        });

        this.client.on('data', (data) => {
            Log.ERROR(`Received data from server: ${data}`);
        })

        this.client.on('error', (error) => {
            console.error(`Error Connecting to server ${this.host}:${this.port}: ${error}`);
            this.Close();
            setTimeout(() => {
                this.Connect();
            }, 1);
        });

        this.client.on('close', () => {
            Log.ERROR(`Connection closed with server ${this.host}:${this.port}`)
            this.Close();
            setTimeout(() => {
                this.Connect();
            }, 1);
        });

        this.client.connect(this.port, this.host);
    }

    Send(data) {
        if (this.client && !this.client.destroyed) {
            this.client.write(data);
        }
    }

    Close() {
        if (this.client) {
            this.client.destroy();
            this.client = null;
        }

    }
}

module.exports = Network;
