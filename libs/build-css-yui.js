#! /usr/bin/env node

/*
http://yuilibrary.com/download/yuicompressor/
$ cd ~/share/tools/libs/
wget http://yui.zenfs.com/releases/yuicompressor/yuicompressor-2.4.7.zip
unzip yuicompressor-2.4.7.zip -d yuicompressor
mv yuicompressor/yuicompressor-2.4.7/build/yuicompressor-2.4.7.jar ./
rm -r yuicompressor
rm yuicompressor-2.4.7.zip

var COMPILER = '/usr/bin/java -jar /home/leon/share/tools/libs/yuicompressor-2.4.7.jar';

node libs/build-css-yui.js ./test/t.css ./test/t.min.css
性能不太好.
*/
var fs = require('fs'),
    path = require('path');

var childProcess = require('child_process');

var COMPILER = '/usr/bin/java -jar /home/leon/share/tools/libs/yuicompressor-2.4.7.jar';

var execSync = require('exec-sync');

var ERROR = 'ERROR';

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
    // console.time('build');
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
        // code = fs.readFileSync(flieIn, 'utf8');
    } else { //  no such file or directory
        ret.success = false;
        ret.msg = 'ERROR: ' + flieIn + ' not exists';
        return ret;
    }
    // parse
    // console.log(COMPILER + ' ' + flieIn + ' ' + fileOut);
    // executes
    try {
        ret.data = execSync(COMPILER + ' ' + flieIn + ' > ' + fileOut);
    } catch (e) {
        ret.success = false;
        var msg = e + ''; // 转换成str;
        msg = msg.replace(/^Error: /, '')
        ret.msg = 'ERROR: ' + msg;
        return ret;
    }

    ret.data = ret.data.replace(/:first-letter{/g, ':first-letter {'); // Fixed: IE6 first-letter BUG

    fs.writeFileSync(fileOut, ret.data);
    // console.log(ret);
    return ret;
}

// exports
exports.now = now;
exports.build = build;