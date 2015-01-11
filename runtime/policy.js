var findProxyFromPac = (function () {
  /*
此脚本为公司内部网络访问规则匹配脚本，包括直连访问、通过代理访问
脚本维护人：Lemonlv（吕木森）
更新：2014/10/24
TJ-SQUIDPAC-13
*/

function FindProxyForURL(url, host) {
    //基于IP判断出口
    if(checkip(host)) {
        if(QQIpDirect(url, host)) {
            return "DIRECT";
        }
        else
            return "PROXY web-proxy.oa.com:8080";
        }
    //基于域名判断出口
    else{
        if(QQDomainByProxy(url, host)) {
            return "PROXY web-proxy.oa.com:8080";
        }
        else if(QQDomainDirect(url, host)) {
            return "DIRECT";
        }
        else if(DomainHKProxy(url, host)) {
            return "PROXY web-proxyhk.oa.com:8080";
        }
        else if(DomainAppProxy(url, host)) {
            return "PROXY proxy.tencent.com:8080";
        }
        else
            return "PROXY web-proxy.oa.com:8080";
        }
}

//公司soso部分cdn域名访问，代理(web-proxy.oa.com)
function QQDomainByProxy(url, host) {
    if (
        shExpMatch(host,"2.y1y.net") ||
        shExpMatch(host, "500wan.zone.tenpay.com") ||
        shExpMatch(host, "air.tenpay.com") ||
        shExpMatch(host, "bao.post.soso.com") ||
        shExpMatch(host, "cache.post.soso.com") ||
        shExpMatch(host, "cache.soso.com") ||
        shExpMatch(host, "office.it.tencent.com") ||
        shExpMatch(host, "p1.qstatic.com") ||
        shExpMatch(host, "p2.qstatic.com") ||
        shExpMatch(host, "p3.qstatic.com") ||
        shExpMatch(host, "p4.qstatic.com") ||
        shExpMatch(host, "pic0.map.soso.com") ||
        shExpMatch(host, "pic1.map.soso.com") ||
        shExpMatch(host, "pic2.map.soso.com") ||
        shExpMatch(host, "pic3.map.soso.com") ||
        shExpMatch(host, "pic1.soso.com") ||
        shExpMatch(host, "pic2.soso.com") ||
        shExpMatch(host, "pic3.soso.com") ||
        shExpMatch(host, "pic4.soso.com") ||
        shExpMatch(host, "pic5.soso.com") ||
        shExpMatch(host, "pic6.soso.com") ||
        shExpMatch(host, "pic7.soso.com") ||
        shExpMatch(host, "pic8.soso.com") ||
        shExpMatch(host, "pic.baike.soso.com") ||
        shExpMatch(host, "pic.wenwen.soso.com") ||
        shExpMatch(host, "piccache1.soso.com") ||
        shExpMatch(host, "piccache2.soso.com") ||
        shExpMatch(host, "piccache3.soso.com") ||
        shExpMatch(host, "piccache4.soso.com") ||
        shExpMatch(host, "soso.qstatic.com")
    )
        return 1;
    else
        return 0;
}

//公司内网域名访问，直连(direct)
function QQDomainDirect(url, host) {
    if (
        shExpMatch(host, "*.3366.com") ||
        shExpMatch(host, "*.8788.cn") ||
        shExpMatch(host, "*.3gqq.com") ||
        shExpMatch(host, "51buy.com") ||
        shExpMatch(host, "*.51buy.com") ||
		shExpMatch(host, "67000.e-oa.com") ||
        shExpMatch(host, "*.ad.com") ||
        shExpMatch(host, "*.addev.com") ||
        shExpMatch(host, "admin.move.com") ||
        shExpMatch(host, "*.asanook.com") ||
        shExpMatch(host, "*.aurora.com") ||
        shExpMatch(host, "*.local") ||
        shExpMatch(host, "*.boss.com") ||
        shExpMatch(host, "*.bocaiwawa.com") ||
        shExpMatch(host, "*.cdc.com") ||
        shExpMatch(host, "*.cf.com") ||
        shExpMatch(host, "*.cm.com") ||
        shExpMatch(host, "*.datamine.com") ||
        shExpMatch(host, "dnspod.cn") ||
        shExpMatch(host, "*.dnspod.cn") ||
        shExpMatch(host, "ecc.com") ||
        shExpMatch(host, "*.ecc.com") ||
        shExpMatch(host, "ejinshang.com") ||
        shExpMatch(host, "*.ejinshang.com") ||
        shExpMatch(host, "*.expochart.cn") ||
        shExpMatch(host, "*.expovideo.cn") ||
        shExpMatch(host, "*.fms.com") ||
        shExpMatch(host, "*.fsanook.com") ||
        shExpMatch(host, "*.futu5.com") ||
        shExpMatch(host, "*.futu.cn") ||
        shExpMatch(host, "gaopeng.com") ||
        shExpMatch(host, "*.gaopeng.com") ||
        shExpMatch(host, "wanggou.com") ||
        shExpMatch(host, "*.wanggou.com") ||
        shExpMatch(host, "*.wkdimg.com") ||
        shExpMatch(host, "*.great.com") ||
        shExpMatch(host, "*.gtimg.cn") ||
        shExpMatch(host, "*.gtimg.com") ||
        shExpMatch(host, "*.heme.com") ||
        shExpMatch(host, "*.hezuo.com") ||
        shExpMatch(host, "*.home.com") ||
        shExpMatch(host, "*.hotbar.com") ||
        shExpMatch(host, "*.ibg.com") ||
        shExpMatch(host, "*.ibibo.com") ||
        shExpMatch(host, "*.icson.com") ||
        shExpMatch(host, "*.idqqimg.com") ||
        shExpMatch(host, "*.ied.com") ||
        shExpMatch(host, "*.ierd.com") ||
        shExpMatch(host, "*.imd.com") ||
        shExpMatch(host, "*.3366img.com") ||
        shExpMatch(host, "*.imoss.com") ||
        shExpMatch(host, "*.imqq.com") ||
        shExpMatch(host, "*.isd.com") ||
        shExpMatch(host, "*.isoso.com") ||
        shExpMatch(host, "*.itil.com") ||
        shExpMatch(host, "*.iweibo2.com") ||
        shExpMatch(host, "*.jd.me") ||
        shExpMatch(host, "zt.jd.com") ||
        shExpMatch(host, "st.jd.com") ||
        shExpMatch(host, "*.zt.jd.com") ||
        shExpMatch(host, "*.st.jd.com") ||
        shExpMatch(host, "localhost") ||
        shExpMatch(host, "*.lpiii.cn") ||		
        shExpMatch(host, "*.kitty.com") ||
        shExpMatch(host, "*.kuyoo.cn") ||
        shExpMatch(host, "*.kuyoo.com") ||
        shExpMatch(host, "*.matrix.cloud") ||
        shExpMatch(host, "*.m.com") ||
        shExpMatch(host, "*.mqq.com") ||
		shExpMatch(host, "*.myapp.com") ||
        shExpMatch(host, "nlog.server.com") ||
        shExpMatch(host, "*.oa.com") ||
        shExpMatch(host, "*.server.com") ||
        shExpMatch(host, "*.oss.com") ||
        shExpMatch(host, "*.otaworld.com") ||
        shExpMatch(host, "*.paipaioa.com") ||
        shExpMatch(host, "*.pc120.com") ||
        shExpMatch(host, "*.pengyou.com") ||
        shExpMatch(host, "*.qcloud.com") ||
        shExpMatch(host, "*.qcloudoa.com") ||
        shExpMatch(host, "*.qlogo.cn") ||
        shExpMatch(host, "*.qpic.cn") ||
        shExpMatch(host, "*.qpimg.cn") ||
        shExpMatch(host, "*.qplus.com") ||
        shExpMatch(host, "*.qq.com") ||
        shExpMatch(host, "qq.elong.com") ||
        shExpMatch(host, "*.qqgameapp.com") ||
        shExpMatch(host, "*.qqgames.com") ||
        shExpMatch(host, "*.qqinternal.com") ||
        shExpMatch(host, "*.qqmail.com") ||
        shExpMatch(host, "*.qqwork.com") ||
        shExpMatch(host, "*.qstatic.com") ||
        shExpMatch(host, "*.qzoneapp.com") ||
        shExpMatch(host, "*.qzone.com") ||
        shExpMatch(host, "*.rtpre.com") ||
        shExpMatch(host, "*.s1sf.com") ||
        shExpMatch(host, "*.sanook.com") ||
        shExpMatch(host, "*.sc.oa.com") ||
        shExpMatch(host, "*.sec.com") ||
        shExpMatch(host, "*.soc.com") ||
        shExpMatch(host, "*.soso.com") ||
        shExpMatch(host, "*.taotao.com") ||
        shExpMatch(host, "*.tencent.com") ||
        shExpMatch(host, "*.tencentvoip.com") ||
        shExpMatch(host, "*.tenpay.com") ||
        shExpMatch(host, "t.km") ||
        shExpMatch(host, "*.tr.com") ||
        shExpMatch(host, "*.t.server.com") ||
        shExpMatch(host, "url.cn") ||
        shExpMatch(host, "*.url.cn") ||
        shExpMatch(host, "*.vinagame.com.vn") ||
        shExpMatch(host, "*.vng.com.vn") ||
        shExpMatch(host, "*.vpn.com") ||
        shExpMatch(host, "*.webdev.com") ||
        shExpMatch(host, "*.webdev2.com") ||
        shExpMatch(host, "weishi.com") ||
        shExpMatch(host, "*.weishi.com") ||
        shExpMatch(host, "*.weiyun.com") ||
        shExpMatch(host, "*.wgimg.com") ||
        shExpMatch(host, "*.wkdimg.com") ||
        shExpMatch(host, "*.wsd.com") ||
        shExpMatch(host, "yixun.com") ||
        shExpMatch(host, "*.yixun.com")
    )
        return 1;
    else
        return 0;
}

//特定域名访问，香港代理(web-proxyhk.oa.com)
function DomainHKProxy(url, host) {
    if (
        shExpMatch(host, "acute3d.com") ||
        shExpMatch(host, "*.acute3d.com") ||
        shExpMatch(host, "*.aastocks.com") ||
        shExpMatch(host, "*.af.mil") ||
        shExpMatch(host, "*.afp.com") ||
        shExpMatch(host, "*.afp-direct.com") ||
        shExpMatch(host, "*.agoda.com") ||
        shExpMatch(host, "*.agoda.net") ||
        shExpMatch(host, "*.akamaihd.net") ||
        shExpMatch(host, "*.amazon.com") ||
        shExpMatch(host, "*.amazonaws.com") ||
        shExpMatch(host, "*.android.com") ||
        shExpMatch(host, "angularjs.org") ||
        shExpMatch(host, "*.angularjs.org") ||
        shExpMatch(host, "*.ap.org") ||
        shExpMatch(host, "*.apimages.com") ||
        shExpMatch(host, "appspot.com") ||
        shExpMatch(host, "*.appspot.com") ||
        shExpMatch(host, "*.aspnetcdn.com") ||
        shExpMatch(host, "*audioview.conferencing.com") ||
        shExpMatch(host, "*.badoo.com") ||
        shExpMatch(host, "*.bild.t-online.de") ||
        shExpMatch(host, "*.bizspring.net") ||
        shExpMatch(host, "*.blizzard.com") ||
        shExpMatch(host, "*.blogblog.com") ||
        shExpMatch(host, "*.blogger.com") ||
        shExpMatch(host, "*.blogspot.com") ||
        shExpMatch(host, "*.bloomberg.com") ||
        shExpMatch(host, "bochk.com") ||
        shExpMatch(host, "*.bochk.com") ||
        shExpMatch(host, "bocionline.com") ||
        shExpMatch(host, "*.bocionline.com") ||
        shExpMatch(host, "*.booking.com") ||
        shExpMatch(host, "*.boston.com") ||
        shExpMatch(host, "*.bus.umich.edu") ||
        shExpMatch(host, "*.businessweek.com") ||
        shExpMatch(host, "*.businessinsider.com") ||
        shExpMatch(host, "*.careerbuilder.com") ||
        shExpMatch(host, "*.castleagegame.com") ||
        shExpMatch(host, "castleagegame.com") ||
        shExpMatch(host, "chromium.org") ||
        shExpMatch(host, "*.chromium.org") ||
        shExpMatch(host, "cloudapp.net") ||
        shExpMatch(host, "*.cloudapp.net") ||
        shExpMatch(host, "cloudfront.net") ||
        shExpMatch(host, "*.cloudfront.net") ||
        shExpMatch(host, "*.cnbc.com") ||
        shExpMatch(host, "*.cnn.com") ||
        shExpMatch(host, "*.codeguru.com") ||
        shExpMatch(host, "*.conferencing.com") ||
        shExpMatch(host, "*.corrieredellosport.it") ||
        shExpMatch(host, "*.corriere.it") ||
        shExpMatch(host, "*.dice.com") ||
        shExpMatch(host, "discuss.com.hk") ||
        shExpMatch(host, "*.discuss.com.hk") ||
        shExpMatch(host, "*.dropbox.com") ||
        shExpMatch(host, "*.e3expo.com") ||
        shExpMatch(host, "*.egotastic.com") ||
        shExpMatch(host, "*.emarketer.com") ||
        shExpMatch(host, "*.e.nikkei.com") ||
        shExpMatch(host, "facebook.com") ||
        shExpMatch(host, "*.facebook.com") ||
        shExpMatch(host, "*.facebook.net") ||
        shExpMatch(host, "*.fastly.net") ||
        shExpMatch(host, "*.fbcdn.net") ||
        shExpMatch(host, "*.feedburner.com") ||
        shExpMatch(host, "feedly.com") ||
        shExpMatch(host, "*.feedly.com") ||
        shExpMatch(host, "fibaasia.net") ||
        shExpMatch(host, "*.fibaasia.net") ||
        shExpMatch(host, "*.flickr.com") ||
        shExpMatch(host, "*.football365.com") ||
        shExpMatch(host, "*.football.guardian.co.uk") ||
        shExpMatch(host, "*.ft.com") ||
        shExpMatch(host, "*.gailly.net") ||
        shExpMatch(host, "*.gamebase.com.tw") ||
        shExpMatch(host, "*.gamer.com.tw") ||
        shExpMatch(host, "*.gazzetta.it") ||
        shExpMatch(host, "*.gbc.tw") ||
        shExpMatch(host, "github.com") ||
        shExpMatch(host, "*.github.com") ||
        shExpMatch(host, "*.github.io") ||
        shExpMatch(host, "*.glassdoor.com") ||
        shExpMatch(host, "gmail.com") ||
        shExpMatch(host, "*.gmail.com") ||
        shExpMatch(host, "golang.org") ||
        shExpMatch(host, "*.golang.org") ||
        shExpMatch(host, "*.goldengame.com.tw") ||
        shExpMatch(host, "google*.*") ||
        shExpMatch(host, "*.google*.*") ||
        shExpMatch(host, "*.googleusercontent.com") ||
        shExpMatch(host, "*.gov.tw") ||
        shExpMatch(host, "gstatic.com") ||
        shExpMatch(host, "*.gstatic.com") ||
        shExpMatch(host, "*.guardian.co.uk") ||
        shExpMatch(host, "hacklang.org") ||
        shExpMatch(host, "*.hacklang.org") ||
        shExpMatch(host, "*.haproxy.org") ||
        shExpMatch(host, "hhvm.com") ||
        shExpMatch(host, "*.hhvm.com") ||
        shExpMatch(host, "*.highcharts.com") ||
        shExpMatch(host, "*.hkjc.com") ||
        shExpMatch(host, "*.hkexnews.hk") ||
        shExpMatch(host, "*.home.skysports.com") ||
        shExpMatch(host, "*.hootsuite.com") ||
        shExpMatch(host, "*.hosted.ap.org") ||
        shExpMatch(host, "*.hsbcnet.com") ||
        shExpMatch(host, "hulu.com") ||
        shExpMatch(host, "*.hulu.com") ||
        shExpMatch(host, "*.huluim.com") ||
        shExpMatch(host, "i1.hk") ||
        shExpMatch(host, "*.i1.hk") ||
        shExpMatch(host, "*.ibibo.com") ||
        shExpMatch(host, "*.imdb.com") ||
        shExpMatch(host, "*.insead.edu") ||
        shExpMatch(host, "*.insidefacebook.com") ||
        shExpMatch(host, "*.insidesocialgame.com") ||
        shExpMatch(host, "*.jstree.com") ||
        shExpMatch(host, "kenexa.com") ||
        shExpMatch(host, "*.kenexa.com") ||
        shExpMatch(host, "*.kicker.de") ||
        shExpMatch(host, "knorex.asia") ||
        shExpMatch(host, "*.knorex.asia") ||
        shExpMatch(host, "*.krxd.net") ||
        shExpMatch(host, "*.ku.edu") ||
        shExpMatch(host, "*.lacitylimo.com") ||
        shExpMatch(host, "*.lastampa.it") ||
        shExpMatch(host, "*.leagueoflegends.com") ||
        shExpMatch(host, "*.libpng.org") ||
        shExpMatch(host, "licdn.com") ||
        shExpMatch(host, "*.licdn.com") ||
        shExpMatch(host, "linkedin.com") || 
        shExpMatch(host, "*.linkedin.com") ||
        shExpMatch(host, "*.marca.com") ||
        shExpMatch(host, "me2day.com") ||
        shExpMatch(host, "*.me2day.com") ||
        shExpMatch(host, "*.microsoftonline.com") ||
        shExpMatch(host, "*.milw0rm.com") ||
        shExpMatch(host, "*.mitsloan.mit.edu") ||
        shExpMatch(host, "mnet.com") ||
        shExpMatch(host, "*.mnet.com") ||
        shExpMatch(host, "*.money.cnn.com") ||
        shExpMatch(host, "*.msocdn.com") ||
        shExpMatch(host, "*.mytour.com.hk") ||
        shExpMatch(host, "*.nasa.gov") ||
        shExpMatch(host, "*.nasdaq.com") ||
        shExpMatch(host, "*.nate.com") ||
        shExpMatch(host, "*.naver.com") ||
        shExpMatch(host, "*.naver.net") ||
        shExpMatch(host, "*.navy.mil") ||
        shExpMatch(host, "*.ncb.com.hk") ||
        shExpMatch(host, "*.newsweek.com") ||
        shExpMatch(host, "*.nexon.com") ||
        shExpMatch(host, "*.northwestern.edu") ||
        shExpMatch(host, "*.nytimes.com") ||
        shExpMatch(host, "*.optimizely.com") ||
        shExpMatch(host, "*.paypal.com") ||
        shExpMatch(host, "*.r7ls.net") ||
        shExpMatch(host, "ping.fm") ||
        shExpMatch(host, "*.pixelinteractivemedia.com") ||
        shExpMatch(host, "*.play168.com.tw") ||
        shExpMatch(host, "*.playfish.com") ||
        shExpMatch(host, "*.plurk.com") ||
        shExpMatch(host, "*.precision-asia.com") ||
        shExpMatch(host, "*.ptt.cc") ||
        shExpMatch(host, "*.picdn.net") ||
        shExpMatch(host, "*.rd.yahoo.com") ||
        shExpMatch(host, "*.renaissancecapital.com") ||
        shExpMatch(host, "*.reuters.com") ||
        shExpMatch(host, "*.rootkit.com") ||
        shExpMatch(host, "*.scout.org.hk") ||
        shExpMatch(host, "*.serving-sys.com") ||
		shExpMatch(host, "*.shl.com") ||
        shExpMatch(host, "*.shutterstock.com") ||
        shExpMatch(host, "*.sixjoy.com") ||
        shExpMatch(host, "*.slidesharecdn.com") ||
        shExpMatch(host, "*.slideshare.net") ||
        shExpMatch(host, "sourceforge.net") ||
        shExpMatch(host, "*.sourceforge.net") ||
        shExpMatch(host, "*.sport.independent.co.uk") ||
        shExpMatch(host, "*.sstatic.net") ||
        shExpMatch(host, "survey-online.com") ||
        shExpMatch(host, "*.survey-online.com") ||
        shExpMatch(host, "*.sysinternals.com") ||
        shExpMatch(host, "stackoverflow.com") ||
        shExpMatch(host, "*.stackoverflow.com") ||
        shExpMatch(host, "tangentsoft.net") ||
        shExpMatch(host, "*.tangentsoft.net") ||
        shExpMatch(host, "t.co") ||
        shExpMatch(host, "*.t.co") ||
        shExpMatch(host, "thestar.com") ||
        shExpMatch(host, "*.thestar.com") ||
        shExpMatch(host, "*.thestar.com.my") ||
        shExpMatch(host, "*.timesofindia.indiatimes.com") ||
        shExpMatch(host, "tinychat.com") ||
        shExpMatch(host, "*.tinychat.com") ||
        shExpMatch(host, "*.tipo.gov.tw") ||
        shExpMatch(host, "*.tmz.com") ||
        shExpMatch(host, "*.turner.com") ||
        shExpMatch(host, "*.truste.com") ||
        shExpMatch(host, "twimg.com") ||
        shExpMatch(host, "*.twimg.com") ||
        shExpMatch(host, "*.twitiq.com") ||
        shExpMatch(host, "*.twitpic.com") ||
        shExpMatch(host, "twitter.com") ||
        shExpMatch(host, "*.twitter.com") ||
        shExpMatch(host, "udn.com") ||
        shExpMatch(host, "*.udn.com") ||
        shExpMatch(host, "*.ugdturner.com") ||
        shExpMatch(host, "*.unalis.com.tw") ||
        shExpMatch(host, "*.verisign.com") ||
        shExpMatch(host, "vimeo.com") ||
        shExpMatch(host, "*.vimeo.com") ||
        shExpMatch(host, "*.vimeocdn.com") ||
        shExpMatch(host, "voanews.com") ||
        shExpMatch(host, "*.voanews.com") ||
        shExpMatch(host, "vtibet.cn") ||
        shExpMatch(host, "*.vtibet.cn") ||
        shExpMatch(host, "*.want-daily.com") ||
        shExpMatch(host, "*.webssup.com") ||
        shExpMatch(host, "*.wechat.com") ||
        shExpMatch(host, "*.wharton.upenn.edu") ||
        shExpMatch(host, "wiki.kernel.org") ||
        shExpMatch(host, "*.wiki.kernel.org") ||
        shExpMatch(host, "*.wikimedia.org") ||
        shExpMatch(host, "*.wikipedia.org") ||
        shExpMatch(host, "*.windowslive.cn") ||
        shExpMatch(host, "*.windowsphone.com") ||
        shExpMatch(host, "wireshark.org") ||
        shExpMatch(host, "*.wireshark.org") ||
        shExpMatch(host, "wordpress.com") ||
        shExpMatch(host, "*.wordpress.com") ||
        shExpMatch(host, "*.worldofwarcraft.co.kr") ||
        shExpMatch(host, "*.wowarmory.com") ||
        shExpMatch(host, "*.wow-europe.com") ||
        shExpMatch(host, "*.wowtaiwan.com.tw") ||
        shExpMatch(host, "*.wpengine.com") ||
        shExpMatch(host, "*.wsj.com") ||
        shExpMatch(host, "*.wsj.net") ||
        shExpMatch(host, "*.wretch.cc") ||
        shExpMatch(host, "*.xbox.com") ||
        shExpMatch(host, "*.yahoo.com") ||
        shExpMatch(host, "*.yam.com") ||
        shExpMatch(host, "yfrog.com") ||
        shExpMatch(host, "*.yfrog.com") ||
        shExpMatch(host, "*.yiiframework.com") ||
        shExpMatch(host, "*.youtube.com") ||
        shExpMatch(host, "*.ytimg.com") ||
        shExpMatch(host, "*.zgncdn.com")
    )
        return 1;
    else
        return 0;
}

//以下为公司内网IP，直连(direct)
function QQIpDirect(url, host) {
    if (
        isInNet(host, "10.0.0.0", "255.0.0.0") ||
        isInNet(host, "127.0.0.0", "255.255.255.0") ||
		isInNet(host, "172.0.0.0", "255.0.0.0") ||
        isInNet(host, "172.16.0.0", "255.240.0.0") ||
        isInNet(host, "192.168.0.0", "255.255.0.0") ||
        isInNet(host, "58.64.216.247", "255.255.255.255") ||
        isInNet(host, "58.64.216.248", "255.255.255.255") ||
        isInNet(host, "58.249.115.246", "255.255.255.255") ||
        isInNet(host, "111.161.56.174", "255.255.255.255") ||
        isInNet(host, "112.90.60.244", "255.255.255.255") ||
        isInNet(host, "113.107.203.244", "255.255.255.255") ||
        isInNet(host, "113.108.16.105", "255.255.255.255") ||
        isInNet(host, "116.57.254.109", "255.255.255.255") ||
        isInNet(host, "118.123.232.9", "255.255.255.255") ||
		isInNet(host, "122.225.208.50", "255.255.255.255") ||
        isInNet(host, "163.177.65.228", "255.255.255.255") ||
        isInNet(host, "183.60.117.179", "255.255.255.255") ||
        isInNet(host, "183.61.87.117", "255.255.255.255") ||
        isInNet(host, "183.61.87.118", "255.255.255.255") ||
        isInNet(host, "120.196.210.78", "255.255.255.255") ||
        isInNet(host, "203.195.180.244", "255.255.255.255") ||
        isInNet(host, "219.133.33.74", "255.255.255.255") ||
        isInNet(host, "219.133.33.75", "255.255.255.255") ||
        isInNet(host, "219.133.33.76", "255.255.255.255") ||
        isInNet(host, "219.133.33.77", "255.255.255.255") ||
        isInNet(host, "220.241.126.88", "255.255.255.255") ||
        isInNet(host, "221.130.24.13", "255.255.255.255") ||
        isInNet(host, "221.130.15.25", "255.255.255.255") ||
        isInNet(host, "221.130.15.33", "255.255.255.255") ||
        isInNet(host, "221.130.15.44", "255.255.255.255") ||
        isInNet(host, "221.130.15.46", "255.255.255.255") ||
        isInNet(host, "221.130.15.91", "255.255.255.255") ||
        isInNet(host, "221.130.15.93", "255.255.255.255") ||
        isInNet(host, "221.130.15.172", "255.255.255.255") ||
        isInNet(host, "221.130.15.240", "255.255.255.255")
    )
        return 1;
    else
        return 0;
}

//管家下载补丁的特定域名走appproxy
function DomainAppProxy(url, host) {
    if (
        shExpMatch(host, "tc.dlservice.microsoft.com") ||
        shExpMatch(host, "qh.dlservice.microsoft.com") ||
		shExpMatch(host, "download.microsoft.com") 
    )
        return 1;
    else
        return 0;
}

//判断IP是否合法
function checkip(host) {
    var ipValidate=/^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
    if (ipValidate.test(host)) {
        return true;
    }
    else {
        return false;
    }
}
  return FindProxyForURL || function () { return 'DIRECT'; };
})();

var shExpMatch,
  isInNet,
  exports;

if (shExpMatch === undefined) {
  shExpMatch = function (url, pattern) {
    url = url || '';
    var pChar,
      isAggressive = false,
      pIndex,
      urlIndex = 0,
      patternLength = pattern.length,
      urlLength = url.length;
    for (pIndex = 0; pIndex < patternLength; pIndex += 1) {
      pChar = pattern[pIndex];
      switch (pChar) {
      case "?":
        isAggressive = false;
        urlIndex += 1;
        break;
      case "*":
        if (pIndex === patternLength - 1) {
          urlIndex = urlLength;
        } else {
          isAggressive = true;
        }
        break;
      default:
        if (isAggressive) {
          urlIndex = url.indexOf(pChar, urlIndex);
          if (urlIndex < 0) {
            return false;
          }
          isAggressive = false;
        } else {
          if (urlIndex >= urlLength || url[urlIndex] !== pChar) {
            return false;
          }
        }
        urlIndex += 1;
      }
    }
    return urlIndex === urlLength;
  };
}

if (isInNet === undefined) {
  isInNet = function (host, pattern, mask) {
    var i;
    host = host.split('.');
    pattern = pattern.split('.');
    mask = mask.split('.');

    for (i = 0; i < 4; i++) {
      if ((host[i] & mask[i]) !== (pattern[i] & mask[i])) {
        return false;
      }
    }

    return true;
  };
}

if (exports === undefined) {
  exports = {};
}

exports.findProxyFromPac = findProxyFromPac;
