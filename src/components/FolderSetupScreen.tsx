import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface FolderSetupScreenProps {
  onSelect: (path: string) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

const QUICK_PATHS = [
  { path: '/storage/emulated/0/OBDProtocols', label: 'Внутренняя память', sub: 'OBDProtocols' },
  { path: '/storage/emulated/0/Download/OBDProtocols', label: 'Загрузки', sub: 'Download / OBDProtocols' },
  { path: '/storage/emulated/0/Documents/OBDProtocols', label: 'Документы', sub: 'Documents / OBDProtocols' },
  { path: '/sdcard/OBDProtocols', label: 'SD карта', sub: 'sdcard / OBDProtocols' },
];

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
      <div className="flex-1 px-5 pb-10">

        {/* Выбор папки */}
        <div className="mb-6 animate-fade-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-xl bg-blue-500/15 flex items-center justify-center shrink-0">
              <Icon name="FolderOpen" size={16} className="text-blue-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-foreground">Выбери папку с протоколами</div>
              <div className="text-xs text-muted-foreground">Где лежат .json файлы на телефоне</div>
            </div>
          </div>

          <div className="space-y-2">
            {QUICK_PATHS.map((item, i) => {
              const isSelected = selectedPath === item.path;
              const isChecking = isSelected && isLoading;
              return (
                <button
                  key={item.path}
                  onClick={() => handleSelect(item.path)}
                  disabled={isLoading}
                  style={{ animationDelay: `${i * 60}ms` }}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all active:scale-[0.98] animate-fade-up ${
                    isSelected && !error
                      ? 'border-blue-500/40 bg-blue-500/10'
                      : 'border-white/5 bg-card hover:border-white/10 hover:bg-secondary/50'
                  } disabled:opacity-60`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isSelected && !error ? 'bg-blue-500/20' : 'bg-secondary'
                  }`}>
                    {isChecking ? (
                      <Icon name="Loader2" size={18} className="text-blue-400 animate-spin" />
                    ) : (
                      <Icon name="Folder" size={18} className={isSelected && !error ? 'text-blue-400' : 'text-muted-foreground'} />
                    )}
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="text-sm font-medium text-foreground">{item.label}</div>
                    <div className="text-xs text-muted-foreground font-mono truncate">{item.sub}</div>
                  </div>
                  <Icon
                    name={isSelected && !error && !isLoading ? 'CheckCircle2' : 'ChevronRight'}
                    size={18}
                    className={isSelected && !error && !isLoading ? 'text-blue-400' : 'text-muted-foreground'}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Свой путь */}
        <div className="mb-5 animate-fade-up delay-300">
          {!showCustom ? (
            <button
              onClick={() => setShowCustom(true)}
              className="w-full flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name="FolderInput" size={16} />
              Указать другой путь к папке
            </button>
          ) : (
            <div className="space-y-2">
              <div className="text-xs text-muted-foreground px-1 mb-2">Введи полный путь к папке:</div>
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
          <div className="mb-5 p-4 rounded-2xl bg-red-500/8 border border-red-500/20 animate-fade-up">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
                <Icon name="AlertCircle" size={16} className="text-red-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-red-400 mb-1">Папка не найдена</div>
                <div className="text-xs text-red-400/70 whitespace-pre-line">{error}</div>
              </div>
            </div>
          </div>
        )}

        {/* Инструкция */}
        <div className="rounded-2xl bg-card border border-white/5 p-4 animate-fade-up delay-200">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Как подготовить папку
          </div>
          <div className="space-y-3">
            {[
              { icon: 'FolderPlus', color: 'text-blue-400 bg-blue-500/10', text: 'Создай папку OBDProtocols во внутренней памяти телефона' },
              { icon: 'FileJson', color: 'text-purple-400 bg-purple-500/10', text: 'Скопируй в неё .json файлы протоколов' },
              { icon: 'ShieldCheck', color: 'text-emerald-400 bg-emerald-500/10', text: 'Разреши приложению доступ к хранилищу при запросе' },
            ].map((step, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${step.color}`}>
                  <Icon name={step.icon} size={14} />
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
