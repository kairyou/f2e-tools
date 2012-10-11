#! /usr/bin/env node

/*
node libs/build-js-gc.js ./test/t.js ./test/t.min.js

https://code.google.com/p/closure-compiler/downloads/list
$ cd ~/share/tools/libs/
wget http://closure-compiler.googlecode.com/files/compiler-latest.zip
unzip compiler-latest.zip -d compiler-latest
mv compiler-latest/compiler.jar ./
rm -r compiler-latest
rm compiler-latest.zip

*/
var fs = require('fs'),
    path = require('path');

var childProcess = require('child_process');

var COMPILER = '/usr/bin/java -jar /home/leon/share/tools/libs/compiler.jar';

var execSync = require('exec-sync');

// test{{
var argv = process.argv,
    arguments;
if (argv) {
    arguments = argv.splice(2);
    console.log(build(arguments[0], arguments[1]));
}
// }}

function now() {
    return (new Date()).getTime();
}
function build (flieIn, fileOut) {
    var begin = now();
    var ret = compress(flieIn, fileOut);

    if (ret.success) {
        ret.time = (now() - begin) + ' ms';
    }
    // console.log(ret);
    return ret;
}
function compress(flieIn, fileOut) {
    var ret = {success: true};
    var code, ast, msg;
    if (!flieIn) {
        ret.success = false;
        ret.msg = 'ERROR: No input file specified';
        return ret;
    }
    if (!fileOut) {
        ret.success = false;
        ret.msg = 'ERROR: No output file specified';
        return ret;
    }

    if (fs.existsSync(flieIn)) {
        code = fs.readFileSync(flieIn, 'utf8');
    } else { //  no such file or directory
        ret.success = false;
        ret.msg = 'ERROR: ' + flieIn + ' not exists';
        return ret;
    }
    // executes
    try {
        ret.data = execSync(COMPILER + ' ' + flieIn + ' > ' + fileOut);
    } catch (e) {
        ret.success = false;
        var msg = e + ''; // 转换成str;
        msg = msg.replace(/^Error: /, '');
        ret.msg = 'ERROR: ' + msg;
        return ret;
    }

    fs.writeFileSync(fileOut, ret.data);
    // console.log(ret);
    return ret;
}

// exports
exports.now = now;
exports.build = build;