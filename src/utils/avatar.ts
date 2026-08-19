/**
 * Resolves avatar image URL in order of priority:
 * 1. Custom profile avatar URL (if non-empty)
 * 2. OAuth user_metadata.avatar_url
 * 3. OAuth user_metadata.picture
 * 4. null (fallback to initials)
 */
export function resolveAvatarUrl(
  profileAvatarUrl?: string | null,
  userMetadata?: Record<string, any> | null
): string | null {
  if (profileAvatarUrl && profileAvatarUrl.trim() !== '') {
    return profileAvatarUrl.trim();
  }
  if (userMetadata?.avatar_url && typeof userMetadata.avatar_url === 'string' && userMetadata.avatar_url.trim() !== '') {
    return userMetadata.avatar_url.trim();
  }
  if (userMetadata?.picture && typeof userMetadata.picture === 'string' && userMetadata.picture.trim() !== '') {
    return userMetadata.picture.trim();
  }
  return null;
}

/**
 * Extracts initials from full name or email (e.g. "Priyanshu Saha" -> "PS")
 */
export function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim() !== '') {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    } else if (parts[0].length >= 2) {
      return parts[0].substring(0, 2).toUpperCase();
    } else if (parts[0].length === 1) {
      return parts[0][0].toUpperCase();
    }
  }

  if (email && email.trim() !== '') {
    const username = email.trim().split('@')[0];
    if (username.length >= 2) {
      return username.substring(0, 2).toUpperCase();
    } else if (username.length === 1) {
      return username[0].toUpperCase();
    }
  }

  return 'U';
}
