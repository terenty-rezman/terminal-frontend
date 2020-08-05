
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { debounce } from 'debounce'

import './xterm.css'
import './index.css'


function fit_terminal() {
    let { rows, cols } = fit_addon.proposeDimensions();

    // limit min values
    cols = cols < 20 ? 20 : cols;
    rows = rows < 10 ? 10 : rows;

    terminal.resize(cols, rows);

    const fit_msg = { type: 'f', cols, rows };
    ws_socket.send(JSON.stringify(fit_msg));
}

// string message buffering
function buffered(socket, timeout) {
    let data = '';
    let sender = null;

    return (chunk) => {
        data += chunk;

        if (!sender)
            sender = setTimeout(() => {
                const msg = { type: 'm', data };
                socket.send(JSON.stringify(msg));

                data = '';
                sender = null;
            }, timeout);
    };
}

const theme = {
    foreground: "#eee",
    /** The default background color */
    background: "#222",
    /** The cursor color */
    cursor: "#eee",
    /** The accent color of the cursor (fg color for a block cursor) */
    cursorAccent: "#fce94f",
    /** The selection background color (can be transparent) */
    selection: "#888",
    /** ANSI black (eg. `\x1b[30m`) */
    black: "#000",
    /** ANSI red (eg. `\x1b[31m`) */
    red: "#ef2929",
    /** ANSI green (eg. `\x1b[32m`) */
    green: "#4e9a06",
    /** ANSI yellow (eg. `\x1b[33m`) */
    yellow: "#fce94f",
    /** ANSI blue (eg. `\x1b[34m`) */
    blue: "#729fcf",
    /** ANSI magenta (eg. `\x1b[35m`) */
    magenta: "#f9f",
    /** ANSI cyan (eg. `\x1b[36m`) */
    cyan: "#f9f",
    /** ANSI white (eg. `\x1b[37m`) */
    white: "#fff",
    /** ANSI bright black (eg. `\x1b[1;30m`) */
    brightBlack: "#444",
    /** ANSI bright red (eg. `\x1b[1;31m`) */
    brightRed: "#f9f",
    /** ANSI bright green (eg. `\x1b[1;32m`) */
    brightGreen: "#f9f",
    /** ANSI bright yellow (eg. `\x1b[1;33m`) */
    brightYellow: "#f9f",
    /** ANSI bright blue (eg. `\x1b[1;34m`) */
    brightBlue: "#f9f",
    /** ANSI bright magenta (eg. `\x1b[1;35m`) */
    brightMagenta: "#f9f",
    /** ANSI bright cyan (eg. `\x1b[1;36m`) */
    brightCyan: "#f9f",
    /** ANSI bright white (eg. `\x1b[1;37m`) */
    brightWhite: "#f9f",
};

const terminal = new Terminal({theme});
const fit_addon = new FitAddon();

terminal.setOption("fontSize", 17);
terminal.setOption("cursorBlink", true);

terminal.loadAddon(fit_addon);
terminal.open(document.getElementById('terminal-container'));

terminal.write('connecting...');

window.onresize = debounce(fit_terminal, 100);

const protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
const port = 3000; location.port;
const socket_url = protocol + location.hostname + ':' + port + '/terminal/';

const ws_socket = new WebSocket(socket_url);
const send_to_server = buffered(ws_socket, 10);

ws_socket.onopen = event => {
    console.log('connected');
    fit_terminal();
};

ws_socket.onclose = event => {
    console.log('disconnected');
};

ws_socket.onmessage = event => {
    const raw_msg = event.data;
    const msg = JSON.parse(raw_msg);

    switch(msg.type){
        case 'e':
            console.log(msg.msg);
            break
        case 'm':
            terminal.write(msg.data);
            break;
    }
};

terminal.onData(data => {
    send_to_server(data);
});



