'use client';

import { useEffect, useState } from 'react';

import { z } from 'zod';

import { IconComponent } from '@/app/shared/components/Icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GuestPill } from '@/components/ui/guest-pill';
import { Input } from '@/components/ui/input';

const emailSchema = z.string().email();

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
  const [emailError, setEmailError] = useState<string | null>(null);

  // Without an onSearch handler there is no backend lookup, so the results
  // dropdown is suppressed and the field is purely for entering addresses
  const isSearchEnabled = Boolean(onSearch);

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

  const isValidEmail = (email: string) => emailSchema.safeParse(email.trim()).success;

  const alreadyInvited = (email: string, extra: InvitedMember[] = []) =>
    [...invitedMembers, ...extra].some(
      (member) => member.email?.toLowerCase() === email.toLowerCase(),
    );

  /**
   * Adds every valid address in the batch at once. Anything that does not parse
   * is handed back so it can stay in the input for the user to correct rather
   * than being silently dropped.
   */
  const addEmails = (candidates: string[]): string[] => {
    const added: InvitedMember[] = [];
    const rejected: string[] = [];

    candidates.forEach((candidate, index) => {
      const email = candidate.trim();
      if (!email) return;

      if (!isValidEmail(email)) {
        rejected.push(email);
        return;
      }

      if (alreadyInvited(email, added)) return;

      added.push({
        // Index keeps ids unique when a whole batch lands in the same millisecond
        id: `email-${Date.now()}-${index}`,
        name: email,
        email,
        image: '',
      });
    });

    if (added.length > 0) {
      onMembersChange([...invitedMembers, ...added]);
    }

    setEmailError(
      rejected.length > 0
        ? `${rejected.join(', ')} ${rejected.length === 1 ? 'is not a' : 'are not'} valid email${
            rejected.length === 1 ? '' : 's'
          }`
        : null,
    );

    return rejected;
  };

  const handleSearchChange = (value: string) => {
    setEmailError(null);

    // A comma ends an address, so everything before the last one is committed
    // and the tail stays in the input
    if (value.includes(',')) {
      const segments = value.split(',');
      const tail = segments.pop() ?? '';
      const rejected = addEmails(segments);

      setSearchQuery([...rejected, tail].filter(Boolean).join(', '));
      setShowResults(false);
      return;
    }

    setSearchQuery(value);
    setShowResults(isSearchEnabled && value.length > 0);
  };

  const handleAddEmail = (email: string) => {
    const rejected = addEmails(email.split(','));
    setSearchQuery(rejected.join(', '));
    setShowResults(false);
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
      handleAddEmail(searchQuery);
    }
  };

  // Anything still typed when focus leaves would otherwise be lost
  const handleBlur = () => {
    if (searchQuery.trim()) {
      handleAddEmail(searchQuery);
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
          onBlur={handleBlur}
          placeholder={placeholder}
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2">
          <IconComponent iconName="Search01Icon" size={22} color="gray" />
        </span>

        {/* Search Results Dropdown — only when a backend search is wired up */}
        {isSearchEnabled &&
          showResults &&
          (searchResults.length > 0 || isValidEmail(searchQuery)) && (
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

              {isValidEmail(searchQuery) &&
                !invitedMembers.find((m) => m.email === searchQuery) && (
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

      {emailError && <p className="mt-1 text-xs text-red-500">{emailError}</p>}

      {/* Invited Members Pills */}
      {invitedMembers.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {displayedMembers.map((member) => (
            <GuestPill
              key={member.id}
              name={member.name}
              image={member.image}
              onRemove={() => handleRemoveMember(member.id)}
            />
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
