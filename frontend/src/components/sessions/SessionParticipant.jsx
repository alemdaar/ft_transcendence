import { useState } from "react";
import { UserRound } from "lucide-react";

export default function SessionParticipant({ label, profile }) {
  const [failedAvatar, setFailedAvatar] = useState(null);
  const showAvatar = profile?.avatar && failedAvatar !== profile.avatar;
  const name = profile?.name || "Unknown user";
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-line bg-surface p-4">
      {showAvatar ? (
        <img
          src={profile.avatar}
          alt={name}
          onError={() => setFailedAvatar(profile.avatar)}
          className="h-11 w-11 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-soft text-muted"
          aria-hidden="true"
        >
          <UserRound size={22} />
        </span>
      )}
      <div className="min-w-0">
        <dt className="text-xs text-muted">{label}</dt>
        <dd className="mt-1 truncate font-semibold" title={name}>
          {name}
        </dd>
      </div>
    </div>
  );
}
