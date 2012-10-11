#! /usr/bin/env node

/*
https://github.com/mishoo/uglifyjs2
*/
var fs = require('fs'),
    path = require('path');
var util = require('util'); // console.log(util.inspect(process.memoryUsage()));
var UglifyJS = require("./UglifyJS2/tools/node");

// var ERROR = 'ERROR';

//test{{
// node libs/build-js-uj2.js ./test/t.js ./test/t.min.js
//var argv = process.argv,arguments;
//if (argv) {arguments = argv.splice(2);console.log(build(arguments[0], arguments[1]));
//}
//}}

// vim UglifyJS2/tools/node.js warn_function 注释掉, 否则会有很多WARN信息

function now() {
    return (new Date()).getTime();
}
function build (flieIn, fileOut) {
    var begin = now();
    // console.time('build');
    var ret = compress(flieIn, fileOut);
    // console.timeEnd('build');

    if (ret.success) {
        ret.time = (now() - begin) + ' ms'; // var minute = (now() - begin) * 0.001 + ' s';
    }
    // console.log(ret);
    return ret;
}
function compress(flieIn, fileOut) { // uglifyjs t.js > t.min.js
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
    // parse
    try {
        ast = UglifyJS.parse(code);
        // lib/parse.js , function js_error
        // 加了 错误输出, 但是行号不准确(需要把里面的console.log注释掉)
    } catch (e) {
        ret.success = false;
        ret.msg = 'ERROR: ' + e.message + ' [' + e.line + ', ' + e.col + ']' + ', (file: ' + flieIn + ')';
        // console.log(msg);
        return ret;
    }
    // mangle
    ast.figure_out_scope();
    ast.mangle_names();

    // compress
    // var compressor = UglifyJS.Compressor({unused_func: true,unused_vars: true});
    var compressor = UglifyJS.Compressor();
    ast.squeeze(compressor);
    // discard unused function arguments or variables;
    // unused_func / unused_vars ?

    // ast.scope_warnings(); // 会显示更多的警告(比如xx没有使用, 变量前面没加var之类, 一般不需要)

    var opts = {};
    opts['ascii_only'] = true; // ASCII characters as \uXXXX
    // util.print(ast.print_to_string(opts));

    ret.data = ast.print_to_string(opts);
    // fs.writeFileSync(fileOut, ret.data);
    fs.writeFile(fileOut, ret.data, function (err) {
        if (err) throw err;
    });

    return ret;
}

// exports
exports.now = now;
exports.build = build;