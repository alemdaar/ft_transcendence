export function normalizeProfile(profile) {
  const name = (typeof profile?.name === 'string' ? profile.name.trim() : '') || (typeof profile?.username === 'string' ? profile.username.trim() : '') || 'Unknown user';
  const avatar = profile?.avatar || profile?.avatarUrl;
  const usableAvatar = typeof avatar === 'string' && avatar.trim() && !/^(javascript|data|vbscript):/i.test(avatar.trim());
  return { id: profile?.id ?? null, name, avatar: usableAvatar ? avatar.trim() : null };
}

export function normalizeSession(data) {
  if (!data?.succes || typeof data.succes !== 'object' || Array.isArray(data.succes) || !Number.isSafeInteger(Number(data.succes.id)) || Number(data.succes.id) <= 0) {
    throw new Error('Unexpected session response.');
  }
  return {
    succes: data.succes,
    profiles: {
      asker: normalizeProfile(data.profiles?.asker ?? data.Profiles?.askerOne),
      helper: normalizeProfile(data.profiles?.helper ?? data.Profiles?.helperOne),
    },
  };
}
