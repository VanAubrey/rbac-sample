import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Plus } from 'lucide-react';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: number;
  teamName: string;
  onAddMember: (userId: string, role: 'ADMIN' | 'MEMBER') => Promise<void>;
  searchUsers: (query: string, teamId: number) => Promise<User[]>;
}

export const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  teamId,
  teamName,
  onAddMember,
  searchUsers
}) => {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'MEMBER'>('MEMBER');
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setUsers([]);
      setSelectedRole('MEMBER');
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.trim()) {
      searchTimeoutRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const results = await searchUsers(query, teamId);
          setUsers(results);
        } finally {
          setLoading(false);
        }
      }, 300);
    } else {
      setUsers([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query, teamId, searchUsers]);

  const handleAddMember = async (userId: string) => {
    try {
      await onAddMember(userId, selectedRole);
      // Remove user from search results
      setUsers(prev => prev.filter(user => user.id !== userId));
      setQuery('');
    } catch (error) {
      console.error('Failed to add member:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Add Member to {teamName}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Role Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Role</label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as 'ADMIN' | 'MEMBER')}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="MEMBER">Member</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>

        {/* User Search */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Search Users</label>
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Search Results */}
        <div className="max-h-64 overflow-y-auto">
          {loading && (
            <div className="text-center py-4 text-gray-500">Searching...</div>
          )}
          
          {!loading && query && users.length === 0 && (
            <div className="text-center py-4 text-gray-500">No users found</div>
          )}

          {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg mb-2">
              <div className="flex items-center space-x-3">
                {user.image ? (
                  <img
                    src={user.image}
                    alt={user.name || 'User'}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">
                      {(user.name || user.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                
                <div>
                  <div className="font-medium text-sm">
                    {user.name || 'Unnamed User'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.email}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleAddMember(user.id)}
                className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};