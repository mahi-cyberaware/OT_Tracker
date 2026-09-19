// Vercel Serverless Function: /api/statement
// Keep OPENAI_API_KEY only in Vercel Environment Variables.

export default async function handler(req,res){
  // Safe health check: never returns the secret itself.
  if(req.method==="GET")return res.status(200).json({ok:true,openaiConfigured:!!process.env.OPENAI_API_KEY});
  if(req.method!=="POST")return res.status(405).json({error:"Method not allowed"});
  try{
    const apiKey=(process.env.OPENAI_API_KEY||"").trim();
    if(!apiKey){
      return res.status(500).json({error:"OPENAI_API_KEY is not configured for this Vercel deployment. Enable OPENAI_API_KEY for the Vercel environment serving this request and redeploy."});
    }
    const {
      incidentTitle,dateIncident,locationIncident,timeIncident,flightEtd,
      staffNo,staffName,staffMob,staffDesignation,involved,witness,injured,
      reason,ocrText,imageData
    }=req.body||{};
    if(!reason?.trim())return res.status(400).json({error:"Reason / explanation is required."});

    const instructions=`
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

    const content=[{
      type:"input_text",
      text:`${instructions}\n\nFORM DATA:\n${JSON.stringify({
        incidentTitle,dateIncident,locationIncident,timeIncident,flightEtd,
        staffNo,staffName,staffMob,staffDesignation,involved,witness,injured,
        employeeReason:reason,ocrText:ocrText||""
      },null,2)}`
    }];

    if(imageData&&/^data:image\//.test(imageData))
      content.push({type:"input_image",image_url:imageData});

    const response=await fetch("https://api.openai.com/v1/responses",{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        "Authorization":`Bearer ${apiKey}`
      },
      body:JSON.stringify({
        model:"gpt-5.6-luna",
        input:[{role:"user",content}],
        max_output_tokens:900
      })
    });

    const data=await response.json();
    if(!response.ok){
      const apiMessage=data?.error?.message||"AI request failed.";
      if(response.status===401){
        return res.status(502).json({error:"OpenAI rejected the API key. Check OPENAI_API_KEY in the Vercel environment serving this request and redeploy."});
      }
      return res.status(response.status).json({error:apiMessage});
    }
    const statement=(
      data?.output_text?.trim() ||
      (Array.isArray(data?.output)?data.output.flatMap(item=>Array.isArray(item?.content)?item.content:[])
        .filter(part=>part?.type==="output_text" && typeof part?.text==="string")
        .map(part=>part.text).join("\n").trim():"")
    );
    if(!statement){
      console.error("OpenAI response contained no output text", JSON.stringify({id:data?.id,status:data?.status,outputTypes:Array.isArray(data?.output)?data.output.map(x=>x?.type):[]}));
      return res.status(502).json({error:"OpenAI returned no statement text. Please try again."});
    }
    return res.status(200).json({statement});
  }catch(e){
    return res.status(500).json({error:e?.message||"Server error"});
  }
}
