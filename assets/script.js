
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
  function waText(d){return "Hello! I'd like a removals quote.\nName: "+d.name+"\nPhone: "+d.phone+"\nFrom: "+d.from+(d.fromInfo?"\n  ("+d.fromInfo+")":"")+"\nTo: "+d.to+(d.toInfo?"\n  ("+d.toInfo+")":"")+(d.what?"\nMoving: "+d.what:"")+(d.service?"\nService: "+d.service:"")+(d.date?"\nDate: "+d.date:"")+(d.msg?"\nDetails: "+d.msg:"")}
  function failover(ok,d){
    var link="https://wa.me/"+WA+"?text="+encodeURIComponent(waText(d));
    if(ok){ok.innerHTML='We could not send this automatically. <a href="'+link+'" target="_blank" rel="noopener">Tap here to send it on WhatsApp</a> or call <a href="tel:+447876809044">07876 809044</a>.';ok.classList.add("show")}
    try{window.open(link,"_blank")}catch(e){}
  }
  document.querySelectorAll("form[data-lead]").forEach(function(form){
    form.addEventListener("submit",function(e){
      e.preventDefault();
      var err=form.querySelector(".ferr"),ok=form.querySelector(".fok"),btn=form.querySelector('button[type="submit"]');
      if(val(form,"company"))return;
      var d={name:val(form,"name")||"Website enquiry",phone:val(form,"phone"),from:val(form,"from"),to:val(form,"to"),what:val(form,"what"),date:val(form,"date"),msg:val(form,"message")};
      if(!phoneOk(d.phone)||d.from.length<2||d.to.length<2){if(err)err.classList.add("show");return}
      if(err)err.classList.remove("show");
      if(btn)btn.disabled=true;
      if(KEY.indexOf("PUT_")===0){if(btn)btn.disabled=false;failover(ok,d);return}
      var p={access_key:KEY,subject:"New removals quote request",from_name:"Movonest Removals",Name:d.name,Phone:d.phone,"Moving from":d.from,"Moving to":d.to};
      if(d.what)p["Moving"]=d.what;if(d.date)p["Date"]=d.date;if(d.msg)p["Details"]=d.msg;
      fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(p)})
      .then(function(r){return r.json()}).then(function(j){
        if(btn)btn.disabled=false;
        if(j.success){if(ok){ok.textContent="Thank you! We have your request and will contact you shortly.";ok.classList.add("show")}form.reset()}
        else failover(ok,d)
      }).catch(function(){if(btn)btn.disabled=false;failover(ok,d)});
    });
  });

  /* ---------- multi-step quote wizard ---------- */
  document.querySelectorAll("form[data-wizard]").forEach(function(form){
    var panes=form.querySelectorAll(".pane"),bars=form.querySelectorAll(".prog i"),lbl=form.querySelector(".plabel"),cur=0;
    var err=form.querySelector(".ferr"),ok=form.querySelector(".fok");
    var LAB=["Step 1 of 6 · Pick-up address","Step 2 of 6 · Drop-off address","Step 3 of 6 · What are you moving?","Step 4 of 6 · Choose your service","Step 5 of 6 · When?","Step 6 of 6 · Your details"];
    var MSG=["Please fill in the pick-up address, postcode, floor and lift.","Please fill in the drop-off address, postcode, floor and lift.","Please choose what you are moving.","Please choose Basic or Premium.","","Please enter a valid phone number so we can send your quote."];
    function show(i){cur=i;panes.forEach(function(x,k){x.classList.toggle("on",k===i)});bars.forEach(function(x,k){x.classList.toggle("on",k<=i)});if(lbl)lbl.textContent=LAB[i];if(err)err.classList.remove("show");form.closest(".formcard").scrollIntoView({block:"nearest"})}
    function addrOk(k){return val(form,k+"_addr").length>=3&&val(form,k+"_post").length>=3&&val(form,k+"_floor")&&val(form,k+"_lift")}
    function check(i){
      if(i===0)return addrOk("from");
      if(i===1)return addrOk("to");
      if(i===2)return !!form.querySelector('input[name="size"]:checked');
      if(i===3)return !!form.querySelector('input[name="service"]:checked');
      if(i===5)return phoneOk(val(form,"phone"));
      return true;
    }
    function addr(k){return [val(form,k+"_flat")?"Flat/Apt "+val(form,k+"_flat"):"",val(form,k+"_addr"),val(form,k+"_town"),val(form,k+"_post").toUpperCase()].filter(Boolean).join(", ")}
    function info(k){return "Floor: "+val(form,k+"_floor")+" | Lift: "+val(form,k+"_lift")+" | Van to door: "+(val(form,k+"_dist")||"not specified")}
    form.querySelectorAll("[data-next]").forEach(function(b){b.addEventListener("click",function(){if(!check(cur)){if(err){err.textContent=MSG[cur];err.classList.add("show")}return}show(cur+1)})});
    form.querySelectorAll("[data-back]").forEach(function(b){b.addEventListener("click",function(){show(Math.max(0,cur-1))})});
    form.addEventListener("submit",function(e){
      e.preventDefault();
      if(val(form,"company"))return;
      if(!check(5)){if(err){err.textContent=MSG[5];err.classList.add("show")}return}
      var items=[];form.querySelectorAll('input[name="items"]:checked').forEach(function(c){items.push(c.value)});
      var size=(form.querySelector('input[name="size"]:checked')||{}).value||"";
      var svc=(form.querySelector('input[name="service"]:checked')||{}).value||"";
      var d={name:val(form,"name")||"Website enquiry",phone:val(form,"phone"),from:addr("from"),to:addr("to"),fromInfo:info("from"),toInfo:info("to"),what:size+(items.length?" ("+items.join(", ")+")":""),service:svc,date:(val(form,"date")+(form.querySelector('input[name="flex"]:checked')?" (flexible)":"")).trim(),msg:(val(form,"email")?"Email: "+val(form,"email"):"")+(val(form,"email")&&val(form,"message")?" | ":"")+val(form,"message")};
      var btn=form.querySelector('button[type="submit"]');if(btn)btn.disabled=true;
      if(KEY.indexOf("PUT_")===0){if(btn)btn.disabled=false;failover(ok,d);return}
      var p={access_key:KEY,subject:"New removals quote request",from_name:"Movonest Removals",Name:d.name,Phone:d.phone,"Pick-up address":d.from,"Pick-up details":d.fromInfo,"Drop-off address":d.to,"Drop-off details":d.toInfo,"Size / items":d.what,Service:d.service,Date:d.date,Details:d.msg};
      fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(p)})
      .then(function(r){return r.json()}).then(function(j){
        if(btn)btn.disabled=false;
        if(j.success){if(ok){ok.textContent="Thank you! We have your request and will contact you shortly with your quote.";ok.classList.add("show")}form.reset();show(0)}
        else failover(ok,d)
      }).catch(function(){if(btn)btn.disabled=false;failover(ok,d)});
    });
  });
})();
