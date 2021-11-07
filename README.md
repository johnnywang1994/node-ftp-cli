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

### --putdir [localfolder] -t [remotefolder]
upload target folder to ftp server, if target file already exist, will overwrite the existing file, if target folder existed, will only append new files to that folder

```bash
$ node-ftp --putfir dist -t /htdocs
```

### --appenddir [localfolder] -t [remotefolder]
now working...


## Script Usage
now working...

### Last Updated by johnnywang in 2021/11/07