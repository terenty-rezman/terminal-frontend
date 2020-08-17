
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { debounce } from 'debounce'

import { OnceConnectedWebSocket } from './OnceConnectedWebSocket.js'
import { xterm_theme } from './xterm_theme'

import './xterm.css'
import './index.css'


function custom_key_handler(event) {
    const key = event.code;
    const ctrl = event.ctrlKey;

    if (key === "KeyC" && ctrl) {
        if (terminal.hasSelection()) {
            copy_to_cllipboard();
            return false;
        }
    }
    else if (key === "KeyV" && ctrl) {
        document.execCommand('paste');
        return false;
    }

    return true;
}

function copy_to_cllipboard() {
    document.execCommand('copy');
    popup_info('copied');
}

function fit_terminal() {
    let { rows, cols } = fit_addon.proposeDimensions();

    terminal.resize(cols, rows);
    console.log(cols, rows);
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

function create_final_popup(e) {
    let in_final_state = false;

    return function (msg, final = false) {
        if (in_final_state)
            return;

        info_box_dom.textContent = msg;

        if (final) {
            info_box_dom.classList.remove("run-hide");
            info_box_dom.classList.add("show");
            in_final_state = true;
        }
        else {
            // replay animation trick
            info_box_dom.classList.remove("run-hide");
            void info_box_dom.offsetWidth;
            info_box_dom.classList.add("run-hide");
        }
    }
}

const terminal_container_dom = document.querySelector('.terminal-container');
const info_box_dom = document.querySelector('.info-box');
const popup_info = create_final_popup();

const isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].indexOf(navigator.platform) >= 0;

const terminal = new Terminal({
    theme: xterm_theme,
    rendererType: "canvas",
    windowsMode: isWindows,
    drawBoldTextInBrightColors: true
});

const fit_addon = new FitAddon();

const protocol = (location.protocol === 'https:') ? 'wss://' : 'ws://';
const port = location.port;
const socket_url = protocol + location.hostname + ((port) ? (':' + port) : '') + '/terminal/';

const ws_socket = new OnceConnectedWebSocket(socket_url);
const send_to_server = buffered(ws_socket, 10);

terminal.setOption("fontSize", 17);
terminal.setOption("cursorBlink", true);

terminal.loadAddon(fit_addon);
terminal.open(terminal_container_dom);
terminal.attachCustomKeyEventHandler(custom_key_handler);

window.onresize = debounce(fit_terminal, 100);
window.onload = () => terminal.focus();

terminal.write('connecting...');

ws_socket.onopen = event => {
    console.log('connected');
    fit_terminal();
    terminal.write('\x1bc'); // clear terminal
};

ws_socket.onclose = event => {
    console.log('disconnected');
    popup_info('disconnected', true);
};

ws_socket.onerror = event => {
    console.log(event);
}

ws_socket.onreconnect = event => {
    terminal.write(` \x1b[31mfailed.\x1b[0m\n\rconnecting...`);
}

ws_socket.onmessage = event => {
    const raw_msg = event.data;
    const msg = JSON.parse(raw_msg);

    switch (msg.type) {
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

terminal.onResize(({ cols, rows }) => {
    if (ws_socket.is_connected) {
        const fit_msg = { type: 'f', cols, rows };
        ws_socket.send(JSON.stringify(fit_msg));
    }
})

terminal.onSelectionChange((arg1, arg2) => {
    if (terminal.hasSelection()) {
        const selected = terminal.getSelection().trim();
        if (selected)
            copy_to_cllipboard();
    }

})

terminal_container_dom.oncontextmenu = evt => {
    evt.preventDefault();
}


