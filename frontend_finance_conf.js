/*jslint node: true*/

var module;

module.exports = {
  enableReplace : true,
  //delay : 1000,
  delayFilter : function (url) {
    return true;
    return /\.qpic\.cn/i.test(url);
  },
  replaceRules : [

    //qq panel
    [ /http:\/\/mat1\.gtimg\.com\/finance\/js\/st\/p\/qq\/([^_]+)_.*.js/, 'product/qq/{$1}.js'],

    //qq2011 panel
    [ /^http:\/\/mat1\.gtimg\.com\/finance\/js\/st\/p\/qq2011\/([^_]+)_.*.js/,
      'product/qq2011/build/js/{$1}.js'],
    [ /^http:\/\/mat1.gtimg.com\/finance\/st\/p\/2011\/bg.*.gif/,
      'product/qq2011/imgs/bg.gif' ],
    [ /^http:\/\/stockapp.finance.qq.com\/panel2\/sta\/[0-9]+\/canvas.php.*/i,
      'product/qq2011/build/htm/canvas.htm' ],

    //mstat
    [ /http:\/\/mat1.gtimg.com\/finance\/js\/st\/p\/mstats\/firstscreen_.*.js/,
      'scripts/mstats/firstscreen.comment.js']

  ],
  filter : function (url, host) {
    if (
        //!/\.(swf|jpg|jpeg|gif|bmp|png|cur)(\?|$)/i.test(url) && //no pics or flash
        //!/^127\.0\.0\.1/i.test(host) && //no local
        (
          /^http:\/\/mat1\.gtimg\.com\/finance\/js\/st\//i.test(url) ||
          /^http:\/\/stockapp.finance.qq.com\//i.test(url)
        )
        ) {
      return true;
    }
  },

  proxyRules : {
    'PROXY web-proxyhk.oa.com:8080' : [
      '*.google.com*',
      'cn.wsj.com'
    ],
    'PROXY web-proxy.oa.com:8080' : [
      '*wikipedia.org*',
      '*.webdev.com*'
    ],
    'DIRECT' : [
      'localhost',
      '127.0.0.1',
      '127.0.0.1:*',
      '10.211.55.*'
    ]
  },

  allowIps : [
    '127.0.0.1',
    '10.211.55.*'
  ],

  scriptBase : __dirname,
  pac : 'http://txp-01.tencent.com/proxy.pac',
  pacEncoding : 'gbk',

  enableLogs : true,
  logFile : './logs/visit.log',
  enableResponseLog : false,
  responseLogFilePrefix : './logs/response_',

  hostsFile : './hosts.conf',

  enableProxyRequest : true,

  port : 8080,
  maxSockets : 10
};
