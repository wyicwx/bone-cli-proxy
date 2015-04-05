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

**port**

type: 'number' default: 8080

代理服务器的启用端口

**enableReplace**

type: 'boolean' default: true

启用代理替换

**replaceRules**

type: 'array' default: []

代理过程中替换文件规则，参数为二维数组，第一个值为正则，第二个值为被替换的文件

```js
var proxy = require('bone-cli-proxy');
bone.cli(proxy{
	replaceRules: [
		[/www\.qq\.com\/([^.]*)/, '~/dist/qq/{$1}']
		[/www\.baidu\.com\/([^.]*)/, '~/dist/baidu/{$1}']
	]
});

```

**enableLog**

type: `boolean` default: false

启用http访问log

**visitLog**

type: 'string'、'stream' default: '~/bone-cli-proxy/visit.log'

访问log写入目的地，可以传入一个可写流

**enableResponseLog**

type: 'boolean' default: false

启用http返回log

**responseLog**

type: 'string'、'stream' default: '~/bone-cli-proxy/response.log'

返回log写入目的地，可传入一个可写流

**pac**

type: 'string'、'boolean' default: false

支持用pac方式的代理，可以填入一个网址

**pacEncoding**

type: 'string' default: 'gbk'

pac文件编码

### 其他

命令行工具开发以及使用请参考[处理器](https://github.com/wyicwx/bone-cli)

[站在巨人的肩膀上](https://github.com/stauren/macFiddler)