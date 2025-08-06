import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Users, Settings, Plus } from 'lucide-react';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { TeamMemberCard } from '@/components/team-management/TeamMemberCard';
import { AddMemberModal } from '@/components/team-management/AddMemberModal';

const TeamManagement: React.FC = () => {
  const { data: session } = useSession();
  const {
    teams,
    loading,
    isAdmin,
    addTeamMember,
    removeTeamMember,
    updateMemberRole,
    searchUsers
  } = useTeamManagement();

  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access team management.</p>
        </div>
      </div>
    );
  }

  const currentTeam = teams.find(team => team.id === selectedTeam);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Management</h1>
          <p className="text-gray-600">Manage team members and their roles across all teams.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Teams List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-4">
              <h2 className="text-lg font-semibold mb-4 flex items-center">
                <Users size={20} className="mr-2" />
                Teams
              </h2>
              
              <div className="space-y-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    onClick={() => setSelectedTeam(team.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      selectedTeam === team.id
                        ? 'bg-blue-100 border-2 border-blue-300'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className="font-medium">{team.name}</div>
                    <div className="text-sm text-gray-500">
                      {team._count.userTeams} members • {team._count.tasks} tasks
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Team Details */}
          <div className="lg:col-span-2">
            {selectedTeam && currentTeam ? (
              <div className="bg-white rounded-lg shadow">
                {/* Team Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-semibold">{currentTeam.name}</h2>
                      <p className="text-gray-600 mt-1">
                        {currentTeam._count.userTeams} members • {currentTeam._count.tasks} tasks
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setShowAddMemberModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Add Member</span>
                    </button>
                  </div>
                </div>

                {/* Team Members */}
                <div className="p-6">
                  <h3 className="text-lg font-medium mb-4">Team Members</h3>
                  
                  {currentTeam.userTeams.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No members in this team yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {currentTeam.userTeams.map((member) => (
                        <TeamMemberCard
                          key={member.userId}
                          member={member}
                          onRoleChange={(userId, role) => updateMemberRole(currentTeam.id, userId, role)}
                          onRemove={(userId) => removeTeamMember(currentTeam.id, userId)}
                          canEdit={true}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <Settings size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">Select a Team</h3>
                <p className="text-gray-600">Choose a team from the list to manage its members.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add Member Modal */}
        {selectedTeam && currentTeam && (
          <AddMemberModal
            isOpen={showAddMemberModal}
            onClose={() => setShowAddMemberModal(false)}
            teamId={currentTeam.id}
            teamName={currentTeam.name}
            onAddMember={(userId, role) => addTeamMember(currentTeam.id, userId, role)}
            searchUsers={searchUsers}
          />
        )}
      </div>
    </div>
  );
};

export default TeamManagement;