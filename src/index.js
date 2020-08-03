
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

const term = new Terminal({ theme });
const fit_addon = new FitAddon();

term.setOption("fontSize", 16);

term.loadAddon(fit_addon);
term.open(document.getElementById('terminal-container'));

fit_addon.fit();
term.write('Hello from \x1b[31m xtermd \n this is nice \x1b[33mterminal\x1b[33m');

window.onresize = () => fit_addon.fit();

