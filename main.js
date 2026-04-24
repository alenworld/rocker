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

ipcMain.handle("select-folder", async () => {

  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"]
  });

  if (result.canceled) return;

  const folder = result.filePaths[0];

  startScan(folder);

  return folder;
});

function startScan(folder) {

  const worker = new Worker(
    path.join(__dirname, "worker.js"),
    {
      workerData: {
        folder,
        extensions: EXTENSIONS
      }
    }
  );

  worker.on("message", message => {

    mainWindow.webContents.send(
      "scan-update",
      message
    );

  });

  worker.on("exit", () => {

    mainWindow.webContents.send(
      "scan-complete"
    );

  });

}

app.whenReady().then(createWindow);