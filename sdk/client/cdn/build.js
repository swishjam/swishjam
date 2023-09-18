(()=>{var e={238:function(e,i,t){var a;!function(r,s){"use strict";var o="function",n="undefined",d="object",c="string",w="major",l="model",b="name",u="type",h="vendor",g="version",p="architecture",m="console",v="mobile",f="tablet",x="smarttv",k="wearable",y="embedded",S="Amazon",_="Apple",I="ASUS",z="BlackBerry",D="Browser",V="Chrome",j="Firefox",N="Google",E="Huawei",T="LG",M="Microsoft",O="Motorola",C="Opera",q="Samsung",A="Sharp",P="Sony",U="Xiaomi",R="Zebra",L="Facebook",B="Chromium OS",F="Mac OS",$=function(e){for(var i={},t=0;t<e.length;t++)i[e[t].toUpperCase()]=e[t];return i},H=function(e,i){return typeof e===c&&-1!==K(i).indexOf(K(e))},K=function(e){return e.toLowerCase()},J=function(e,i){if(typeof e===c)return e=e.replace(/^\s\s*/,""),typeof i===n?e:e.substring(0,350)},W=function(e,i){for(var t,a,r,n,c,w,l=0;l<i.length&&!c;){var b=i[l],u=i[l+1];for(t=a=0;t<b.length&&!c&&b[t];)if(c=b[t++].exec(e))for(r=0;r<u.length;r++)w=c[++a],typeof(n=u[r])===d&&n.length>0?2===n.length?typeof n[1]==o?this[n[0]]=n[1].call(this,w):this[n[0]]=n[1]:3===n.length?typeof n[1]!==o||n[1].exec&&n[1].test?this[n[0]]=w?w.replace(n[1],n[2]):s:this[n[0]]=w?n[1].call(this,w,n[2]):s:4===n.length&&(this[n[0]]=w?n[3].call(this,w.replace(n[1],n[2])):s):this[n]=w||s;l+=2}},Z=function(e,i){for(var t in i)if(typeof i[t]===d&&i[t].length>0){for(var a=0;a<i[t].length;a++)if(H(i[t][a],e))return"?"===t?s:t}else if(H(i[t],e))return"?"===t?s:t;return e},G={ME:"4.90","NT 3.11":"NT3.51","NT 4.0":"NT4.0",2e3:"NT 5.0",XP:["NT 5.1","NT 5.2"],Vista:"NT 6.0",7:"NT 6.1",8:"NT 6.2",8.1:"NT 6.3",10:["NT 6.4","NT 10.0"],RT:"ARM"},X={browser:[[/\b(?:crmo|crios)\/([\w\.]+)/i],[g,[b,"Chrome"]],[/edg(?:e|ios|a)?\/([\w\.]+)/i],[g,[b,"Edge"]],[/(opera mini)\/([-\w\.]+)/i,/(opera [mobiletab]{3,6})\b.+version\/([-\w\.]+)/i,/(opera)(?:.+version\/|[\/ ]+)([\w\.]+)/i],[b,g],[/opios[\/ ]+([\w\.]+)/i],[g,[b,C+" Mini"]],[/\bopr\/([\w\.]+)/i],[g,[b,C]],[/(kindle)\/([\w\.]+)/i,/(lunascape|maxthon|netfront|jasmine|blazer)[\/ ]?([\w\.]*)/i,/(avant |iemobile|slim)(?:browser)?[\/ ]?([\w\.]*)/i,/(ba?idubrowser)[\/ ]?([\w\.]+)/i,/(?:ms|\()(ie) ([\w\.]+)/i,/(flock|rockmelt|midori|epiphany|silk|skyfire|bolt|iron|vivaldi|iridium|phantomjs|bowser|quark|qupzilla|falkon|rekonq|puffin|brave|whale(?!.+naver)|qqbrowserlite|qq|duckduckgo)\/([-\w\.]+)/i,/(heytap|ovi)browser\/([\d\.]+)/i,/(weibo)__([\d\.]+)/i],[b,g],[/(?:\buc? ?browser|(?:juc.+)ucweb)[\/ ]?([\w\.]+)/i],[g,[b,"UC"+D]],[/microm.+\bqbcore\/([\w\.]+)/i,/\bqbcore\/([\w\.]+).+microm/i],[g,[b,"WeChat(Win) Desktop"]],[/micromessenger\/([\w\.]+)/i],[g,[b,"WeChat"]],[/konqueror\/([\w\.]+)/i],[g,[b,"Konqueror"]],[/trident.+rv[: ]([\w\.]{1,9})\b.+like gecko/i],[g,[b,"IE"]],[/ya(?:search)?browser\/([\w\.]+)/i],[g,[b,"Yandex"]],[/(avast|avg)\/([\w\.]+)/i],[[b,/(.+)/,"$1 Secure "+D],g],[/\bfocus\/([\w\.]+)/i],[g,[b,j+" Focus"]],[/\bopt\/([\w\.]+)/i],[g,[b,C+" Touch"]],[/coc_coc\w+\/([\w\.]+)/i],[g,[b,"Coc Coc"]],[/dolfin\/([\w\.]+)/i],[g,[b,"Dolphin"]],[/coast\/([\w\.]+)/i],[g,[b,C+" Coast"]],[/miuibrowser\/([\w\.]+)/i],[g,[b,"MIUI "+D]],[/fxios\/([-\w\.]+)/i],[g,[b,j]],[/\bqihu|(qi?ho?o?|360)browser/i],[[b,"360 "+D]],[/(oculus|samsung|sailfish|huawei)browser\/([\w\.]+)/i],[[b,/(.+)/,"$1 "+D],g],[/(comodo_dragon)\/([\w\.]+)/i],[[b,/_/g," "],g],[/(electron)\/([\w\.]+) safari/i,/(tesla)(?: qtcarbrowser|\/(20\d\d\.[-\w\.]+))/i,/m?(qqbrowser|baiduboxapp|2345Explorer)[\/ ]?([\w\.]+)/i],[b,g],[/(metasr)[\/ ]?([\w\.]+)/i,/(lbbrowser)/i,/\[(linkedin)app\]/i],[b],[/((?:fban\/fbios|fb_iab\/fb4a)(?!.+fbav)|;fbav\/([\w\.]+);)/i],[[b,L],g],[/(kakao(?:talk|story))[\/ ]([\w\.]+)/i,/(naver)\(.*?(\d+\.[\w\.]+).*\)/i,/safari (line)\/([\w\.]+)/i,/\b(line)\/([\w\.]+)\/iab/i,/(chromium|instagram|snapchat)[\/ ]([-\w\.]+)/i],[b,g],[/\bgsa\/([\w\.]+) .*safari\//i],[g,[b,"GSA"]],[/musical_ly(?:.+app_?version\/|_)([\w\.]+)/i],[g,[b,"TikTok"]],[/headlesschrome(?:\/([\w\.]+)| )/i],[g,[b,V+" Headless"]],[/ wv\).+(chrome)\/([\w\.]+)/i],[[b,V+" WebView"],g],[/droid.+ version\/([\w\.]+)\b.+(?:mobile safari|safari)/i],[g,[b,"Android "+D]],[/(chrome|omniweb|arora|[tizenoka]{5} ?browser)\/v?([\w\.]+)/i],[b,g],[/version\/([\w\.\,]+) .*mobile\/\w+ (safari)/i],[g,[b,"Mobile Safari"]],[/version\/([\w(\.|\,)]+) .*(mobile ?safari|safari)/i],[g,b],[/webkit.+?(mobile ?safari|safari)(\/[\w\.]+)/i],[b,[g,Z,{"1.0":"/8",1.2:"/1",1.3:"/3","2.0":"/412","2.0.2":"/416","2.0.3":"/417","2.0.4":"/419","?":"/"}]],[/(webkit|khtml)\/([\w\.]+)/i],[b,g],[/(navigator|netscape\d?)\/([-\w\.]+)/i],[[b,"Netscape"],g],[/mobile vr; rv:([\w\.]+)\).+firefox/i],[g,[b,j+" Reality"]],[/ekiohf.+(flow)\/([\w\.]+)/i,/(swiftfox)/i,/(icedragon|iceweasel|camino|chimera|fennec|maemo browser|minimo|conkeror|klar)[\/ ]?([\w\.\+]+)/i,/(seamonkey|k-meleon|icecat|iceape|firebird|phoenix|palemoon|basilisk|waterfox)\/([-\w\.]+)$/i,/(firefox)\/([\w\.]+)/i,/(mozilla)\/([\w\.]+) .+rv\:.+gecko\/\d+/i,/(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir|obigo|mosaic|(?:go|ice|up)[\. ]?browser)[-\/ ]?v?([\w\.]+)/i,/(links) \(([\w\.]+)/i,/panasonic;(viera)/i],[b,g],[/(cobalt)\/([\w\.]+)/i],[b,[g,/master.|lts./,""]]],cpu:[[/(?:(amd|x(?:(?:86|64)[-_])?|wow|win)64)[;\)]/i],[[p,"amd64"]],[/(ia32(?=;))/i],[[p,K]],[/((?:i[346]|x)86)[;\)]/i],[[p,"ia32"]],[/\b(aarch64|arm(v?8e?l?|_?64))\b/i],[[p,"arm64"]],[/\b(arm(?:v[67])?ht?n?[fl]p?)\b/i],[[p,"armhf"]],[/windows (ce|mobile); ppc;/i],[[p,"arm"]],[/((?:ppc|powerpc)(?:64)?)(?: mac|;|\))/i],[[p,/ower/,"",K]],[/(sun4\w)[;\)]/i],[[p,"sparc"]],[/((?:avr32|ia64(?=;))|68k(?=\))|\barm(?=v(?:[1-7]|[5-7]1)l?|;|eabi)|(?=atmel )avr|(?:irix|mips|sparc)(?:64)?\b|pa-risc)/i],[[p,K]]],device:[[/\b(sch-i[89]0\d|shw-m380s|sm-[ptx]\w{2,4}|gt-[pn]\d{2,4}|sgh-t8[56]9|nexus 10)/i],[l,[h,q],[u,f]],[/\b((?:s[cgp]h|gt|sm)-\w+|sc[g-]?[\d]+a?|galaxy nexus)/i,/samsung[- ]([-\w]+)/i,/sec-(sgh\w+)/i],[l,[h,q],[u,v]],[/(?:\/|\()(ip(?:hone|od)[\w, ]*)(?:\/|;)/i],[l,[h,_],[u,v]],[/\((ipad);[-\w\),; ]+apple/i,/applecoremedia\/[\w\.]+ \((ipad)/i,/\b(ipad)\d\d?,\d\d?[;\]].+ios/i],[l,[h,_],[u,f]],[/(macintosh);/i],[l,[h,_]],[/\b(sh-?[altvz]?\d\d[a-ekm]?)/i],[l,[h,A],[u,v]],[/\b((?:ag[rs][23]?|bah2?|sht?|btv)-a?[lw]\d{2})\b(?!.+d\/s)/i],[l,[h,E],[u,f]],[/(?:huawei|honor)([-\w ]+)[;\)]/i,/\b(nexus 6p|\w{2,4}e?-[atu]?[ln][\dx][012359c][adn]?)\b(?!.+d\/s)/i],[l,[h,E],[u,v]],[/\b(poco[\w ]+|m2\d{3}j\d\d[a-z]{2})(?: bui|\))/i,/\b; (\w+) build\/hm\1/i,/\b(hm[-_ ]?note?[_ ]?(?:\d\w)?) bui/i,/\b(redmi[\-_ ]?(?:note|k)?[\w_ ]+)(?: bui|\))/i,/\b(mi[-_ ]?(?:a\d|one|one[_ ]plus|note lte|max|cc)?[_ ]?(?:\d?\w?)[_ ]?(?:plus|se|lite)?)(?: bui|\))/i],[[l,/_/g," "],[h,U],[u,v]],[/\b(mi[-_ ]?(?:pad)(?:[\w_ ]+))(?: bui|\))/i],[[l,/_/g," "],[h,U],[u,f]],[/; (\w+) bui.+ oppo/i,/\b(cph[12]\d{3}|p(?:af|c[al]|d\w|e[ar])[mt]\d0|x9007|a101op)\b/i],[l,[h,"OPPO"],[u,v]],[/vivo (\w+)(?: bui|\))/i,/\b(v[12]\d{3}\w?[at])(?: bui|;)/i],[l,[h,"Vivo"],[u,v]],[/\b(rmx[12]\d{3})(?: bui|;|\))/i],[l,[h,"Realme"],[u,v]],[/\b(milestone|droid(?:[2-4x]| (?:bionic|x2|pro|razr))?:?( 4g)?)\b[\w ]+build\//i,/\bmot(?:orola)?[- ](\w*)/i,/((?:moto[\w\(\) ]+|xt\d{3,4}|nexus 6)(?= bui|\)))/i],[l,[h,O],[u,v]],[/\b(mz60\d|xoom[2 ]{0,2}) build\//i],[l,[h,O],[u,f]],[/((?=lg)?[vl]k\-?\d{3}) bui| 3\.[-\w; ]{10}lg?-([06cv9]{3,4})/i],[l,[h,T],[u,f]],[/(lm(?:-?f100[nv]?|-[\w\.]+)(?= bui|\))|nexus [45])/i,/\blg[-e;\/ ]+((?!browser|netcast|android tv)\w+)/i,/\blg-?([\d\w]+) bui/i],[l,[h,T],[u,v]],[/(ideatab[-\w ]+)/i,/lenovo ?(s[56]000[-\w]+|tab(?:[\w ]+)|yt[-\d\w]{6}|tb[-\d\w]{6})/i],[l,[h,"Lenovo"],[u,f]],[/(?:maemo|nokia).*(n900|lumia \d+)/i,/nokia[-_ ]?([-\w\.]*)/i],[[l,/_/g," "],[h,"Nokia"],[u,v]],[/(pixel c)\b/i],[l,[h,N],[u,f]],[/droid.+; (pixel[\daxl ]{0,6})(?: bui|\))/i],[l,[h,N],[u,v]],[/droid.+ (a?\d[0-2]{2}so|[c-g]\d{4}|so[-gl]\w+|xq-a\w[4-7][12])(?= bui|\).+chrome\/(?![1-6]{0,1}\d\.))/i],[l,[h,P],[u,v]],[/sony tablet [ps]/i,/\b(?:sony)?sgp\w+(?: bui|\))/i],[[l,"Xperia Tablet"],[h,P],[u,f]],[/ (kb2005|in20[12]5|be20[12][59])\b/i,/(?:one)?(?:plus)? (a\d0\d\d)(?: b|\))/i],[l,[h,"OnePlus"],[u,v]],[/(alexa)webm/i,/(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i,/(kf[a-z]+)( bui|\)).+silk\//i],[l,[h,S],[u,f]],[/((?:sd|kf)[0349hijorstuw]+)( bui|\)).+silk\//i],[[l,/(.+)/g,"Fire Phone $1"],[h,S],[u,v]],[/(playbook);[-\w\),; ]+(rim)/i],[l,h,[u,f]],[/\b((?:bb[a-f]|st[hv])100-\d)/i,/\(bb10; (\w+)/i],[l,[h,z],[u,v]],[/(?:\b|asus_)(transfo[prime ]{4,10} \w+|eeepc|slider \w+|nexus 7|padfone|p00[cj])/i],[l,[h,I],[u,f]],[/ (z[bes]6[027][012][km][ls]|zenfone \d\w?)\b/i],[l,[h,I],[u,v]],[/(nexus 9)/i],[l,[h,"HTC"],[u,f]],[/(htc)[-;_ ]{1,2}([\w ]+(?=\)| bui)|\w+)/i,/(zte)[- ]([\w ]+?)(?: bui|\/|\))/i,/(alcatel|geeksphone|nexian|panasonic(?!(?:;|\.))|sony(?!-bra))[-_ ]?([-\w]*)/i],[h,[l,/_/g," "],[u,v]],[/droid.+; ([ab][1-7]-?[0178a]\d\d?)/i],[l,[h,"Acer"],[u,f]],[/droid.+; (m[1-5] note) bui/i,/\bmz-([-\w]{2,})/i],[l,[h,"Meizu"],[u,v]],[/(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|meizu|motorola|polytron|infinix|tecno)[-_ ]?([-\w]*)/i,/(hp) ([\w ]+\w)/i,/(asus)-?(\w+)/i,/(microsoft); (lumia[\w ]+)/i,/(lenovo)[-_ ]?([-\w]+)/i,/(jolla)/i,/(oppo) ?([\w ]+) bui/i],[h,l,[u,v]],[/(kobo)\s(ereader|touch)/i,/(archos) (gamepad2?)/i,/(hp).+(touchpad(?!.+tablet)|tablet)/i,/(kindle)\/([\w\.]+)/i,/(nook)[\w ]+build\/(\w+)/i,/(dell) (strea[kpr\d ]*[\dko])/i,/(le[- ]+pan)[- ]+(\w{1,9}) bui/i,/(trinity)[- ]*(t\d{3}) bui/i,/(gigaset)[- ]+(q\w{1,9}) bui/i,/(vodafone) ([\w ]+)(?:\)| bui)/i],[h,l,[u,f]],[/(surface duo)/i],[l,[h,M],[u,f]],[/droid [\d\.]+; (fp\du?)(?: b|\))/i],[l,[h,"Fairphone"],[u,v]],[/(u304aa)/i],[l,[h,"AT&T"],[u,v]],[/\bsie-(\w*)/i],[l,[h,"Siemens"],[u,v]],[/\b(rct\w+) b/i],[l,[h,"RCA"],[u,f]],[/\b(venue[\d ]{2,7}) b/i],[l,[h,"Dell"],[u,f]],[/\b(q(?:mv|ta)\w+) b/i],[l,[h,"Verizon"],[u,f]],[/\b(?:barnes[& ]+noble |bn[rt])([\w\+ ]*) b/i],[l,[h,"Barnes & Noble"],[u,f]],[/\b(tm\d{3}\w+) b/i],[l,[h,"NuVision"],[u,f]],[/\b(k88) b/i],[l,[h,"ZTE"],[u,f]],[/\b(nx\d{3}j) b/i],[l,[h,"ZTE"],[u,v]],[/\b(gen\d{3}) b.+49h/i],[l,[h,"Swiss"],[u,v]],[/\b(zur\d{3}) b/i],[l,[h,"Swiss"],[u,f]],[/\b((zeki)?tb.*\b) b/i],[l,[h,"Zeki"],[u,f]],[/\b([yr]\d{2}) b/i,/\b(dragon[- ]+touch |dt)(\w{5}) b/i],[[h,"Dragon Touch"],l,[u,f]],[/\b(ns-?\w{0,9}) b/i],[l,[h,"Insignia"],[u,f]],[/\b((nxa|next)-?\w{0,9}) b/i],[l,[h,"NextBook"],[u,f]],[/\b(xtreme\_)?(v(1[045]|2[015]|[3469]0|7[05])) b/i],[[h,"Voice"],l,[u,v]],[/\b(lvtel\-)?(v1[12]) b/i],[[h,"LvTel"],l,[u,v]],[/\b(ph-1) /i],[l,[h,"Essential"],[u,v]],[/\b(v(100md|700na|7011|917g).*\b) b/i],[l,[h,"Envizen"],[u,f]],[/\b(trio[-\w\. ]+) b/i],[l,[h,"MachSpeed"],[u,f]],[/\btu_(1491) b/i],[l,[h,"Rotor"],[u,f]],[/(shield[\w ]+) b/i],[l,[h,"Nvidia"],[u,f]],[/(sprint) (\w+)/i],[h,l,[u,v]],[/(kin\.[onetw]{3})/i],[[l,/\./g," "],[h,M],[u,v]],[/droid.+; (cc6666?|et5[16]|mc[239][23]x?|vc8[03]x?)\)/i],[l,[h,R],[u,f]],[/droid.+; (ec30|ps20|tc[2-8]\d[kx])\)/i],[l,[h,R],[u,v]],[/smart-tv.+(samsung)/i],[h,[u,x]],[/hbbtv.+maple;(\d+)/i],[[l,/^/,"SmartTV"],[h,q],[u,x]],[/(nux; netcast.+smarttv|lg (netcast\.tv-201\d|android tv))/i],[[h,T],[u,x]],[/(apple) ?tv/i],[h,[l,_+" TV"],[u,x]],[/crkey/i],[[l,V+"cast"],[h,N],[u,x]],[/droid.+aft(\w+)( bui|\))/i],[l,[h,S],[u,x]],[/\(dtv[\);].+(aquos)/i,/(aquos-tv[\w ]+)\)/i],[l,[h,A],[u,x]],[/(bravia[\w ]+)( bui|\))/i],[l,[h,P],[u,x]],[/(mitv-\w{5}) bui/i],[l,[h,U],[u,x]],[/Hbbtv.*(technisat) (.*);/i],[h,l,[u,x]],[/\b(roku)[\dx]*[\)\/]((?:dvp-)?[\d\.]*)/i,/hbbtv\/\d+\.\d+\.\d+ +\([\w\+ ]*; *([\w\d][^;]*);([^;]*)/i],[[h,J],[l,J],[u,x]],[/\b(android tv|smart[- ]?tv|opera tv|tv; rv:)\b/i],[[u,x]],[/(ouya)/i,/(nintendo) ([wids3utch]+)/i],[h,l,[u,m]],[/droid.+; (shield) bui/i],[l,[h,"Nvidia"],[u,m]],[/(playstation [345portablevi]+)/i],[l,[h,P],[u,m]],[/\b(xbox(?: one)?(?!; xbox))[\); ]/i],[l,[h,M],[u,m]],[/((pebble))app/i],[h,l,[u,k]],[/(watch)(?: ?os[,\/]|\d,\d\/)[\d\.]+/i],[l,[h,_],[u,k]],[/droid.+; (glass) \d/i],[l,[h,N],[u,k]],[/droid.+; (wt63?0{2,3})\)/i],[l,[h,R],[u,k]],[/(quest( 2| pro)?)/i],[l,[h,L],[u,k]],[/(tesla)(?: qtcarbrowser|\/[-\w\.]+)/i],[h,[u,y]],[/(aeobc)\b/i],[l,[h,S],[u,y]],[/droid .+?; ([^;]+?)(?: bui|\) applew).+? mobile safari/i],[l,[u,v]],[/droid .+?; ([^;]+?)(?: bui|\) applew).+?(?! mobile) safari/i],[l,[u,f]],[/\b((tablet|tab)[;\/]|focus\/\d(?!.+mobile))/i],[[u,f]],[/(phone|mobile(?:[;\/]| [ \w\/\.]*safari)|pda(?=.+windows ce))/i],[[u,v]],[/(android[-\w\. ]{0,9});.+buil/i],[l,[h,"Generic"]]],engine:[[/windows.+ edge\/([\w\.]+)/i],[g,[b,"EdgeHTML"]],[/webkit\/537\.36.+chrome\/(?!27)([\w\.]+)/i],[g,[b,"Blink"]],[/(presto)\/([\w\.]+)/i,/(webkit|trident|netfront|netsurf|amaya|lynx|w3m|goanna)\/([\w\.]+)/i,/ekioh(flow)\/([\w\.]+)/i,/(khtml|tasman|links)[\/ ]\(?([\w\.]+)/i,/(icab)[\/ ]([23]\.[\d\.]+)/i,/\b(libweb)/i],[b,g],[/rv\:([\w\.]{1,9})\b.+(gecko)/i],[g,b]],os:[[/microsoft (windows) (vista|xp)/i],[b,g],[/(windows) nt 6\.2; (arm)/i,/(windows (?:phone(?: os)?|mobile))[\/ ]?([\d\.\w ]*)/i,/(windows)[\/ ]?([ntce\d\. ]+\w)(?!.+xbox)/i],[b,[g,Z,G]],[/(win(?=3|9|n)|win 9x )([nt\d\.]+)/i],[[b,"Windows"],[g,Z,G]],[/ip[honead]{2,4}\b(?:.*os ([\w]+) like mac|; opera)/i,/(?:ios;fbsv\/|iphone.+ios[\/ ])([\d\.]+)/i,/cfnetwork\/.+darwin/i],[[g,/_/g,"."],[b,"iOS"]],[/(mac os x) ?([\w\. ]*)/i,/(macintosh|mac_powerpc\b)(?!.+haiku)/i],[[b,F],[g,/_/g,"."]],[/droid ([\w\.]+)\b.+(android[- ]x86|harmonyos)/i],[g,b],[/(android|webos|qnx|bada|rim tablet os|maemo|meego|sailfish)[-\/ ]?([\w\.]*)/i,/(blackberry)\w*\/([\w\.]*)/i,/(tizen|kaios)[\/ ]([\w\.]+)/i,/\((series40);/i],[b,g],[/\(bb(10);/i],[g,[b,z]],[/(?:symbian ?os|symbos|s60(?=;)|series60)[-\/ ]?([\w\.]*)/i],[g,[b,"Symbian"]],[/mozilla\/[\d\.]+ \((?:mobile|tablet|tv|mobile; [\w ]+); rv:.+ gecko\/([\w\.]+)/i],[g,[b,j+" OS"]],[/web0s;.+rt(tv)/i,/\b(?:hp)?wos(?:browser)?\/([\w\.]+)/i],[g,[b,"webOS"]],[/watch(?: ?os[,\/]|\d,\d\/)([\d\.]+)/i],[g,[b,"watchOS"]],[/crkey\/([\d\.]+)/i],[g,[b,V+"cast"]],[/(cros) [\w]+(?:\)| ([\w\.]+)\b)/i],[[b,B],g],[/panasonic;(viera)/i,/(netrange)mmh/i,/(nettv)\/(\d+\.[\w\.]+)/i,/(nintendo|playstation) ([wids345portablevuch]+)/i,/(xbox); +xbox ([^\);]+)/i,/\b(joli|palm)\b ?(?:os)?\/?([\w\.]*)/i,/(mint)[\/\(\) ]?(\w*)/i,/(mageia|vectorlinux)[; ]/i,/([kxln]?ubuntu|debian|suse|opensuse|gentoo|arch(?= linux)|slackware|fedora|mandriva|centos|pclinuxos|red ?hat|zenwalk|linpus|raspbian|plan 9|minix|risc os|contiki|deepin|manjaro|elementary os|sabayon|linspire)(?: gnu\/linux)?(?: enterprise)?(?:[- ]linux)?(?:-gnu)?[-\/ ]?(?!chrom|package)([-\w\.]*)/i,/(hurd|linux) ?([\w\.]*)/i,/(gnu) ?([\w\.]*)/i,/\b([-frentopcghs]{0,5}bsd|dragonfly)[\/ ]?(?!amd|[ix346]{1,2}86)([\w\.]*)/i,/(haiku) (\w+)/i],[b,g],[/(sunos) ?([\w\.\d]*)/i],[[b,"Solaris"],g],[/((?:open)?solaris)[-\/ ]?([\w\.]*)/i,/(aix) ((\d)(?=\.|\)| )[\w\.])*/i,/\b(beos|os\/2|amigaos|morphos|openvms|fuchsia|hp-ux|serenityos)/i,/(unix) ?([\w\.]*)/i],[b,g]]},Q=function(e,i){if(typeof e===d&&(i=e,e=s),!(this instanceof Q))return new Q(e,i).getResult();var t=typeof r!==n&&r.navigator?r.navigator:s,a=e||(t&&t.userAgent?t.userAgent:""),m=t&&t.userAgentData?t.userAgentData:s,x=i?function(e,i){var t={};for(var a in e)i[a]&&i[a].length%2==0?t[a]=i[a].concat(e[a]):t[a]=e[a];return t}(X,i):X,k=t&&t.userAgent==a;return this.getBrowser=function(){var e,i={};return i[b]=s,i[g]=s,W.call(i,a,x.browser),i[w]=typeof(e=i[g])===c?e.replace(/[^\d\.]/g,"").split(".")[0]:s,k&&t&&t.brave&&typeof t.brave.isBrave==o&&(i[b]="Brave"),i},this.getCPU=function(){var e={};return e[p]=s,W.call(e,a,x.cpu),e},this.getDevice=function(){var e={};return e[h]=s,e[l]=s,e[u]=s,W.call(e,a,x.device),k&&!e[u]&&m&&m.mobile&&(e[u]=v),k&&"Macintosh"==e[l]&&t&&typeof t.standalone!==n&&t.maxTouchPoints&&t.maxTouchPoints>2&&(e[l]="iPad",e[u]=f),e},this.getEngine=function(){var e={};return e[b]=s,e[g]=s,W.call(e,a,x.engine),e},this.getOS=function(){var e={};return e[b]=s,e[g]=s,W.call(e,a,x.os),k&&!e[b]&&m&&"Unknown"!=m.platform&&(e[b]=m.platform.replace(/chrome os/i,B).replace(/macos/i,F)),e},this.getResult=function(){return{ua:this.getUA(),browser:this.getBrowser(),engine:this.getEngine(),os:this.getOS(),device:this.getDevice(),cpu:this.getCPU()}},this.getUA=function(){return a},this.setUA=function(e){return a=typeof e===c&&e.length>350?J(e,350):e,this},this.setUA(a),this};Q.VERSION="1.0.36",Q.BROWSER=$([b,g,w]),Q.CPU=$([p]),Q.DEVICE=$([l,h,u,m,v,x,f,k,y]),Q.ENGINE=Q.OS=$([b,g]),typeof i!==n?(e.exports&&(i=e.exports=Q),i.UAParser=Q):t.amdO?(a=function(){return Q}.call(i,t,i,e))===s||(e.exports=a):typeof r!==n&&(r.UAParser=Q);var Y=typeof r!==n&&(r.jQuery||r.Zepto);if(Y&&!Y.ua){var ee=new Q;Y.ua=ee.getResult(),Y.ua.get=function(){return ee.getUA()},Y.ua.set=function(e){ee.setUA(e);var i=ee.getResult();for(var t in i)Y.ua[t]=i[t]}}}("object"==typeof window?window:this)}},i={};function t(a){var r=i[a];if(void 0!==r)return r.exports;var s=i[a]={exports:{}};return e[a].call(s.exports,s,s.exports,t),s.exports}t.amdO={},(()=>{"use strict";class e{constructor(){this.newPageCallbacks=[],this._listenForSoftNavigations()}currentUrl=()=>this._currentUrl;previousUrl=()=>this._previousUrl||document.referrer;onNewPage=e=>{this.newPageCallbacks.push(e)};recordPageView=()=>{const e=window.location.href;this._previousUrl=this._currentUrl||document.referrer,this._currentUrl=e,this.newPageCallbacks.forEach((e=>e(this.currentUrl(),this.previousUrl())))};_listenForSoftNavigations=()=>{if(window.addEventListener("hashchange",this.recordPageView),window.addEventListener("popstate",this.recordPageView),window.history.pushState){const e=window.history.pushState,i=this;window.history.pushState=function(){e.apply(this,arguments),i.recordPageView()}}}}class i{static generate=e=>((e?`${e}-`:"")+"xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx").replace(/x/g,(e=>{const i=16*Math.random()|0;return("x"==e?i:3&i|8).toString(16)}))}class a{static set(e,i){const t=this.all();return t[e]=i,sessionStorage.setItem("swishjam",JSON.stringify(t)),i}static get(e){return this.all()[e]}static all(){return JSON.parse(sessionStorage.getItem("swishjam")||"{}")}}class r{static setCookie=({name:e,value:i,expiresIn:t,path:a,domain:r,secure:s})=>{let o=`${e}=${i}`;if(t){const e=new Date;e.setTime(e.getTime()+t),o+=`; expires=${e.toUTCString()}`}a&&(o+=`; path=${a}`),r&&(o+=`; domain=${r}`),s&&(o+="; secure"),document.cookie=o};static getCookie=e=>{const i=document.cookie.split("; ").find((i=>i.startsWith(`${e}=`)));if(i)return i.split("=")[1]};static deleteCookie=e=>{this.setCookie({name:e,value:"",expiresIn:-1})}}const s=JSON.parse('{"version":"0.0.214"}'),{version:o}=s,n="swishjam_device_identifier";class d{static getDeviceIdentifierValue=()=>this._getDeviceIdentifierValue()||this._setDeviceIdentifierValue();static resetDeviceIdentifierValue=()=>(r.deleteCookie(n),this._setDeviceIdentifierValue());static _getDeviceIdentifierValue=()=>r.getCookie(n);static _setDeviceIdentifierValue=()=>{const e=i.generate("di");return r.setCookie({name:n,value:e,expiresIn:31536e6}),e}}class c{constructor(e,t){this.eventName=e,this.uuid=i.generate(`e-${Date.now()}`),this.ts=Date.now(),this.sessionId=a.get("sessionId"),this.pageViewId=a.get("pageViewId"),this.deviceIdentifierValue=d.getDeviceIdentifierValue(),this.url=window.location.href,this.data=t}toJSON(){return{uuid:this.uuid,event:this.eventName,timestamp:this.ts,device_identifier:this.deviceIdentifierValue,session_identifier:this.sessionId,page_view_identifier:this.pageViewId,url:this.url,...this.data,sdk_version:o,source:"web"}}}class w{constructor(e={}){this.data=[],this.numFailedReports=0,this.apiEndpoint=e.apiEndpoint,this.apiKey=e.apiKey,this.maxSize=e.maxSize||20,this.heartbeatMs=e.heartbeatMs||1e4,this.maxNumFailedReports=e.maxNumFailedReports||3,this._initHeartbeat()}getData=()=>this.data;recordEvent=async(e,i)=>{const t=new c(e,i);return this.data.push(t.toJSON()),this.data.length>=this.maxSize&&await this._reportDataIfNecessary(),t};flushQueue=async()=>await this._reportDataIfNecessary();_initHeartbeat=()=>{setInterval((async()=>{await this._reportDataIfNecessary()}),this.heartbeatMs)};_reportDataIfNecessary=async()=>{try{if(0===this.data.length||this.numFailedReports>=this.maxNumFailedReports)return;(await fetch(this.apiEndpoint,{method:"POST",headers:{"Content-Type":"application/json","X-Swishjam-Api-Key":this.apiKey},body:JSON.stringify(this.data)})).ok?this.data=[]:this.numFailedReports+=1}catch(e){this.numFailedReports+=1}}}var l=t(238);class b{constructor(){const e=new l;this.browserData=e.getResult()}all(){return{user_agent:this.getUserAgent(),browser_name:this.getBrowser(),browser_version:this.getBrowserVersion(),browser_major_version:this.getBrowserMajorVersion(),os:this.getOS(),os_version:this.getOSVersion(),device:this.getDevice(),device_type:this.getDeviceType(),device_vendor:this.getDeviceVendor(),is_mobile:this.isMobile(),timezone:this.getTimeZone(),language:this.getLanguage(),system_language:this.getSystemLanguage()}}browserData(){return this.browserData}getUserAgent(){return this.browserData.ua}getBrowser(){return this.browserData.browser.name}getBrowserVersion(){return this.browserData.browser.version}getBrowserMajorVersion(){return this.browserData.browser.major}getOS(){return this.browserData.os.name}getOSVersion(){return this.browserData.os.version}getDevice(){return this.browserData.device.model}getDeviceType(){return this.browserData.device.type}getDeviceVendor(){return this.browserData.device.vendor}isMobile(){var e=this.browserData.ua||navigator.vendor||window.opera;return/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(e)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(e.substr(0,4))}hasLocalStorage(){return this._hasLocalStorage??function(){try{return window.localStorage.setItem("swishjam-test","test"),window.localStorage.removeItem("swishjam-test"),this._hasLocalStorage=!0}catch(e){return this._hasLocalStorage=!1}}()}hasSessionStorage(){return this._hasSessionStorage??function(){try{return window.sessionStorage.setItem("swishjam-test","test"),window.sessionStorage.removeItem("swishjam-test"),this._hasSessionStorage=!0}catch(e){return this._hasSessionStorage=!1}}()}hasCookiesEnabled(){return window.navigator.cookieEnabled}getTimeZone(){let e,i,t,a;return e=new Date,i=String(-e.getTimezoneOffset()/60),i<0?(i*=-1,t=("0"+i).slice(-2),a="-"+t):(t=("0"+i).slice(-2),a="+"+t),a}getLanguage(){return navigator.language}getSystemLanguage(){return navigator.systemLanguage||window.navigator.language}}class u{constructor(i={}){this.config=this._setConfig(i),this.eventManager=new w(this.config),this.pageViewManager=new e,this.deviceDetails=new b,this.devideIdentifier=new d,this.getSession()||this.newSession({registerPageView:!1}),this._initPageViewListeners()}record=(e,i)=>this.eventManager.recordEvent(e,i);identify=(e,i)=>(this._extractOrganizationFromIdentifyCall(i),this.record("identify",{userIdentifier:e,...i}));setOrganization=(e,i={})=>{const t=a.get("organizationId");a.set("organizationId",e),t!==e&&this.newSession(),this.record("organization",{organizationIdentifier:e,...i})};getSession=()=>a.get("sessionId");newSession=({registerPageView:e=!0})=>(a.set("sessionId",i.generate("s")),this.record("new_session",{referrer:this.pageViewManager.previousUrl(),...this.deviceDetails.all()}),e&&this.pageViewManager.recordPageView(),this.getSession());logout=()=>(this.deviceIdentifier.resetDeviceIdentifierValue(),this.newSession());_extractOrganizationFromIdentifyCall=e=>{const{organization:i,org:t}=e;if(i||t){const e=i||t,{organizationIdentifier:a,orgIdentifier:r,identifier:s,organizationId:o,orgId:n,id:d}=e,c=a||r||s||o||n||d;let w={};Object.keys(e).forEach((i=>{["organizationIdentifier","orgIdentifier","identifier","organizationId","orgId","id"].includes(i)||(w[i]=e[i])})),this.setOrganization(c,w)}};_initPageViewListeners=()=>{this.pageViewManager.onNewPage(((e,t)=>{a.set("pageViewId",i.generate("pv")),this.eventManager.recordEvent("page_view",{referrer:t})})),window.addEventListener("pagehide",(async()=>{this.eventManager.recordEvent("page_left"),await this.eventManager.flushQueue()})),this.pageViewManager.recordPageView()};_setConfig=e=>{if(!e.apiKey)throw new Error("Swishjam `apiKey` is required");const i=["apiKey","apiEndpoint","maxEventsInMemory","reportingHeartbeatMs","debug"];return Object.keys(e).forEach((e=>{i.includes(e)||console.warn(`SwishjamJS received unrecognized config: ${e}`)})),{version:o,apiKey:e.apiKey,apiEndpoint:e.apiEndpoint||"https://api2.swishjam.com/api/v1/capture",maxEventsInMemory:e.maxEventsInMemory||20,reportingHeartbeatMs:e.reportingHeartbeatMs||1e4,debug:"boolean"==typeof e.debug&&e.debug}}}const h=Symbol("client");class g{constructor(e){return window.Swishjam&&!window.Swishjam.stubbed?(console.warn("SwishjamJS already initialized. Returning existing instance."),window.Swishjam):(this[h]=new u(e),this.config=this[h].config,window.Swishjam=this,this)}event=(e,i)=>this[h].record(e,i);identify=(e,i)=>this[h].identify(e,i);setOrganization=(e,i)=>this[h].setOrganization(e,i);getSession=()=>this[h].getSession();newSession=()=>this[h].newSession()}!function(){const e=document.currentScript.getAttribute("data-api-key"),i=document.currentScript.getAttribute("data-api-endpoint"),t=document.currentScript.getAttribute("data-max-events-in-memory"),a=document.currentScript.getAttribute("data-reporting-heartbeat-ms");if(!e)throw new Error("Missing Swishjam API key, you must provide it in the `data-api-key` attribute of the Swishjam CDN script tag.");new g({apiKey:e,apiEndpoint:i,maxEventsInMemory:t,reportingHeartbeatMs:a})}()})()})();