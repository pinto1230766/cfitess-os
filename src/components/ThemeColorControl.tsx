import React, { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Palette, Check } from 'lucide-react';
import { useCfos } from '../context/CfosContext';
import { ACCENT_COLOR_OPTIONS, getAccentColorOption } from '../domain/theme';

export interface ThemeColorControlProps {
  variant?: 'full' | 'compact' | 'inline';
}

export function ThemeColorControl({ variant = 'full' }: ThemeColorControlProps) {
  const {
    themeMode,
    setThemeMode,
    toggleThemeMode,
    accentColor,
    setAccentColor,
  } = useCfos();

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDark = themeMode === 'dark';
  const activeAccent = getAccentColorOption(accentColor);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  if (variant === 'inline') {
    return (
      <div
        className={`p-3 rounded-2xl border space-y-2.5 text-xs ${
          isDark
            ? 'bg-[#171C2E] border-slate-800 text-slate-200'
            : 'bg-slate-50 border-slate-200 text-slate-800'
        }`}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
            Personnaliser l&apos;affichage (Jour / Nuit)
          </span>
          <button
            type="button"
            onClick={toggleThemeMode}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] flex items-center gap-1.5 cursor-pointer border ${
              isDark
                ? 'bg-slate-800 border-slate-700 text-amber-300'
                : 'bg-white border-slate-200 text-slate-700'
            }`}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Mode Jour</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-violet-600" />
                <span>Mode Nuit</span>
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-6 gap-1.5 pt-0.5">
          {ACCENT_COLOR_OPTIONS.map((opt) => {
            const selected = opt.id === accentColor;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setAccentColor(opt.id)}
                title={`Couleur : ${opt.label}`}
                aria-label={`Couleur ${opt.label}`}
                className={`h-7 rounded-lg flex items-center justify-center border transition-transform cursor-pointer ${
                  selected ? 'scale-105 ring-2 ring-offset-1 ring-slate-400 border-white' : 'border-transparent opacity-85 hover:opacity-100'
                }`}
                style={{ backgroundColor: opt.hexPrimary }}
              >
                {selected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative flex items-center">
      {/* Unified Display Customization Button ("Personnaliser l'affichage" — Jour/Nuit & Couleurs) */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Personnaliser l'affichage (Mode Jour/Nuit et Couleur)"
        aria-expanded={open}
        title={`Personnaliser l'affichage : ${isDark ? 'Mode Nuit' : 'Mode Jour'} · ${activeAccent.label}`}
        className={`rounded-xl border font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
          variant === 'compact'
            ? 'min-h-[30px] px-2.5 py-1 text-[11px]'
            : 'min-h-[38px] px-3 py-1.5 text-xs'
        } ${
          isDark
            ? 'bg-[#1A2033] border-slate-700 text-slate-200 hover:bg-slate-800'
            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
        }`}
      >
        {isDark ? (
          <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        ) : (
          <Sun className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        )}
        <Palette className="w-3.5 h-3.5 text-violet-500 shrink-0" />
        <span
          className="w-2.5 h-2.5 rounded-full shrink-0 border border-white/40 shadow-2xs"
          style={{ backgroundColor: activeAccent.hexPrimary }}
        />
        {variant === 'compact' ? (
          <span>Affichage</span>
        ) : (
          <>
            <span className="hidden sm:inline">Personnaliser l&apos;affichage</span>
            <span className="sm:hidden">Affichage</span>
          </>
        )}
      </button>

      {/* Popover Panel */}
      {open && (
        <div
          className={`absolute right-0 top-full mt-2 w-72 rounded-2xl border shadow-2xl p-3.5 z-50 space-y-3 text-xs ${
            isDark
              ? 'bg-[#151A2C] border-slate-700 text-slate-100'
              : 'bg-white border-slate-200 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between border-b pb-2 border-slate-200 dark:border-slate-800">
            <span className="font-extrabold text-xs">
              Personnaliser l&apos;affichage
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              PC · Tablette · Mobile
            </span>
          </div>

          {/* Mode Jour / Mode Nuit Selector */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Luminosité (Jour / Nuit)
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setThemeMode('light')}
                className={`py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  !isDark
                    ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Mode Jour</span>
              </button>
              <button
                type="button"
                onClick={() => setThemeMode('dark')}
                className={`py-2 px-2.5 rounded-xl border font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer ${
                  isDark
                    ? 'bg-violet-600 text-white border-violet-600 shadow-2xs'
                    : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Mode Nuit</span>
              </button>
            </div>
          </div>

          {/* 6 Display Colors Grid */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Couleur de l&apos;affichage (6 thèmes)
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {ACCENT_COLOR_OPTIONS.map((opt) => {
                const isSelected = opt.id === accentColor;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setAccentColor(opt.id);
                    }}
                    className={`p-2 rounded-xl border text-left flex items-center gap-2 cursor-pointer transition-all ${
                      isSelected
                        ? isDark
                          ? 'bg-slate-800 border-white/60 font-bold text-white'
                          : 'bg-slate-100 border-slate-900 font-bold text-slate-900'
                        : isDark
                        ? 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800/70'
                        : 'bg-slate-50 border-slate-200/80 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center shadow-2xs"
                      style={{ backgroundColor: opt.hexPrimary }}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </span>
                    <span className="truncate text-[11px]">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
