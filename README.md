# bone-proxy
> 代理服务器 for bone

### 安装及使用

通过npm安装

```sh
$ npm install bone-proxy 
```

安装后在`bonefile.js`文件内通过`bone.cli()`加载

```js
var bone = require('bone');
var proxy = require('bone-proxy');

bone.cli(proxy());
```

### 参数


### 其他

处理器开发以及使用请参考[处理器](https://github.com/wyicwx/bone/blob/master/docs/plugin.md)