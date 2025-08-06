import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface TeamMember {
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  user: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
}

interface Team {
  id: number;
  uuid: string;
  name: string;
  userTeams: TeamMember[];
  _count: {
    tasks: number;
    userTeams: number;
  };
}

export const useTeamManagement = () => {
  const { data: session } = useSession();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.id) return;

      try {
        const response = await fetch('/api/admin/teams');
        if (response.ok) {
          setIsAdmin(true);
          const teamsData = await response.json();
          setTeams(teamsData);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [session]);

  // Add member to team
  const addTeamMember = async (teamId: number, userId: string, role: 'ADMIN' | 'MEMBER' = 'MEMBER') => {
    try {
      const response = await fetch(`/api/admin/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        throw new Error('Failed to add team member');
      }

      const newMember = await response.json();
      
      // Update local state
      setTeams(prevTeams => 
        prevTeams.map(team => 
          team.id === teamId 
            ? {
                ...team,
                userTeams: [...team.userTeams, newMember],
                _count: {
                  ...team._count,
                  userTeams: team._count.userTeams + 1
                }
              }
            : team
        )
      );

      return newMember;
    } catch (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
  };

  // Remove member from team
  const removeTeamMember = async (teamId: number, userId: string) => {
    try {
      const response = await fetch(`/api/admin/teams/${teamId}/members`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove team member');
      }

      // Update local state
      setTeams(prevTeams => 
        prevTeams.map(team => 
          team.id === teamId 
            ? {
                ...team,
                userTeams: team.userTeams.filter(member => member.userId !== userId),
                _count: {
                  ...team._count,
                  userTeams: team._count.userTeams - 1
                }
              }
            : team
        )
      );
    } catch (error) {
      console.error('Error removing team member:', error);
      throw error;
    }
  };

  // Update member role
  const updateMemberRole = async (teamId: number, userId: string, role: 'ADMIN' | 'MEMBER') => {
    try {
      const response = await fetch(`/api/admin/teams/${teamId}/members`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, role }),
      });

      if (!response.ok) {
        throw new Error('Failed to update member role');
      }

      const updatedMember = await response.json();

      // Update local state
      setTeams(prevTeams => 
        prevTeams.map(team => 
          team.id === teamId 
            ? {
                ...team,
                userTeams: team.userTeams.map(member => 
                  member.userId === userId ? updatedMember : member
                )
              }
            : team
        )
      );

      return updatedMember;
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  };

  // Search users for adding to team
  const searchUsers = async (query: string, teamId: number) => {
    if (!query.trim()) return [];

    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}&teamId=${teamId}`);
      
      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      return await response.json();
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  return {
    teams,
    loading,
    isAdmin,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    searchUsers,
  };
};