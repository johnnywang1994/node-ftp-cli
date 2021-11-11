# node-ftp-cli

A command line tool based on npm [ftp package](https://www.npmjs.com/package/ftp)


## Install

You can install globally or locally.

### Global

- Install
```bash
$ npm install -g node-ftp-cli
```

- get help
```bash
$ node-ftp --help
```

### Local

- Install
```bash
$ npm install node-ftp-cli
```

- package.json
```json
{
  "script": {
    "node-ftp": "node node_modules/.bin/node-ftp"
  }
}
```

- get help

```bash
npm run node-ftp --help
```


## Usage

we can confirm usage help by `node-ftp --help`, by default `node-ftp-cli` will look for the `ftp.config.js` in your current folder.

we can use options like `node-ftp --config my-ftp.config.js ....` to specific the config file. Settings can we refer [Here](https://www.npmjs.com/package/ftp#methods)

```js
// ftp.config.js
module.exports = {
  host: 'ftpupload.net.xxxx',
  port: 21,
  user: '12345678',
  password: 'aabbccdd12345',
  keepalive: 10000,
}
```


## Cli Usage

- remotepath: remote file path
- localpath: local file path
- remotefolder: remote folder path
- localfolder: local folder path
- outputpath: output folder path

### --list [remotefolder]
list files name in specific remote path folder

```bash
$ node-ftp --list /htdocs
```

### --get [remotepath] [-o [outputpath]]
download target file from ftp server, optionally to outputpath, if `-o` is not specific, current path will be used

```bash
$ node-ftp --get /htdocs/index.html -o ./dist
```

### --put/--append [localpath] -t [remotepath]
upload target file to ftp server

```bash
$ node-ftp --put/--append index.html -t /htdocs
```

### --rm [remotepath]
delete target file on ftp server

### --rename [remotepath/remotefolder] -t [remotepath/remotefolder]
rename an remote path to new path

```bash
$ node-ftp --rename /htdocs/index.html -t /htdocs/index.php
```

### --mkdir [remotefolder]
create new folder on ftp server, if the folder already exist, will do nothing

### --rmdir [remotefolder] [-r]
delete remote folder on ftp server, `-r` for `recursive`

### --getdir [remotefolder] [-o [outputpath]]
download target folder

```bash
$ node-ftp --getdir /htdocs -o ./myftp
```

### --putdir [localfolder] -t [remotefolder] [--unzip]
upload target folder to ftp server, if target file already exist, will overwrite the existing file, if target folder existed, will only append new files to that folder

1. ./dist/index.html => /htdocs/dist/index.html
```bash
$ node-ftp --putfir dist -t /htdocs
```

with `--unzip`, we can extract files from specific folder to the target folder

2. ./dist/index.html => /htdocs/index.html
```bash
$ node-ftp --putdir dist -t /htdocs --unzip
```

> for putdir, appenddir methods, we can set the `excludes` as array of string/regexp in options. value will be directly use in `match` method to exclude files or folder.

```js
module.exports = {
  host: '',
  password: '',
  // ...
  excludes: [/node_modules/],
}
```

### --appenddir [localfolder] -t [remotefolder] [--unzip]
upload target folder to ftp server, if target file already exist, will not overwrite the existing file.


## Script Usage
if you need more custom usage, you can easily require the `initFtp` function for custom usage.

```js
// find below usable methods
const { initFtp, listFiles } = require('node-ftp-cli');

const ftpOptions = {
  config: {
    host: 'aaaa.net',
    password: '123',
    // ...
  },
  ready: onFtpReady,
};

// ready function should be a promise
async function onFtpReady(client) {
  const { files } = await listFiles(client, '/');
  console.dir(files);
  // will auto close client once this ready promise resolved
}

// init connect
initFtp(ftpOptions);
```

Usable functions:

```js
// exports of node-ftp-cli
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
}
```

### Last Updated by johnnywang in 2021/11/08