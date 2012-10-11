#! /usr/bin/env node

/*
// node build-js-uj1.js ./test/t.js ./test/t.min.js

https://github.com/mishoo/UglifyJS/
*/
var fs = require('fs'),
    path = require('path');
// var util = require('util'); // console.log(util.inspect(process.memoryUsage()));
var begin = now();

var argv = process.argv;

//console.log(argv[2]);
if (!argv[2]) {
    console.log('ERROR: No input file specified');
    return;
}
if (!argv[3]) {
    console.log('ERROR: No output file specified');
    return;
}
build(argv[2], argv[3]);

function now() {
    return (new Date()).getTime();
}
function build(flieIn, fileOut) { // uglifyjs t.js > t.min.js
    var uglify = require('uglify-js'),
        jsp = uglify.parser,
        pro = uglify.uglify;
    var origCode, ast;

    if (fs.existsSync(flieIn)) {
        origCode = fs.readFileSync(flieIn, 'utf8');
    } else {
        console.log('ERROR: ' + flieIn + ' not exists');  //  no such file or directory
        return;
    }

    try {
        ast = jsp.parse(origCode); // parse code and get the initial AST
        ast = pro.ast_mangle(ast); // get a new AST with mangled names
        ast = pro.ast_squeeze(ast);// get an AST with compression optimizations
        ast = pro.ast_lift_variables(ast);// discard unused function arguments or variables;
    } catch (e) {
        // console.log(e);
        // console.log('ERROR: ' + e.message + ' (line: ' + e.line + ', col: ' + e.col + ', pos: ' + e.pos + ')' + '\n***** file: ' + flieIn + ' *****');
        console.log('ERROR: ' + e.message + ' [' + e.line + ', ' + e.col + ']' + '\n***** file: ' + flieIn + ' *****');
        return;
    }
    var opts = {};
    opts['ascii_only'] = true; // ASCII characters as \uXXXX
    var finalCode = pro.gen_code(ast, opts);

    // fs.writeFileSync(fileOut, finalCode, 'utf8'); // try {} cache (e) {};
    fs.writeFileSync(fileOut, finalCode);
    var minute = (now() - begin) * 0.001;
    console.log(minute + ' s');

    // console.log(finalCode)
}
// build('t.js','t.mini.js');
