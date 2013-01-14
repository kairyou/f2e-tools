#! /usr/bin/env node

/*
1. sudo /path/scss.js # 载入已写好的配置, 侦听多个项目;
   推荐这种方法, 把多个项目的配置信息写到 scssConfig.js中, 不需要额外的参数.
2. sudo /path/scss.js /path/project1/ /path/lib/ # 临时监听project1项目, lib为.scss里@import的path(无@import,可以省略);
3. sudo /path/scss.js -clear # 清除错误日志(如果配置了 scssConfig.js里logDir的路径);
4. sudo /path/scss.js -build # 读取所有的.scss并编译成.css文件;

scss docs:
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
    includePaths = arguments.length > 1 ? [arguments[1]] : []; // 单个项目文件夹

// console.log(projectDir);

var $fs = require('fs');
var $path = require('path');
var $exec = require('child_process').exec;
var $sass = require('node-sass');

var moment = require('moment'); // moment().format('YYYY/MM/DD HH:mm:ss')

var isCommand = 0 === projectDir.indexOf('-') ? true : false;

var scssConfig, logDir, logFile, maps;

if (projectDir && !isCommand) { // not: -clear || -build
    watch(projectDir, includePaths);
} else { // load maps
    scssConfig = require(__dirname + '/scssConfig');
    logDir = scssConfig.logDir;
    maps = scssConfig.maps;
    logFile = $path.join(logDir, 'scss.txt');
    // console.log(maps);
    if (isCommand) {
        if ('-clear' === projectDir && logDir) { // clear logs
            $fs.existsSync(logFile) && $fs.unlinkSync(logFile);
        }
        if ('-build' === projectDir) { // build .scss files
            maps.forEach(function(item, i) {
                var dir = item.dir,
                    paths = item.paths;
                build(dir, paths);
            });
        }
    } else { // watch project
        maps.forEach(function(item, i) {
            var dir = item.dir,
                paths = item.paths;
            watch(dir, paths);
        });
    }
}

var AP = Array.prototype;
var logMsg = function() {
    var args = AP.slice.call(arguments),
        len = args.length,
        last = args[len - 1],
        isErr = true === last ? true : false;
    if (isErr) args.pop();
    if (isErr && logDir) {
        var data = '[' + moment().format('YYYY/MM/DD HH:mm:ss') + ']' + '\n' + AP.join.call(args, '\n');
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
    if ('.scss' !== $path.extname(filepath) || 0 === baseName.indexOf('_')) return;

    // logMsg(filepath, ' > ', target);
    // return;
    var saveFile = function(data) {
        $fs.writeFile(target, data, function(err) {
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

function watch(path, paths) {
    // watch folder && subfolders with fs.watch: https://github.com/remy/nodemon/issues/66
    // or node-walk: https://github.com/coolaj86/node-walk
    $exec('find ' + path + ' -type d', function(err, stdout, stderr) {
        if (err) return logMsg(err, true);
        var dirs = stdout.split('\n');
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
}

function build(path, paths) {
    $exec('find ' + path + ' -name "*.scss"', function(err, stdout, stderr) {
        if (err) return logMsg(err, true);
        var files = stdout.split('\n');
        // logMsg(files);
        files.forEach(function(filepath, i) {
            // logMsg(i, filepath);
            if (filepath) processFile(filepath, paths);
        });
    });
}
