const {app, BrowserWindow, ipcMain} = require('electron');
const url = require('url');
const path = require('path');
require("electron-reload")(__dirname);
const imageMin = require("imagemin");
const imageMinMozJpeg = require("imagemin-mozjpeg");
const imageMinPngQuant = require("imagemin-pngquant");
const slash = require("slash");
let win;

function createWindow() {
  win = new BrowserWindow({width: 800, height: 600});
  win.loadURL(url.format ({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
}

app.on('ready', createWindow);
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.disableHardwareAcceleration();

ipcMain.on("image:minimize", (e, options) => {
  const args= Object.keys(options).map(function (key) {
    return { [key]: options[key] };
  });
  console.log(args,args.length);
  for (let i=0;i<args.length;i++){
    console.log(typeof args[i],args[i])
  }

  const err = shrinkImage(options);
  e.sender.send("minimize:done", true);
});

async function shrinkImage({ imagePath, quality, dest }) {
  try {
    const pngQuality = quality / 100;

    const files = await imageMin([slash(imagePath)], {
      destination: dest,
      plugins: [
        imageMinMozJpeg({ quality }),
        imageMinPngQuant({ quality: [pngQuality, pngQuality] }),
      ],
    });
    console.log(files);
    return null;
  } catch (e) {
    console.log(e);
    return e;
  }
}