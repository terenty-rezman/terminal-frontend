
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'

import './xterm.css'
import './index.css'

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

const terminal = new Terminal({ theme });
const fit_addon = new FitAddon();

terminal.setOption("fontSize", 16);
terminal.setOption("cursorBlink", true);

terminal.loadAddon(fit_addon);
terminal.open(document.getElementById('terminal-container'));

fit_addon.fit();
terminal.write('connecting...');

window.onresize = () => fit_addon.fit();

const protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
const port = 3000 ; location.port;
const socket_url = protocol + location.hostname + ((location.port) ? (':' + port) : '') + '/terminal/';

const ws_socket = new WebSocket(socket_url);

ws_socket.onmessage = evt => {
    const msg = evt.data;
    terminal.write(msg);
};

terminal.onData(data => {
    ws_socket.send(data);
})

console.log('connected');

