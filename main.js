const path = require("path");
const os = require("os");
const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  shell,
} = require("electron");
const imageMin = require("imagemin");
const imageMinMozJpeg = require("imagemin-mozjpeg");
const imageMinPngQuant = require("imagemin-pngquant");
const slash = require("slash");

require("electron-reload")(__dirname);
let window;
function createWindow() {
  window = new BrowserWindow({
    title: "ImageShrink",
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  globalShortcut.register("CmdOrCtrl+R", () => window.reload());
  globalShortcut.register("Cmd+X", () => {
    window.toggleDevTools();
  });
  window.loadFile("imageshrink-template/index.html");
}

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("ready", createWindow);
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
