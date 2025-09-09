import { PrismaClient } from "../generated/prisma/index.js";
import allSkills from "../data/skill.js";

const prisma = new PrismaClient();

async function main() {
  for (const skill of allSkills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: {
        name: skill.name,
        category: skill.category,
      },
    });
  }
  console.log("Skillテーブルに初期データを投入しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
