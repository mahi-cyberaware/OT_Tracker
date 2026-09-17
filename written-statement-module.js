(function(){
  const WS_API="/api/statement";
  const WS_STORAGE="worktrack-written-statement-draft-v23";
  const $ws=id=>document.getElementById(id);

  function formData(){
    return {
      incidentTitle:$ws("wsIncidentTitle").value.trim(),
      dateIncident:$ws("wsDateIncident").value,
      locationIncident:$ws("wsLocationIncident").value.trim(),
      timeIncident:$ws("wsTimeIncident").value,
      flightEtd:$ws("wsFlightEtd").value.trim(),
      staffNo:$ws("wsStaffNo").value.trim(),
      staffName:$ws("wsStaffName").value.trim(),
      staffMob:$ws("wsStaffMob").value.trim(),
      staffDesignation:$ws("wsStaffDesignation").value.trim(),
      involved:$ws("wsInvolved").checked,
      witness:$ws("wsWitness").checked,
      injured:$ws("wsInjured").checked,
      reason:$ws("wsReason").value.trim(),
      ocrText:$ws("wsOcrText").value.trim()
    };
  }

  function setStatus(msg,error=false){
    const el=$ws("wsStatus"); el.textContent=msg||"";
    el.className="message "+(error?"error":"success");
  }

  function bind(name,value){
    const el=document.querySelector(`[data-bind="${name}"]`);
    if(el) el.textContent=value||"";
  }

  function renderPreview(statement=""){
    const d=formData();
    bind("incidentTitle",d.incidentTitle);
    bind("dateIncident",d.dateIncident);
    bind("locationIncident",d.locationIncident);
    bind("timeIncident",d.timeIncident);
    bind("flightEtd",d.flightEtd);
    bind("staffNo",d.staffNo);
    bind("staffName",d.staffName);
    bind("staffMob",d.staffMob);
    bind("staffDesignation",d.staffDesignation);
    bind("staffStatement",statement);
    const marks={involved:d.involved,witness:d.witness,injured:d.injured};
    document.querySelectorAll("[data-check]").forEach(el=>{
      el.textContent=marks[el.dataset.check]?"☑":"□";
    });
  }

  async function ocr(){
    const f=$ws("wsReportImage").files[0];
    if(!f)return setStatus("Select the onboard crew report image first.",true);
    if(!window.Tesseract)return setStatus("OCR library is loading. Please try again.",true);
    setStatus("Reading report image…");
    try{
      const result=await Tesseract.recognize(f,"eng",{logger:m=>{
        if(m.status&&typeof m.progress==="number")
          setStatus(`OCR: ${m.status} ${Math.round(m.progress*100)}%`);
      }});
      $ws("wsOcrText").value=result.data.text.trim();
      setStatus("OCR completed. Check the text before generating.");
    }catch(e){setStatus(e.message||"OCR failed.",true);}
  }

  async function generate(){
    const d=formData();
    if(!d.reason)return setStatus("Enter your reason / explanation first.",true);
    setStatus("Preparing the statement…");
    try{
      const file=$ws("wsReportImage").files[0];
      let imageData=null;
      if(file)imageData=await new Promise((resolve,reject)=>{
        const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=reject;r.readAsDataURL(file);
      });
      const res=await fetch(WS_API,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({...d,imageData})
      });
      const p=await res.json();
      if(!res.ok)throw new Error(p.error||"Statement generation failed.");
      $ws("wsStatementDraft").value=p.statement||"";
      renderPreview(p.statement||"");
      setStatus("Statement generated. Review it before printing.");
    }catch(e){setStatus(e.message||"Could not generate the statement.",true);}
  }

  function saveDraft(){
    const d=formData();d.statement=$ws("wsStatementDraft").value||"";
    localStorage.setItem(WS_STORAGE,JSON.stringify(d));
    setStatus("Draft saved on this device.");
  }

  function loadDraft(){
    try{
      const d=JSON.parse(localStorage.getItem(WS_STORAGE)||"null");
      if(!d)return;
      const map={
        wsIncidentTitle:d.incidentTitle,wsDateIncident:d.dateIncident,
        wsLocationIncident:d.locationIncident,wsTimeIncident:d.timeIncident,
        wsFlightEtd:d.flightEtd,wsStaffNo:d.staffNo,wsStaffName:d.staffName,
        wsStaffMob:d.staffMob,wsStaffDesignation:d.staffDesignation,
        wsReason:d.reason,wsOcrText:d.ocrText
      };
      Object.entries(map).forEach(([id,v])=>{if($ws(id)&&v!=null)$ws(id).value=v});
      $ws("wsInvolved").checked=!!d.involved;
      $ws("wsWitness").checked=!!d.witness;
      $ws("wsInjured").checked=!!d.injured;
      $ws("wsStatementDraft").value=d.statement||"";
      renderPreview(d.statement||"");
    }catch{}
  }

  function clearOcr(){$ws("wsOcrText").value="";setStatus("");}
  function newStatement(){
    document.querySelectorAll("#writtenStatementSection input,#writtenStatementSection textarea").forEach(el=>{
      if(el.type==="checkbox")el.checked=false;
      else if(el.type!=="file")el.value="";
    });
    renderPreview("");
    setStatus("");
  }
  function print(){renderPreview($ws("wsStatementDraft").value||"");window.print();}

  window.initWrittenStatementModule=function(){
    if(!$ws("writtenStatementSection"))return;
    if(!$ws("wsStatementDraft")){
      const ta=document.createElement("textarea");
      ta.id="wsStatementDraft";ta.className="hidden";
      $ws("writtenStatementSection").appendChild(ta);
    }
    $ws("wsOcr").onclick=ocr;
    $ws("wsClearOcr").onclick=clearOcr;
    $ws("wsGenerate").onclick=generate;
    $ws("wsSave").onclick=saveDraft;
    $ws("wsPrint").onclick=print;
    $ws("wsNew").onclick=newStatement;
    ["wsIncidentTitle","wsDateIncident","wsLocationIncident","wsTimeIncident","wsFlightEtd",
     "wsStaffNo","wsStaffName","wsStaffMob","wsStaffDesignation","wsInvolved","wsWitness","wsInjured"]
      .forEach(id=>$ws(id)?.addEventListener("input",()=>renderPreview($ws("wsStatementDraft").value||"")));
    loadDraft();renderPreview($ws("wsStatementDraft").value||"");
  };
})();
