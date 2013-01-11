#! /usr/bin/env node

/*
1. 载入已写好的配置, 侦听多个项目: sudo /home/leon/share/tools/scss.js
2. 针对临时项目(带include_paths): sudo /home/leon/share/tools/scss.js /home/leon//share/tools/test/p /home/leon//share/tools/test/p/f/
当不会用到@import导入时, 第3个参数可以省略;

推荐使用第1种, 只需把配置写到 scssConfig.js中, 不需要额外的参数.

http://sass-lang.com/docs/yardoc/file.SASS_REFERENCE.html
*/

/*
node-sass使用时遇到的问题整理:
1. error reading values after :
读取value出错, 可能是颜色错误不是6位或3位, 比如:color:#abcde;
2. .scss里面写: @charset "UTF-8"; 会报错: top-level blockless directive must be terminated by ';'
@see: https://github.com/andrew/node-sass/issues/23
3. error reading values after opacity / progid
使用: unquote("..."); @see: https://github.com/hcatlin/libsass/issues/72
*/


var argv = process.argv,
    arguments = argv.splice(2),
    projectDir = arguments[0],
    includePaths = arguments.length > 1 ? [arguments[1]] : []; // 一个文件夹应该够了

// console.log(projectDir);

var $fs = require('fs');
var $path = require('path');
var $exec = require('child_process').exec;
var $sass = require('node-sass');

var moment = require('moment');
// console.log(moment().format('YYYY/MM/DD HH:mm:ss'));

var scssConfig, logDir, logFile, maps;
if (projectDir && '-clear' !== projectDir) { // one
    watch2(projectDir, includePaths);
} else { // load maps
    scssConfig = require(__dirname + '/scssConfig');
    logDir = scssConfig.logDir;
    maps = scssConfig.maps;
    logFile = $path.join(logDir, 'scss.txt');
    // console.log(maps);
    if ('-clear' === projectDir && logDir) { // clear logs
        $fs.existsSync(logFile) && $fs.unlinkSync(logFile);
        return;
    }
    maps.forEach(function(item, i) {
        var dir = item.dir,
            paths = item.paths;
        watch2(dir, paths);
    });
}

/*
sass.render('body{background:blue; a{color:black;}}', function(err, css){
    console.log(css);
});*/

var AP = Array.prototype;
var logMsg = function() {
    var args = AP.slice.call(arguments),
        len = args.length,
        last = args[len - 1],
        isErr = true === last ? true : false;
    if (isErr) args.pop();
    if (isErr && logDir) {
        var data = '[' + moment().format('YYYY/MM/DD HH:mm:ss') + ']'+ '\n' + AP.join.call(args, '\n');
        data = data.replace(/\n$/g, '');
        $fs.appendFileSync(logFile, data + '\n', 'utf-8');
    }
    return console.log.apply(null, args);
};

// file change callback (create || modify)
var processFile = function(filepath, paths) {
    var baseName = $path.basename(filepath, '.scss'),
        target = $path.join($path.dirname(filepath), baseName + '.css');
    // not *.scss and _*.scss files
    if ('.scss' !== $path.extname(filepath) || baseName.indexOf('_') === 0) return;

    // logMsg(filepath, ' > ', target);
    // return;
    var saveFile = function(data) {
        $fs.writeFile(target, data, function (err) {
            if (err) return logMsg(err, true);
            // logMsg('data', data);
            logMsg('@done:', filepath, '>', target);
        });
    };
    $fs.readFile(filepath, 'utf-8', function(err, data) {
        if (err) return logMsg(err, true);
        // logMsg(data);
        $sass.render(data, function(err, css) {
            if (err) return logMsg(filepath, err, true);
            // logMsg(css);
            if (css) saveFile(css);
        }, { include_paths: paths ? paths : []});
    });
};

function watch(file, real) {
    // watch folder && subfolders with fs.watch: https://github.com/remy/nodemon/issues/66
    // or node-walk: https://github.com/coolaj86/node-walk
    var path;
    if (!real) {
        if (!$fs.existsSync(file)) return logMsg('No such directory: ' + file, true);
        real = $fs.realpathSync(file);
        path = real;
    } else {
        path = $path.join(real, file);//real.concat('/', file);
    }
    real = path;
    $fs.stat(path, function(err, stat) {
        if (err) return logMsg(err, true);
        if (stat && stat.isDirectory()) {
            $fs.watch(path, function(event, filename) {
                var filepath = $path.join(real, filename);
                // var type  = event == 'change' ? 'changed' : 'created';
                // logMsg(event, filename, filepath);
                if (filename) processFile(filepath);
            });
            // sub folders
            $fs.readdir(path, function(err, files) {
                if (err) return logMsg(err, true);
                for (var i = 0, len = files.length; i < len; i++) {
                    var file = files[i],
                        ext = $path.extname(file);
                    // logMsg(file, real);
                    if (!ext) { // folder
                        watch(file, real);
                    }
                }
            });
        }
    });
};
function watch2(path, paths) {
    $exec('find ' + path + ' -type d', function(err, stdout, stderr) {
        if (err) return logMsg(err, true);
        var dirs =  stdout.split('\n');
        // logMsg(dirs);
        dirs.forEach(function(dirpath, i) {
            // logMsg(i, dirpath);
            if (dirpath) { // add watch
                $fs.watch(dirpath, function(event, filename) {
                    var filepath = $path.join(dirpath, filename);
                    if (filename) processFile(filepath, paths);
                });
            }
        });
    });
};
