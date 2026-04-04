import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });
async function main() {
  const event = await prisma.courseEvent.findFirst({
    where: { clinic: { name: "Movement Orthopedics" } },
  });
  if (!event) { console.log("Event not found"); return; }
  console.log("Current date:", event.eventDate);
  await prisma.courseEvent.update({
    where: { id: event.id },
    data: { eventDate: new Date("2024-01-19") },
  });
  console.log("✓ Fixed to 2024-01-19");
}
main().catch(console.error).finally(() => prisma.$disconnect());
