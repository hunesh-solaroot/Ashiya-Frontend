'use client';

import Image from 'next/image';

interface HeaderProps {
  modelStatus: 'online' | 'offline' | 'unknown';
  isStatusLoading?: boolean;
}

export default function Header({ modelStatus, isStatusLoading = false }: HeaderProps) {
  const normalizedStatus = modelStatus?.toLowerCase() as HeaderProps['modelStatus'];

  const statusLabel = isStatusLoading
    ? 'Checking...'
    : normalizedStatus === 'online'
    ? 'Online'
    : normalizedStatus === 'offline'
    ? 'Offline'
    : 'Unknown';

  const statusClasses = isStatusLoading
    ? 'bg-gray-100 text-gray-600'
    : normalizedStatus === 'online'
    ? 'bg-emerald-100 text-emerald-700'
    : normalizedStatus === 'offline'
    ? 'bg-red-100 text-red-700'
    : 'bg-amber-100 text-amber-700';

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center">
            <Image
              src="/logo-open.png"
              alt="Ashiya"
              width={120}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          <p className="text-gray-900 text-sm font-normal mt-1">
            Advanced Solar Heuristic Intelligence for Yield Audit
          </p>
        </div>

        <div className="mt-1 flex flex-col items-end">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Model Status</span>
          <span className={`mt-1 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}>
            <span className={`h-2 w-2 rounded-full ${
              isStatusLoading
                ? 'bg-gray-400 animate-pulse'
                : normalizedStatus === 'online'
                ? 'bg-emerald-500'
                : normalizedStatus === 'offline'
                ? 'bg-red-500'
                : 'bg-amber-500'
            }`} />
            {statusLabel}
          </span>
        </div>
      </div>
    </header>
  );
}
