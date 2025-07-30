import { google } from 'googleapis';

interface GroupMembership {
  id: string;
  email: string;
  name: string;
}

/**
 * Get user's Google Workspace group memberships
 */
export async function getUserWorkspaceGroups(
  accessToken: string,
  userEmail: string
): Promise<string[]> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const admin = google.admin({ version: 'directory_v1', auth });

    // Get all groups the user is a member of
    const response = await admin.groups.list({
      userKey: userEmail,
      maxResults: 200
    });

    const groups = response.data.groups || [];
    return groups.map(group => group.email!).filter(Boolean);
  } catch (error) {
    console.error('Error fetching user groups:', error);
    
    // Fallback: return hardcoded groups for testing
    // Remove this in production
    if (userEmail.includes('@alphaus.cloud')) {
      return ['uni-one@alphaus.cloud'];
    }
    
    return [];
  }
}

/**
 * Check if user has admin access to directory
 */
export async function hasDirectoryAccess(accessToken: string): Promise<boolean> {
  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });

    const admin = google.admin({ version: 'directory_v1', auth });
    
    // Try to list groups - this will fail if no admin access
    await admin.groups.list({ maxResults: 1 });
    return true;
  } catch (error) {
    console.error('No directory access:', error);
    return false;
  }
}