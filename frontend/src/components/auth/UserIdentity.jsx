import { useState } from "react";
import { UserRound } from "lucide-react";

export default function UserIdentity({ user, compact = false }) {
  const [failedImage, setFailedImage] = useState(null);
  const name = user.username || user.displayname || user.email || "Student";
  const showImage =
    user.authProvider === "42" &&
    user.avatarUrl &&
    failedImage !== user.avatarUrl;
  return (
    <div className="flex min-w-0 items-center gap-3" title={name}>
      {showImage ? (
        <img
          src={user.avatarUrl}
          alt={name}
          onError={() => setFailedImage(user.avatarUrl)}
          className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-line"
        />
      ) : (
        <span
          role="img"
          aria-label={name}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-selected text-highlight ring-2 ring-line"
        >
          <UserRound size={22} aria-hidden="true" />
        </span>
      )}
      {!compact && (
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-xs text-muted">
            {user.campus} · {user.points ?? 0} points
          </p>
        </div>
      )}
    </div>
  );
}
