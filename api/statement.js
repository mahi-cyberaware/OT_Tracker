// WorkTrack V27 - resilient Staff Statement generator.
// Provider order: Gemini -> Groq -> Cerebras -> OpenAI -> built-in fallback.
// All API keys stay server-side in Vercel Environment Variables.

const INSTRUCTIONS = `
Prepare ONLY the employee's factual explanation/answer body for a formal workplace written statement.

Operational context:
- The OCR text is the onboard report/questioning/complaint. Treat it as the issue that the employee is responding to.
- The employee explanation (reason) is the employee's answer. Use it as the factual source for the response.
- The location controls the mandatory opening sentence, which the server will add separately. Do NOT write the opening sentence yourself.

Rules:
- Use only supplied facts from the form, OCR text, and employee explanation.
- Never invent a fact, time, flight number, action, cause, person, or outcome.
- If something is unclear or missing, do not guess.
- Rewrite the employee's simple words into clear, professional, factual English.
- Directly address the points raised in the OCR/questioning/complaint using the employee explanation as the answer.
- Do not assign blame or make accusations unless the supplied facts explicitly do so.
- Return ONLY the explanation/answer body. Do not return Dear Sir, the opening sentence, Staff Statement, Answer, Question, Complaint, Subject, Opening, Regards, Sincerely, Thank you, Yours faithfully, Yours sincerely, Signature, Name, Date, or any heading.
- Do not repeat the incident details unless they are necessary to explain the answer.
- Keep the wording concise and suitable for a company written statement.
`

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

function extractFlightNumber(value=''){
  const text=String(value||'').trim();
  const match=text.match(/\b[A-Z]{2}\s?\d{3,4}\b/i);
  return match?match[0].replace(/\s+/g,'').toUpperCase():text;
}

function buildOpening(body={}){
  const flight=extractFlightNumber(body.flightEtd)||'the flight';
  const location=String(body.locationIncident||'').trim().toLowerCase();
  if(/\bbase\b/.test(location))return `I was allocated for the ${flight} base catering check.`;
  if(/\bramp\b/.test(location))return `I was allocated for the ${flight} handling on the RAMP.`;
  const rawLocation=String(body.locationIncident||'').trim();
  return rawLocation
    ? `I was allocated for the ${flight} handling at ${rawLocation}.`
    : `I was allocated for the ${flight} handling.`;
}

function cleanAnswer(value=''){
  let text=String(value||'').replace(/\r\n?/g,'\n').trim();
  text=text.replace(/^```(?:text)?\s*/i,'').replace(/\s*```$/,'').trim();
  text=text.replace(/^Dear\s+Sir\s*[,.:]?\s*/i,'').trim();
  text=text.replace(/^(?:Staff\s+Statement|Answer|Response|Explanation)\s*[:\-]?\s*/i,'').trim();
  text=text.replace(/^I\s+was\s+allocated\s+for\b[^.!?]*[.!?]\s*/i,'').trim();
  return text;
}

function normalizeStatement(value='',body={}){
  const answer=cleanAnswer(value);
  if(!answer)return `Dear Sir,\n\n${buildOpening(body)}`;
  return `Dear Sir,\n\n${buildOpening(body)}\n\n${answer}`;
}

function builtInStatement(body){
  const reason=String(body?.reason||'').trim().replace(/\s+/g,' ');
  if(!reason)return '';
  return normalizeStatement(reason,body);
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
  return cleanAnswer(text);
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
  return cleanAnswer(text);
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
  return cleanAnswer(text);
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
        const answer=await call();
        if(answer)return res.status(200).json({statement:normalizeStatement(answer,body),provider:name,attempts});
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
