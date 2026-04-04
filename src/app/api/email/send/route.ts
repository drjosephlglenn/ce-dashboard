import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";
import { prisma } from "@/lib/db";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    return NextResponse.json(
      { error: "Email service not configured. Add GMAIL_USER and GMAIL_APP_PASSWORD to .env" },
      { status: 503 }
    );
  }

  try {
    // Build attachments from material IDs
    const attachments: { filename: string; path?: string; content?: Buffer; contentType?: string }[] = [];

    if (body.materialIds && Array.isArray(body.materialIds) && body.materialIds.length > 0) {
      const materials = await prisma.material.findMany({
        where: { id: { in: body.materialIds } },
      });

      for (const material of materials) {
        const ext = material.mimeType
          ? material.mimeType.split("/").pop() || "pdf"
          : "pdf";
        const filename = `${material.title.replace(/[^a-zA-Z0-9-_ ]/g, "")}.${ext}`;

        if (material.fileUrl.startsWith("data:")) {
          // Base64 data URI
          const matches = material.fileUrl.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            attachments.push({
              filename,
              content: Buffer.from(matches[2], "base64"),
              contentType: matches[1],
            });
          }
        } else if (material.fileUrl.startsWith("/")) {
          // Local file path relative to public/
          attachments.push({
            filename,
            path: path.join(process.cwd(), "public", material.fileUrl),
          });
        } else if (material.fileUrl.startsWith("http")) {
          // External URL
          attachments.push({
            filename,
            path: material.fileUrl,
          });
        }
      }
    }

    const result = await sendEmail({
      to: body.to,
      subject: body.subject,
      html: body.html,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    return NextResponse.json({ id: result?.id });
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
