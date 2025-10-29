'use client';

import { Moon, RotateCcw } from 'lucide-react';

export default function Header() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-600">A.S.H.I.Y.A</h1>
            <p className="text-gray-600 text-sm">Advanced Solar Heuristic Intelligence for Yield Audit</p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <Moon size={20} className="text-gray-600" />
        </button>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <RotateCcw size={20} className="text-gray-600" />
        </button>
      </div>
    </div>
  );
}
