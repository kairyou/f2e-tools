#! /usr/bin/env node

/*

https://github.com/GoalSmashers/clean-css

var cleanCSS = require('clean-css');
var source = "a{font-weight:bold;}";
var minimized = cleanCSS.process(source);
console.log(minimized);

bugs:
{}里都注释的没有删除

*/
var fs = require('fs'),
    path = require('path');
// var util = require('util'); // console.log(util.inspect(process.memoryUsage()));
var cleanCSS = require('clean-css');

// var ERROR = 'ERROR';

//test{{
//node libs/build-css-cc.js ./test/t.css ./test/t.min.css
//var argv = process.argv,arguments;
//if (argv) {arguments = argv.splice(2);console.log(build(arguments[0], arguments[1]));}
//}}

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
function compress(flieIn, fileOut) { // uglifyjs t.js > t.min.js
    var ret = {success: true};
    var source, ast, msg;
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
        source = fs.readFileSync(flieIn, 'utf8');
    } else { //  no such file or directory
        ret.success = false;
        ret.msg = 'ERROR: ' + flieIn + ' not exists';
        return ret;
    }


    var minimized = cleanCSS.process(source);

    minimized = minimized.replace(/:first-letter{/g, ':first-letter {'); // Fixed: IE6 first-letter BUG
    minimized = minimized.replace(/}\S*{}/g, '}'); // 删除全部是注释的元素 .del{}.del2{}

    ret.data = minimized;

    // fs.writeFileSync(fileOut, ret.data);
    fs.writeFile(fileOut, ret.data, function (err) {
        if (err) throw err;
    });
    // console.log(ret);
    return ret;
}

// exports
exports.now = now;
exports.build = build;