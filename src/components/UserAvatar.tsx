import React, { useState, useEffect } from 'react';
import { resolveAvatarUrl, getInitials } from '../utils/avatar';

interface UserAvatarProps {
  profileAvatarUrl?: string | null;
  userMetadata?: Record<string, any> | null;
  name?: string | null;
  email?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  xs: 'w-5 h-5 text-[10px]',
  sm: 'w-7 h-7 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-20 h-20 text-2xl'
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  profileAvatarUrl,
  userMetadata,
  name,
  email,
  size = 'sm',
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);

  const resolvedUrl = resolveAvatarUrl(profileAvatarUrl, userMetadata);
  const initials = getInitials(name, email);

  // Reset error state if image URL changes
  useEffect(() => {
    setImgError(false);
  }, [resolvedUrl]);

  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.sm;

  if (resolvedUrl && !imgError) {
    return (
      <img
        src={resolvedUrl}
        alt={name || 'User Avatar'}
        onError={() => {
          console.warn('[UserAvatar] Image load failed, falling back to initials:', resolvedUrl);
          setImgError(true);
        }}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        className={`${sizeClass} rounded-full object-cover border border-line-200 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-pine-900 text-white border border-pine-700 font-semibold flex items-center justify-center select-none ${className}`}
      title={name || email || 'User Profile'}
    >
      {initials}
    </div>
  );
};
