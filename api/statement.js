// WorkTrack V23 — Written Statement AI Generator
// Vercel Serverless Function
//
// IMPORTANT:
// OPENAI_API_KEY must be stored in Vercel Environment Variables.
// Never put the API key in index.html or browser JavaScript.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const {
      incidentTitle,
      dateIncident,
      locationIncident,
      timeIncident,
      flightEtd,
      staffNo,
      staffName,
      staffMob,
      staffDesignation,
      involved,
      witness,
      injured,
      reason,
      ocrText,
      imageData
    } = req.body || {};

    if (!reason || !reason.trim()) {
      return res.status(400).json({
        error: "Reason / explanation is required."
      });
    }

    const instructions = `
You are helping prepare a formal workplace Written Statement.

Your job is to convert the employee's simple explanation into a clear,
professional and factual Staff Statement.

STRICT RULES:

1. Use ONLY information supplied in the form, OCR text, image and employee explanation.
2. NEVER invent facts.
3. NEVER invent names, times, flight numbers, locations, actions, causes or outcomes.
4. Do not guess missing information.
5. Do not exaggerate.
6. Do not add accusations or blame unless the supplied information explicitly states them.
7. Preserve the actual meaning of the employee's explanation.
8. Write professional workplace English.
9. The statement should explain what happened, what the staff member knew/did,
   and any relevant reason supplied by the employee.
10. If information is uncertain, use neutral wording instead of guessing.
11. Return ONLY the Staff Statement.
12. Do not return a heading.
13. Do not return signatures.
14. Do not return Duty Officer comments.
15. Do not return analysis or explanations.

The final text will be placed inside the STAFF STATEMENT section
of the official company Written Statement form.
`;

    const formInformation = {
      incidentTitle: incidentTitle || "",
      dateIncident: dateIncident || "",
      locationIncident: locationIncident || "",
      timeIncident: timeIncident || "",
      flightEtd: flightEtd || "",
      staffNo: staffNo || "",
      staffName: staffName || "",
      staffMob: staffMob || "",
      staffDesignation: staffDesignation || "",
      involvement: {
        involved: !!involved,
        witness: !!witness,
        injuredParty: !!injured
      },
      employeeReason: reason.trim(),
      onboardCrewReportOCR: ocrText || ""
    };

    const content = [
      {
        type: "input_text",
        text:
          instructions +
          "\n\nSUPPLIED INFORMATION:\n" +
          JSON.stringify(formInformation, null, 2)
      }
    ];

    // If the user uploaded the onboard crew report,
    // allow the AI to inspect the original image as well.
    if (
      imageData &&
      typeof imageData === "string" &&
      imageData.startsWith("data:image/")
    ) {
      content.push({
        type: "input_image",
        image_url: imageData
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-5.6-luna",

          input: [
            {
              role: "user",
              content
            }
          ],

          max_output_tokens: 1200
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error:
          data?.error?.message ||
          "OpenAI request failed."
      });
    }

    const statement =
      data?.output_text?.trim() || "";

    if (!statement) {
      return res.status(502).json({
        error: "No statement was returned by the AI."
      });
    }

    return res.status(200).json({
      statement
    });

  } catch (error) {

    console.error("Written Statement API error:", error);

    return res.status(500).json({
      error:
        error?.message ||
        "Internal server error."
    });
  }
        }
