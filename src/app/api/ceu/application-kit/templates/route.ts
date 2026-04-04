import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

const PARTICIPANT_EVALUATION_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Participant Evaluation Form</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #231F20; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    h2 { font-size: 18px; color: #444; margin-top: 24px; }
    .header { text-align: center; border-bottom: 2px solid #8FBDA3; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { color: #8FBDA3; font-weight: 600; }
    .field { margin: 12px 0; }
    .field label { display: block; font-weight: 600; margin-bottom: 4px; }
    .field .line { border-bottom: 1px solid #999; height: 28px; }
    .question { margin: 16px 0; padding: 12px; background: #f8f8f7; border-radius: 6px; }
    .question p { margin: 0 0 8px 0; font-weight: 600; }
    .options { display: flex; gap: 24px; flex-wrap: wrap; }
    .options label { font-weight: normal; display: flex; align-items: center; gap: 6px; }
    .rating-scale { display: flex; gap: 12px; align-items: center; margin-top: 4px; }
    .rating-scale span { font-size: 12px; color: #666; }
    .required-section { border: 2px solid #8FBDA3; border-radius: 8px; padding: 20px; margin: 24px 0; }
    .required-section h2 { color: #8FBDA3; margin-top: 0; }
    textarea { width: 100%; min-height: 60px; border: 1px solid #ccc; border-radius: 4px; padding: 8px; font-family: inherit; }
  </style>
</head>
<body>
  <div class="header">
    <h1><span class="brand">SIDELINE</span> by Dr. Joey Glenn</h1>
    <p>Participant Course Evaluation Form</p>
  </div>

  <div class="field">
    <label>Course Title:</label>
    <div class="line"></div>
  </div>
  <div class="field">
    <label>Course Date:</label>
    <div class="line"></div>
  </div>
  <div class="field">
    <label>Speaker:</label>
    <div class="line"></div>
  </div>

  <div class="required-section">
    <h2>Required CPTA Evaluation Questions</h2>

    <div class="question">
      <p>1. Were the course objectives met?</p>
      <div class="options">
        <label><input type="radio" name="q1" value="yes"> Yes</label>
        <label><input type="radio" name="q1" value="partially"> Partially</label>
        <label><input type="radio" name="q1" value="no"> No</label>
      </div>
    </div>

    <div class="question">
      <p>2. Was evidence provided to substantiate material presented?</p>
      <div class="options">
        <label><input type="radio" name="q2" value="yes"> Yes</label>
        <label><input type="radio" name="q2" value="partially"> Partially</label>
        <label><input type="radio" name="q2" value="no"> No</label>
      </div>
    </div>

    <div class="question">
      <p>3. Were personal experience and observation the primary source of information?</p>
      <div class="options">
        <label><input type="radio" name="q3" value="yes"> Yes</label>
        <label><input type="radio" name="q3" value="no"> No</label>
      </div>
    </div>

    <div class="question">
      <p>4. Was a commercial product promoted?</p>
      <div class="options">
        <label><input type="radio" name="q4" value="yes"> Yes</label>
        <label><input type="radio" name="q4" value="no"> No</label>
      </div>
    </div>

    <div class="question">
      <p>5. If yes, did you feel that product promotion was the sole purpose of the course?</p>
      <div class="options">
        <label><input type="radio" name="q5" value="yes"> Yes</label>
        <label><input type="radio" name="q5" value="no"> No</label>
        <label><input type="radio" name="q5" value="na"> N/A</label>
      </div>
    </div>
  </div>

  <h2>Additional Evaluation</h2>

  <div class="question">
    <p>6. The speaker demonstrated expertise in the subject matter.</p>
    <div class="rating-scale">
      <span>Strongly Disagree</span>
      <label><input type="radio" name="q6" value="1"> 1</label>
      <label><input type="radio" name="q6" value="2"> 2</label>
      <label><input type="radio" name="q6" value="3"> 3</label>
      <label><input type="radio" name="q6" value="4"> 4</label>
      <label><input type="radio" name="q6" value="5"> 5</label>
      <span>Strongly Agree</span>
    </div>
  </div>

  <div class="question">
    <p>7. The speaker was effective in presenting the material.</p>
    <div class="rating-scale">
      <span>Strongly Disagree</span>
      <label><input type="radio" name="q7" value="1"> 1</label>
      <label><input type="radio" name="q7" value="2"> 2</label>
      <label><input type="radio" name="q7" value="3"> 3</label>
      <label><input type="radio" name="q7" value="4"> 4</label>
      <label><input type="radio" name="q7" value="5"> 5</label>
      <span>Strongly Agree</span>
    </div>
  </div>

  <div class="question">
    <p>8. The course content was relevant to my clinical practice.</p>
    <div class="rating-scale">
      <span>Strongly Disagree</span>
      <label><input type="radio" name="q8" value="1"> 1</label>
      <label><input type="radio" name="q8" value="2"> 2</label>
      <label><input type="radio" name="q8" value="3"> 3</label>
      <label><input type="radio" name="q8" value="4"> 4</label>
      <label><input type="radio" name="q8" value="5"> 5</label>
      <span>Strongly Agree</span>
    </div>
  </div>

  <div class="question">
    <p>9. The hands-on lab component enhanced my understanding of the material.</p>
    <div class="rating-scale">
      <span>Strongly Disagree</span>
      <label><input type="radio" name="q9" value="1"> 1</label>
      <label><input type="radio" name="q9" value="2"> 2</label>
      <label><input type="radio" name="q9" value="3"> 3</label>
      <label><input type="radio" name="q9" value="4"> 4</label>
      <label><input type="radio" name="q9" value="5"> 5</label>
      <span>Strongly Agree</span>
    </div>
  </div>

  <div class="question">
    <p>10. I would recommend this course to a colleague.</p>
    <div class="options">
      <label><input type="radio" name="q10" value="yes"> Yes</label>
      <label><input type="radio" name="q10" value="no"> No</label>
    </div>
  </div>

  <div class="question">
    <p>11. Overall course rating:</p>
    <div class="rating-scale">
      <span>Poor</span>
      <label><input type="radio" name="q11" value="1"> 1</label>
      <label><input type="radio" name="q11" value="2"> 2</label>
      <label><input type="radio" name="q11" value="3"> 3</label>
      <label><input type="radio" name="q11" value="4"> 4</label>
      <label><input type="radio" name="q11" value="5"> 5</label>
      <span>Excellent</span>
    </div>
  </div>

  <div class="question">
    <p>12. What topics would you like to see in future continuing education courses?</p>
    <textarea placeholder="Your response..."></textarea>
  </div>

  <div class="question">
    <p>13. Additional comments or suggestions:</p>
    <textarea placeholder="Your response..."></textarea>
  </div>

  <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #ccc;">
    <p style="font-size: 12px; color: #888;">Thank you for completing this evaluation. Your feedback helps us improve our continuing education offerings.</p>
  </div>
</body>
</html>`;

const RELEASE_OF_LIABILITY_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Release of Liability Form</title>
  <style>
    body { font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #231F20; line-height: 1.6; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .header { text-align: center; border-bottom: 2px solid #8FBDA3; padding-bottom: 16px; margin-bottom: 24px; }
    .brand { color: #8FBDA3; font-weight: 600; }
    .field { margin: 16px 0; }
    .field label { display: block; font-weight: 600; margin-bottom: 4px; font-size: 14px; color: #666; }
    .field .line { border-bottom: 1px solid #999; height: 28px; }
    .content { margin: 24px 0; }
    .content p { margin: 12px 0; }
    .signature-block { margin-top: 48px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .sig-field { border-top: 1px solid #333; padding-top: 8px; }
    .sig-field p { margin: 0; font-size: 14px; color: #666; }
    .important { background: #fff3cd; border: 1px solid #ffc107; border-radius: 6px; padding: 16px; margin: 24px 0; }
    .important p { margin: 0; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <h1><span class="brand">SIDELINE</span> by Dr. Joey Glenn</h1>
    <p>Release of Liability &mdash; Hands-On Lab Participation</p>
  </div>

  <div class="field">
    <label>Course Provider:</label>
    <div style="height: 28px; font-weight: 500;">SIDELINE by Dr. Joey Glenn, DC, CSCS</div>
  </div>

  <div class="field">
    <label>Course Title:</label>
    <div class="line"></div>
  </div>

  <div class="field">
    <label>Course Date:</label>
    <div class="line"></div>
  </div>

  <div class="field">
    <label>Course Location:</label>
    <div class="line"></div>
  </div>

  <div class="field">
    <label>Speaker:</label>
    <div class="line"></div>
  </div>

  <div class="field">
    <label>Lab Assistant(s):</label>
    <div class="line"></div>
  </div>

  <div class="content">
    <p>I, the undersigned participant, understand that this continuing education course includes hands-on laboratory components in which attendees will practice clinical techniques on one another under the supervision of the course instructor and lab assistant(s).</p>

    <p>I voluntarily agree to participate in the hands-on laboratory portions of this course. I understand that:</p>

    <ul>
      <li>The techniques demonstrated and practiced are for educational purposes and are performed under supervised conditions.</li>
      <li>I may be the person demonstrating a technique or the person upon whom a technique is being demonstrated.</li>
      <li><strong>I may cease my participation as the person being demonstrated upon at any time, for any reason, without penalty or consequence to my course completion status.</strong></li>
      <li>If I experience any discomfort during a demonstration or practice session, I will immediately notify the instructor or lab assistant.</li>
      <li>I will inform the instructor of any pre-existing conditions, injuries, or limitations that may affect my participation prior to the start of lab activities.</li>
    </ul>

    <div class="important">
      <p>IMPORTANT: Any participant acting as the person upon whom a technique is being demonstrated may withdraw from that role at any time. Participation as a demonstration subject is entirely voluntary.</p>
    </div>

    <p>I hereby release and hold harmless SIDELINE by Dr. Joey Glenn, DC, CSCS, the course instructor(s), lab assistant(s), and the host facility from any claims, damages, or liability arising from my participation in the hands-on laboratory components of this course, except in cases of gross negligence or willful misconduct.</p>

    <p>I have read this release of liability form, understand its contents, and sign it voluntarily.</p>
  </div>

  <div class="signature-block">
    <div>
      <div style="height: 48px;"></div>
      <div class="sig-field">
        <p>Participant Name (Print)</p>
      </div>
    </div>
    <div>
      <div style="height: 48px;"></div>
      <div class="sig-field">
        <p>Credentials / License Number</p>
      </div>
    </div>
    <div>
      <div style="height: 48px;"></div>
      <div class="sig-field">
        <p>Participant Signature</p>
      </div>
    </div>
    <div>
      <div style="height: 48px;"></div>
      <div class="sig-field">
        <p>Date</p>
      </div>
    </div>
  </div>

  <div style="margin-top: 48px; padding-top: 16px; border-top: 1px solid #ccc;">
    <p style="font-size: 11px; color: #888;">SIDELINE by Dr. Joey Glenn, DC, CSCS &bull; Continuing Education Provider</p>
  </div>
</body>
</html>`;

const CERTIFICATE_OF_COMPLETION_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Certificate of Completion</title>
  <style>
    @page { size: landscape; margin: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
    .certificate { width: 900px; padding: 60px; background: white; border: 3px solid #8FBDA3; position: relative; text-align: center; }
    .certificate::before { content: ''; position: absolute; top: 8px; left: 8px; right: 8px; bottom: 8px; border: 1px solid #8FBDA3; pointer-events: none; }
    .brand { color: #8FBDA3; font-size: 14px; letter-spacing: 4px; text-transform: uppercase; font-weight: 600; }
    h1 { font-size: 36px; color: #231F20; margin: 20px 0 8px; }
    .subtitle { font-size: 16px; color: #666; margin-bottom: 32px; }
    .recipient { font-size: 28px; color: #231F20; margin: 24px 0; border-bottom: 2px solid #8FBDA3; display: inline-block; padding: 8px 48px; min-width: 400px; }
    .course-title { font-size: 20px; color: #231F20; font-weight: 600; margin: 16px 0 8px; }
    .details { font-size: 14px; color: #444; margin: 8px 0; }
    .ceu-info { background: #f8faf9; border: 1px solid #8FBDA3; border-radius: 8px; display: inline-block; padding: 12px 32px; margin: 20px 0; }
    .ceu-info .hours { font-size: 24px; font-weight: 700; color: #8FBDA3; }
    .ceu-info .label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
    .approval { font-size: 13px; color: #666; font-style: italic; margin: 12px 0; }
    .footer { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-top: 40px; text-align: center; }
    .footer .sig-line { border-top: 1px solid #333; padding-top: 8px; margin-top: 48px; }
    .footer .sig-name { font-weight: 600; font-size: 14px; }
    .footer .sig-title { font-size: 12px; color: #666; }
    .provider-info { margin-top: 24px; font-size: 11px; color: #888; }
  </style>
</head>
<body>
  <div class="certificate">
    <div class="brand">SIDELINE</div>
    <h1>Certificate of Completion</h1>
    <p class="subtitle">Continuing Education</p>

    <p class="details">This certifies that</p>
    <div class="recipient">[Participant Name]</div>

    <p class="details">has successfully completed the continuing education course</p>
    <p class="course-title">[Course Title]</p>

    <p class="details">presented on <strong>[Course Date(s)]</strong></p>

    <div class="ceu-info">
      <div class="hours">[XX]</div>
      <div class="label">Contact Hours / CEUs Earned</div>
    </div>

    <p class="approval">This course has been approved for [xx] CEUs by CPTA #[xx-xxx]</p>

    <div class="footer">
      <div>
        <div class="sig-line">
          <div class="sig-name">Dr. Joey Glenn, DC, CSCS</div>
          <div class="sig-title">Course Provider &bull; SIDELINE</div>
        </div>
      </div>
      <div>
        <div class="sig-line">
          <div class="sig-name">Date Issued</div>
          <div class="sig-title">[Date]</div>
        </div>
      </div>
    </div>

    <div class="provider-info">
      <p>Course Provider: SIDELINE by Dr. Joey Glenn, DC, CSCS</p>
    </div>
  </div>
</body>
</html>`;

const TEMPLATES: Record<string, { title: string; html: string; tag: string; type: string }> = {
  "participant-evaluation": {
    title: "Participant Evaluation Form (CPTA Template)",
    html: PARTICIPANT_EVALUATION_HTML,
    tag: "participant-evaluation",
    type: "OTHER",
  },
  "release-of-liability": {
    title: "Release of Liability Form (Hands-On Lab)",
    html: RELEASE_OF_LIABILITY_HTML,
    tag: "release-of-liability",
    type: "OTHER",
  },
  "certificate-template": {
    title: "Certificate of Completion Template",
    html: CERTIFICATE_OF_COMPLETION_HTML,
    tag: "certificate-template",
    type: "CERTIFICATE_TEMPLATE",
  },
};

export async function POST(req: Request) {
  const { templateType } = await req.json();

  const template = TEMPLATES[templateType];
  if (!template) {
    return NextResponse.json({ error: "Unknown template type" }, { status: 400 });
  }

  // Check if this template material already exists
  const existing = await prisma.material.findFirst({
    where: {
      tags: { hasEvery: ["ceu-kit", "template", template.tag] },
      courseId: null,
    },
  });

  if (existing) {
    // Update existing
    const updated = await prisma.material.update({
      where: { id: existing.id },
      data: {
        title: template.title,
        type: template.type as "OTHER" | "CERTIFICATE_TEMPLATE",
        fileUrl: `data:text/html;base64,${Buffer.from(template.html).toString("base64")}`,
        fileSize: template.html.length,
        mimeType: "text/html",
        isTemplate: true,
      },
    });
    return NextResponse.json(updated);
  }

  // Create new material entry
  const material = await prisma.material.create({
    data: {
      title: template.title,
      type: template.type as "OTHER" | "CERTIFICATE_TEMPLATE",
      fileUrl: `data:text/html;base64,${Buffer.from(template.html).toString("base64")}`,
      fileSize: template.html.length,
      mimeType: "text/html",
      version: "v1.0",
      tags: ["ceu-kit", "template", template.tag],
      isTemplate: true,
    },
  });

  return NextResponse.json(material, { status: 201 });
}
