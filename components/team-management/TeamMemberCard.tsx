import React from 'react';
import { User, Crown, Shield, X } from 'lucide-react';

interface TeamMemberCardProps {
  member: {
    userId: string;
    role: 'ADMIN' | 'MEMBER';
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
    };
  };
  onRoleChange: (userId: string, role: 'ADMIN' | 'MEMBER') => void;
  onRemove: (userId: string) => void;
  canEdit: boolean;
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  member,
  onRoleChange,
  onRemove,
  canEdit
}) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        {member.user.image ? (
          <img
            src={member.user.image}
            alt={member.user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
        )}
        
        <div>
          <div className="font-medium text-sm">
            {member.user.name || 'Unnamed User'}
          </div>
          <div className="text-xs text-gray-500">
            {member.user.email}
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Role Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${
          member.role === 'ADMIN' 
            ? 'bg-purple-100 text-purple-700' 
            : 'bg-blue-100 text-blue-700'
        }`}>
          {member.role === 'ADMIN' ? <Crown size={12} /> : <Shield size={12} />}
          <span>{member.role}</span>
        </div>

        {canEdit && (
          <>
            {/* Role Toggle */}
            <button
              onClick={() => onRoleChange(member.userId, member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN')}
              className="text-xs px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded transition-colors"
              title={`Make ${member.role === 'ADMIN' ? 'Member' : 'Admin'}`}
            >
              {member.role === 'ADMIN' ? 'Demote' : 'Promote'}
            </button>

            {/* Remove Button */}
            <button
              onClick={() => onRemove(member.userId)}
              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
              title="Remove from team"
            >
              <X size={16} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};