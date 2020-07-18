const http = require("http");
const path = require("path");
const { Nuxt, Builder } = require("nuxt");
let config = require("./nuxt.config.js");

config.rootDir = __dirname;

const nuxt = new Nuxt(config);
const builder = new Builder(nuxt);
const server = http.createServer(nuxt.render);

let _NUXT_URL_ = "";
if (config.dev) {
    builder.build().catch(err => {
        console.error(err);
        process.exit(1);
    });
    server.listen();
    _NUXT_URL_ = `http://localhost:${server.address().port}`;
    console.log(`Nuxt working on ${_NUXT_URL_}`);
} else {
    _NUXT_URL_ = "file://" + __dirname + "/dist/index.html";
}

let win = null;
const electron = require("electron");
const url = require('url');
const app = electron.app;
const protocol = electron.protocol;
const ipcMain = electron.ipcMain;

app.on('ready', () => {
    protocol.interceptFileProtocol('file', (req, callback) => {
        const requestedUrl = req.url.substr(7);

        if (path.isAbsolute(requestedUrl)) {
            callback(path.normalize(path.join(__dirname + "/dist", requestedUrl)));
        } else {
            callback(requestedUrl);
        }
    });
});

const newWin = () => {
    win = new electron.BrowserWindow({
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: false,
            preload: path.resolve(path.join(__dirname, "preload.js"))
        }
    });
    win.on("closed", () => (win = null));
    if (config.dev) {
        const {
            default: installExtension,
            VUEJS_DEVTOOLS
        } = require("electron-devtools-installer");
        installExtension(VUEJS_DEVTOOLS.id)
            .then(name => {
                console.log(`Added Extension:  ${name}`);
                win.webContents.openDevTools();
            })
            .catch(err => console.log("An error occurred: ", err));
        const pollServer = () => {
            http
                .get(_NUXT_URL_, res => {
                    if (res.statusCode === 200) {
                        win.loadURL(_NUXT_URL_);
                    } else {
                        console.log("restart poolServer");
                        setTimeout(pollServer, 300);
                    }
                })
                .on("error", pollServer);
        };
        pollServer();
    } else {
        //return win.loadURL(_NUXT_URL_);
        return win.loadURL(url.format({
            pathname: '/index.html',
            protocol: 'file:',
            slashes: true,
          }))
    }
};
app.on("ready", newWin);
app.on("window-all-closed", () => app.quit());
app.on("activate", () => win === null && newWin());
