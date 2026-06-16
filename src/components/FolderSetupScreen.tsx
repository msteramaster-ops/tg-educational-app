import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface FolderSetupScreenProps {
  onSelect: (path: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const DEFAULT_PATH = '/storage/emulated/0/OBDProtocols';

export default function FolderSetupScreen({ onSelect, isLoading, error }: FolderSetupScreenProps) {
  const [customPath, setCustomPath] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);

  const handleSelect = (path: string) => {
    setSelectedPath(path);
    onSelect(path);
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col overflow-y-auto">

      {/* Верхняя часть с иконкой */}
      <div className="relative overflow-hidden px-6 pt-16 pb-8">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-0 w-48 h-48 rounded-full bg-purple-500/6 blur-2xl pointer-events-none" />

        <div className="flex justify-center mb-8">
          <div className="relative animate-float">
            <div className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center shadow-glow">
              <Icon name="Gauge" size={44} className="text-white" />
            </div>
          </div>
        </div>

        <div className="text-center">
          <h1 className="font-display text-3xl text-foreground mb-2">OBD Pro</h1>
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
            Профессиональная диагностика автомобилей прямо с телефона
          </p>
        </div>
      </div>

      {/* Основной контент */}
      <div className="flex-1 px-5 pb-10 space-y-4">

        {/* Большая кнопка — один путь */}
        <div className="animate-fade-up">
          <button
            onClick={() => handleSelect(DEFAULT_PATH)}
            disabled={isLoading}
            className={`w-full flex items-center gap-4 p-5 rounded-3xl border transition-all active:scale-[0.97] ${
              selectedPath && !error
                ? 'border-blue-500/50 bg-blue-500/10'
                : 'border-white/8 bg-card'
            } disabled:opacity-60`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
              selectedPath && !error ? 'bg-blue-500/20' : 'bg-secondary'
            }`}>
              {isLoading ? (
                <Icon name="Loader2" size={24} className="text-blue-400 animate-spin" />
              ) : selectedPath && !error ? (
                <Icon name="CheckCircle2" size={24} className="text-blue-400" />
              ) : (
                <Icon name="FolderOpen" size={24} className="text-muted-foreground" />
              )}
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="text-base font-semibold text-foreground mb-0.5">
                {isLoading ? 'Проверяем папку...' : selectedPath && !error ? 'Папка найдена!' : 'Открыть папку протоколов'}
              </div>
              <div className="text-xs text-muted-foreground font-mono truncate">
                /storage/emulated/0/OBDProtocols
              </div>
            </div>
            {!isLoading && (
              <Icon name="ChevronRight" size={20} className="text-muted-foreground shrink-0" />
            )}
          </button>
        </div>

        {/* Другой путь */}
        <div className="animate-fade-up delay-100">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full py-3 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1.5"
            >
              <Icon name="FolderInput" size={15} />
              Другой путь к папке
            </button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPath}
                  onChange={e => setCustomPath(e.target.value)}
                  placeholder="/storage/emulated/0/МояПапка"
                  className="flex-1 bg-secondary border border-white/5 rounded-2xl px-4 py-3 text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-blue-500/40 transition-colors"
                />
                <button
                  onClick={() => handleSelect(customPath)}
                  disabled={!customPath.trim() || isLoading}
                  className="px-5 py-3 gradient-primary text-white rounded-2xl text-sm font-semibold disabled:opacity-40 transition-all active:scale-95 shadow-glow"
                >
                  Ок
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Ошибка */}
        {error && (
          <div className="p-4 rounded-2xl bg-red-500/8 border border-red-500/20 animate-fade-up">
            <div className="flex items-start gap-3">
              <Icon name="AlertCircle" size={18} className="text-red-400 shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-red-400 mb-1">Папка не найдена</div>
                <div className="text-xs text-red-400/60">
                  Создай папку <span className="font-mono text-red-400">OBDProtocols</span> на телефоне и попробуй снова
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Инструкция */}
        <div className="rounded-2xl bg-card border border-white/5 p-4 animate-fade-up delay-200">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
            Как начать
          </div>
          <div className="space-y-3">
            {[
              { icon: 'FolderPlus', color: 'text-blue-400 bg-blue-500/10', text: 'Создай папку OBDProtocols во внутренней памяти' },
              { icon: 'FileJson', color: 'text-violet-400 bg-violet-500/10', text: 'Скопируй .json файлы протоколов в эту папку' },
              { icon: 'ShieldCheck', color: 'text-emerald-400 bg-emerald-500/10', text: 'Разреши доступ к хранилищу при запросе Android' },
            ].map((s, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                  <Icon name={s.icon} size={14} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed pt-0.5">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}