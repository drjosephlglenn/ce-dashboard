const baseStyle = `
  body { margin: 0; padding: 0; background-color: #1a1a2e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .container { max-width: 600px; margin: 0 auto; background-color: #16213e; border-radius: 8px; overflow: hidden; }
  .header { background-color: #0f3460; padding: 24px; text-align: center; }
  .header h1 { color: #a8e6cf; margin: 0; font-size: 24px; letter-spacing: 2px; }
  .body { padding: 32px 24px; color: #e0e0e0; line-height: 1.6; }
  .body h2 { color: #a8e6cf; margin-top: 0; }
  .detail { background-color: #1a1a2e; border-left: 3px solid #a8e6cf; padding: 12px 16px; margin: 16px 0; border-radius: 0 4px 4px 0; }
  .detail p { margin: 4px 0; color: #c0c0c0; }
  .detail strong { color: #ffffff; }
  .cta { display: inline-block; background-color: #a8e6cf; color: #1a1a2e; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: 600; margin-top: 16px; }
  .footer { padding: 16px 24px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #0f3460; }
`;

function wrap(content: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>${baseStyle}</style></head>
<body><div class="container">
  <div class="header"><h1>SIDELINE</h1></div>
  ${content}
  <div class="footer">SIDELINE &mdash; Continuing Education by Dr. Joey Glenn<br/>This is an automated message.</div>
</div></body>
</html>`;
}

export function bookingConfirmation({
  clinicName,
  courseTitle,
  eventDate,
  contactName,
}: {
  clinicName: string;
  courseTitle: string;
  eventDate: string;
  contactName: string;
}): { subject: string; html: string } {
  return {
    subject: `Booking Confirmed: ${courseTitle} at ${clinicName}`,
    html: wrap(`
      <div class="body">
        <h2>Booking Confirmed!</h2>
        <p>Hi ${contactName},</p>
        <p>Great news! Your continuing education course has been confirmed.</p>
        <div class="detail">
          <p><strong>Course:</strong> ${courseTitle}</p>
          <p><strong>Clinic:</strong> ${clinicName}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
        </div>
        <p>We'll send additional details and materials as the date approaches. If you have any questions, feel free to reach out.</p>
      </div>
    `),
  };
}

export function postCourseThankYou({
  contactName,
  courseTitle,
  eventDate,
}: {
  contactName: string;
  courseTitle: string;
  eventDate: string;
}): { subject: string; html: string } {
  return {
    subject: `Thank You - ${courseTitle}`,
    html: wrap(`
      <div class="body">
        <h2>Thank You!</h2>
        <p>Hi ${contactName},</p>
        <p>Thank you for hosting <strong>${courseTitle}</strong> on ${eventDate}. It was a great session and we appreciate the opportunity to work with your team.</p>
        <p>We'd love to hear your feedback and discuss upcoming opportunities. If you're interested in rebooking or exploring other courses, just let us know.</p>
      </div>
    `),
  };
}

export function followUpReminder({
  contactName,
  clinicName,
  courseTitle,
}: {
  contactName: string;
  clinicName: string;
  courseTitle: string;
}): { subject: string; html: string } {
  return {
    subject: `Following Up: ${courseTitle} for ${clinicName}`,
    html: wrap(`
      <div class="body">
        <h2>Just Checking In</h2>
        <p>Hi ${contactName},</p>
        <p>I wanted to follow up regarding <strong>${courseTitle}</strong> for ${clinicName}. We'd love to get this on the calendar for your team.</p>
        <p>If you have any questions about the course content, scheduling, or pricing, I'm happy to help.</p>
        <p>Looking forward to hearing from you!</p>
      </div>
    `),
  };
}

export function registrationConfirmation({
  attendeeName,
  courseTitle,
  eventDate,
  clinicName,
}: {
  attendeeName: string;
  courseTitle: string;
  eventDate: string;
  clinicName: string;
}): { subject: string; html: string } {
  return {
    subject: `Registration Confirmed: ${courseTitle}`,
    html: wrap(`
      <div class="body">
        <h2>You're Registered!</h2>
        <p>Hi ${attendeeName},</p>
        <p>Your registration for the following course has been confirmed:</p>
        <div class="detail">
          <p><strong>Course:</strong> ${courseTitle}</p>
          <p><strong>Location:</strong> ${clinicName}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
        </div>
        <p>Please arrive 10 minutes early. You'll receive your CEU certificate upon completion of the course.</p>
      </div>
    `),
  };
}

export function invoiceReminder({
  clinicName,
  amount,
  invoiceNumber,
}: {
  clinicName: string;
  amount: string;
  invoiceNumber: string;
}): { subject: string; html: string } {
  return {
    subject: `Invoice Reminder: ${invoiceNumber} - ${clinicName}`,
    html: wrap(`
      <div class="body">
        <h2>Invoice Reminder</h2>
        <p>Hi,</p>
        <p>This is a friendly reminder that the following invoice is due:</p>
        <div class="detail">
          <p><strong>Clinic:</strong> ${clinicName}</p>
          <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
          <p><strong>Amount:</strong> $${amount}</p>
        </div>
        <p>If payment has already been sent, please disregard this message. Otherwise, please arrange payment at your earliest convenience.</p>
        <p>Questions? Just reply to this email.</p>
      </div>
    `),
  };
}

export function bfrL1ToAclUpgrade({
  contactName,
  clinicName,
  eventDate,
}: {
  contactName: string;
  clinicName: string;
  eventDate: string;
}): { subject: string; html: string } {
  return {
    subject: `Ready for the next step with BFR? - ${clinicName}`,
    html: wrap(`
      <div class="body">
        <h2>Take BFR to the Next Level</h2>
        <p>Hi ${contactName},</p>
        <p>I hope you're doing well. I wanted to reach out because I really enjoyed teaching the <strong>Smart Tools BFR Level 1</strong> course at ${clinicName} on ${eventDate}. Your team was engaged, asked great questions, and it was obvious they're serious about improving their clinical skills.</p>
        <p>Since that course, the most common question I've gotten from clinicians who completed L1 is: <strong><em>"I know how to use BFR now, but how do I actually program it into my rehab protocols?"</em></strong></p>
        <p>That question is exactly why I built a new course:</p>
        <div class="detail">
          <p><strong style="color:#a8e6cf;font-size:16px;">ACL+BFR Mastery: From Rehab to Return</strong></p>
          <p><strong>8 CEU Hours</strong> | Live, In-Person | 5 Hands-On Labs</p>
        </div>
        <p>This course picks up where L1 left off and gives your team a <strong>complete, phase-by-phase BFR protocol</strong> for ACL reconstruction rehab, from early post-op all the way through return-to-sport clearance.</p>

        <h2 style="font-size:16px;margin-top:24px;color:#a8e6cf;">Here's what the protocol covers:</h2>

        <div class="detail">
          <p><strong>Early Post-Op (Weeks 1-6)</strong></p>
          <p>Low-load BFR exercises to preserve quad mass during the window when your patient can't load heavy. This is where BFR makes the biggest difference.</p>
        </div>

        <div class="detail">
          <p><strong>Mid Rehab (Weeks 6-16)</strong></p>
          <p>Combining BFR with progressive loading. Closed chain exercises, single-leg work, and addressing the persistent quad inhibition that standard rehab often misses.</p>
        </div>

        <div class="detail">
          <p><strong>Late Phase (4-9+ Months)</strong></p>
          <p>BFR paired with heavy loading, plyometric readiness, sport-specific progression, and knowing when to move past BFR entirely.</p>
        </div>

        <div class="detail">
          <p><strong>Return-to-Sport Testing</strong></p>
          <p>Objective clearance using strength testing, hop test batteries, landing quality, and psychological readiness. Your team will practice every test hands-on during the course.</p>
        </div>

        <h2 style="font-size:16px;margin-top:24px;color:#a8e6cf;">A few things that set this course apart:</h2>
        <ul style="color:#c0c0c0;padding-left:20px;">
          <li><strong style="color:#e0e0e0;">Over half the course is hands-on</strong>, with a lab after every lecture module</li>
          <li><strong style="color:#e0e0e0;">A pre-req video is sent beforehand</strong> so we can skip the basics and maximize practice time</li>
          <li><strong style="color:#e0e0e0;">Your team walks away with a protocol</strong> they can start using immediately</li>
          <li><strong style="color:#e0e0e0;">All content is backed by current peer-reviewed research</strong> (2022-2025)</li>
        </ul>

        <p style="margin-top:24px;">Since your team already has the BFR foundation from L1, they're the perfect fit for this. <strong>It's designed to be the next step.</strong></p>

        <p>Would ${clinicName} be interested in hosting? I have limited dates available and would love to get your team on the calendar. Just reply and we can figure out what works.</p>

        <a href="mailto:dr.josephlglenn@gmail.com?subject=ACL%2BBFR%20Course%20-%20${encodeURIComponent(clinicName)}" class="cta">Let's Schedule It</a>
      </div>
    `),
  };
}

export function rebookingPitch({
  contactName,
  clinicName,
  courseTitle,
  eventDate,
  otherCourses,
}: {
  contactName: string;
  clinicName: string;
  courseTitle: string;
  eventDate: string;
  otherCourses: { title: string; ceuHours: number; description: string }[];
}): { subject: string; html: string } {
  const otherCoursesHtml =
    otherCourses.length > 0
      ? `<h2 style="font-size:16px;margin-top:24px;">Other Courses Available</h2>
         ${otherCourses
           .map(
             (c) => `<div class="detail">
               <p><strong>${c.title}</strong> (${c.ceuHours} CEU hours)</p>
               <p>${c.description}</p>
             </div>`
           )
           .join("")}`
      : "";

  return {
    subject: `Rebook for ${new Date().getFullYear() + 1}? — ${clinicName}`,
    html: wrap(`
      <div class="body">
        <h2>Let's Do It Again</h2>
        <p>Hi ${contactName},</p>
        <p>Thank you again for hosting <strong>${courseTitle}</strong> on ${eventDate} at ${clinicName}. The feedback from your team was great and we'd love to come back.</p>
        <p>A few reasons to rebook early:</p>
        <ul style="color:#c0c0c0;padding-left:20px;">
          <li><strong style="color:#a8e6cf;">Lock in your preferred date</strong> before the calendar fills up</li>
          <li><strong style="color:#a8e6cf;">Keep your staff's CEUs on track</strong> — consistent annual education builds on itself</li>
          <li><strong style="color:#a8e6cf;">New content:</strong> courses are updated each year with the latest evidence</li>
        </ul>
        <p>We can rebook the same course for new staff, or bring something different this time:</p>
        ${otherCoursesHtml}
        <p style="margin-top:24px;">Want to lock in a date? Just reply with a few options that work for your team and we'll get it scheduled.</p>
        <a href="mailto:dr.josephlglenn@gmail.com?subject=Rebooking%20for%20${encodeURIComponent(clinicName)}" class="cta">Reply to Rebook</a>
      </div>
    `),
  };
}

export function ceuCertificate({
  attendeeName,
  courseTitle,
  dateCompleted,
  ceuHours,
  certificateNumber,
}: {
  attendeeName: string;
  courseTitle: string;
  dateCompleted: string;
  ceuHours: number;
  certificateNumber: string;
}): { subject: string; html: string } {
  const certHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { margin: 0; padding: 0; background-color: #231F20; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  .outer { max-width: 650px; margin: 0 auto; padding: 24px; }
  .cert-border { border: 3px solid #8FBDA3; border-radius: 8px; background-color: #2C2828; padding: 8px; }
  .cert-inner { border: 1px solid rgba(143,189,163,0.3); border-radius: 4px; padding: 48px 32px; text-align: center; }
  .brand { font-size: 14px; letter-spacing: 6px; color: #8FBDA3; text-transform: uppercase; margin-bottom: 8px; }
  .cert-title { font-size: 28px; color: #D7D3CD; margin: 16px 0 4px; font-weight: 300; letter-spacing: 2px; text-transform: uppercase; }
  .cert-subtitle { font-size: 13px; color: #B9B6AF; margin-bottom: 32px; }
  .presented-to { font-size: 12px; color: #B9B6AF; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px; }
  .attendee-name { font-size: 32px; color: #D7D3CD; font-weight: 600; border-bottom: 2px solid #8FBDA3; display: inline-block; padding-bottom: 4px; margin-bottom: 24px; }
  .course-name { font-size: 18px; color: #8FBDA3; font-weight: 600; margin-bottom: 24px; }
  .details-row { display: flex; justify-content: center; gap: 48px; margin: 24px 0; }
  .detail-item { text-align: center; }
  .detail-label { font-size: 10px; color: #B9B6AF; text-transform: uppercase; letter-spacing: 2px; }
  .detail-value { font-size: 16px; color: #D7D3CD; font-weight: 600; margin-top: 4px; }
  .presenter { font-size: 14px; color: #D7D3CD; margin-top: 32px; }
  .presenter-title { font-size: 12px; color: #B9B6AF; }
  .cert-number { font-size: 10px; color: #B9B6AF; margin-top: 24px; letter-spacing: 1px; }
  .footer-note { padding: 16px; text-align: center; color: #666; font-size: 11px; }
</style>
</head>
<body>
<div class="outer">
  <div class="cert-border">
    <div class="cert-inner">
      <div class="brand">SIDELINE</div>
      <div class="cert-title">Certificate of Completion</div>
      <div class="cert-subtitle">Continuing Education Units</div>
      <div class="presented-to">This certifies that</div>
      <div class="attendee-name">${attendeeName}</div>
      <div style="font-size:13px;color:#B9B6AF;margin-bottom:16px;">has successfully completed</div>
      <div class="course-name">${courseTitle}</div>
      <table style="margin:24px auto;border-collapse:collapse;">
        <tr>
          <td style="text-align:center;padding:0 32px;">
            <div class="detail-label">Date Completed</div>
            <div class="detail-value">${dateCompleted}</div>
          </td>
          <td style="text-align:center;padding:0 32px;">
            <div class="detail-label">CEU Hours</div>
            <div class="detail-value">${ceuHours}</div>
          </td>
        </tr>
      </table>
      <div style="margin-top:32px;border-top:1px solid rgba(143,189,163,0.2);padding-top:24px;">
        <div class="presenter">Dr. Joey Glenn, DC, CSCS</div>
        <div class="presenter-title">Presented by</div>
      </div>
      <div class="cert-number">Certificate No: ${certificateNumber}</div>
    </div>
  </div>
  <div class="footer-note">SIDELINE &mdash; Continuing Education by Dr. Joey Glenn<br/>Please retain this certificate for your records.</div>
</div>
</body>
</html>`;

  return {
    subject: `Your CEU Certificate: ${courseTitle}`,
    html: certHtml,
  };
}

export function preCourseEmail({
  attendeeName,
  courseTitle,
  eventDate,
  clinicName,
  materialLinks,
  prerequisiteInfo,
}: {
  attendeeName: string;
  courseTitle: string;
  eventDate: string;
  clinicName: string;
  materialLinks: { title: string; url: string }[];
  prerequisiteInfo?: { title: string; ceuHours: number } | null;
}): { subject: string; html: string } {
  const materialsHtml = materialLinks.length > 0
    ? `<div style="margin: 16px 0;">
        <p style="color:#D7D3CD;font-weight:600;margin-bottom:8px;">Course Materials:</p>
        ${materialLinks.map((m) => `<p style="margin:4px 0;"><a href="${m.url}" style="color:#8FBDA3;text-decoration:underline;">${m.title}</a></p>`).join("")}
      </div>`
    : "";

  const prereqHtml = prerequisiteInfo
    ? `<div class="detail" style="border-left-color:#D4A843;">
        <p><strong style="color:#D4A843;">Pre-Requisite:</strong> This course requires prior completion of <strong>${prerequisiteInfo.title}</strong> (${prerequisiteInfo.ceuHours} CEU hours).</p>
      </div>`
    : "";

  return {
    subject: `Prep for ${courseTitle} — ${eventDate}`,
    html: wrap(`
      <div class="body">
        <h2>Your Upcoming Course</h2>
        <p>Hi ${attendeeName},</p>
        <p>You're registered for an upcoming continuing education course. Here are the details and materials to help you prepare:</p>
        <div class="detail">
          <p><strong>Course:</strong> ${courseTitle}</p>
          <p><strong>Date:</strong> ${eventDate}</p>
          <p><strong>Location:</strong> ${clinicName}</p>
        </div>
        ${prereqHtml}
        ${materialsHtml}
        <h2 style="font-size:16px;margin-top:24px;">What to Bring</h2>
        <ul style="color:#c0c0c0;padding-left:20px;">
          <li>Photo ID for CEU verification</li>
          <li>Notepad or device for notes</li>
          <li>Comfortable attire for hands-on portions</li>
        </ul>
        <p>Please arrive 10 minutes early to sign in. If you have any questions, just reply to this email.</p>
        <p>See you there!</p>
      </div>
    `),
  };
}
