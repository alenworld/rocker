const fs = require("fs");
const path = require("path");

const {
  parentPort,
  workerData
} = require("worker_threads");

const {
  folder,
  extensions,
  usbRoot
} = workerData;

function matchExtension(file) {

  return extensions.some(
    ext =>
      file.toLowerCase().endsWith(ext)
  );

}

function copyFileSafe(source) {

  const destFolder =
    path.join(
      usbRoot,
      "collected"
    );

  try {

    if (!fs.existsSync(destFolder)) {

      fs.mkdirSync(
        destFolder,
        { recursive: true }
      );

    }

    const dest =
      path.join(
        destFolder,
        path.basename(source)
      );

    if (!fs.existsSync(dest)) {

      fs.copyFileSync(
        source,
        dest
      );

      parentPort.postMessage({
        type: "copied",
        file: source
      });

    }

  } catch (e) {

    parentPort.postMessage({
      type: "error",
      file: source
    });

  }

}

function scan(dir) {

  parentPort.postMessage({
    type: "progress",
    dir
  });

  let files;

  try {

    files =
      fs.readdirSync(
        dir,
        { withFileTypes: true }
      );

  } catch {

    return;

  }

  for (const file of files) {

    const full =
      path.join(
        dir,
        file.name
      );

    try {

      if (
        file.isDirectory()
      ) {

        scan(full);

      } else {

        if (
          matchExtension(
            file.name
          )
        ) {

          copyFileSafe(full);

        }

      }

    } catch {}

  }

}

scan(folder);