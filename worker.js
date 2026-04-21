const fs = require("fs");
const path = require("path");
const { workerData } = require("worker_threads");

const { drive, usbRoot, extensions } = workerData;

function matchExtension(file) {
  return extensions.some(ext => file.endsWith(ext));
}

function copyFileSafe(source) {
  const fileName = path.basename(source);

  const destFolder = path.join(usbRoot, "collected");

  if (!fs.existsSync(destFolder)) {
    fs.mkdirSync(destFolder, { recursive: true });
  }

  const dest = path.join(destFolder, fileName);

  try {
    fs.copyFileSync(source, dest);
  } catch {}
}

function scan(dir) {
  let files;

  try {
    files = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const file of files) {
    const full = path.join(dir, file.name);

    if (file.isDirectory()) {
      scan(full);
    } else {
      if (matchExtension(file.name)) {
        copyFileSafe(full);
      }
    }
  }
}

scan(drive);