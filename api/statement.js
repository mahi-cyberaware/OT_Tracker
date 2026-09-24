// V27: resilient Staff Statement AI
// Provider order: Gemini -> Groq -> Cerebras -> optional OpenAI -> built-in.
// Keep every API key in Vercel Environment Variables. Never expose keys in frontend code.

const INSTRUCTIONS = `
Prepare ONLY the Staff Statement text for a formal workplace written statement.

Rules:
- Use only supplied facts from the form, OCR text, image, and employee explanation.
- Never invent a fact, time, flight number, action, cause, person, or outcome.
- If something is unclear or missing, do not guess.
- Rewrite the employee's simple words into clear, professional, factual English.
- Do not assign blame or make accusations unless the supplied facts explicitly do so.
- Return only the staff statement text, with no title, signature, comments, or form fields.
- The statement MUST begin exactly with: Dear Sir,
- After "Dear Sir," insert exactly one blank line, then begin the factual statement on the third line.
- Do not add any other greeting, heading, salutation, or closing.
`;

function formPrompt(d) {
  return `${INSTRUCTIONS}

FORM DATA:
${JSON.stringify({
  incidentTitle:d.incidentTitle,dateIncident:d.dateIncident,locationIncident:d.locationIncident,
  timeIncident:d.timeIncident,flightEtd:d.flightEtd,staffNo:d.staffNo,staffName:d.staffName,
  staffMob:d.staffMob,staffDesignation:d.staffDesignation,involved:d.involved,witness:d.witness,
  injured:d.injured,employeeReason:d.reason,ocrText:d.ocrText||""
},null,2)}`;
}

function cleanStatement(s) {
  if(typeof s !== "string") return "";
  s = s.trim();
  s = s.replace(/^```(?:text|plain)?\s*/i,"").replace(/\s*```$/,"").trim();
  // Enforce the application's required opening without rewriting factual content.
  if(!/^Dear Sir,\s*/i.test(s)) s = `Dear Sir,\n\n${s}`;
  return s;
}

async function jsonFetch(url, options, timeoutMs=18000) {
  const controller = new AbortController();
  const timer = setTimeout(()=>controller.abort(), timeoutMs);
  try {
    return await fetch(url,{...options,signal:controller.signal});
  } finally { clearTimeout(timer); }
}

async function tryGemini(prompt, imageData) {
  const key=(process.env.GEMINI_API_KEY||"").trim();
  if(!key) throw new Error("Gemini not configured");
  const parts=[{text:prompt}];
  if(imageData && /^data:image\//.test(imageData)){
    const m=imageData.match(/^data:(image\/[^;]+);base64,(.+)$/);
    if(m) parts.push({inlineData:{mimeType:m[1],data:m[2]}});
  }
  const model=process.env.GEMINI_MODEL||"gemini-2.5-flash";
  const r=await jsonFetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,
    {method:"POST",headers:{"Content-Type":"application/json"},
     body:JSON.stringify({contents:[{role:"user",parts}],generationConfig:{temperature:0.2,maxOutputTokens:900}})}
  );
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.error?.message||`Gemini HTTP ${r.status}`);
  const text=data?.candidates?.[0]?.content?.parts?.map(p=>p?.text||"").join("").trim();
  if(!text) throw new Error("Gemini returned no statement");
  return text;
}

async function tryGroq(prompt) {
  const key=(process.env.GROQ_API_KEY||"").trim();
  if(!key) throw new Error("Groq not configured");
  const model=process.env.GROQ_MODEL||"openai/gpt-oss-120b";
  const r=await jsonFetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
    body:JSON.stringify({model,messages:[
      {role:"system",content:INSTRUCTIONS},
      {role:"user",content:prompt}
    ],temperature:0.2,max_completion_tokens:900})
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.error?.message||`Groq HTTP ${r.status}`);
  const text=data?.choices?.[0]?.message?.content?.trim();
  if(!text) throw new Error("Groq returned no statement");
  return text;
}

async function tryCerebras(prompt) {
  const key=(process.env.CEREBRAS_API_KEY||"").trim();
  if(!key) throw new Error("Cerebras not configured");
  const model=process.env.CEREBRAS_MODEL||"gpt-oss-120b";
  const r=await jsonFetch("https://api.cerebras.ai/v1/chat/completions",{
    method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
    body:JSON.stringify({model,messages:[
      {role:"system",content:INSTRUCTIONS},
      {role:"user",content:prompt}
    ],temperature:0.2,max_completion_tokens:900})
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.error?.message||`Cerebras HTTP ${r.status}`);
  const text=data?.choices?.[0]?.message?.content?.trim();
  if(!text) throw new Error("Cerebras returned no statement");
  return text;
}

async function tryOpenAI(prompt, imageData) {
  const key=(process.env.OPENAI_API_KEY||"").trim();
  if(!key) throw new Error("OpenAI not configured");
  const content=[{type:"input_text",text:prompt}];
  if(imageData&&/^data:image\//.test(imageData)) content.push({type:"input_image",image_url:imageData});
  const model=process.env.OPENAI_MODEL||"gpt-5.6-luna";
  const r=await jsonFetch("https://api.openai.com/v1/responses",{
    method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${key}`},
    body:JSON.stringify({model,input:[{role:"user",content}],max_output_tokens:900})
  });
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data?.error?.message||`OpenAI HTTP ${r.status}`);
  const text=data?.output_text?.trim() ||
    (Array.isArray(data?.output)?data.output.flatMap(i=>Array.isArray(i?.content)?i.content:[])
      .filter(p=>p?.type==="output_text").map(p=>p.text).join("\n").trim():"");
  if(!text) throw new Error("OpenAI returned no statement");
  return text;
}

// Deterministic fallback: no API, no credits, no internet required.
function builtInStatement(d) {
  const clean=v=>typeof v==="string"?v.trim():"";
  const reason=clean(d.reason);
  if(!reason) return "";
  const lines=[];
  lines.push("Dear Sir,");
  lines.push("");
  lines.push(reason.replace(/\s+/g," ").trim());
  return lines.join("\n");
}

export default async function handler(req,res){
  if(req.method==="GET"){
    return res.status(200).json({
      ok:true,
      providers:{
        gemini:!!process.env.GEMINI_API_KEY,
        groq:!!process.env.GROQ_API_KEY,
        cerebras:!!process.env.CEREBRAS_API_KEY,
        openai:!!process.env.OPENAI_API_KEY,
        builtIn:true
      }
    });
  }
  if(req.method!=="POST") return res.status(405).json({error:"Method not allowed"});

  try{
    const d=req.body||{};
    if(!d.reason?.trim()) return res.status(400).json({error:"Reason / explanation is required."});
    const prompt=formPrompt(d);
    const attempts=[
      ["Gemini",()=>tryGemini(prompt,d.imageData)],
      ["Groq",()=>tryGroq(prompt)],
      ["Cerebras",()=>tryCerebras(prompt)],
      ["OpenAI",()=>tryOpenAI(prompt,d.imageData)]
    ];
    const failures=[];
    for(const [provider,fn] of attempts){
      try{
        const statement=cleanStatement(await fn());
        if(statement) return res.status(200).json({statement,provider});
      }catch(e){
        failures.push(`${provider}: ${e?.message||"request failed"}`);
      }
    }
    const fallback=cleanStatement(builtInStatement(d));
    if(fallback){
      console.warn("All external AI providers failed; using built-in fallback.",failures);
      return res.status(200).json({statement:fallback,provider:"Built-in"});
    }
    return res.status(502).json({error:"Unable to generate a statement. Please check the explanation field."});
  }catch(e){
    return res.status(500).json({error:e?.message||"Server error"});
  }
}
