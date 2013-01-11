// linux kernel
var Inotify = require('inotify').Inotify;
var inotify = new Inotify();
var watchList = {};  // store watch and path
var inotifyCb = function(event) {
    var mask = event.mask;
    var filepath = watchList[event.watch] + '/' + event.name;
    // console.log(mask);

    var type = mask & Inotify.IN_ISDIR ? 'directory ' : 'file ',
        filename = event.name ? type + ':' + event.name + ' ' : ' ';
    if(mask & Inotify.IN_MODIFY) {
        // console.log(filename + 'was modified ');
        processFile(filepath);
    }
    else if(mask & Inotify.IN_CREATE) {
        // console.log(filename + 'created');
        if (mask & Inotify.IN_ISDIR) {
           inotifyAddWatch(filepath);
        }
    }
    // else if(mask & Inotify.IN_DELETE) {console.log(type + 'deleted');}
};
// add watch
var inotifyAddWatch = function(path) {
    var dir = {
        path: path,
        watch_for: Inotify.IN_CREATE | Inotify.IN_MODIFY | Inotify.IN_DELETE, // Inotify.IN_ALL_EVENTS,
        callback: inotifyCb
    };
    var watch = inotify.addWatch(dir);
    // console.log('add watch:' + path);
    watchList[watch] = path;
    // console.log(watch);
};
var watch = function(path) {
    $exec('find ' + path + ' -type d', function(err, stdout, stderr) {
        if (err) return console.log(err);
        var dirs =  stdout.split('\n');
        // console.log(dirs);
        dirs.forEach(function(dirpath, i) {
            // console.log(i, dirpath);
            if (dirpath) inotifyAddWatch(dirpath); // add watch
        });
    });
};
watch(projectDir);