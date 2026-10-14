import React, { useState } from 'react';
import { Smartphone, Monitor, Check, RefreshCw } from 'lucide-react';

const DEVICE_PRESETS = [
  { name: 'iPhone 15 / 14 Pro', width: 393, height: 852, ratio: '9:19.5' },
  { name: 'Samsung Galaxy S23', width: 412, height: 915, ratio: '9:20' },
  { name: 'iPhone 14 / 13', width: 390, height: 844, ratio: '9:19.5' },
  { name: 'Pixel 7', width: 412, height: 915, ratio: '9:20' },
  { name: 'iPhone 15 Pro Max', width: 430, height: 932, ratio: '9:19.5' },
  { name: 'Compact Phone', width: 360, height: 800, ratio: '9:20' },
];

export default function DeviceSimulator({ activeDevice, onSelectDevice, isSimulating, onToggleSimulate }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center space-x-2 bg-gray-900/90 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-2xl text-xs">
      <button
        onClick={onToggleSimulate}
        className={`flex items-center space-x-2 px-3 py-2 rounded-xl font-bold tracking-wider uppercase transition-all ${
          isSimulating
            ? 'bg-gradient-to-r from-amber-500 to-cyan-500 text-white shadow-lg shadow-amber-500/20'
            : 'bg-white/10 hover:bg-white/20 text-gray-300'
        }`}
      >
        <Smartphone className="w-4 h-4" />
        <span>{isSimulating ? 'Mobile Sim ON' : 'Preview Mobile'}</span>
      </button>

      {isSimulating && (
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-cyan-300 font-bold flex items-center space-x-2"
          >
            <span>{activeDevice.name} ({activeDevice.width}×{activeDevice.height})</span>
          </button>

          {isOpen && (
            <div className="absolute right-0 bottom-12 w-64 bg-gray-900 border border-white/20 rounded-2xl p-2 shadow-2xl flex flex-col space-y-1">
              <div className="text-[10px] font-bold text-gray-400 px-3 py-1 uppercase tracking-widest border-b border-white/10">
                Target Mobile Viewports
              </div>
              {DEVICE_PRESETS.map((dev) => (
                <button
                  key={dev.name}
                  onClick={() => {
                    onSelectDevice(dev);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors ${
                    activeDevice.name === dev.name
                      ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-500/30'
                      : 'hover:bg-white/10 text-gray-300'
                  }`}
                >
                  <div>
                    <div className="font-semibold">{dev.name}</div>
                    <div className="text-[10px] text-gray-400">{dev.width} × {dev.height} ({dev.ratio})</div>
                  </div>
                  {activeDevice.name === dev.name && <Check className="w-4 h-4 text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
