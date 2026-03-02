'use client';

import { useEffect, useState } from 'react';

import IconComponent from '@/app/components/iconComponent';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export interface InvitedMember {
  id: string;
  name: string;
  email?: string;
  image?: string;
}

interface InviteMembersProps {
  invitedMembers: InvitedMember[];
  onMembersChange: (members: InvitedMember[]) => void;
  placeholder?: string;
  searchResults?: InvitedMember[];
  onSearch?: (query: string) => void;
  isSearching?: boolean;
  debounceMs?: number;
  className?: string;
}

export function InviteMembers({
  invitedMembers,
  onMembersChange,
  placeholder = 'Search by user name or add their email',
  searchResults = [],
  onSearch,
  isSearching = false,
  debounceMs = 300,
  className = '',
}: InviteMembersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (!onSearch) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onSearch(searchQuery.trim());
    }, debounceMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [searchQuery, onSearch, debounceMs]);

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowResults(value.length > 0);
  };

  const handleAddEmail = (email: string) => {
    if (isValidEmail(email) && !invitedMembers.find((m) => m.email === email)) {
      const newMember: InvitedMember = {
        id: `email-${Date.now()}`,
        name: email,
        email: email,
        image: '',
      };
      onMembersChange([...invitedMembers, newMember]);
      setSearchQuery('');
      setShowResults(false);
    }
  };

  const handleAddUser = (user: InvitedMember) => {
    if (!invitedMembers.find((m) => m.id === user.id)) {
      onMembersChange([...invitedMembers, user]);
      setSearchQuery('');
      setShowResults(false);
    }
  };

  const handleRemoveMember = (memberId: string) => {
    onMembersChange(invitedMembers.filter((m) => m.id !== memberId));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery) {
      e.preventDefault();
      if (isValidEmail(searchQuery)) {
        handleAddEmail(searchQuery);
      }
    }
  };

  const displayedMembers = invitedMembers.slice(0, 6);
  const remainingCount = invitedMembers.length - displayedMembers.length;

  return (
    <div className={className}>
      <div className="relative">
        <Input
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          <IconComponent iconName="Search01Icon" size={22} color="gray" />
        </span>

        {/* Search Results Dropdown */}
        {showResults && (searchResults.length > 0 || isValidEmail(searchQuery)) && (
          <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {searchResults.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleAddUser(user)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gray-50"
              >
                <Avatar className="h-10 w-10">
                  {user.image ? <AvatarImage src={user.image} alt={user.name} /> : null}
                  <AvatarFallback className="bg-gray-200 text-gray-500">
                    <IconComponent iconName="UserIcon" size={18} color="gray" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  {user.email && <p className="text-xs text-gray-500">{user.email}</p>}
                </div>
              </button>
            ))}

            {isValidEmail(searchQuery) && !invitedMembers.find((m) => m.email === searchQuery) && (
              <button
                type="button"
                onClick={() => handleAddEmail(searchQuery)}
                className="flex w-full items-center gap-3 border-t border-gray-200 px-4 py-3 text-left hover:bg-gray-50"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                  <IconComponent iconName="Mail01Icon" size={18} color="#10B981" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Invite via email</p>
                  <p className="text-xs text-gray-500">{searchQuery}</p>
                </div>
              </button>
            )}

            {searchResults.length === 0 && !isValidEmail(searchQuery) && !isSearching && (
              <div className="px-4 py-3 text-center text-sm text-gray-500">No results found</div>
            )}

            {isSearching && (
              <div className="px-4 py-3 text-center text-sm text-gray-500">Searching...</div>
            )}
          </div>
        )}
      </div>

      {/* Invited Members Pills */}
      {invitedMembers.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {displayedMembers.map((member) => (
            <div
              key={member.id}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 py-1.5 pl-1.5 pr-2"
            >
              <Avatar className="h-6 w-6">
                {member.image ? <AvatarImage src={member.image} alt={member.name} /> : null}
                <AvatarFallback className="bg-gray-200 text-gray-500">
                  <IconComponent iconName="UserIcon" size={14} color="gray" />
                </AvatarFallback>
              </Avatar>
              <span className="max-w-[112px] truncate text-xs text-gray-700">{member.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveMember(member.id)}
                className="flex h-5 w-5 items-center justify-center rounded-full bg-gray-400 hover:bg-gray-500"
              >
                <IconComponent iconName="Cancel01Icon" size={12} color="white" />
              </button>
            </div>
          ))}

          {remainingCount > 0 && (
            <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-full bg-emerald-100 px-2 text-xs font-semibold text-emerald-700">
              +{remainingCount}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
