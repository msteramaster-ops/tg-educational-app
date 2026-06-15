import { useState } from 'react';
import Icon from '@/components/ui/icon';

const HERO_IMG = 'https://cdn.poehali.dev/projects/9c84ab67-0481-49f6-b840-91ab3c78d672/files/1de4bbf4-1c6a-418d-a652-822f9133cc7a.jpg';

function decodeVin(vin: string) {
  const v = vin.toUpperCase().trim();
  if (v.length !== 17) return null;
  const wmi = v.slice(0, 3);
  const makes: Record<string, { make: string; country: string }> = {
    WVW: { make: 'Volkswagen', country: 'Германия' },
    WAU: { make: 'Audi', country: 'Германия' },
    WBA: { make: 'BMW', country: 'Германия' },
    WBS: { make: 'BMW M', country: 'Германия' },
    WDD: { make: 'Mercedes-Benz', country: 'Германия' },
    WDB: { make: 'Mercedes-Benz', country: 'Германия' },
    TMB: { make: 'Škoda', country: 'Чехия' },
    VSS: { make: 'SEAT', country: 'Испания' },
    JTD: { make: 'Toyota', country: 'Япония' },
    JTM: { make: 'Toyota', country: 'Япония' },
    SAL: { make: 'Land Rover', country: 'Великобритания' },
    XTA: { make: 'LADA (ВАЗ)', country: 'Россия' },
    XTT: { make: 'LADA', country: 'Россия' },
    YV1: { make: 'Volvo', country: 'Швеция' },
    ZAR: { make: 'Alfa Romeo', country: 'Италия' },
    ZFA: { make: 'Fiat', country: 'Италия' },
    '1G1': { make: 'Chevrolet', country: 'США' },
    '1HG': { make: 'Honda', country: 'США/Япония' },
    KNM: { make: 'Kia', country: 'Южная Корея' },
    KMH: { make: 'Hyundai', country: 'Южная Корея' },
  };
  const years: Record<string, number> = {
    A: 1980, B: 1981, C: 1982, D: 1983, E: 1984, F: 1985, G: 1986, H: 1987,
    J: 1988, K: 1989, L: 1990, M: 1991, N: 1992, P: 1993, R: 1994, S: 1995,
    T: 1996, V: 1997, W: 1998, X: 1999, Y: 2000, '1': 2001, '2': 2002,
    '3': 2003, '4': 2004, '5': 2005, '6': 2006, '7': 2007, '8': 2008,
    '9': 2009,
  };
  const yearChar = v[9];
  const info = makes[wmi] || null;
  const year = years[yearChar] || null;
  return {
    vin: v,
    wmi,
    make: info?.make || 'Неизвестно',
    country: info?.country || 'Неизвестно',
    year: year || 'Неизвестно',
    plant: v[10],
    serial: v.slice(11),
    vds: v.slice(3, 9),
  };
}

const DTC_DB: Record<string, { desc: string; system: string; severity: 'error' | 'warn' | 'info' }> = {
  P0001: { desc: 'Регулятор давления топлива — цепь управления', system: 'Топливо', severity: 'error' },
  P0100: { desc: 'Датчик массового расхода воздуха — неисправность', system: 'Двигатель', severity: 'error' },
  P0101: { desc: 'Датчик МРВ — диапазон/производительность', system: 'Двигатель', severity: 'warn' },
  P0110: { desc: 'Датчик температуры впускного воздуха — неисправность', system: 'Двигатель', severity: 'warn' },
  P0115: { desc: 'Датчик температуры охлаждающей жидкости', system: 'Охлаждение', severity: 'error' },
  P0120: { desc: 'Датчик положения дроссельной заслонки', system: 'Двигатель', severity: 'error' },
  P0130: { desc: 'Датчик O2 (банк 1, датчик 1) — нет реакции', system: 'Выхлоп', severity: 'warn' },
  P0171: { desc: 'Топливная смесь бедная (банк 1)', system: 'Топливо', severity: 'warn' },
  P0172: { desc: 'Топливная смесь богатая (банк 1)', system: 'Топливо', severity: 'warn' },
  P0200: { desc: 'Цепь форсунки — неисправность', system: 'Топливо', severity: 'error' },
  P0300: { desc: 'Случайные/множественные пропуски зажигания', system: 'Зажигание', severity: 'error' },
  P0301: { desc: 'Пропуски зажигания — цилиндр 1', system: 'Зажигание', severity: 'error' },
  P0302: { desc: 'Пропуски зажигания — цилиндр 2', system: 'Зажигание', severity: 'error' },
  P0303: { desc: 'Пропуски зажигания — цилиндр 3', system: 'Зажигание', severity: 'error' },
  P0304: { desc: 'Пропуски зажигания — цилиндр 4', system: 'Зажигание', severity: 'error' },
  P0401: { desc: 'Система EGR — недостаточный поток', system: 'Выхлоп', severity: 'warn' },
  P0420: { desc: 'Эффективность катализатора ниже нормы (банк 1)', system: 'Выхлоп', severity: 'warn' },
  P0440: { desc: 'Система улавливания паров топлива', system: 'Выхлоп', severity: 'warn' },
  P0500: { desc: 'Датчик скорости автомобиля — неисправность', system: 'Трансмиссия', severity: 'warn' },
  P0600: { desc: 'Шина связи — неисправность', system: 'Электроника', severity: 'error' },
  P0700: { desc: 'Управление трансмиссией — неисправность', system: 'Трансмиссия', severity: 'error' },
  P0715: { desc: 'Датчик скорости входного вала', system: 'Трансмиссия', severity: 'error' },
  P0730: { desc: 'Неправильное передаточное число', system: 'Трансмиссия', severity: 'error' },
  C0035: { desc: 'Датчик скорости переднего левого колеса', system: 'ABS/ESP', severity: 'error' },
  C0040: { desc: 'Датчик скорости переднего правого колеса', system: 'ABS/ESP', severity: 'error' },
  C0045: { desc: 'Датчик скорости заднего левого колеса', system: 'ABS/ESP', severity: 'error' },
  C0050: { desc: 'Датчик скорости заднего правого колеса', system: 'ABS/ESP', severity: 'error' },
  B0001: { desc: 'Подушка безопасности водителя — неисправность', system: 'SRS/Airbag', severity: 'error' },
  B0002: { desc: 'Подушка безопасности пассажира — неисправность', system: 'SRS/Airbag', severity: 'error' },
  U0001: { desc: 'Шина CAN высокоскоростная — неисправность', system: 'Электроника', severity: 'error' },
  U0100: { desc: 'Потеря связи с ЭБУ двигателя', system: 'Электроника', severity: 'error' },
};

const HISTORY_MOCK = [
  { id: 1, vin: 'WVW1234567890ABCD', make: 'Volkswagen Golf', date: '14.06.2025', codes: ['P0171', 'P0420'], status: 'warn' },
  { id: 2, vin: 'WBA1234567890EFGH', make: 'BMW 3 Series', date: '10.06.2025', codes: [], status: 'ok' },
  { id: 3, vin: 'JTD1234567890IJKL', make: 'Toyota Camry', date: '03.06.2025', codes: ['P0300', 'P0301'], status: 'error' },
];

const NAV = [
  { id: 'home', label: 'Главная', icon: 'LayoutDashboard' },
  { id: 'vin', label: 'VIN', icon: 'Search' },
  { id: 'bluetooth', label: 'OBD-II', icon: 'Bluetooth' },
  { id: 'dtc', label: 'Коды', icon: 'BookOpen' },
  { id: 'history', label: 'История', icon: 'History' },
];

function PageHome({ setTab }: { setTab: (t: string) => void }) {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="relative rounded-xl overflow-hidden border-glow">
        <img src={HERO_IMG} alt="" className="w-full h-44 object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,20%,8%)] via-[hsl(220,20%,8%,0.5)] to-transparent" />
        <div className="absolute bottom-0 left-0 p-5">
          <div className="font-display text-2xl text-cyan-glow">AutoDiag Pro</div>
          <div className="text-sm text-muted-foreground mt-0.5">Профессиональная диагностика автомобиля</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: 'Search', label: 'Поиск по VIN', sub: 'Расшифровать номер', tab: 'vin' },
          { icon: 'Bluetooth', label: 'Подключить OBD', sub: 'ELM327 адаптер', tab: 'bluetooth' },
          { icon: 'BookOpen', label: 'Библиотека DTC', sub: 'Коды ошибок', tab: 'dtc' },
          { icon: 'History', label: 'История', sub: 'Прошлые проверки', tab: 'history' },
        ].map((a) => (
          <button key={a.tab} onClick={() => setTab(a.tab)}
            className="border-glow bg-card rounded-xl p-4 text-left hover:bg-secondary transition-colors">
            <Icon name={a.icon} size={24} className="text-cyan mb-3" />
            <div className="font-semibold text-sm">{a.label}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{a.sub}</div>
          </button>
        ))}
      </div>

      <div className="border-glow-accent bg-card rounded-xl p-4 flex items-center gap-3">
        <div className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse-glow shrink-0" />
        <div className="flex-1">
          <div className="text-sm font-semibold text-accent">Адаптер не подключён</div>
          <div className="text-xs text-muted-foreground">Подключите ELM327 через Bluetooth</div>
        </div>
        <button onClick={() => setTab('bluetooth')} className="text-xs text-cyan font-semibold shrink-0">
          Подключить →
        </button>
      </div>

      <div className="border-glow bg-card rounded-xl p-4">
        <div className="font-display text-xs text-muted-foreground mb-3">Последняя проверка</div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <Icon name="Car" size={20} className="text-cyan" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold truncate">Volkswagen Golf</div>
            <div className="text-xs text-muted-foreground">14.06.2025 · 2 ошибки</div>
          </div>
          <div className="flex gap-1 shrink-0">
            <span className="text-xs font-mono bg-secondary px-2 py-1 rounded text-accent">P0171</span>
            <span className="text-xs font-mono bg-secondary px-2 py-1 rounded text-accent">P0420</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PageVin() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<ReturnType<typeof decodeVin>>(null);
  const [error, setError] = useState('');

  const search = () => {
    const r = decodeVin(input);
    if (!r) { setError('VIN должен содержать ровно 17 символов'); setResult(null); return; }
    setError(''); setResult(r);
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <div className="font-display text-xl text-cyan-glow mb-1">Поиск по VIN</div>
        <div className="text-xs text-muted-foreground">Введите 17-значный идентификационный номер</div>
      </div>
      <div className="border-glow bg-card rounded-xl p-4 space-y-3">
        <input value={input} onChange={(e) => setInput(e.target.value.toUpperCase().slice(0, 17))}
          placeholder="WVW1234567890ABCD" maxLength={17}
          className="w-full bg-secondary rounded-lg px-4 py-3 font-mono text-sm tracking-widest outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{input.length}/17 символов</span>
          {input.length === 17 && <span className="text-green-400">✓ Длина корректна</span>}
        </div>
        <button onClick={search}
          className="w-full gradient-primary text-[hsl(220,20%,8%)] font-bold py-3 rounded-lg font-display tracking-wider hover:opacity-90 transition">
          РАСШИФРОВАТЬ VIN
        </button>
      </div>
      {error && <div className="border-glow-error bg-card rounded-xl p-4 text-sm text-destructive">{error}</div>}
      {result && (
        <div className="border-glow bg-card rounded-xl overflow-hidden animate-fade-up">
          <div className="gradient-primary px-4 py-3 flex items-center gap-2">
            <Icon name="Car" size={18} className="text-[hsl(220,20%,8%)]" />
            <span className="font-display font-bold text-[hsl(220,20%,8%)] text-lg">{result.make}</span>
          </div>
          <div className="p-4 space-y-0">
            {([
              ['VIN', result.vin, true],
              ['Марка', result.make, false],
              ['Год выпуска', String(result.year), false],
              ['Страна производства', result.country, false],
              ['WMI (производитель)', result.wmi, true],
              ['VDS (модель/тип)', result.vds, true],
              ['Завод-изготовитель', result.plant, true],
              ['Серийный номер', result.serial, true],
            ] as [string, string, boolean][]).map(([label, value, mono]) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground">{label}</span>
                <span className={`text-sm font-semibold ${mono ? 'font-mono text-cyan' : ''}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="border-glow bg-card rounded-xl p-4">
        <div className="font-display text-xs text-muted-foreground mb-3">Структура VIN-номера</div>
        <div className="flex gap-1.5 font-mono text-xs flex-wrap">
          {[
            ['WMI (1-3)', 'bg-primary/20 text-cyan'],
            ['VDS (4-9)', 'bg-accent/20 text-accent'],
            ['Год (10)', 'bg-secondary text-foreground'],
            ['Завод (11)', 'bg-secondary text-foreground'],
            ['Серия (12-17)', 'bg-secondary text-foreground'],
          ].map(([label, cls]) => (
            <span key={label} className={`${cls} px-2 py-1 rounded`}>{label}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function PageBluetooth() {
  const [state, setState] = useState<'idle' | 'scanning' | 'connected'>('idle');
  const [codes] = useState(['P0171', 'P0420']);

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <div className="font-display text-xl text-cyan-glow mb-1">OBD-II Диагностика</div>
        <div className="text-xs text-muted-foreground">Bluetooth подключение к ELM327 адаптеру</div>
      </div>
      <div className="border-glow bg-card rounded-xl p-6 flex flex-col items-center gap-5">
        <div className={`w-24 h-24 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
          state === 'connected' ? 'border-green-400 bg-green-400/10'
          : state === 'scanning' ? 'border-primary animate-pulse-glow'
          : 'border-border bg-secondary'
        }`}>
          <Icon name={state === 'connected' ? 'BluetoothConnected' : 'Bluetooth'} size={36}
            className={state === 'connected' ? 'text-green-400' : 'text-cyan'} />
        </div>
        <div className="text-center">
          <div className="font-semibold">
            {state === 'idle' && 'Адаптер не подключён'}
            {state === 'scanning' && 'Поиск адаптера...'}
            {state === 'connected' && 'ELM327 подключён'}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {state === 'idle' && 'Включите OBD-адаптер в разъём автомобиля'}
            {state === 'scanning' && 'Убедитесь, что Bluetooth включён'}
            {state === 'connected' && 'Считывание данных активно'}
          </div>
        </div>
        {state !== 'connected' ? (
          <button onClick={() => { setState('scanning'); setTimeout(() => setState('connected'), 2200); }}
            disabled={state === 'scanning'}
            className="gradient-primary text-[hsl(220,20%,8%)] font-bold px-8 py-3 rounded-lg font-display tracking-wider hover:opacity-90 transition disabled:opacity-50">
            {state === 'scanning' ? 'ПОИСК...' : 'ПОДКЛЮЧИТЬ'}
          </button>
        ) : (
          <button onClick={() => setState('idle')}
            className="border border-destructive/50 text-destructive font-semibold px-8 py-3 rounded-lg hover:bg-destructive/10 transition">
            Отключить
          </button>
        )}
      </div>

      {state === 'connected' && (
        <div className="space-y-3 animate-fade-up">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Обороты', value: '850 RPM', icon: 'Gauge' },
              { label: 'Температура', value: '91°C', icon: 'Thermometer' },
              { label: 'Напряжение', value: '14.2V', icon: 'Zap' },
              { label: 'Скорость', value: '0 км/ч', icon: 'Navigation' },
            ].map((m) => (
              <div key={m.label} className="border-glow bg-card rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={m.icon} size={16} className="text-cyan" />
                  <span className="text-xs text-muted-foreground">{m.label}</span>
                </div>
                <div className="font-display text-xl text-cyan-glow">{m.value}</div>
              </div>
            ))}
          </div>
          <div className="border-glow-error bg-card rounded-xl p-4">
            <div className="font-display text-xs text-muted-foreground mb-3">Найдено ошибок: {codes.length}</div>
            <div className="space-y-2">
              {codes.map((code) => (
                <div key={code} className="flex items-center gap-3 bg-secondary rounded-lg px-3 py-2.5">
                  <span className="font-mono font-bold text-sm text-destructive shrink-0">{code}</span>
                  <span className="text-xs text-muted-foreground flex-1">{DTC_DB[code]?.desc || '—'}</span>
                </div>
              ))}
            </div>
            <button className="mt-3 w-full border border-destructive/40 text-destructive text-sm font-semibold py-2 rounded-lg hover:bg-destructive/10 transition">
              Сбросить ошибки
            </button>
          </div>
        </div>
      )}

      <div className="border-glow bg-card rounded-xl p-4">
        <div className="font-display text-xs text-muted-foreground mb-2">Совместимые адаптеры</div>
        {['ELM327 Bluetooth v1.5 / v2.1', 'OBDLink MX+ Bluetooth', 'Vgate iCar Pro BLE', 'Любой адаптер OBD-II / ISO 15765'].map((t) => (
          <div key={t} className="text-xs text-muted-foreground py-1">• {t}</div>
        ))}
      </div>
    </div>
  );
}

function PageDTC() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'P' | 'C' | 'B' | 'U'>('all');

  const filtered = Object.entries(DTC_DB).filter(([code, info]) => {
    const q = search.toUpperCase();
    return (!q || code.includes(q) || info.desc.toUpperCase().includes(q) || info.system.toUpperCase().includes(q))
      && (filter === 'all' || code.startsWith(filter));
  });

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <div className="font-display text-xl text-cyan-glow mb-1">Библиотека DTC</div>
        <div className="text-xs text-muted-foreground">База кодов ошибок OBD-II на русском языке</div>
      </div>
      <div className="border-glow bg-card rounded-xl p-3 flex items-center gap-2">
        <Icon name="Search" size={16} className="text-muted-foreground shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Код ошибки или описание..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        {search && <button onClick={() => setSearch('')}><Icon name="X" size={14} className="text-muted-foreground" /></button>}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'P', 'C', 'B', 'U'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition ${
              filter === f ? 'gradient-primary text-[hsl(220,20%,8%)]' : 'bg-secondary text-muted-foreground'
            }`}>
            {f === 'all' ? 'Все' : `${f} — ${f === 'P' ? 'Двигатель' : f === 'C' ? 'Шасси' : f === 'B' ? 'Кузов' : 'Сеть'}`}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center text-muted-foreground text-sm py-10">Ничего не найдено</div>}
        {filtered.map(([code, info]) => (
          <div key={code} className={`bg-card rounded-xl p-4 ${
            info.severity === 'error' ? 'border-glow-error' : info.severity === 'warn' ? 'border-glow-accent' : 'border-glow'
          }`}>
            <div className="flex items-start gap-3">
              <span className={`font-mono font-bold text-sm shrink-0 mt-0.5 ${
                info.severity === 'error' ? 'status-error' : info.severity === 'warn' ? 'status-warn' : 'status-ok'
              }`}>{code}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-snug">{info.desc}</div>
                <div className="text-xs text-muted-foreground mt-1">{info.system}</div>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                info.severity === 'error' ? 'bg-destructive/15 text-destructive'
                : info.severity === 'warn' ? 'bg-accent/15 text-accent'
                : 'bg-primary/15 text-cyan'
              }`}>
                {info.severity === 'error' ? 'Критично' : info.severity === 'warn' ? 'Внимание' : 'Инфо'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageHistory() {
  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <div className="font-display text-xl text-cyan-glow mb-1">История проверок</div>
        <div className="text-xs text-muted-foreground">{HISTORY_MOCK.length} сохранённых диагностики</div>
      </div>
      <div className="space-y-3">
        {HISTORY_MOCK.map((h) => (
          <div key={h.id} className={`bg-card rounded-xl p-4 ${
            h.status === 'error' ? 'border-glow-error' : h.status === 'warn' ? 'border-glow-accent' : 'border-glow'
          }`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                h.status === 'error' ? 'bg-destructive/15' : h.status === 'warn' ? 'bg-accent/15' : 'bg-green-400/10'
              }`}>
                <Icon name="Car" size={20} className={
                  h.status === 'error' ? 'text-destructive' : h.status === 'warn' ? 'text-accent' : 'text-green-400'
                } />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{h.make}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{h.vin}</div>
                <div className="text-xs text-muted-foreground mt-1">{h.date}</div>
              </div>
              <div className="text-right shrink-0">
                {h.codes.length > 0 ? (
                  <div className="flex flex-col gap-1">
                    {h.codes.map((c) => (
                      <span key={c} className="font-mono text-xs bg-secondary px-2 py-0.5 rounded text-accent">{c}</span>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-green-400 font-semibold">Ошибок нет</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full border border-border text-muted-foreground text-sm font-semibold py-3 rounded-xl hover:bg-secondary transition">
        + Новая диагностика
      </button>
    </div>
  );
}

const Index = () => {
  const [tab, setTab] = useState('home');

  const pages: Record<string, JSX.Element> = {
    home: <PageHome setTab={setTab} />,
    vin: <PageVin />,
    bluetooth: <PageBluetooth />,
    dtc: <PageDTC />,
    history: <PageHistory />,
  };

  return (
    <div className="min-h-screen bg-background grid-bg pb-28">
      <div className="max-w-xl mx-auto px-4 pt-6">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center shadow-glow">
              <Icon name="Activity" size={18} className="text-[hsl(220,20%,8%)]" />
            </div>
            <span className="font-display text-lg text-cyan-glow">AutoDiag Pro</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground border border-border rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-accent" />
            v1.0
          </div>
        </header>
        {pages[tab]}
      </div>

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-card border-glow rounded-2xl px-2 py-2 flex items-center gap-1 w-[calc(100%-2rem)] max-w-sm">
        {NAV.map((n) => (
          <button key={n.id} onClick={() => setTab(n.id)}
            className={`flex flex-col items-center justify-center rounded-xl px-2 py-2 flex-1 transition-all ${
              tab === n.id ? 'gradient-primary text-[hsl(220,20%,8%)] shadow-glow' : 'text-muted-foreground hover:text-foreground'
            }`}>
            <Icon name={n.icon} size={20} />
            <span className="text-[10px] font-semibold mt-0.5">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Index;
