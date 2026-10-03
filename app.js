const DEFAULT_M3U="https://iptv-org.github.io/iptv/countries/th.m3u";const $=s=>document.querySelector(s);
let channels=[],cat="ทั้งหมด",view="all",fav=new Set(JSON.parse(localStorage.getItem("tvFav")||"[]")),hls=null,current=null,epg={};
let retryTimer=null,retries=0,manualStop=false,backupIndex=0,backupList=[],statsTimer=null;
const cats=["ทั้งหมด","รายการโปรด","ข่าว","ทั่วไป","บันเทิง","กีฬา","การศึกษา","ภาพยนตร์","ศาสนา","เพลง"];
function esc(s){return String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":">","\"":"&quot;","'":"&#039;"}[c]))}
function toast(t){let e=$("#toast");e.textContent=t;e.classList.add("show");setTimeout(()=>e.classList.remove("show"),1800)}
function status(t,g=true){$("#streamStatus").textContent=t;$("#dot").classList.toggle("bad",!g)}
function parseM3U(t){let a=[],m=null;for(let l of t.split(/\r?\n/)){l=l.trim();if(!l)continue;if(l.startsWith("#EXTINF")){m=l;continue}if(!l.startsWith("#")&&m){let name=(m.match(/,(.*)$/)||[])[1]||"Unknown",logo=(m.match(/tvg-logo="([^"]*)"/)||[])[1]||"",group=(m.match(/group-title="([^"]*)"/)||[])[1]||"ทั่วไป",id=(m.match(/tvg-id="([^"]*)"/)||[])[1]||"";a.push({name:name.trim(),logo,url:l,group,id,cat:grp(group,name)});m=null}}return a}
function grp(g,n){let s=(g+" "+n).toLowerCase();if(/news|ข่าว/.test(s))return"ข่าว";if(/sport|กีฬา/.test(s))return"กีฬา";if(/entertain|บันเทิง|variety/.test(s))return"บันเทิง";if(/education|การศึกษา/.test(s))return"การศึกษา";if(/movie|film|ภาพยนตร์/.test(s))return"ภาพยนตร์";if(/relig|ศาสนา/.test(s))return"ศาสนา";if(/music|เพลง/.test(s))return"เพลง";return"ทั่วไป"}
function tabs(){$("#tabs").innerHTML=cats.map(x=>`<button class="tab ${cat===x?"active":""}" data-c="${x}">${x}</button>`).join("");document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{cat=b.dataset.c;view=cat==="รายการโปรด"?"fav":"all";render()})}
function list(){let a=channels;if(view==="fav")a=a.filter(x=>fav.has(x.url));if(cat!=="ทั้งหมด"&&cat!=="รายการโปรด")a=a.filter(x=>x.cat===cat);let q=$("#search").value.trim().toLowerCase();if(q)a=a.filter(x=>(x.name+" "+x.group).toLowerCase().includes(q));return a}
function render(){tabs();let a=list();$("#title").textContent=view==="fav"?"รายการโปรด":cat==="ทั้งหมด"?"ช่องทั้งหมด":cat;$("#count").textContent=a.length+" ช่อง";$("#grid").innerHTML=a.length?a.map((x,i)=>`<article class="card" data-i="${i}"><div class="thumb">${x.logo?`<img src="${esc(x.logo)}" onerror="this.style.display='none'">`:""}<div class="fallback" ${x.logo?'style="display:none"':''}>TV</div><span class="live">LIVE</span><button class="star" data-star="${encodeURIComponent(x.url)}">${fav.has(x.url)?"★":"☆"}</button></div><div class="info"><div class="name">${esc(x.name)}</div><div class="meta"><span>${esc(x.cat)}</span><span>${epg[x.id]?.title?"EPG":""}</span></div></div></article>`).join(""):`<div class="empty">ไม่พบช่องในหมวดนี้</div>`;document.querySelectorAll(".card").forEach(c=>c.onclick=e=>{if(e.target.closest(".star"))return;open(a[+c.dataset.i])});document.querySelectorAll("[data-star]").forEach(b=>b.onclick=e=>{e.stopPropagation();let u=decodeURIComponent(b.dataset.star);fav.has(u)?fav.delete(u):fav.add(u);localStorage.setItem("tvFav",JSON.stringify([...fav]));render()})}
async function load(url=localStorage.getItem("tvM3U")||DEFAULT_M3U){$("#status").textContent="กำลังโหลดช่อง…";try{let r=await fetch(url);if(!r.ok)throw Error("HTTP "+r.status);channels=parseM3U(await r.text());localStorage.setItem("tvM3U",url);$("#status").textContent=`พร้อมใช้งาน • ${channels.length} ช่อง`;render()}catch(e){$("#status").textContent="โหลด Playlist ไม่สำเร็จ";$("#grid").innerHTML=`<div class="empty">โหลดไม่ได้<br><small>${esc(e.message)}</small></div>`}}
async function loadEPG(url){if(!url)return;try{let r=await fetch(url);if(!r.ok)throw Error();let t=await r.text(),xml=new DOMParser().parseFromString(t,"text/xml");xml.querySelectorAll("programme").forEach(p=>{let id=p.getAttribute("channel"),title=p.querySelector("title")?.textContent||"",desc=p.querySelector("desc")?.textContent||"",start=p.getAttribute("start")||"",stop=p.getAttribute("stop")||"";if(id&&!epg[id])epg[id]={title,desc,start,stop}});render()}catch(e){toast("โหลด EPG ไม่สำเร็จ")}}
function program(c){let p=epg[c.id];if(!p)return null;let n=Date.now(),s=Date.parse(p.start),e=Date.parse(p.stop);return isNaN(s)||isNaN(e)||n<s||n>e?null:p}
function clearRetry(){if(retryTimer){clearTimeout(retryTimer);retryTimer=null}}
function clearStats(){if(statsTimer){clearInterval(statsTimer);statsTimer=null}}
function destroy(){clearRetry();clearStats();if(hls){hls.destroy();hls=null}let v=$("#video");v.pause();v.removeAttribute("src");v.load()}
function fillQuality(){let q=$("#quality");q.innerHTML='<option value="-1">Auto Quality</option>';if(!hls||!hls.levels?.length)return;hls.levels.forEach((l,i)=>{let label=l.height?(l.height+"p"):(l.bitrate?Math.round(l.bitrate/1000)+" kbps":"Level "+(i+1));let o=document.createElement("option");o.value=i;o.textContent=label;q.appendChild(o)})}
function setQuality(v){if(!hls)return;hls.currentLevel=Number(v);toast(v===" -1"?"Auto Quality":($("#quality").selectedOptions[0]?.textContent||"เปลี่ยนคุณภาพ"))}
$("#quality").onchange=()=>setQuality($("#quality").value);
function startStats(){clearStats();statsTimer=setInterval(()=>{let v=$("#video"),buf=0;try{if(v.buffered.length)buf=Math.max(0,v.buffered.end(v.buffered.length-1)-v.currentTime)}catch(e){}let q="Auto",br="—";if(hls){let l=hls.currentLevel>=0?hls.levels[hls.currentLevel]:hls.levels[hls.loadLevel];if(l){q=l.height?l.height+"p":"—";br=l.bitrate?Math.round(l.bitrate/1000)+" kbps":"—"}}$("#stats").innerHTML=`Buffer: ${buf.toFixed(1)}s<br>Quality: ${q}<br>Bitrate: ${br}`},700)}
function schedule(reason){if(manualStop||!current)return;clearRetry();if(retries>=4&&backupList.length>backupIndex){backupIndex++;retries=0;toast("เปลี่ยนไป Backup Stream");return startStream()}if(retries>=7){status("เชื่อมต่อไม่สำเร็จ",false);return}let d=Math.min(15000,1200*Math.pow(2,retries));retries++;status(`${reason} • ${Math.ceil(d/1000)}s`,false);retryTimer=setTimeout(startStream,d)}
function startStream(){if(!current)return;clearRetry();let v=$("#video"),url=current.url;if(backupIndex>0&&backupList[backupIndex-1])url=backupList[backupIndex-1];status("กำลังเชื่อมต่อ…");if(hls){hls.destroy();hls=null}$("#quality").innerHTML='<option value="-1">Auto Quality</option>';
if(window.Hls&&Hls.isSupported()&&/\.m3u8($|\?)/i.test(url)){hls=new Hls({enableWorker:true,lowLatencyMode:false,backBufferLength:20,maxBufferLength:50,maxMaxBufferLength:100,maxBufferHole:.7,liveSyncDurationCount:3,liveMaxLatencyDurationCount:10,fragLoadingMaxRetry:6,manifestLoadingMaxRetry:6,levelLoadingMaxRetry:6,fragLoadingRetryDelay:1000,manifestLoadingRetryDelay:1000,levelLoadingRetryDelay:1000,startFragPrefetch:true});hls.loadSource(url);hls.attachMedia(v);hls.on(Hls.Events.MANIFEST_PARSED,()=>{retries=0;fillQuality();startStats();status("สตรีมปกติ");diag("🟢 <b>สตรีมพร้อมใช้งาน</b><br>ระบบกำลังตรวจ Buffer และคุณภาพแบบเรียลไทม์");v.play().catch(()=>{})});hls.on(Hls.Events.ERROR,(e,d)=>{if(d.fatal){if(d.type===Hls.ErrorTypes.MEDIA_ERROR){status("กู้คืน Media…",false);diag("🟠 <b>Media Error</b><br>กำลังพยายามกู้คืนตัวถอดรหัส…");try{hls.recoverMediaError()}catch(x){schedule("Media Error")}}else if(d.type===Hls.ErrorTypes.NETWORK_ERROR){diag("🟠 <b>Network Error</b><br>กำลังลองเชื่อมต่อใหม่…");schedule("Network Error")}else{diag("🔴 <b>HLS Error</b><br>"+esc(d.details||"Unknown error"));schedule("Stream Error")}}});hls.on(Hls.Events.FRAG_LOADED,()=>{retries=0;status("สตรีมปกติ")})}
else{v.src=url;v.load();v.play().then(()=>{retries=0;startStats();status("สตรีมปกติ")}).catch(()=>schedule("เล่นสตรีมไม่ได้"))}}

function diag(msg,show=true){const e=$("#diag");e.innerHTML=msg;e.classList.toggle("show",show)}
function classifyError(err){
  const s=String(err||"").toLowerCase();
  if(s.includes("cors")||s.includes("cross-origin"))return["CORS","เซิร์ฟเวอร์ไม่อนุญาตให้ Browser/PWA เรียกสตรีม"];
  if(s.includes("403")||s.includes("forbidden"))return["403 Forbidden","ต้นทางปฏิเสธคำขอ อาจต้องใช้ header/referer"];
  if(s.includes("404")||s.includes("not found"))return["404 Not Found","URL สตรีมหายหรือหมดอายุ"];
  if(s.includes("401")||s.includes("unauthorized"))return["401 Unauthorized","สตรีมต้องมีสิทธิ์หรือ token"];
  if(s.includes("timeout")||s.includes("network"))return["Network","เชื่อมต่อเซิร์ฟเวอร์ไม่ได้หรือช้าเกินไป"];
  if(s.includes("manifest"))return["Manifest","ไม่สามารถอ่าน HLS manifest ได้"];
  if(s.includes("codec")||s.includes("media"))return["Codec/Media","รูปแบบวิดีโออาจไม่รองรับบนอุปกรณ์นี้"];
  return["Stream Error","ต้นทางไม่ตอบสนองหรือรูปแบบสตรีมมีปัญหา"];
}
async function diagnose(){
  if(!current)return;
  diag("🔎 กำลังตรวจสอบ URL และรูปแบบสตรีม…");
  try{
    const u=new URL(current.url,location.href);
    const isHls=/\.m3u8($|\?)/i.test(u.pathname+u.search);
    if(!isHls && !/\.(mp4|webm|ogg)($|\?)/i.test(u.pathname+u.search)){
      diag("🟡 <b>รูปแบบ URL ไม่ชัดเจน</b><br>อาจเป็น stream แบบที่ Player นี้ไม่รองรับ");
      return;
    }
    if(location.protocol==="https:" && u.protocol==="http:"){
      diag("🔴 <b>Mixed Content</b><br>หน้า PWA เป็น HTTPS แต่สตรีมเป็น HTTP Browser อาจบล็อก");
      return;
    }
    diag("🟢 <b>URL ผ่านการตรวจเบื้องต้น</b><br>"+(isHls?"HLS/M3U8":"Media URL")+" • กำลังทดสอบ Player");
    retries=0;startStream();
  }catch(e){
    const [code,desc]=classifyError(e.message);
    diag(`🔴 <b>${code}</b><br>${desc}`);
  }
}
function open(c){manualStop=false;current=c;retries=0;backupIndex=0;backupList=(localStorage.getItem("tvBackup")||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);$("#player").classList.add("show");$("#ptitle").textContent=c.name;let p=program(c);$("#nowTitle").textContent=p?.title||"กำลังเล่น";$("#nowDesc").textContent=p?.desc||c.cat;startStream()}
$("#video").addEventListener("waiting",()=>status("กำลังเติม Buffer…"));$("#video").addEventListener("playing",()=>status("สตรีมปกติ"));$("#video").addEventListener("stalled",()=>schedule("Stalled"));$("#video").addEventListener("error",()=>schedule("Video Error"));
$("#close").onclick=()=>{manualStop=true;$("#player").classList.remove("show");destroy();current=null};
$("#reconnect").onclick=()=>{if(current){retries=0;backupIndex=0;diag("🔄 กำลังเชื่อมต่อใหม่…");startStream()}};$("#diagnose").onclick=()=>diagnose();
$("#pip").onclick=async()=>{try{if(document.pictureInPictureEnabled)await $("#video").requestPictureInPicture();else toast("ไม่รองรับ PiP")}catch(e){toast("เปิด PiP ไม่ได้")}};
$("#air").onclick=()=>{if($("#video").webkitShowPlaybackTargetPicker)$("#video").webkitShowPlaybackTargetPicker();else toast("AirPlay ใช้ได้บน Safari/iOS ที่รองรับ")};
$("#search").oninput=render;$("#refresh").onclick=()=>load();
$("#settings").onclick=()=>{$("#playlist").value=localStorage.getItem("tvM3U")||DEFAULT_M3U;$("#epg").value=localStorage.getItem("tvEPG")||"";$("#backup").value=localStorage.getItem("tvBackup")||"";$("#modal").classList.add("show")};
$("#cancel").onclick=()=>$("#modal").classList.remove("show");
$("#save").onclick=()=>{let m=$("#playlist").value.trim()||DEFAULT_M3U,e=$("#epg").value.trim(),b=$("#backup").value.trim();localStorage.setItem("tvM3U",m);localStorage.setItem("tvEPG",e);localStorage.setItem("tvBackup",b);$("#modal").classList.remove("show");load(m);if(e)loadEPG(e);toast("บันทึกการตั้งค่าแล้ว")};
document.querySelectorAll(".bottom button[data-view]").forEach(b=>b.onclick=()=>{view=b.dataset.view;cat=view==="fav"?"รายการโปรด":"ทั้งหมด";document.querySelectorAll(".bottom button").forEach(x=>x.classList.remove("active"));b.classList.add("active");render()});

function openTrueID(){
  $("#trueidModal").classList.remove("show");
  showTrueID();
}
function showTrueID(){
  $("#trueidView").classList.add("show");
  $("#trueidFrame").src="https://tv.trueid.net/th-en/live";
}
function hideTrueID(){
  $("#trueidView").classList.remove("show");
  $("#trueidFrame").src="about:blank";
}
$("#trueidTab").onclick=showTrueID;
$("#trueidBack").onclick=hideTrueID;
$("#trueidExternal").onclick=()=>window.open("https://tv.trueid.net/th-en/live","_blank","noopener,noreferrer");
$("#trueid").onclick=openTrueID;
$("#trueidCancel").onclick=()=>$("#trueidModal").classList.remove("show");
$("#trueidOpen").onclick=()=>{showTrueID();$("#trueidModal").classList.remove("show")};

let deferred;window.addEventListener("beforeinstallprompt",e=>{e.preventDefault();deferred=e;$("#install").hidden=false});$("#install").onclick=async()=>{if(deferred){deferred.prompt();deferred=null}};
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("sw.js"));load();if(localStorage.getItem("tvEPG"))loadEPG(localStorage.getItem("tvEPG"));
