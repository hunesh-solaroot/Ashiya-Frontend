'use client';

import Image from 'next/image';

export default function Header() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-0.5">
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
    </div>
  );
}
