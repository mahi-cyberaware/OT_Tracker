// WorkTrack V27 - resilient Staff Statement generator.
// Provider order: Gemini -> Groq -> Cerebras -> OpenAI -> built-in fallback.
// All API keys stay server-side in Vercel Environment Variables.

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

function formPrompt(body) {
  const {
    incidentTitle,dateIncident,locationIncident,timeIncident,flightEtd,
    staffNo,staffName,staffMob,staffDesignation,involved,witness,injured,
    reason,ocrText
  } = body || {};
  return `${INSTRUCTIONS}\n\nFORM DATA:\n${JSON.stringify({
    incidentTitle,dateIncident,locationIncident,timeIncident,flightEtd,
    staffNo,staffName,staffMob,staffDesignation,involved,witness,injured,
    employeeReason:reason,ocrText:ocrText||''
  },null,2)}`;
}

function normalizeStatement(value='') {
  let text=String(value||'').replace(/\r\n?/g,'\n').trim();
  text=text.replace(/^```(?:text)?\s*/i,'').replace(/\s*```$/,'').trim();
  text=text.replace(/^Dear\s+Sir\s*[,.:]?\s*/i,'').trim();
  if(!text)return '';
  return `Dear Sir,\n\n${text}`;
}

function builtInStatement(body) {
  const reason=String(body?.reason||'').trim().replace(/\s+/g,' ');
  if(!reason)return '';
  let factual=reason;
  if(!/^[iI]\b/.test(factual)) factual=`I would like to state that ${factual.charAt(0).toLowerCase()}${factual.slice(1)}`;
  if(!/[.!?]$/.test(factual))factual+='.';
  return normalizeStatement(factual);
}

async function readJson(response){
  try{return await response.json()}catch{return {}};
}

function providerError(name,response,data){
  const msg=data?.error?.message||data?.error?.status||data?.message||`${name} request failed (${response.status}).`;
  const err=new Error(msg);err.provider=name;err.status=response.status;return err;
}

async function callGemini(apiKey,prompt,imageData){
  const parts=[{text:prompt}];
  if(imageData && /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(imageData)){
    const match=imageData.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/i);
    if(match)parts.push({inline_data:{mime_type:match[1],data:match[2]}});
  }
  const response=await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key='+encodeURIComponent(apiKey),{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({contents:[{role:'user',parts}],generationConfig:{temperature:0.2,maxOutputTokens:900}})
  });
  const data=await readJson(response);
  if(!response.ok)throw providerError('Gemini',response,data);
  const text=data?.candidates?.[0]?.content?.parts?.map(p=>p?.text||'').join('\n').trim()||'';
  if(!text)throw new Error('Gemini returned no statement text.');
  return normalizeStatement(text);
}

async function callOpenAI(apiKey,prompt,imageData){
  const content=[{type:'input_text',text:prompt}];
  if(imageData && /^data:image\//.test(imageData))content.push({type:'input_image',image_url:imageData,detail:'low'});
  const response=await fetch('https://api.openai.com/v1/responses',{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body:JSON.stringify({model:'gpt-5-mini',input:[{role:'user',content}],max_output_tokens:900})
  });
  const data=await readJson(response);
  if(!response.ok)throw providerError('OpenAI',response,data);
  const text=data?.output_text?.trim() || (Array.isArray(data?.output)?data.output.flatMap(item=>Array.isArray(item?.content)?item.content:[]).filter(part=>part?.type==='output_text'&&typeof part?.text==='string').map(part=>part.text).join('\n').trim():'');
  if(!text)throw new Error('OpenAI returned no statement text.');
  return normalizeStatement(text);
}

async function callCompatibleProvider(name,apiKey,url,model,prompt){
  const response=await fetch(url,{
    method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
    body:JSON.stringify({model,messages:[{role:'system',content:INSTRUCTIONS},{role:'user',content:prompt}],temperature:0.2,max_tokens:900})
  });
  const data=await readJson(response);
  if(!response.ok)throw providerError(name,response,data);
  const text=data?.choices?.[0]?.message?.content?.trim()||'';
  if(!text)throw new Error(`${name} returned no statement text.`);
  return normalizeStatement(text);
}

export default async function handler(req,res){
  if(req.method==='GET')return res.status(200).json({
    ok:true,
    configured:{
      gemini:!!process.env.GEMINI_API_KEY,
      groq:!!process.env.GROQ_API_KEY,
      cerebras:!!process.env.CEREBRAS_API_KEY,
      openai:!!process.env.OPENAI_API_KEY
    },
    fallback:'built-in'
  });
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});

  try{
    const body=req.body||{};
    if(!String(body.reason||'').trim())return res.status(400).json({error:'Reason / explanation is required.'});
    const prompt=formPrompt(body);
    const attempts=[];

    const providers=[
      ['Gemini',process.env.GEMINI_API_KEY,()=>callGemini(process.env.GEMINI_API_KEY.trim(),prompt,body.imageData)],
      ['Groq',process.env.GROQ_API_KEY,()=>callCompatibleProvider('Groq',process.env.GROQ_API_KEY.trim(),'https://api.groq.com/openai/v1/chat/completions','openai/gpt-oss-20b',prompt)],
      ['Cerebras',process.env.CEREBRAS_API_KEY,()=>callCompatibleProvider('Cerebras',process.env.CEREBRAS_API_KEY.trim(),'https://api.cerebras.ai/v1/chat/completions','gpt-oss-120b',prompt)],
      ['OpenAI',process.env.OPENAI_API_KEY,()=>callOpenAI(process.env.OPENAI_API_KEY.trim(),prompt,body.imageData)]
    ];

    for(const [name,key,call] of providers){
      if(!String(key||'').trim()){attempts.push(`${name}: not configured`);continue;}
      try{
        const statement=await call();
        if(statement)return res.status(200).json({statement,provider:name,attempts});
        attempts.push(`${name}: empty response`);
      }catch(err){
        console.error(`WorkTrack ${name} statement provider failed`,err?.message||err);
        attempts.push(`${name}: unavailable`);
      }
    }

    const fallback=builtInStatement(body);
    if(fallback)return res.status(200).json({statement:fallback,provider:'Built-in',attempts});
    return res.status(500).json({error:'Could not generate a statement. Enter your explanation and try again.',provider:'none',attempts});
  }catch(e){
    console.error('WorkTrack statement handler error',e);
    const fallback=builtInStatement(req.body||{});
    if(fallback)return res.status(200).json({statement:fallback,provider:'Built-in'});
    return res.status(500).json({error:e?.message||'Server error'});
  }
}
