
import { prisma } from "./lib/db";

async function main() {
  if (prisma.emailQueue) {
    console.log("SUCCESS: prisma.emailQueue is defined");
    // Try a simple count to ensure it works
    const count = await prisma.emailQueue.count();
    console.log(`Current queue count: ${count}`);
  } else {
    console.error("FAILURE: prisma.emailQueue is UNDEFINED");
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
