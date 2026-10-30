
(function(){
  "use strict";
  var WA = "447710861506";
  var KEY = "PUT_WEB3FORMS_ACCESS_KEY_HERE";
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
  /* forms */
  function val(f,n){var x=f.querySelector('[name="'+n+'"]');return x?x.value.trim():""}
  function phoneOk(p){var d=p.replace(/\D/g,"");return d.length>=10&&d.length<=13}
  function waText(d){return "Hello! I'd like a removals quote.\nName: "+d.name+"\nPhone: "+d.phone+"\nFrom: "+d.from+"\nTo: "+d.to+(d.what?"\nMoving: "+d.what:"")+(d.date?"\nDate: "+d.date:"")+(d.msg?"\nDetails: "+d.msg:"")}
  function failover(ok,d){
    var link="https://wa.me/"+WA+"?text="+encodeURIComponent(waText(d));
    if(ok){ok.innerHTML='We could not send this automatically. <a href="'+link+'" target="_blank" rel="noopener">Tap here to send it on WhatsApp</a> or call <a href="tel:+447710861506">07710 861506</a>.';ok.classList.add("show")}
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
      var p={access_key:KEY,subject:"New removals quote request",from_name:"Rapid Removals UK",Name:d.name,Phone:d.phone,"Moving from":d.from,"Moving to":d.to};
      if(d.what)p["Moving"]=d.what;if(d.date)p["Date"]=d.date;if(d.msg)p["Details"]=d.msg;
      fetch("https://api.web3forms.com/submit",{method:"POST",headers:{"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify(p)})
      .then(function(r){return r.json()}).then(function(j){
        if(btn)btn.disabled=false;
        if(j.success){if(ok){ok.textContent="Thank you! We have your request and will contact you shortly.";ok.classList.add("show")}form.reset()}
        else failover(ok,d)
      }).catch(function(){if(btn)btn.disabled=false;failover(ok,d)});
    });
  });
})();
