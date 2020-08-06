export 
class OnceConnectedWebSocket 
{
    static reconnect_time = 5000;

    url = null;
    ws = null;
    onopen = () => { };
    onerror = () => { };
    onclose = () => { };
    onmessage = () => { };
    onreconnect = () => { };

    send = () => {};
    close = () => {};

    get is_connected() {
        return this.ws.readyState === 1;
    }

    get reconnect_time() {
        return OnceConnectedWebSocket.reconnect_time / 1000; // return in secs
    }

    constructor(url) {
        this.url = url;
        this._create_socket();
    }

    _onerror = () => {
        this._destroy_socket();

        this.onreconnect();

        setTimeout(() => {
            this._create_socket();
        }, OnceConnectedWebSocket.reconnect_time);
    }

    _onopen = (evt) => {
        const ws = this.ws;

        ws.onerror = this.onerror;
        ws.onmessage = this.onmessage;
        ws.onclose = this.onclose;

        this.send = ws.send.bind(ws);
        this.close = ws.close.bind(ws);

        this.onopen(evt);
    }

    _create_socket() {
        this.ws = new WebSocket(this.url);
        this.ws.onopen = this._onopen;
        this.ws.onerror = this._onerror;
    }

    _destroy_socket() {
        this.ws.close();
        this.ws.onerror = null;
        this.ws.onopen = null;
        this.ws = null;
    }
}