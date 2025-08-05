import { PrismaClient, Role } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

// Team configuration - easily extensible
const TEAMS_CONFIG = [
  { name: 'Professional Services', adminEmail: 'vanaubrey.dahan@alphaus.cloud' },
  { name: 'Future What', adminEmail: 'horioka.haruka@alphaus.cloud' },
  { name: 'Future How', adminEmail: 'chew.esmero@alphaus.cloud' },
  { name: 'Sales', adminEmail: 'mochizuki.rena@alphaus.cloud' },
  { name: 'CS', adminEmail: 'mochizuki.rena@alphaus.cloud' },
  { name: 'OCTO', adminEmail: 'gilbert@alphaus.cloud' },
  { name: 'Ripple', adminEmail: 'emma@alphaus.cloud' },
  { name: 'Growth Content', adminEmail: 'charlene.acson@alphaus.cloud' },
  { name: 'Core-hub', adminEmail: 'shungo.arai@alphaus.cloud' },
  { name: 'Flow', adminEmail: 'nika.amorin@alphaus.cloud' },
  { name: 'Azure', adminEmail: 'tuan@alphaus.cloud' },
  { name: 'Consulting', adminEmail: 'atasha.mohd@alphaus.cloud' }
];

async function createTeams() {
  console.log('🚀 Starting team creation process...\n');

  for (const { name, adminEmail } of TEAMS_CONFIG) {
    try {
      // Check if team already exists
      const existingTeam = await prisma.team.findUnique({
        where: { name }
      });

      if (existingTeam) {
        console.log(`⏭️  Team "${name}" already exists, skipping creation...`);
        
        // Check if admin is already assigned
        const existingAdmin = await prisma.userTeam.findFirst({
          where: {
            teamId: existingTeam.id,
            role: Role.ADMIN
          },
          include: {
            user: { select: { email: true } }
          }
        });

        if (existingAdmin) {
          console.log(`   Admin already assigned: ${existingAdmin.user.email}`);
        } else {
          console.log(`   No admin assigned yet for "${name}"`);
        }
        continue;
      }

      // Find admin user
      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (!adminUser) {
        console.log(`⚠️  Admin user ${adminEmail} not found for team "${name}"`);
        console.log(`   Creating team without admin - admin can be assigned later`);
        
        // Create team without admin
        const team = await prisma.team.create({
          data: {
            uuid: uuidv4(),
            name
          }
        });
        
        console.log(`🏢 Created team "${name}" (ID: ${team.id})`);
        continue;
      }

      // Create team and assign admin in a transaction
      const result = await prisma.$transaction(async (tx) => {
        // Create team
        const team = await tx.team.create({
          data: {
            uuid: uuidv4(),
            name
          }
        });

        // Assign admin
        await tx.userTeam.create({
          data: {
            userId: adminUser.id,
            teamId: team.id,
            role: Role.ADMIN
          }
        });

        return team;
      });

      console.log(`✅ Created team "${name}" with admin ${adminUser.name || adminUser.email} (${adminUser.email})`);

    } catch (error) {
      console.error(`❌ Error creating team "${name}":`, error);
    }
  }

  console.log('\n📊 Final summary:');
  await showTeamSummary();
}

async function showTeamSummary() {
  const teams = await prisma.team.findMany({
    include: {
      userTeams: {
        include: {
          user: { select: { email: true, name: true } }
        }
      },
      _count: { select: { tasks: true } }
    },
    orderBy: { name: 'asc' }
  });

  teams.forEach(team => {
    const admins = team.userTeams.filter(ut => ut.role === Role.ADMIN);
    const members = team.userTeams.filter(ut => ut.role === Role.MEMBER);
    
    console.log(`\n🏢 ${team.name} (ID: ${team.id})`);
    console.log(`   Members: ${team.userTeams.length} (${admins.length} admins, ${members.length} members)`);
    console.log(`   Tasks: ${team._count.tasks}`);
    
    if (admins.length > 0) {
      admins.forEach(admin => {
        console.log(`   👑 Admin: ${admin.user.name || admin.user.email}`);
      });
    } else {
      console.log(`   ⚠️  No admin assigned`);
    }
  });
}

// Add new teams function for future use
async function addNewTeams(newTeamsConfig: Array<{ name: string; adminEmail: string }>) {
  console.log('➕ Adding new teams...\n');
  
  for (const { name, adminEmail } of newTeamsConfig) {
    try {
      const existingTeam = await prisma.team.findUnique({
        where: { name }
      });

      if (existingTeam) {
        console.log(`⏭️  Team "${name}" already exists`);
        continue;
      }

      const adminUser = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (!adminUser) {
        console.log(`⚠️  Admin user ${adminEmail} not found for team "${name}"`);
        continue;
      }

      const result = await prisma.$transaction(async (tx) => {
        const team = await tx.team.create({
          data: {
            uuid: uuidv4(),
            name
          }
        });

        await tx.userTeam.create({
          data: {
            userId: adminUser.id,
            teamId: team.id,
            role: Role.ADMIN
          }
        });

        return team;
      });

      console.log(`✅ Added new team "${name}" with admin ${adminUser.email}`);

    } catch (error) {
      console.error(`❌ Error adding team "${name}":`, error);
    }
  }
}

// Main execution
async function main() {
  try {
    await createTeams();
    console.log('\n✨ Team creation completed!');
  } catch (error) {
    console.error('💥 Error during team creation:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Export for reuse
export { addNewTeams, TEAMS_CONFIG };

// Run if called directly
if (require.main === module) {
  main();
}