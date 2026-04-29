function OfflineBadge({ isOnline, pendingSyncCount, onSync }) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm",
        isOnline
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
          : "border-amber-500/30 bg-amber-500/10 text-amber-200",
      ].join(" ")}
    >
      <div>
        <p className="font-medium">
          {isOnline ? "Online sync ready" : "Offline mode active"}
        </p>
        <p className="text-xs opacity-80">
          {pendingSyncCount
            ? `${pendingSyncCount} change${pendingSyncCount > 1 ? "s" : ""} waiting to sync`
            : "All CRM changes are synced"}
        </p>
      </div>
      <button
        type="button"
        onClick={onSync}
        className="rounded-lg border border-current px-3 py-2 text-xs font-medium"
      >
        Sync now
      </button>
    </div>
  );
}

export default OfflineBadge;
