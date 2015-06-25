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
  },
  pacFilter : 'auto',
  proxyRules : {
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
