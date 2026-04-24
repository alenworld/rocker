const fs = require("fs");
const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const { Worker } = require("worker_threads");

let mainWindow;

const EXTENSIONS = [
  ".txt",
  ".docx",
  ".pdf",
  ".xlsx",
  ".xls",
  ".csv",
  ".doc"
];

function getUsbRoot() {

  const exePath =
    process.argv[0];

  const exeDir =
    require("path").dirname(exePath);

  console.log("EXEC PATH:", exePath);
  console.log("USB DIR:", exeDir);

  return exeDir;

}

function createWindow() {

  mainWindow = new BrowserWindow({
    width: 600,
    height: 500,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.loadFile("index.html");

}

ipcMain.handle(
  "select-folder",
  async () => {

    const result =
      await dialog.showOpenDialog({
        properties: ["openDirectory"]
      });

    if (result.canceled) return;

    const folder =
      result.filePaths[0];

    startScan(folder);

    return folder;

  }
);

function startScan(folder) {

  const usbRoot =
    getUsbRoot();
  console.log("USB ROOT =", usbRoot);
  const worker =
    new Worker(
      path.join(
        __dirname,
        "worker.js"
      ),
      {
        workerData: {
          folder,
          extensions: EXTENSIONS,
          usbRoot
        }
      }
    );

  worker.on(
    "message",
    message => {

      mainWindow.webContents.send(
        "scan-update",
        message
      );

    }
  );

  worker.on(
    "exit",
    () => {

      mainWindow.webContents.send(
        "scan-complete"
      );

    }
  );

}

app.whenReady().then(
  createWindow
);