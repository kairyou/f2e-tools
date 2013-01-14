**nodejs scss tools**

##### useage

```bash
$ sudo /path/scss.js # 载入已写好的配置, 侦听多个项目;
$ sudo /path/scss.js /path/project1/ /path/lib/ # 临时监听project1项目, lib为.scss里@import的path(无@import,可以省略);
$ sudo /path/scss.js -clear # 清除错误日志(如果配置了 scssConfig.js里logDir的路径);
$ sudo /path/scss.js -build # 读取所有的.scss并编译成.css文件;
```


[docs](http://www.fantxi.com/blog/archives/nodejs-sass/)