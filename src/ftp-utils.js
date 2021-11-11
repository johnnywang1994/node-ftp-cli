const ftp = require('ftp');
const ora = require('ora');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const { readFilesFromDir } = require('./fs-utils');

function isNavigator(filename) {
  return filename.startsWith('.') || filename.startsWith('..');
}

function isDirectory(file) {
  return file.type === 'd' && !isNavigator(file.name);
}

function log(color, message) {
  console.log(chalk[color](message));
}

// 切換目錄
function cwd(client, dirpath){
  return new Promise((resolve)=>{
    client.cwd(dirpath, (err, dir) => {
      resolve({ err, dir });
    });
  });
}

async function listFiles(client, dirpath){
  await cwd(client, dirpath);
  return new Promise((resolve) => {
    client.list((err, files) => {
      resolve({ err, files });
    });
  });
}

async function getFile(client, filePath, outputPath, root = false){
  const dirpath = path.dirname(filePath);
  const fileName = path.basename(filePath);
  if (!root) {
    await cwd(client, dirpath);
  }
  return new Promise((resolve) => {
    client.get(root ? filePath : fileName, (err, stream) => {
      if (!err) {
        let ws = fs.createWriteStream(
          path.resolve(
            outputPath || '',
            root ? `.${filePath}` : fileName,
          ),
        );
        stream.pipe(ws);
      }
      resolve({ err });
    });
  });
}

async function putFile(client, currentFile, dirpath) {
  const fileName = path.basename(currentFile);
  const stream = fs.createReadStream(currentFile);
  await cwd(client, dirpath);
  return new Promise((resolve) => {
    client.put(stream, fileName, (err) => {
      resolve({ err });
    });
  });
}

async function appendFile(client, currentFile, dirpath) {
  const fileName = path.basename(currentFile);
  const stream = fs.createReadStream(currentFile);
  await cwd(client, dirpath);
  return new Promise((resolve) => {
    client.append(stream, fileName, (err) => {
      resolve({ err });
    });
  });
}

function removeFile(client, targetFilePath) {
  return new Promise((resolve) => {
    client.delete(targetFilePath, (err) => {
      resolve({ err });
    });
  })
}

function renamePath(client, oldpath, newpath) {
  return new Promise((resolve) => {
    client.rename(oldpath, newpath, (err) => {
      resolve({ err });
    });
  })
}

function mkdir(client, targetFilePath) {
  return new Promise((resolve) => {
    client.mkdir(targetFilePath, (err) => {
      resolve({ err });
    });
  })
}

function rmdir(client, targetFilePath, recursive = false) {
  return new Promise((resolve) => {
    client.rmdir(targetFilePath, recursive, (err) => {
      resolve({ err });
    });
  })
}

async function getdir(client, dirpath, outputDirPath) {

  async function getFilepaths(entryPath, parentPath = '') {
    let filepaths = [];
    let source = '';

    if (parentPath === '') {
      source = entryPath;
    } else {
      source = parentPath + '/' + entryPath;
    }

    // check if output folder exist
    const outputDir = path.resolve(outputDirPath || '', `.${source}`);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    // need to list first, so that we can know files type
    const { files } = await listFiles(client, source);

    const fetching = [];
    for (let file of files) {
      // skip ".", ".."
      if (isNavigator(file.name)) continue;
      // is folder
      if (isDirectory(file)) {
        const p = getFilepaths(file.name, source)
          .then((childs) => {
            filepaths = filepaths.concat(childs);
          });
        fetching.push(p);
      } else {
        const fileSource = source === '/'
          ? source + file.name
          : `${source}/${file.name}`;
        filepaths.push(fileSource);
      }
    }

    await Promise.all(fetching);

    return filepaths;
  }

  // get filepaths
  const resultFiles = await getFilepaths(dirpath);
  console.log(resultFiles);

  // downloading
  for (let i = 0; i < resultFiles.length; i++) {
    const filepath = resultFiles[i];
    await getFile(client, filepath, outputDirPath, true); // from root
  }
}

async function putdir(client, options) {
  const { dirpath, targetDirPath, unzip, excludes } = Object.assign({
    targetDirPath: '/',
    unzip: false,
    excludes: [],
  }, options);
  // get local filepaths
  const localFilepaths = readFilesFromDir(dirpath, excludes);

  // loop local files
  for (let filepath of localFilepaths) {
    let dirname = path.dirname(filepath);
    // unzip files
    if (unzip === true) {
      dirname = dirname.replace(dirpath, '');
    }
    const remoteDirname = path.join(targetDirPath, dirname);
    // check remote folder exist
    const { err } = await cwd(client, remoteDirname);
    if (err) {
      await mkdir(client, remoteDirname);
    }
    await putFile(client, filepath, remoteDirname);
  }
}

async function appenddir(client, options) {
  const { dirpath, targetDirPath, unzip, excludes } = Object.assign({
    targetDirPath: '/',
    unzip: false,
    excludes: [],
  }, options);
  // get local filepaths
  const localFilepaths = readFilesFromDir(dirpath, excludes);

  // loop local files
  for (let filepath of localFilepaths) {
    let dirname = path.dirname(filepath);
    // unzip files
    if (unzip === true) {
      dirname = dirname.replace(dirpath, '');
    }
    const remoteDirname = path.join(targetDirPath, dirname);
    // check remote folder exist
    const { err } = await cwd(client, remoteDirname);
    if (err) {
      await mkdir(client, remoteDirname);
    }
    await appendFile(client, filepath, remoteDirname);
  }
}

function initFtp(options) {
  const spinner = ora('connecting...\n');

  const { config, ready: onClientReady } = options;

  spinner.start();

  log('yellow', `Try to Connect FTP: ${config.host}:${config.port}, username: ${config.user}\n`);

  const client = new ftp();

  client.on('ready', async function() {
    await onClientReady(client, spinner);
    client.end();
    spinner.stop();
  });

  client.on('error', function(err) {
    client.end();
    spinner.stop();
  });

  client.connect(config);
}

module.exports = {
  cwd,
  listFiles,
  getFile,
  putFile,
  appendFile,
  removeFile,
  renamePath,
  mkdir,
  rmdir,
  getdir,
  putdir,
  appenddir,
  initFtp,
};
