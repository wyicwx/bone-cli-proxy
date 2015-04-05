/*jslint node: true*/

var module;

module.exports = {
  // global
  port : 8080,
  allowIps : [
    '*'
  ],
  enableReplace : true,
  replaceRules : [],
  
  //delay : 1000,
  delayFilter : function (url) {
    // return true;
    // return /\.qpic\.cn/i.test(url);
  },
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


  scriptBase : __dirname,
  // pac module
  pac : false,
  pacEncoding : 'gbk',
  // logs module
  enableLog : false,
  visitLog : '~/bone-cli-proxy/visit.log',
  enableResponseLog : false,
  responseLog: '~/bone-cli-proxy/response.log',
  // host
  hostsFile : './hosts.conf',
  enableProxyRequest : true,
};
