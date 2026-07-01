"use client";

interface CreatorSocialLinksCardProps {
  creatorName: string;
  creatorCategory: string;
}

export function CreatorSocialLinksCard({ creatorName, creatorCategory }: CreatorSocialLinksCardProps) {
  const handleBase = creatorName.toLowerCase().replace(/\s+/g, "");

  const channels = [
    {
      name: "TikTok",
      handle: `@${handleBase}.official`,
      followers: "15.4K",
      avgViews: "18.5K",
      icon: (
        <svg className="w-5 h-5 text-neutral-900" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.01 1.62 4.18.99 1.17 2.37 1.96 3.86 2.23v3.74c-1.42-.02-2.82-.41-4.04-1.15-.36-.21-.7-.47-1.01-.76v7.37c-.07 1.52-.64 3.01-1.66 4.14-1.02 1.13-2.45 1.83-3.98 1.99-1.53.16-3.11-.21-4.37-1.07A5.996 5.996 0 0 1 3.93 16.2c-.36-1.5-.16-3.11.58-4.47.74-1.36 1.99-2.38 3.48-2.83V12.7c-.52.12-1 .4-1.37.8-.37.4-.59.93-.62 1.48-.03.55.12 1.1.43 1.56.31.46.77.78 1.29.92.52.14 1.07.08 1.55-.16.48-.24.86-.66 1.06-1.17.16-.41.22-.85.22-1.29V0h2.01z" />
        </svg>
      ),
      color: "border-neutral-200 bg-neutral-50/30",
    },
    {
      name: "Instagram",
      handle: `@${handleBase}_lifestyle`,
      followers: "9.8K",
      avgViews: "11.2K",
      icon: (
        <svg className="w-5 h-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      color: "border-pink-100 bg-pink-50/10",
    },
  ];

  return (
    <div className="rounded-2xl border border-border-soft bg-white p-5 space-y-4 shadow-2xs">
      <span className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
        Saluran Media Sosial
      </span>

      <div className="space-y-3">
        {channels.map((chan, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-4 transition-colors ${chan.color}`}
          >
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center border border-border-subtle shrink-0 shadow-3xs">
                {chan.icon}
              </div>
              <div className="space-y-0.5">
                <span className="block text-xs font-extrabold text-text-primary">
                  {chan.name}
                </span>
                <span className="block text-[10px] text-text-muted font-bold hover:underline cursor-pointer">
                  {chan.handle}
                </span>
              </div>
            </div>

            <div className="text-right space-y-0.5">
              <span className="block text-xs font-extrabold text-text-primary">
                {chan.followers}
              </span>
              <span className="block text-[8px] text-text-muted uppercase tracking-wider font-bold">
                Followers
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
