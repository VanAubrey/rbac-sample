import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Hardcoded group to role mapping
export const GROUP_ROLE_MAPPING = {
  "profservices-team@alphaus.cloud": "ProfServicesMember",
  "corehub-team@alphaus.cloud": "CoreHubMember",
  "admin@alphaus.cloud": "Admin",
  // Temporary mappings based on your current groups
  "uni-one@alphaus.cloud": "CoreHubMember",
  "all@alphaus.cloud": "Admin"
} as const;

export type RoleName = typeof GROUP_ROLE_MAPPING[keyof typeof GROUP_ROLE_MAPPING];

export interface UserPermissions {
  userId: string;
  roles: string[];
  permissions: string[];
}

export interface TaskPermissionCheck {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canTogglePrivacy: boolean;
}

/**
 * Get user's roles and permissions
 */
export async function getUserPermissions(userId: string): Promise<UserPermissions> {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: {
      role: {
        include: {
          permissions: {
            include: {
              permission: true
            }
          }
        }
      }
    }
  });

  const roles = userRoles.map(ur => ur.role.name);
  const permissions = userRoles.flatMap(ur => 
    ur.role.permissions.map(rp => rp.permission.action)
  );

  return {
    userId,
    roles,
    permissions: [...new Set(permissions)] // Remove duplicates
  };
}

/**
 * Check if user can perform actions on a task
 */
export async function checkTaskPermissions(
  userId: string, 
  task: { userId: string; isPrivate: boolean }
): Promise<TaskPermissionCheck> {
  const userPermissions = await getUserPermissions(userId);
  const isTaskOwner = task.userId === userId;
  const isAdmin = userPermissions.roles.includes('Admin');
  
  // If task is not private, everyone can do everything
  if (!task.isPrivate) {
    return {
      canView: true,
      canEdit: true,
      canDelete: true,
      canTogglePrivacy: isTaskOwner || isAdmin
    };
  }

  // For private tasks, check role-based permissions
  const hasViewPermission = userPermissions.permissions.includes('viewTask');
  const hasEditPermission = userPermissions.permissions.includes('editTask');
  const hasDeletePermission = userPermissions.permissions.includes('deleteTask');

  // Get task owner's role to check if current user shares the same role
  const taskOwnerPermissions = await getUserPermissions(task.userId);
  const sharesRoleWithOwner = userPermissions.roles.some(role => 
    taskOwnerPermissions.roles.includes(role)
  );

  const canAccess = isTaskOwner || isAdmin || sharesRoleWithOwner;

  return {
    canView: canAccess && hasViewPermission,
    canEdit: canAccess && hasEditPermission,
    canDelete: canAccess && hasDeletePermission,
    canTogglePrivacy: isTaskOwner || isAdmin || sharesRoleWithOwner
  };
}

/**
 * Sync user roles based on Google Workspace groups
 */
export async function syncUserRoles(userId: string, userGroups: string[]) {
  // Map groups to roles
  const roleNames = userGroups
    .map(group => GROUP_ROLE_MAPPING[group as keyof typeof GROUP_ROLE_MAPPING])
    .filter(Boolean);

  if (roleNames.length === 0) {
    console.warn(`No roles found for user ${userId} with groups:`, userGroups);
    return;
  }

  // Get role IDs
  const roles = await prisma.role.findMany({
    where: {
      name: { in: roleNames }
    }
  });

  // Remove existing user roles
  await prisma.userRole.deleteMany({
    where: { userId }
  });

  // Add new user roles
  const userRoleData = roles.map(role => ({
    userId,
    roleId: role.id
  }));

  await prisma.userRole.createMany({
    data: userRoleData
  });

  console.log(`Synced roles for user ${userId}:`, roleNames);
}

/**
 * Initialize default roles and permissions
 */
export async function initializeRBACData() {
  // Create roles
  const roles = [
    { name: 'Admin', uuid: crypto.randomUUID() },
    { name: 'CoreHubMember', uuid: crypto.randomUUID() },
    { name: 'ProfServicesMember', uuid: crypto.randomUUID() }
  ];

  // Create permissions
  const permissions = [
    { name: 'viewTask', action: 'viewTask', uuid: crypto.randomUUID() },
    { name: 'editTask', action: 'editTask', uuid: crypto.randomUUID() },
    { name: 'deleteTask', action: 'deleteTask', uuid: crypto.randomUUID() }
  ];

  try {
    // Upsert roles
    for (const role of roles) {
      await prisma.role.upsert({
        where: { name: role.name },
        update: {},
        create: role
      });
    }

    // Upsert permissions
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { uuid: permission.uuid },
        update: {},
        create: permission
      });
    }

    // Assign all permissions to all roles
    const createdRoles = await prisma.role.findMany();
    const createdPermissions = await prisma.permission.findMany();

    for (const role of createdRoles) {
      for (const permission of createdPermissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id
            }
          },
          update: {},
          create: {
            roleId: role.id,
            permissionId: permission.id
          }
        });
      }
    }

    console.log('RBAC data initialized successfully');
  } catch (error) {
    console.error('Error initializing RBAC data:', error);
  }
}