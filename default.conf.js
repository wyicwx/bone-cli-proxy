/*jslint node: true*/

var module;

module.exports = {
  enableReplace : true,
  //delay : 1000,
  delayFilter : function (url) {
    // return true;
    // return /\.qpic\.cn/i.test(url);
  },
  replaceRules : [],
  pacFilter : 'auto',
  // function (url, host) {
  //   if (
  //       //!/\.(swf|jpg|jpeg|gif|bmp|png|cur)(\?|$)/i.test(url) && //no pics or flash
  //       //!/^127\.0\.0\.1/i.test(host) && //no local
  //       (
  //         /^http:\/\/mat1\.gtimg\.com\/finance\/js\/st\//i.test(url) ||
  //         /^http:\/\/stockapp.finance.qq.com\//i.test(url)
  //       )
  //       ) {
  //     return true;
  //   }
  // },

  proxyRules : {
    // 'PROXY web-proxyhk.oa.com:8080' : [
    //   '*.google.com*',
    //   'cn.wsj.com'
    // ],
    // 'PROXY web-proxy.oa.com:8080' : [
    //   '*wikipedia.org*',
    //   '*.webdev.com*'
    // ],
    // 'DIRECT' : [
    //   'localhost',
    //   '127.0.0.1',
    //   '127.0.0.1:*',
    //   '10.211.55.*'
    // ]
  },

  allowIps : [
    '127.0.0.1',
    '10.211.55.*'
  ],

  scriptBase : __dirname,
  pac : '',
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
