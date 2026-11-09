
(function(){
  "use strict";
  var WA = "447876809044";
  var KEY = "b94b0400-c3a8-4074-a1d1-4b211a11e043";
  /* burger */
  var b=document.querySelector(".burger"),m=document.querySelector(".mnav");
  if(b&&m)b.addEventListener("click",function(){var o=m.classList.toggle("open");b.setAttribute("aria-expanded",o?"true":"false")});
  /* accordion */
  document.querySelectorAll(".acc-q").forEach(function(q){q.addEventListener("click",function(){
    var i=q.closest(".acc-i"),a=i.querySelector(".acc-a"),o=i.classList.contains("open");
    i.parentElement.querySelectorAll(".acc-i.open").forEach(function(x){x.classList.remove("open");x.querySelector(".acc-a").style.maxHeight=null;x.querySelector(".acc-q").setAttribute("aria-expanded","false")});
    if(!o){i.classList.add("open");a.style.maxHeight=a.scrollHeight+"px";q.setAttribute("aria-expanded","true")}
  })});
  /* reveal */
  var rv=document.querySelectorAll(".rv");
  if("IntersectionObserver" in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add("in");io.unobserve(e.target)}})},{threshold:.08});rv.forEach(function(el){io.observe(el)})}else rv.forEach(function(el){el.classList.add("in")});
  document.querySelectorAll("[data-yr]").forEach(function(e){e.textContent=new Date().getFullYear()});
  document.querySelectorAll('input[type="date"]').forEach(function(e){var t=new Date();e.min=t.getFullYear()+"-"+("0"+(t.getMonth()+1)).slice(-2)+"-"+("0"+t.getDate()).slice(-2)});
  /* forms */
  function val(f,n){var x=f.querySelector('[name="'+n+'"]');return x?x.value.trim():""}
  function phoneOk(p){var d=p.replace(/\D/g,"");return d.length>=10&&d.length<=13}
  function onlyShow(root,mode){root.querySelectorAll("[data-only]").forEach(function(el){el.hidden=(" "+el.getAttribute("data-only")+" ").indexOf(" "+mode+" ")<0})}
  var PHOTOS = false;
  var URL_ = "https://api.web3forms.com/submit";
  var TITLES={move:"New removals quote request",both:"New move and clearance quote request",clear:"New clearance quote request"};
  var KINDS={move:"Move",both:"Move + clearance",clear:"Clearance only"};
  function waText(d){
    var t="Hello! I'd like a "+(d.kind==="clear"?"clearance":"removals")+" quote.\nName: "+d.name+"\nPhone: "+d.phone;
    if(d.date)t+="\nDate: "+d.date;
    if(d.service)t+="\nService: "+d.service;
    t+="\nFrom: "+(d.from||d.fromPlace||"")+(d.fromType?" ("+d.fromType+")":"")+(d.fromInfo?"\n  ("+d.fromInfo+")":"");
    if(d.to)t+="\nTo: "+d.to+(d.toType?" ("+d.toType+")":"")+(d.toInfo?"\n  ("+d.toInfo+")":"");
    if(d.what)t+="\nMoving: "+d.what;
    if(d.inv)t+="\nItems ("+d.invCount+"): "+(d.inv.length>700?d.inv.slice(0,700)+"...":d.inv);
    if(d.packing)t+="\nPacking: "+d.packing;
    if(d.clear)t+="\nTo remove: "+d.clear+(d.clearNotes?" ("+d.clearNotes+")":"");
    if(d.msg)t+="\nDetails: "+d.msg;
    return t;
  }
  function failover(ok,d){
    var link="https://wa.me/"+WA+"?text="+encodeURIComponent(waText(d));
    if(ok){ok.innerHTML='We could not send this automatically. <a href="'+link+'" target="_blank" rel="noopener">Tap here to send it on WhatsApp</a> or call <a href="tel:+447876809044">07876 809044</a>.';ok.classList.add("show")}
    try{window.open(link,"_blank")}catch(e){}
  }
  function photoLink(d){return "https://wa.me/"+WA+"?text="+encodeURIComponent("Hello! I have just sent a clearance quote request"+(d.name&&d.name!=="Website enquiry"?" ("+d.name+")":"")+(d.post?" from "+d.post:"")+". Here are photos of the items:")}
  function thanks(ok,base,d){
    if(!ok)return;
    if(d.kind!=="move"&&!PHOTOS){ok.innerHTML=base+' Photos help us price a clearance accurately: <a href="'+photoLink(d)+'" target="_blank" rel="noopener">send them on WhatsApp</a>.'}
    else ok.textContent=base;
    ok.classList.add("show");
  }
  document.querySelectorAll("form[data-lead]").forEach(function(form){
    var ksel=form.querySelector('[name="kind"]'),ft=form.querySelector(".ft");
    function kind(){return ksel?ksel.value:"move"}
    function sync(){var k=kind();onlyShow(form,k);if(ft)ft.classList.toggle("one",k==="clear")}
    if(ksel){ksel.addEventListener("change",sync);sync()}
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var err=form.querySelector(".ferr"),ok=form.querySelector(".fok"),btn=form.querySelector('button[type="submit"]');
      if(val(form,"company"))return;
      var k=kind();
      var d={kind:k,name:val(form,"name")||"Website enquiry",phone:val(form,"phone"),from:val(form,"from"),post:val(form,"from").toUpperCase(),to:k==="clear"?"":val(form,"to"),what:k==="clear"?"":val(form,"what"),date:val(form,"date"),msg:val(form,"message")};
      if(!phoneOk(d.phone)||d.from.length<2||(k!=="clear"&&d.to.length<2)){if(err)err.classList.add("show");return}
      if(err)err.classList.remove("show");
      if(btn)btn.disabled=true;
      if(KEY.indexOf("PUT_")===0){if(btn)btn.disabled=false;failover(ok,d);return}
      var p={access_key:KEY,subject:TITLES[k],from_name:"Movonest Removals","Request type":KINDS[k],Name:d.name,Phone:d.phone};
      p[k==="clear"?"Collect from":"Moving from"]=d.from;if(k!=="clear")p["Moving to"]=d.to;
      if(d.what)p["Moving"]=d.what;if(d.date)p["Date"]=d.date;if(d.msg)p["Details"]=d.msg;
      if(k!=="move")p["Items / photos"]="Customer was invited to send the item list and photos on WhatsApp";
      fetch(URL_,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(p)})
      .then(function(r){return r.json()}).then(function(j){
        if(btn)btn.disabled=false;
        if(j.success){thanks(ok,"Thank you! We have your request and will contact you shortly.",d);form.reset();if(ksel)sync()}
        else failover(ok,d)
      }).catch(function(){if(btn)btn.disabled=false;failover(ok,d)});
    });
  });

  
  /* ---------- quote wizard ---------- */
  var PCAPI="https://api.postcodes.io";
  var PC_RE=/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;
  var SETTLE={"City":1,"Capital City":1,"Town":1,"Village":1,"Hamlet":1,"Suburban Area":1,"Other Settlement":1};
  var MONTHS=["January","February","March","April","May","June","July","August","September","October","November","December"];
  var DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  var PACK_NOTE="packing material and bubble wrap included";
  function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}
  function pad(n){return (n<10?"0":"")+n}
  function iso(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate())}
  function nice(d){return DAYS[d.getDay()]+" "+d.getDate()+" "+MONTHS[d.getMonth()].slice(0,3)+" "+d.getFullYear()}
  function parseIso(s){var m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s||"");return m?new Date(+m[1],+m[2]-1,+m[3]):null}
  function nicePc(pc){pc=pc.replace(/\s+/g,"").toUpperCase();return pc.length>3?pc.slice(0,-3)+" "+pc.slice(-3):pc}
  function miles(a,b){var R=3958.8,r=Math.PI/180,dl=(b.lat-a.lat)*r,dn=(b.lon-a.lon)*r,x=Math.sin(dl/2)*Math.sin(dl/2)+Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dn/2)*Math.sin(dn/2);return 2*R*Math.asin(Math.sqrt(x))}
  function getJSON(path){
    var ctl=("AbortController" in window)?new AbortController():null,t=setTimeout(function(){if(ctl)ctl.abort()},5000);
    return fetch(PCAPI+path,ctl?{signal:ctl.signal}:{}).then(function(r){clearTimeout(t);return r.json()}).catch(function(){clearTimeout(t);return null});
  }
  function fetchSuggest(q){
    if(/\d/.test(q)){
      var s=q.replace(/\s+/g,"");if(s.length<2)return Promise.resolve([]);
      return getJSON("/postcodes/"+encodeURIComponent(s)+"/autocomplete?limit=6").then(function(r){return ((r&&r.result)||[]).map(function(pc){return {label:pc,pc:pc}})});
    }
    return getJSON("/places?q="+encodeURIComponent(q)+"&limit=10").then(function(r){
      var seen={},out=[];
      ((r&&r.result)||[]).forEach(function(x){
        if(!SETTLE[x.local_type])return;
        var area=x.county_unitary||x.region||"",key=x.name_1+"|"+area;if(seen[key])return;seen[key]=1;
        out.push({label:x.name_1+(area&&area!==x.name_1?", "+area:""),town:x.name_1,lat:x.latitude,lon:x.longitude,sub:x.local_type});
      });
      return out.slice(0,6);
    });
  }

  /* calendar modal (shared) */
  var cal=null;
  function getCal(){
    if(cal)return cal;
    var m=document.createElement("div");m.className="calmodal";m.hidden=true;m.setAttribute("role","dialog");m.setAttribute("aria-modal","true");m.setAttribute("aria-label","Choose a date");
    m.innerHTML='<div class="calbox"><div class="calhead"><b>Choose a date</b><button type="button" class="calx" aria-label="Close calendar">&times;</button></div><div class="caldow"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div><div class="calbody"></div></div>';
    document.body.appendChild(m);
    var body=m.querySelector(".calbody"),cb=null,ret=null;
    function close(){m.hidden=true;document.documentElement.classList.remove("calopen");if(ret&&ret.focus)ret.focus()}
    m.addEventListener("click",function(e){
      if(e.target===m||e.target.className==="calx"){close();return}
      var b=e.target.closest?e.target.closest(".cd"):null;if(b&&!b.disabled){var v=b.getAttribute("data-d");close();if(cb)cb(v)}
    });
    document.addEventListener("keydown",function(e){if(!m.hidden&&e.key==="Escape")close()});
    cal={open:function(sel,callback,retEl){
      cb=callback;ret=retEl;var t=new Date(),today=new Date(t.getFullYear(),t.getMonth(),t.getDate()),h="";
      for(var k=0;k<12;k++){
        var first=new Date(today.getFullYear(),today.getMonth()+k,1),dim=new Date(first.getFullYear(),first.getMonth()+1,0).getDate(),lead=(first.getDay()+6)%7;
        h+='<div class="calmonth"><h4>'+MONTHS[first.getMonth()]+" "+first.getFullYear()+'</h4><div class="calgrid">';
        for(var i=0;i<lead;i++)h+="<span></span>";
        for(var d=1;d<=dim;d++){var dt=new Date(first.getFullYear(),first.getMonth(),d),off=dt<today,s=iso(dt);
          h+='<button type="button" class="cd'+(off?" off":"")+(s===iso(today)?" today":"")+(s===sel?" sel":"")+'"'+(off?" disabled":"")+' data-d="'+s+'" aria-label="'+nice(dt)+'">'+d+"</button>"}
        h+="</div></div>";
      }
      body.innerHTML=h;m.hidden=false;document.documentElement.classList.add("calopen");
      var tgt=body.querySelector(".sel")||body.querySelector(".today");if(tgt&&tgt.scrollIntoView)tgt.scrollIntoView({block:"center"});
      m.querySelector(".calx").focus();
    }};
    return cal;
  }

  var wizards=[];
  document.querySelectorAll("form[data-wizard]").forEach(function(form){
    var all=[].slice.call(form.querySelectorAll(".pane")),prog=form.querySelector(".prog"),lbl=form.querySelector(".plabel"),seg=form.querySelector(".seg"),rows=form.querySelector(".irows"),cur=0,mode="move";
    var err=form.querySelector(".ferr"),ok=form.querySelector(".fok");
    var S={inv:{},pack:{}},PL={from:null,to:null};
    var MC="Please add at least one item to be removed. If you are not sure, type: mixed household items.";
    var cats=form.querySelector(".cats"),sumBar=form.querySelector(".sumbar"),sumPanel=form.querySelector(".sumpanel"),sumList=form.querySelector(".sumlist"),sumN=form.querySelector(".sumn"),custCat=form.querySelector(".custcat"),custBody=form.querySelector(".custbody");

    function panes(){return all.filter(function(p){return (" "+p.getAttribute("data-modes")+" ").indexOf(" "+mode+" ")>-1})}
    function pickMode(){var r=form.querySelector('input[name="mode"]:checked');return r?r.value:"move"}
    function key(){return panes()[cur].getAttribute("data-k")}
    function show(i,quiet){
      var a=panes();cur=Math.max(0,Math.min(i,a.length-1));
      all.forEach(function(x){x.classList.remove("on")});a[cur].classList.add("on");
      prog.innerHTML=a.map(function(x,k){return "<i"+(k<=cur?' class="on"':"")+"></i>"}).join("");
      if(lbl)lbl.textContent="Step "+(cur+1)+" of "+a.length+" · "+(a[cur].getAttribute("data-label-"+mode)||a[cur].getAttribute("data-label"));
      if(seg)seg.hidden=cur!==0;
      if(err)err.classList.remove("show");
      if(!quiet&&prog.scrollIntoView)prog.scrollIntoView({block:"start"});
    }
    function selService(){return form.querySelector('input[name="service"]:checked')}
    function isPlat(){var s=selService();return !!s&&s.value.toLowerCase().indexOf("platinum")===0}
    function syncService(){var pk=form.querySelector(".pack");if(pk)pk.hidden=!isPlat()}
    function setMode(m,level){
      mode=m;var r=form.querySelector('input[name="mode"][value="'+m+'"]');if(r)r.checked=true;
      onlyShow(form,mode);
      if(level){var lv=form.querySelectorAll('input[name="service"]');for(var i=0;i<lv.length;i++){if(lv[i].value.toLowerCase().indexOf(level.toLowerCase())===0)lv[i].checked=true}}
      syncService();show(0,true);
    }
    form._setMode=setMode;
    form.querySelectorAll('input[name="mode"]').forEach(function(r){r.addEventListener("change",function(){setMode(pickMode())})});
    form.querySelectorAll('input[name="service"]').forEach(function(r){r.addEventListener("change",syncService)});

    /* ----- quantities (inventory + packing) ----- */
    function total(g){var t=0,o=S[g];for(var k in o)t+=o[k];return t}
    function rowsFor(g){return [].slice.call(form.querySelectorAll('[data-grp="'+g+'"] .it'))}
    function setQty(g,name,q,skip){
      q=Math.max(0,Math.min(99,q|0));
      if(q)S[g][name]=q;else delete S[g][name];
      rowsFor(g).forEach(function(el){
        if(el.getAttribute("data-n")!==name)return;
        el.classList.toggle("has",q>0);
        var qn=el.querySelector(".qn");if(qn&&qn!==skip&&String(q)!==qn.value)qn.value=q;
      });
      if(g==="inv")refreshInv();
    }
    function refreshInv(){
      form.querySelectorAll(".cat").forEach(function(c){
        var n=0;[].slice.call(c.querySelectorAll(".it")).forEach(function(el){n+=S.inv[el.getAttribute("data-n")]||0});
        var cn=c.querySelector(".cn");if(cn)cn.textContent=n?n+(n===1?" item":" items"):"";
      });
      var t=total("inv");if(sumN)sumN.textContent=t+(t===1?" item":" items");
      if(sumList){
        var h="";rowsFor("inv").forEach(function(el){var n=el.getAttribute("data-n"),q=S.inv[n];if(q)h+='<li><span>'+q+" × "+esc(n)+'</span><button type="button" class="rmx" data-n="'+esc(n)+'" aria-label="Remove '+esc(n)+'">Remove</button></li>'});
        sumList.innerHTML=h;
      }
    }
    function findRow(name){var r=rowsFor("inv");for(var i=0;i<r.length;i++){if(r[i].getAttribute("data-n").toLowerCase()===name.toLowerCase())return r[i]}return null}
    function addCustom(name){
      var el=findRow(name);
      if(!el){
        var d=document.createElement("div");d.innerHTML='<div class="it" data-n="'+esc(name)+'"><span class="in">'+esc(name)+'</span><span class="qc"><button type="button" class="qm" aria-label="Remove one '+esc(name)+'">&minus;</button><input class="qn" type="number" min="0" max="99" value="0" inputmode="numeric" aria-label="Quantity of '+esc(name)+'"><button type="button" class="qp" aria-label="Add one '+esc(name)+'">+</button></span></div>';
        el=d.firstChild;custBody.appendChild(el);custCat.hidden=false;
      }
      var n=el.getAttribute("data-n");setQty("inv",n,(S.inv[n]||0)+1);return el;
    }
    function reveal(el){
      var c=el.closest(".cat");if(c&&!c.classList.contains("open"))openCat(c);
      el.classList.remove("flash");void el.offsetWidth;el.classList.add("flash");
    }
    function openCat(c){
      form.querySelectorAll(".cat").forEach(function(x){var o=x===c;x.classList.toggle("open",o);var b=x.querySelector(".ah");if(b)b.setAttribute("aria-expanded",o?"true":"false")});
    }
    form.addEventListener("click",function(e){
      var t=e.target,b=t.closest?t.closest(".qp,.qm"):null;
      if(b){var it=b.closest(".it"),g=it.closest("[data-grp]").getAttribute("data-grp"),n=it.getAttribute("data-n");setQty(g,n,(S[g][n]||0)+(b.classList.contains("qp")?1:-1));return}
      var ah=t.closest?t.closest(".ah"):null;
      if(ah){var c=ah.closest(".cat");if(c.classList.contains("open")){c.classList.remove("open");ah.setAttribute("aria-expanded","false")}else openCat(c);return}
      var rx=t.closest?t.closest(".rmx"):null;
      if(rx){setQty("inv",rx.getAttribute("data-n"),0);return}
    });
    form.addEventListener("input",function(e){
      var t=e.target;
      if(t.classList&&t.classList.contains("qn")){var it=t.closest(".it"),g=it.closest("[data-grp]").getAttribute("data-grp"),v=parseInt(t.value,10)||0;setQty(g,it.getAttribute("data-n"),v,t);if(v>99)t.value="99";return}
      if(t.getAttribute&&t.getAttribute("data-auto")==="1")t.setAttribute("data-auto","0");
    });
    form.addEventListener("change",function(e){
      var t=e.target;
      if(t.classList&&t.classList.contains("qn")){var it=t.closest(".it"),g=it.closest("[data-grp]").getAttribute("data-grp");t.value=S[g][it.getAttribute("data-n")]||0}
    });
    if(sumBar)sumBar.addEventListener("click",function(){var o=sumBar.getAttribute("aria-expanded")==="true";sumBar.setAttribute("aria-expanded",o?"false":"true");sumPanel.hidden=o});

    /* ----- item search ----- */
    var srch=form.querySelector(".isrch"),sug=form.querySelector(".isug"),msg=form.querySelector(".sugmsg"),msgT=null;
    function norm(s){return s.toLowerCase().replace(/[^a-z0-9 ]+/g," ").replace(/\s+/g," ").trim()}
    function catalogNames(){return rowsFor("inv").map(function(el){return el.getAttribute("data-n")})}
    function matches(q){
      var nq=norm(q);if(nq.length<2)return [];
      var a=[],b=[],c=[];
      catalogNames().forEach(function(n){var nn=norm(n);if(nn.indexOf(nq)===0)a.push(n);else if((" "+nn).indexOf(" "+nq)>-1)b.push(n);else if(nn.indexOf(nq)>-1)c.push(n)});
      return a.concat(b,c).slice(0,6);
    }
    function renderSug(){
      var q=srch.value.trim(),m=matches(q),h="";
      if(q.length<2){sug.hidden=true;sug.innerHTML="";return}
      h='<li class="sughead">Suggested items</li>';
      m.forEach(function(n){h+='<li><span>'+esc(n)+'</span><button type="button" class="addbtn" data-n="'+esc(n)+'">Add</button></li>'});
      var exact=false;m.forEach(function(n){if(norm(n)===norm(q))exact=true});
      if(!exact)h+='<li><span>Add &ldquo;'+esc(q)+'&rdquo; as your own item</span><button type="button" class="addbtn" data-custom="1" data-n="'+esc(q)+'">Add</button></li>';
      sug.innerHTML=h;sug.hidden=false;
    }
    function flashMsg(t){if(!msg)return;msg.textContent=t;clearTimeout(msgT);msgT=setTimeout(function(){msg.textContent=""},2600)}
    function addFromSearch(name,custom){
      var el;
      if(custom){name=name.replace(/\s+/g," ").trim().slice(0,40);name=name.charAt(0).toUpperCase()+name.slice(1);el=addCustom(name)}
      else{el=findRow(name);var n=el.getAttribute("data-n");setQty("inv",n,(S.inv[n]||0)+1)}
      reveal(el);flashMsg("Added "+el.getAttribute("data-n")+" ("+S.inv[el.getAttribute("data-n")]+")");
      srch.value="";sug.hidden=true;sug.innerHTML="";
    }
    if(srch){
      srch.addEventListener("input",renderSug);
      srch.addEventListener("keydown",function(e){
        if(e.key==="Enter"){e.preventDefault();var b=sug.querySelector(".addbtn");if(b)addFromSearch(b.getAttribute("data-n"),!!b.getAttribute("data-custom"))}
        else if(e.key==="Escape"){sug.hidden=true}
      });
      sug.addEventListener("click",function(e){var b=e.target.closest?e.target.closest(".addbtn"):null;if(b)addFromSearch(b.getAttribute("data-n"),!!b.getAttribute("data-custom"))});
    }

    /* ----- places (town or postcode) ----- */
    function setAuto(inp,v){if(inp&&v&&(!inp.value||inp.getAttribute("data-auto")==="1")){inp.value=v;inp.setAttribute("data-auto","1")}}
    function applyAddr(k){var d=PL[k];if(!d)return;setAuto(form.querySelector('[name="'+k+'_post"]'),d.pc);setAuto(form.querySelector('[name="'+k+'_town"]'),d.town)}
    function resolvePc(k,pc){
      return getJSON("/postcodes/"+encodeURIComponent(pc.replace(/\s+/g,""))).then(function(r){
        var x=r&&r.result;if(x&&PL[k]&&PL[k].pc===pc){PL[k].lat=x.latitude;PL[k].lon=x.longitude;PL[k].town=x.admin_district||x.parish||"";applyAddr(k)}
      });
    }
    function placeInit(k){
      var inp=form.querySelector('[name="'+k+'_place"]');if(!inp)return;
      var ul=inp.parentNode.querySelector(".sug"),timer=null,items=[],act=-1,seq=0;
      function close(){ul.hidden=true;inp.setAttribute("aria-expanded","false");act=-1}
      function render(){
        ul.innerHTML=items.map(function(it,i){return '<li role="option" data-i="'+i+'"'+(i===act?' class="act"':"")+">"+esc(it.label)+(it.sub?"<small>"+esc(it.sub)+"</small>":"")+"</li>"}).join("");
        ul.hidden=!items.length;inp.setAttribute("aria-expanded",items.length?"true":"false");
      }
      function choose(it){
        inp.value=it.label;close();
        PL[k]={text:inp.value,pc:it.pc||"",town:it.town||"",lat:it.lat||null,lon:it.lon||null};
        if(it.pc)resolvePc(k,it.pc);
        applyAddr(k);
      }
      inp.addEventListener("input",function(){
        PL[k]=null;var q=inp.value.trim();clearTimeout(timer);
        if(q.length<2){items=[];render();return}
        var my=++seq;timer=setTimeout(function(){fetchSuggest(q).then(function(list){if(my!==seq)return;items=list;act=-1;render()})},220);
      });
      inp.addEventListener("keydown",function(e){
        if(e.key==="ArrowDown"&&items.length){e.preventDefault();act=Math.min(items.length-1,act+1);render()}
        else if(e.key==="ArrowUp"&&items.length){e.preventDefault();act=Math.max(0,act-1);render()}
        else if(e.key==="Enter"&&!ul.hidden&&items.length){e.preventDefault();choose(items[act>=0?act:0])}
        else if(e.key==="Escape"){close()}
      });
      inp.addEventListener("blur",function(){
        setTimeout(close,160);
        var v=inp.value.trim();
        if(!PL[k]&&PC_RE.test(v)){var pc=nicePc(v);inp.value=pc;PL[k]={text:pc,pc:pc,town:"",lat:null,lon:null};resolvePc(k,pc);applyAddr(k)}
      });
      ul.addEventListener("mousedown",function(e){e.preventDefault();var li=e.target.closest?e.target.closest("li"):null;if(li)choose(items[+li.getAttribute("data-i")])});
    }
    placeInit("from");placeInit("to");

    /* ----- date ----- */
    var dbtn=form.querySelector(".datebtn"),dhid=form.querySelector('input[name="date"]'),nod=form.querySelector('input[name="nodate"]');
    function syncDate(){
      var d=parseIso(dhid.value);
      dbtn.classList.toggle("has",!!d);dbtn.querySelector(".dval").textContent=d?nice(d):"";
      dbtn.disabled=!!(nod&&nod.checked);
    }
    dbtn.addEventListener("click",function(){getCal().open(dhid.value,function(v){dhid.value=v;if(nod)nod.checked=false;syncDate()},dbtn)});
    if(nod)nod.addEventListener("change",function(){if(nod.checked)dhid.value="";syncDate()});

    /* ----- clearance rows ----- */
    function blankRow(r){r.querySelectorAll("input").forEach(function(i){i.value=i.name==="ci_qty"?"1":""})}
    function resetRows(){if(!rows)return;while(rows.children.length>1)rows.removeChild(rows.lastChild)}
    var add=form.querySelector(".addrow");
    if(add&&rows)add.addEventListener("click",function(){
      if(rows.children.length>=12)return;
      var n=rows.firstElementChild.cloneNode(true);blankRow(n);rows.appendChild(n);n.querySelector("input").focus();
    });
    if(rows)rows.addEventListener("click",function(e){
      var b=e.target.closest?e.target.closest(".rm"):null;if(!b)return;
      var r=b.closest(".irow");
      if(rows.children.length>1)rows.removeChild(r);else blankRow(r);
    });
    function itemRows(){
      if(!rows)return [];
      return [].slice.call(rows.querySelectorAll(".irow")).map(function(r){return {n:r.querySelector('[name="ci_name"]').value.trim(),q:Math.max(1,parseInt(r.querySelector('[name="ci_qty"]').value,10)||1)}}).filter(function(x){return x.n.length>=2});
    }
    function photoFiles(){var f=form.querySelector('input[name="photos"]');return(PHOTOS&&f&&f.files)?[].slice.call(f.files):[]}
    function photosProblem(){
      var fs=photoFiles();
      if(fs.length>6)return "Please choose up to 6 photos.";
      for(var i=0;i<fs.length;i++){if(fs[i].size>5*1024*1024)return "Each photo must be under 5 MB."}
      return "";
    }

    /* ----- validation ----- */
    function addrBad(k,label){
      if(val(form,k+"_addr").length<3)return "Please enter the "+label+" address (house number and street).";
      if(val(form,k+"_post").length<3)return "Please enter the "+label+" postcode.";
      if(!val(form,k+"_floor"))return "Please choose the floor at the "+label+" address.";
      if(!val(form,k+"_lift"))return "Please say whether there is a lift at the "+label+" address.";
      return "";
    }
    function problem(k){
      if(k==="where"){
        var clr=mode==="clear";
        if(val(form,"from_place").length<2)return clr?"Please enter the town or postcode where we will collect.":"Please enter the town or postcode you are moving from.";
        if(!val(form,"from_type"))return clr?"Please select the property type we are collecting from.":"Please select the property type you are moving from.";
        if(!clr){
          if(val(form,"to_place").length<2)return "Please enter the town or postcode you are moving to.";
          if(!val(form,"to_type"))return "Please select the property type you are moving to.";
        }
        if(!val(form,"date")&&!(nod&&nod.checked))return "Please choose a date, or tick “I don't have a date yet”.";
        return "";
      }
      if(k==="inv")return total("inv")?"":"Please add at least one item. Can't find it? Search for it and add it as your own item.";
      if(k==="service")return selService()?"":"Please choose Basic, Premium or Platinum.";
      if(k==="clear")return itemRows().length?photosProblem():MC;
      if(k==="from")return addrBad("from",mode==="clear"?"collection":"pick-up");
      if(k==="to")return addrBad("to","delivery");
      if(k==="contact")return phoneOk(val(form,"phone"))?"":"Please enter a valid phone number so we can send your quote.";
      return "";
    }
    function next(){var k=key(),m=problem(k);if(m){if(err){err.textContent=m;err.classList.add("show")}return false}show(cur+1);return true}
    form.querySelectorAll("[data-next]").forEach(function(b){b.addEventListener("click",next)});
    form.querySelectorAll("[data-back]").forEach(function(b){b.addEventListener("click",function(){show(Math.max(0,cur-1))})});

    /* ----- collect + send ----- */
    function addr(k){return [val(form,k+"_flat")?"Flat/Apt "+val(form,k+"_flat"):"",val(form,k+"_addr"),val(form,k+"_town"),val(form,k+"_post").toUpperCase()].filter(Boolean).join(", ")}
    function info(k){return "Floor: "+val(form,k+"_floor")+" | Lift: "+val(form,k+"_lift")+" | Van to door: "+(val(form,k+"_dist")||"not specified")}
    function invText(){var o=[];rowsFor("inv").forEach(function(el){var n=el.getAttribute("data-n"),q=S.inv[n];if(q)o.push(q+" x "+n)});return o.join("; ")}
    function packText(){
      if(!isPlat())return "";
      var o=[];rowsFor("pack").forEach(function(el){var n=el.getAttribute("data-n"),q=S.pack[n];if(q)o.push(q+" x "+n)});
      return (o.length?o.join("; "):"box counts not specified")+" ("+PACK_NOTE+")";
    }
    function mapLink(a,b){return "https://www.google.com/maps/dir/?api=1&origin="+encodeURIComponent(a)+"&destination="+encodeURIComponent(b)+"&travelmode=driving"}
    function resetAll(){
      form.reset();dhid.value="";resetRows();S.inv={};S.pack={};PL={from:null,to:null};
      rowsFor("inv").concat(rowsFor("pack")).forEach(function(el){el.classList.remove("has");var q=el.querySelector(".qn");if(q)q.value=0});
      if(custBody){custBody.innerHTML="";custCat.hidden=true}
      form.querySelectorAll('[data-auto]').forEach(function(i){i.removeAttribute("data-auto")});
      if(sumPanel){sumPanel.hidden=true;sumBar.setAttribute("aria-expanded","false")}
      refreshInv();syncDate();syncService();mode=pickMode();onlyShow(form,mode);show(0);
    }
    form.addEventListener("submit",function(e){
      e.preventDefault();
      if(val(form,"company"))return;
      if(cur<panes().length-1){next();return}
      var pm=problem("contact");if(pm){if(err){err.textContent=pm;err.classList.add("show")}return}
      var m=mode,dd=parseIso(val(form,"date"));
      var d={kind:m,name:val(form,"name")||"Website enquiry",phone:val(form,"phone"),email:val(form,"email"),post:val(form,"from_post").toUpperCase(),
        date:dd?nice(dd):"No date yet",fromPlace:val(form,"from_place"),fromType:val(form,"from_type"),toPlace:m==="clear"?"":val(form,"to_place"),toType:m==="clear"?"":val(form,"to_type"),
        from:addr("from"),fromInfo:info("from"),to:m==="clear"?"":addr("to"),toInfo:m==="clear"?"":info("to"),
        inv:m==="clear"?"":invText(),invCount:m==="clear"?0:total("inv"),
        service:m==="clear"?"Clearance only - removal and disposal":(selService()?selService().value:"")+(m==="both"?" + Clearance":""),
        packing:m==="clear"?"":packText(),clear:m==="move"?"":itemRows().map(function(x){return x.q+" x "+x.n}).join("; "),clearNotes:m==="move"?"":val(form,"clear_notes"),msg:val(form,"message"),dist:"",map:""};
      if(m!=="clear"&&PL.from&&PL.to&&PL.from.lat!=null&&PL.to.lat!=null){d.dist="about "+Math.round(miles(PL.from,PL.to))+" miles in a straight line (road distance will be longer)"}
      if(m!=="clear")d.map=mapLink(d.from,d.to);
      var btn=form.querySelector('button[type="submit"]');if(btn)btn.disabled=true;
      if(KEY.indexOf("PUT_")===0){if(btn)btn.disabled=false;failover(ok,d);return}
      var p={access_key:KEY,subject:TITLES[m],from_name:"Movonest Removals","Request type":KINDS[m],Name:d.name,Phone:d.phone};
      if(d.email)p.email=d.email;
      p["Moving date"]=d.date;p.Service=d.service;
      if(m!=="clear"){if(d.dist)p["Distance"]=d.dist;p["Route on Google Maps"]=d.map}
      p[m==="clear"?"Collection address":"Pick-up address"]=d.from;p[m==="clear"?"Collection details":"Pick-up details"]=d.fromInfo;p[m==="clear"?"Collection property":"Pick-up property"]=d.fromType;
      if(m!=="clear"){p["Drop-off address"]=d.to;p["Drop-off details"]=d.toInfo;p["Drop-off property"]=d.toType;p["Inventory ("+d.invCount+" items)"]=d.inv;if(d.packing)p["Packing"]=d.packing}
      if(m!=="move"){p["Items to remove"]=d.clear;if(d.clearNotes)p["Clearance notes"]=d.clearNotes;if(!PHOTOS)p["Photos"]="Customer was invited to send photos on WhatsApp"}
      if(d.msg)p["Notes"]=d.msg;
      var files=(m!=="move")?photoFiles():[],req;
      if(files.length){var fd=new FormData();Object.keys(p).forEach(function(k){fd.append(k,p[k])});files.forEach(function(f,i){fd.append("attachment_"+(i+1),f)});req=fetch(URL_,{method:"POST",headers:{Accept:"application/json"},body:fd})}
      else req=fetch(URL_,{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(p)});
      req.then(function(r){return r.json()}).then(function(j){
        if(btn)btn.disabled=false;
        if(j.success){thanks(ok,"Thank you! We have your request and will contact you shortly with your quote.",d);resetAll()}
        else failover(ok,d)
      }).catch(function(){if(btn)btn.disabled=false;failover(ok,d)});
    });
    refreshInv();syncDate();syncService();mode=pickMode();onlyShow(form,mode);show(0,true);wizards.push(form);
  });
  function setAll(m,level){wizards.forEach(function(f){f._setMode(m,level)})}
  document.querySelectorAll("[data-svc]").forEach(function(a){a.addEventListener("click",function(){setAll(a.getAttribute("data-svc"),a.getAttribute("data-level"))})});
  try{var qs=new URLSearchParams(location.search).get("service");if(qs){qs=qs.toLowerCase();setAll(qs==="clearance"||qs==="clear"?"clear":(qs==="both"?"both":"move"))}}catch(e){}

})();
