import { useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';

const HERO_IMG = 'https://cdn.poehali.dev/projects/9c84ab67-0481-49f6-b840-91ab3c78d672/files/1de4bbf4-1c6a-418d-a652-822f9133cc7a.jpg';

// ── DTC Справочник (расширенный) ─────────────────────────────────────────────
export const DTC_DB: Record<string, { desc: string; detail: string; system: string; severity: 'error' | 'warn' | 'info'; causes: string[]; actions: string[] }> = {
  P0001: { desc: 'Регулятор давления топлива — цепь управления', detail: 'Неисправность в электрической цепи управления регулятором давления топлива. ЭБУ не может контролировать давление в топливной рампе.', system: 'Топливо', severity: 'error', causes: ['Обрыв или короткое замыкание в цепи', 'Неисправный регулятор давления', 'Неисправность ЭБУ'], actions: ['Проверить проводку и разъёмы', 'Измерить давление топлива', 'Заменить регулятор при необходимости'] },
  P0100: { desc: 'Датчик массового расхода воздуха — неисправность', detail: 'ЭБУ получает сигнал от датчика МРВ вне допустимого диапазона. Возможна нестабильная работа двигателя.', system: 'Двигатель', severity: 'error', causes: ['Загрязнение чувствительного элемента', 'Обрыв в цепи датчика', 'Подсос воздуха после датчика'], actions: ['Очистить датчик специальным очистителем', 'Проверить герметичность впускного тракта', 'Заменить датчик МРВ'] },
  P0101: { desc: 'Датчик МРВ — диапазон/производительность', detail: 'Показания датчика МРВ не соответствуют расчётным значениям ЭБУ при данных оборотах и нагрузке.', system: 'Двигатель', severity: 'warn', causes: ['Частично забитый воздушный фильтр', 'Загрязнение датчика', 'Подсос воздуха'], actions: ['Заменить воздушный фильтр', 'Проверить герметичность впуска', 'Очистить или заменить датчик МРВ'] },
  P0110: { desc: 'Датчик температуры впускного воздуха — неисправность', detail: 'Сигнал от датчика IAT выходит за пределы допустимого диапазона (обычно -40°C до +125°C).', system: 'Двигатель', severity: 'warn', causes: ['Обрыв или КЗ в цепи датчика', 'Неисправный датчик IAT'], actions: ['Проверить сопротивление датчика', 'Проверить проводку', 'Заменить датчик'] },
  P0115: { desc: 'Датчик температуры охлаждающей жидкости — неисправность', detail: 'Сигнал от датчика ECT не соответствует норме. Двигатель может переходить в аварийный режим с фиксированной температурой.', system: 'Охлаждение', severity: 'error', causes: ['Неисправный датчик ECT', 'Обрыв или КЗ в цепи', 'Проблемы с системой охлаждения'], actions: ['Проверить сопротивление датчика', 'Проверить уровень и состояние антифриза', 'Заменить датчик ECT'] },
  P0120: { desc: 'Датчик положения дроссельной заслонки — неисправность', detail: 'Сигнал датчика TPS вне допустимого диапазона. Возможны проблемы с приёмистостью и холостым ходом.', system: 'Двигатель', severity: 'error', causes: ['Неисправный датчик TPS', 'Обрыв или КЗ в цепи', 'Механическая проблема с заслонкой'], actions: ['Проверить сигнал датчика сканером', 'Проверить проводку и разъёмы', 'Заменить датчик TPS или дроссельный узел'] },
  P0130: { desc: 'Датчик O2 (банк 1, датчик 1) — нет реакции', detail: 'Лямбда-зонд перед катализатором (банк 1) не реагирует на изменения состава смеси или выдаёт постоянный сигнал.', system: 'Выхлоп', severity: 'warn', causes: ['Отравление датчика свинцом или силиконом', 'Обрыв в цепи подогрева', 'Неисправный датчик'], actions: ['Проверить напряжение на датчике (норма: 0.1–0.9 В)', 'Проверить подогрев лямбды', 'Заменить датчик кислорода'] },
  P0171: { desc: 'Топливная смесь бедная (банк 1)', detail: 'ЭБУ вышел за пределы коррекции топливоподачи в сторону обогащения. Смесь слишком бедная на протяжении длительного времени.', system: 'Топливо', severity: 'warn', causes: ['Подсос воздуха во впуске', 'Засорённые форсунки', 'Слабый топливный насос', 'Загрязнённый датчик МРВ'], actions: ['Проверить герметичность впускного коллектора', 'Очистить или заменить форсунки', 'Измерить давление топлива'] },
  P0172: { desc: 'Топливная смесь богатая (банк 1)', detail: 'ЭБУ вышел за пределы коррекции в сторону обеднения. Слишком богатая смесь — избыток топлива.', system: 'Топливо', severity: 'warn', causes: ['Неисправный датчик O2', 'Переобогащение форсунок', 'Неисправный регулятор давления топлива', 'Утечка топлива во впуске'], actions: ['Проверить датчики кислорода', 'Проверить давление топлива (возможно завышено)', 'Диагностика форсунок'] },
  P0200: { desc: 'Цепь форсунки — неисправность', detail: 'Общая ошибка цепи управления форсунками. ЭБУ обнаружил отклонение в цепи одной или нескольких форсунок.', system: 'Топливо', severity: 'error', causes: ['Обрыв или КЗ в цепи форсунки', 'Неисправная форсунка', 'Проблема с ЭБУ'], actions: ['Проверить сопротивление форсунок (норма: 12–17 Ом)', 'Проверить проводку', 'Диагностика осциллографом'] },
  P0300: { desc: 'Случайные/множественные пропуски зажигания', detail: 'Пропуски зажигания зафиксированы в нескольких цилиндрах случайным образом. Возможна вибрация, потеря мощности, хлопки в выхлопе.', system: 'Зажигание', severity: 'error', causes: ['Изношенные свечи зажигания', 'Неисправные катушки зажигания', 'Плохое топливо', 'Компрессия в цилиндрах'], actions: ['Заменить свечи зажигания', 'Проверить катушки зажигания', 'Измерить компрессию в цилиндрах'] },
  P0301: { desc: 'Пропуски зажигания — цилиндр 1', detail: 'Пропуски воспламенения рабочей смеси в цилиндре №1. Двигатель работает неровно, возможна потеря мощности.', system: 'Зажигание', severity: 'error', causes: ['Свеча цилиндра 1', 'Катушка зажигания цилиндра 1', 'Форсунка цилиндра 1', 'Низкая компрессия'], actions: ['Заменить свечу в цилиндре 1', 'Переставить катушку и проверить', 'Измерить компрессию в цилиндре 1'] },
  P0302: { desc: 'Пропуски зажигания — цилиндр 2', detail: 'Пропуски воспламенения в цилиндре №2.', system: 'Зажигание', severity: 'error', causes: ['Свеча цилиндра 2', 'Катушка зажигания цилиндра 2', 'Форсунка цилиндра 2'], actions: ['Заменить свечу в цилиндре 2', 'Проверить катушку зажигания', 'Диагностика форсунки'] },
  P0303: { desc: 'Пропуски зажигания — цилиндр 3', detail: 'Пропуски воспламенения в цилиндре №3.', system: 'Зажигание', severity: 'error', causes: ['Свеча цилиндра 3', 'Катушка зажигания цилиндра 3', 'Форсунка цилиндра 3'], actions: ['Заменить свечу в цилиндре 3', 'Проверить катушку зажигания', 'Диагностика форсунки'] },
  P0304: { desc: 'Пропуски зажигания — цилиндр 4', detail: 'Пропуски воспламенения в цилиндре №4.', system: 'Зажигание', severity: 'error', causes: ['Свеча цилиндра 4', 'Катушка зажигания цилиндра 4', 'Форсунка цилиндра 4'], actions: ['Заменить свечу в цилиндре 4', 'Проверить катушку зажигания', 'Диагностика форсунки'] },
  P0401: { desc: 'Система EGR — недостаточный поток', detail: 'Система рециркуляции выхлопных газов не обеспечивает достаточный поток при команде открытия.', system: 'Выхлоп', severity: 'warn', causes: ['Забитый клапан EGR', 'Закоксованные каналы', 'Неисправный датчик давления EGR'], actions: ['Очистить или заменить клапан EGR', 'Прочистить каналы рециркуляции', 'Проверить вакуумные магистрали'] },
  P0420: { desc: 'Эффективность катализатора ниже нормы (банк 1)', detail: 'Катализатор не справляется с нейтрализацией выхлопных газов. Сигналы заднего и переднего лямбда-зондов слишком похожи.', system: 'Выхлоп', severity: 'warn', causes: ['Изношенный катализатор', 'Отравление катализатора (свинец, силикон)', 'Богатая смесь сжигает катализатор', 'Неисправный задний O2-датчик'], actions: ['Проверить задний датчик O2', 'Заменить катализатор при необходимости', 'Проверить состав смеси'] },
  P0440: { desc: 'Система улавливания паров топлива (EVAP) — неисправность', detail: 'Общая неисправность системы EVAP. Возможна утечка топливных паров в атмосферу.', system: 'Выхлоп', severity: 'warn', causes: ['Незакрытая крышка бензобака', 'Трещина в шлангах EVAP', 'Неисправный клапан продувки', 'Неисправный клапан EVAP'], actions: ['Проверить крышку бензобака', 'Визуально осмотреть шланги EVAP', 'Проверить клапан продувки'] },
  P0500: { desc: 'Датчик скорости автомобиля — неисправность', detail: 'ЭБУ не получает корректный сигнал от датчика скорости VSS. Спидометр может не работать.', system: 'Трансмиссия', severity: 'warn', causes: ['Неисправный датчик VSS', 'Обрыв в цепи', 'Неисправность ABS-модуля'], actions: ['Проверить датчик VSS', 'Проверить проводку', 'Считать коды ABS'] },
  P0600: { desc: 'Шина связи — неисправность', detail: 'Ошибка в шине последовательной передачи данных. ЭБУ не может корректно обмениваться данными с другими модулями.', system: 'Электроника', severity: 'error', causes: ['Проблема с проводкой CAN/шины', 'Неисправный блок управления', 'Помехи в бортовой сети'], actions: ['Проверить напряжение питания ЭБУ', 'Проверить предохранители', 'Диагностика с осциллографом'] },
  P0700: { desc: 'Управление трансмиссией — запрос на индикацию неисправности', detail: 'ЭБУ трансмиссии (TCM) обнаружил неисправность и запросил включение лампы Check Engine. Необходимо считать коды TCM.', system: 'Трансмиссия', severity: 'error', causes: ['Неисправность в АКПП', 'Неисправность датчиков АКПП', 'Проблемы с гидроблоком'], actions: ['Считать дополнительные коды трансмиссии', 'Проверить уровень и состояние масла АКПП', 'Диагностика АКПП'] },
  P0715: { desc: 'Датчик скорости входного вала трансмиссии', detail: 'Входной вал трансмиссии не даёт корректного сигнала скорости. Возможны проблемы с переключением передач.', system: 'Трансмиссия', severity: 'error', causes: ['Неисправный датчик скорости входного вала', 'Загрязнение датчика металлической стружкой', 'Обрыв в цепи'], actions: ['Очистить датчик от стружки', 'Проверить зазор датчика', 'Заменить датчик'] },
  P0730: { desc: 'Неправильное передаточное число', detail: 'Реальное передаточное число при включённой передаче не соответствует ожидаемому значению ЭБУ.', system: 'Трансмиссия', severity: 'error', causes: ['Износ фрикционов', 'Неисправность гидроблока', 'Проблема с датчиками скорости'], actions: ['Проверить уровень и состояние масла АКПП', 'Диагностика гидроблока', 'Считать дополнительные коды трансмиссии'] },
  C0035: { desc: 'Датчик скорости переднего левого колеса — неисправность', detail: 'ABS-модуль не получает корректный сигнал от датчика скорости переднего левого колеса.', system: 'ABS/ESP', severity: 'error', causes: ['Повреждённый датчик или кольцо АБС', 'Обрыв в цепи датчика', 'Задир или загрязнение зубчатого кольца'], actions: ['Проверить зазор датчика (норма: 0.3–1.5 мм)', 'Осмотреть зубчатое кольцо', 'Проверить проводку датчика'] },
  C0040: { desc: 'Датчик скорости переднего правого колеса — неисправность', detail: 'ABS-модуль не получает корректный сигнал от датчика переднего правого колеса.', system: 'ABS/ESP', severity: 'error', causes: ['Повреждённый датчик или кольцо АБС', 'Обрыв в цепи датчика'], actions: ['Проверить зазор датчика', 'Осмотреть зубчатое кольцо', 'Проверить проводку'] },
  C0045: { desc: 'Датчик скорости заднего левого колеса — неисправность', detail: 'ABS-модуль не получает корректный сигнал от датчика заднего левого колеса.', system: 'ABS/ESP', severity: 'error', causes: ['Повреждённый датчик', 'Обрыв проводки', 'Повреждение ступичного подшипника с интегрированным кольцом АБС'], actions: ['Проверить датчик и кольцо АБС', 'Проверить подшипник ступицы', 'Проверить проводку'] },
  C0050: { desc: 'Датчик скорости заднего правого колеса — неисправность', detail: 'ABS-модуль не получает корректный сигнал от датчика заднего правого колеса.', system: 'ABS/ESP', severity: 'error', causes: ['Повреждённый датчик', 'Обрыв проводки'], actions: ['Проверить датчик и кольцо АБС', 'Проверить подшипник ступицы'] },
  B0001: { desc: 'Подушка безопасности водителя — цепь воспламенителя', detail: 'Модуль SRS обнаружил неисправность в цепи пиропатрона подушки безопасности водителя.', system: 'SRS/Airbag', severity: 'error', causes: ['Нарушение контакта в спиральном кабеле (улитке)', 'Обрыв в цепи', 'Неисправный модуль подушки'], actions: ['Не трогать систему без опыта работы с SRS!', 'Проверить спиральный кабель рулевого колеса', 'Диагностика у специалиста'] },
  B0002: { desc: 'Подушка безопасности пассажира — цепь воспламенителя', detail: 'Модуль SRS обнаружил неисправность в цепи пиропатрона подушки пассажира.', system: 'SRS/Airbag', severity: 'error', causes: ['Обрыв или КЗ в цепи', 'Неисправный модуль подушки', 'Повреждение разъёма под сиденьем'], actions: ['Не работать с системой без обучения!', 'Проверить разъёмы под приборной панелью', 'Обратиться к специалисту'] },
  U0001: { desc: 'Шина CAN — высокоскоростная — неисправность связи', detail: 'Блок управления не может обмениваться данными по высокоскоростной шине CAN (500 кбит/с).', system: 'Электроника', severity: 'error', causes: ['Повреждение проводки шины CAN', 'Один из блоков управления «завис» и тянет шину', 'Плохой контакт в разъёме диагностики OBD'], actions: ['Проверить напряжение на шине CAN (норма: 2.5±1 В)', 'Отключать блоки управления по одному', 'Проверить разъём OBD-II'] },
  U0100: { desc: 'Потеря связи с ЭБУ двигателя (PCM/ECM)', detail: 'Другие блоки управления не могут установить связь с основным ЭБУ двигателя по шине CAN.', system: 'Электроника', severity: 'error', causes: ['Отсутствие питания или массы ЭБУ', 'Неисправность ЭБУ', 'Повреждение шины CAN'], actions: ['Проверить питание и массы ЭБУ', 'Проверить предохранители ЭБУ', 'Диагностика шины CAN'] },
};

// ── Блоки управления (для OBD-экрана) ────────────────────────────────────────
type DtcStatus = 'active' | 'stored' | 'temporary' | 'historical';

interface DtcEntry {
  code: string;
  status: DtcStatus;
  count: number;
  lastSeen: string;
}

interface EcuBlock {
  id: string;
  name: string;
  icon: string;
  address: string;
  faults: DtcEntry[];
}

const STATUS_LABELS: Record<DtcStatus, { label: string; color: string; bg: string }> = {
  active:     { label: 'Активная',      color: 'text-destructive',   bg: 'bg-destructive/15' },
  stored:     { label: 'Сохранённая',   color: 'text-accent',        bg: 'bg-accent/15' },
  temporary:  { label: 'Временная',     color: 'text-yellow-400',    bg: 'bg-yellow-400/15' },
  historical: { label: 'Историческая',  color: 'text-muted-foreground', bg: 'bg-secondary' },
};

const MOCK_ECU_DATA: EcuBlock[] = [
  {
    id: 'engine', name: 'Блок управления двигателем', icon: 'Gauge', address: '0x01',
    faults: [
      { code: 'P0171', status: 'active',     count: 12, lastSeen: 'сейчас' },
      { code: 'P0420', status: 'stored',     count: 3,  lastSeen: '2 дня назад' },
      { code: 'P0130', status: 'historical', count: 1,  lastSeen: '14 дней назад' },
    ],
  },
  {
    id: 'abs', name: 'Блок ABS / ESP', icon: 'CircleAlert', address: '0x03',
    faults: [
      { code: 'C0035', status: 'temporary', count: 5, lastSeen: '1 час назад' },
    ],
  },
  {
    id: 'transmission', name: 'Блок управления АКПП', icon: 'Settings', address: '0x02',
    faults: [],
  },
  {
    id: 'airbag', name: 'Модуль SRS / Airbag', icon: 'ShieldAlert', address: '0x15',
    faults: [],
  },
];

// ── VIN через NHTSA API ───────────────────────────────────────────────────────
interface VinResult {
  vin: string;
  make: string;
  model: string;
  year: string;
  type: string;
  engine: string;
  fuel: string;
  country: string;
  doors: string;
  drive: string;
  transmission: string;
  wmi: string;
  vds: string;
  serial: string;
}

async function fetchVin(vin: string): Promise<VinResult> {
  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevinvalues/${vin}?format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Ошибка сети');
  const json = await res.json();
  const r = json.Results?.[0];
  if (!r || r.ErrorCode !== '0') {
    // Если NHTSA не нашёл (например, российский VIN) — делаем локальную расшифровку
    return localDecodeVin(vin);
  }
  return {
    vin: vin.toUpperCase(),
    make: r.Make || '—',
    model: r.Model || '—',
    year: r.ModelYear || '—',
    type: r.VehicleType || '—',
    engine: r.DisplacementL ? `${parseFloat(r.DisplacementL).toFixed(1)}L ${r.EngineCylinders ? r.EngineCylinders + '-цил.' : ''}` : '—',
    fuel: translateFuel(r.FuelTypePrimary),
    country: r.PlantCountry || localCountry(vin),
    doors: r.Doors || '—',
    drive: translateDrive(r.DriveType),
    transmission: translateTransmission(r.TransmissionStyle),
    wmi: vin.slice(0, 3),
    vds: vin.slice(3, 9),
    serial: vin.slice(11),
  };
}

function translateFuel(v: string): string {
  if (!v) return '—';
  if (v.includes('Gasoline')) return 'Бензин';
  if (v.includes('Diesel')) return 'Дизель';
  if (v.includes('Electric')) return 'Электро';
  if (v.includes('Hybrid')) return 'Гибрид';
  return v;
}
function translateDrive(v: string): string {
  if (!v) return '—';
  if (v.includes('FWD')) return 'Передний (FWD)';
  if (v.includes('RWD')) return 'Задний (RWD)';
  if (v.includes('AWD') || v.includes('4WD')) return 'Полный (AWD)';
  return v;
}
function translateTransmission(v: string): string {
  if (!v) return '—';
  if (v.includes('Automatic')) return 'Автоматическая';
  if (v.includes('Manual')) return 'Механическая';
  if (v.includes('CVT')) return 'Вариатор (CVT)';
  return v;
}

function localCountry(vin: string): string {
  const c = vin[0];
  const map: Record<string, string> = { W: 'Германия', V: 'Швеция/Франция', S: 'Великобритания', Z: 'Италия', X: 'Россия', J: 'Япония', K: 'Южная Корея', L: 'Китай', '1': 'США', '2': 'Канада', '3': 'Мексика', '4': 'США', '5': 'США' };
  return map[c] || 'Неизвестно';
}

function localDecodeVin(vin: string): VinResult {
  const v = vin.toUpperCase();
  const wmi = v.slice(0, 3);
  const makes: Record<string, string> = {
    WVW: 'Volkswagen', WAU: 'Audi', WBA: 'BMW', WBS: 'BMW M', WDD: 'Mercedes-Benz',
    WDB: 'Mercedes-Benz', TMB: 'Škoda', VSS: 'SEAT', JTD: 'Toyota', JTM: 'Toyota',
    SAL: 'Land Rover', XTA: 'LADA (ВАЗ)', XTT: 'LADA', YV1: 'Volvo', ZAR: 'Alfa Romeo',
    ZFA: 'Fiat', KNM: 'Kia', KMH: 'Hyundai', WF0: 'Ford (Германия)', VF1: 'Renault',
    VF3: 'Peugeot', VF7: 'Citroën', SAJ: 'Jaguar', NM0: 'Nissan',
  };
  const years: Record<string, string> = {
    A: '1980', B: '1981', C: '1982', D: '1983', E: '1984', F: '1985', G: '1986',
    H: '1987', J: '1988', K: '1989', L: '1990', M: '1991', N: '1992', P: '1993',
    R: '1994', S: '1995', T: '1996', V: '1997', W: '1998', X: '1999', Y: '2000',
    '1': '2001', '2': '2002', '3': '2003', '4': '2004', '5': '2005', '6': '2006',
    '7': '2007', '8': '2008', '9': '2009', A2: '2010',
  };
  return {
    vin: v, make: makes[wmi] || 'Неизвестно', model: '—', year: years[v[9]] || '—',
    type: '—', engine: '—', fuel: '—', country: localCountry(v),
    doors: '—', drive: '—', transmission: '—',
    wmi, vds: v.slice(3, 9), serial: v.slice(11),
  };
}

// ── История ───────────────────────────────────────────────────────────────────
const HISTORY_MOCK = [
  { id: 1, vin: 'WVWZZZ1JZ3W386752', make: 'Volkswagen Golf', date: '14.06.2025', codes: ['P0171', 'P0420'], status: 'warn' },
  { id: 2, vin: 'WBA3A5C50DF595899', make: 'BMW 3 Series', date: '10.06.2025', codes: [], status: 'ok' },
  { id: 3, vin: 'JTDBE33K120153657', make: 'Toyota Camry', date: '03.06.2025', codes: ['P0300', 'P0301'], status: 'error' },
];

const NAV = [
  { id: 'home',      label: 'Главная',    icon: 'LayoutDashboard' },
  { id: 'vin',       label: 'VIN',        icon: 'Search' },
  { id: 'bluetooth', label: 'OBD-II',     icon: 'Bluetooth' },
  { id: 'history',   label: 'История',    icon: 'History' },
  { id: 'dtc',       label: 'Справочник', icon: 'BookOpen' },
];

// ── Page: Home ────────────────────────────────────────────────────────────────
function PageHome({ setTab }: { setTab: (t: string) => void }) {
  return (
    <div className="space-y-5 animate-fade-up">
      <div className="relative rounded-xl overflow-hidden border-glow">
        <img src={HERO_IMG} alt="" className="w-full h-44 object-cover opacity-55" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute bottom-0 left-0 p-5">
          <div className="font-display text-2xl text-cyan-glow">AutoDiag Pro</div>
          <div className="text-sm text-muted-foreground mt-0.5">Профессиональная диагностика автомобиля</div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: 'Search',    label: 'Поиск по VIN',    sub: 'Расшифровать номер',   tab: 'vin' },
          { icon: 'Bluetooth', label: 'Подключить OBD',  sub: 'ELM327 адаптер',       tab: 'bluetooth' },
          { icon: 'BookOpen',  label: 'Справочник DTC',  sub: 'Коды ошибок',           tab: 'dtc' },
          { icon: 'History',   label: 'История',          sub: 'Прошлые проверки',     tab: 'history' },
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
        <button onClick={() => setTab('bluetooth')} className="text-xs text-cyan font-semibold shrink-0">Подключить →</button>
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

// ── Page: VIN (с реальным API) ────────────────────────────────────────────────
function PageVin() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<VinResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = useCallback(async () => {
    const v = input.trim().toUpperCase();
    if (v.length !== 17) { setError('VIN должен содержать ровно 17 символов'); return; }
    setError(''); setLoading(true); setResult(null);
    try {
      const r = await fetchVin(v);
      setResult(r);
    } catch {
      setError('Не удалось получить данные. Проверьте подключение к интернету.');
    } finally {
      setLoading(false);
    }
  }, [input]);

  const fields: [string, string, boolean][] = result ? [
    ['VIN',                  result.vin,          true],
    ['Марка',                result.make,         false],
    ['Модель',               result.model,        false],
    ['Год выпуска',          result.year,         false],
    ['Тип ТС',               result.type,         false],
    ['Двигатель',            result.engine,       false],
    ['Топливо',              result.fuel,         false],
    ['Привод',               result.drive,        false],
    ['Коробка передач',      result.transmission, false],
    ['Количество дверей',    result.doors,        false],
    ['Страна',               result.country,      false],
    ['WMI (производитель)',  result.wmi,          true],
    ['VDS (модель/тип)',     result.vds,          true],
    ['Серийный номер',       result.serial,       true],
  ] : [];

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <div className="font-display text-xl text-cyan-glow mb-1">Поиск по VIN</div>
        <div className="text-xs text-muted-foreground">Данные запрашиваются из базы NHTSA (США) — работает для большинства марок</div>
      </div>
      <div className="border-glow bg-card rounded-xl p-4 space-y-3">
        <input value={input} onChange={(e) => setInput(e.target.value.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '').slice(0, 17))}
          placeholder="WVWZZZ1JZ3W386752" maxLength={17} onKeyDown={(e) => e.key === 'Enter' && search()}
          className="w-full bg-secondary rounded-lg px-4 py-3 font-mono text-sm tracking-widest outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{input.length}/17 символов</span>
          {input.length === 17 && <span className="text-green-400">✓ Длина корректна</span>}
        </div>
        <button onClick={search} disabled={loading || input.length !== 17}
          className="w-full gradient-primary text-[hsl(220,20%,8%)] font-bold py-3 rounded-lg font-display tracking-wider hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Icon name="Loader" size={16} className="animate-spin" /> ЗАПРОС...</> : 'РАСШИФРОВАТЬ VIN'}
        </button>
      </div>
      {error && <div className="border-glow-error bg-card rounded-xl p-4 text-sm text-destructive flex gap-2"><Icon name="AlertCircle" size={16} className="shrink-0 mt-0.5" />{error}</div>}
      {result && (
        <div className="border-glow bg-card rounded-xl overflow-hidden animate-fade-up">
          <div className="gradient-primary px-4 py-3 flex items-center gap-2">
            <Icon name="Car" size={18} className="text-[hsl(220,20%,8%)]" />
            <span className="font-display font-bold text-[hsl(220,20%,8%)] text-lg">
              {result.make} {result.model !== '—' ? result.model : ''} {result.year !== '—' ? result.year : ''}
            </span>
          </div>
          <div className="p-4 space-y-0">
            {fields.map(([label, value, mono]) => value && value !== '—' && (
              <div key={label} className="flex justify-between items-center py-2.5 border-b border-border last:border-0">
                <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                <span className={`text-sm font-semibold text-right ml-4 ${mono ? 'font-mono text-cyan' : ''}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="border-glow bg-card rounded-xl p-4">
        <div className="font-display text-xs text-muted-foreground mb-2">Структура VIN</div>
        <div className="flex gap-1.5 font-mono text-xs flex-wrap">
          {[['WMI (1-3)', 'bg-primary/20 text-cyan'], ['VDS (4-9)', 'bg-accent/20 text-accent'], ['Год (10)', 'bg-secondary text-foreground'], ['Завод (11)', 'bg-secondary text-foreground'], ['Серия (12-17)', 'bg-secondary text-foreground']].map(([l, c]) => (
            <span key={l} className={`${c} px-2 py-1 rounded`}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DTC Card (с раскрытием описания из справочника) ──────────────────────────
function DtcCard({ entry, setDtcTab }: { entry: DtcEntry; setDtcTab?: (tab: string, code: string) => void }) {
  const [open, setOpen] = useState(false);
  const info = DTC_DB[entry.code];
  const st = STATUS_LABELS[entry.status];

  return (
    <div className={`bg-card rounded-xl overflow-hidden border transition ${
      entry.status === 'active' ? 'border-glow-error' : entry.status === 'stored' ? 'border-glow-accent' : 'border-glow'
    }`}>
      <button className="w-full text-left p-4 flex items-start gap-3" onClick={() => setOpen((o) => !o)}>
        <span className={`font-mono font-bold text-sm shrink-0 mt-0.5 ${
          info?.severity === 'error' ? 'status-error' : info?.severity === 'warn' ? 'status-warn' : 'status-ok'
        }`}>{entry.code}</span>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium leading-snug">{info?.desc || 'Неизвестный код'}</div>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.color}`}>{st.label}</span>
            {info?.system && <span className="text-[11px] text-muted-foreground">{info.system}</span>}
            <span className="text-[11px] text-muted-foreground">{entry.count}× · {entry.lastSeen}</span>
          </div>
        </div>
        <Icon name={open ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground shrink-0 mt-1" />
      </button>
      {open && info && (
        <div className="px-4 pb-4 pt-0 space-y-3 border-t border-border animate-fade-up">
          <p className="text-xs text-muted-foreground leading-relaxed">{info.detail}</p>
          <div>
            <div className="font-display text-[11px] text-muted-foreground mb-1.5">Возможные причины</div>
            {info.causes.map((c) => (
              <div key={c} className="flex items-start gap-2 text-xs text-foreground py-1">
                <span className="text-accent mt-0.5 shrink-0">•</span>{c}
              </div>
            ))}
          </div>
          <div>
            <div className="font-display text-[11px] text-muted-foreground mb-1.5">Рекомендуемые действия</div>
            {info.actions.map((a, i) => (
              <div key={a} className="flex items-start gap-2 text-xs text-foreground py-1">
                <span className="text-cyan shrink-0">{i + 1}.</span>{a}
              </div>
            ))}
          </div>
          {setDtcTab && (
            <button onClick={() => setDtcTab('dtc', entry.code)} className="text-xs text-cyan font-semibold">
              Открыть в справочнике →
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Page: Bluetooth / OBD-II ──────────────────────────────────────────────────
function PageBluetooth({ setTab }: { setTab: (t: string) => void }) {
  const [state, setState] = useState<'idle' | 'scanning' | 'connected'>('idle');
  const [expandedEcu, setExpandedEcu] = useState<string | null>('engine');

  const totalFaults = MOCK_ECU_DATA.reduce((s, e) => s + e.faults.length, 0);
  const activeFaults = MOCK_ECU_DATA.reduce((s, e) => s + e.faults.filter((f) => f.status === 'active').length, 0);

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <div className="font-display text-xl text-cyan-glow mb-1">OBD-II Диагностика</div>
        <div className="text-xs text-muted-foreground">Bluetooth подключение · ELM327</div>
      </div>

      {/* Статус подключения */}
      <div className="border-glow bg-card rounded-xl p-5 flex items-center gap-4">
        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 shrink-0 ${
          state === 'connected' ? 'border-green-400 bg-green-400/10'
          : state === 'scanning' ? 'border-primary animate-pulse-glow' : 'border-border bg-secondary'
        }`}>
          <Icon name={state === 'connected' ? 'BluetoothConnected' : 'Bluetooth'} size={28}
            className={state === 'connected' ? 'text-green-400' : 'text-cyan'} />
        </div>
        <div className="flex-1">
          <div className="font-semibold">
            {state === 'idle' && 'Не подключён'}
            {state === 'scanning' && 'Поиск адаптера...'}
            {state === 'connected' && 'ELM327 · подключён'}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {state === 'idle' && 'Вставьте OBD-адаптер в разъём авто'}
            {state === 'scanning' && 'Включите Bluetooth на телефоне'}
            {state === 'connected' && `Найдено блоков: ${MOCK_ECU_DATA.length} · Ошибок: ${totalFaults}`}
          </div>
        </div>
        {state !== 'connected' ? (
          <button onClick={() => { setState('scanning'); setTimeout(() => setState('connected'), 2000); }}
            disabled={state === 'scanning'}
            className="gradient-primary text-[hsl(220,20%,8%)] font-bold px-5 py-2.5 rounded-lg font-display text-sm tracking-wider disabled:opacity-50 shrink-0">
            {state === 'scanning' ? '...' : 'ПОДКЛ.'}
          </button>
        ) : (
          <button onClick={() => setState('idle')}
            className="border border-destructive/50 text-destructive text-xs font-semibold px-4 py-2 rounded-lg shrink-0">
            Откл.
          </button>
        )}
      </div>

      {state === 'connected' && (
        <>
          {/* Сводка */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Блоков', value: String(MOCK_ECU_DATA.length), icon: 'Cpu', color: 'text-cyan' },
              { label: 'Ошибок', value: String(totalFaults), icon: 'AlertTriangle', color: 'text-accent' },
              { label: 'Активных', value: String(activeFaults), icon: 'Zap', color: 'text-destructive' },
            ].map((s) => (
              <div key={s.label} className="border-glow bg-card rounded-xl p-3 text-center">
                <Icon name={s.icon} size={18} className={`${s.color} mx-auto mb-1`} />
                <div className={`font-display text-xl font-bold ${s.color}`}>{s.value}</div>
                <div className="text-[11px] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Live параметры */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Обороты', value: '850 RPM', icon: 'Gauge' },
              { label: 'Температура', value: '91°C', icon: 'Thermometer' },
              { label: 'Напряжение', value: '14.2V', icon: 'Zap' },
              { label: 'Нагрузка', value: '23%', icon: 'Activity' },
            ].map((m) => (
              <div key={m.label} className="border-glow bg-card rounded-xl p-3 flex items-center gap-2.5">
                <Icon name={m.icon} size={16} className="text-cyan shrink-0" />
                <div>
                  <div className="text-[11px] text-muted-foreground">{m.label}</div>
                  <div className="font-display text-base text-cyan-glow">{m.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Блоки управления с ошибками */}
          <div>
            <div className="font-display text-xs text-muted-foreground mb-3">БЛОКИ УПРАВЛЕНИЯ</div>
            <div className="space-y-2">
              {MOCK_ECU_DATA.map((ecu) => (
                <div key={ecu.id} className={`bg-card rounded-xl overflow-hidden ${ecu.faults.length > 0 ? 'border-glow-accent' : 'border-glow'}`}>
                  <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => setExpandedEcu(expandedEcu === ecu.id ? null : ecu.id)}>
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${ecu.faults.length > 0 ? 'bg-accent/15' : 'bg-secondary'}`}>
                      <Icon name={ecu.icon} size={18} className={ecu.faults.length > 0 ? 'text-accent' : 'text-muted-foreground'} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{ecu.name}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{ecu.address}</div>
                    </div>
                    {ecu.faults.length > 0 ? (
                      <span className="text-xs font-bold text-accent bg-accent/15 px-2 py-0.5 rounded-full shrink-0">{ecu.faults.length} ош.</span>
                    ) : (
                      <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full shrink-0">OK</span>
                    )}
                    <Icon name={expandedEcu === ecu.id ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground ml-1" />
                  </button>
                  {expandedEcu === ecu.id && ecu.faults.length > 0 && (
                    <div className="px-3 pb-3 space-y-2 border-t border-border">
                      {ecu.faults.map((f) => (
                        <DtcCard key={f.code} entry={f} setDtcTab={(_t, _c) => setTab('dtc')} />
                      ))}
                    </div>
                  )}
                  {expandedEcu === ecu.id && ecu.faults.length === 0 && (
                    <div className="px-4 pb-4 pt-2 border-t border-border text-xs text-muted-foreground">
                      Ошибок не обнаружено
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button className="w-full border border-destructive/40 text-destructive text-sm font-semibold py-3 rounded-xl hover:bg-destructive/10 transition">
            Сбросить все ошибки
          </button>
        </>
      )}

      {state === 'idle' && (
        <div className="border-glow bg-card rounded-xl p-4">
          <div className="font-display text-xs text-muted-foreground mb-2">Совместимые адаптеры</div>
          {['ELM327 Bluetooth v1.5 / v2.1', 'OBDLink MX+ Bluetooth', 'Vgate iCar Pro BLE', 'Любой OBD-II / ISO 15765'].map((t) => (
            <div key={t} className="text-xs text-muted-foreground py-1">• {t}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Page: DTC Справочник ──────────────────────────────────────────────────────
function PageDTC({ initCode }: { initCode?: string }) {
  const [search, setSearch] = useState(initCode || '');
  const [filter, setFilter] = useState<'all' | 'P' | 'C' | 'B' | 'U'>('all');
  const [expanded, setExpanded] = useState<string | null>(initCode || null);

  const filtered = Object.entries(DTC_DB).filter(([code, info]) => {
    const q = search.toUpperCase();
    return (!q || code.includes(q) || info.desc.toUpperCase().includes(q) || info.system.toUpperCase().includes(q))
      && (filter === 'all' || code.startsWith(filter));
  });

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <div className="font-display text-xl text-cyan-glow mb-1">Справочник DTC</div>
        <div className="text-xs text-muted-foreground">{Object.keys(DTC_DB).length} кодов с описаниями, причинами и действиями</div>
      </div>
      <div className="border-glow bg-card rounded-xl p-3 flex items-center gap-2">
        <Icon name="Search" size={16} className="text-muted-foreground shrink-0" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Код ошибки, описание или система..."
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
        {search && <button onClick={() => setSearch('')}><Icon name="X" size={14} className="text-muted-foreground" /></button>}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'P', 'C', 'B', 'U'] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition ${filter === f ? 'gradient-primary text-[hsl(220,20%,8%)]' : 'bg-secondary text-muted-foreground'}`}>
            {f === 'all' ? 'Все' : `${f} · ${f === 'P' ? 'Двигатель' : f === 'C' ? 'Шасси' : f === 'B' ? 'Кузов' : 'Сеть'}`}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {filtered.length === 0 && <div className="text-center text-muted-foreground text-sm py-10">Ничего не найдено</div>}
        {filtered.map(([code, info]) => (
          <div key={code} className={`bg-card rounded-xl overflow-hidden ${info.severity === 'error' ? 'border-glow-error' : info.severity === 'warn' ? 'border-glow-accent' : 'border-glow'}`}>
            <button className="w-full text-left p-4 flex items-start gap-3" onClick={() => setExpanded(expanded === code ? null : code)}>
              <span className={`font-mono font-bold text-sm shrink-0 mt-0.5 ${info.severity === 'error' ? 'status-error' : info.severity === 'warn' ? 'status-warn' : 'status-ok'}`}>{code}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium leading-snug">{info.desc}</div>
                <div className="text-xs text-muted-foreground mt-1">{info.system}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className={`text-xs px-2 py-0.5 rounded-full ${info.severity === 'error' ? 'bg-destructive/15 text-destructive' : info.severity === 'warn' ? 'bg-accent/15 text-accent' : 'bg-primary/15 text-cyan'}`}>
                  {info.severity === 'error' ? 'Критично' : info.severity === 'warn' ? 'Внимание' : 'Инфо'}
                </span>
                <Icon name={expanded === code ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-muted-foreground" />
              </div>
            </button>
            {expanded === code && (
              <div className="px-4 pb-4 space-y-3 border-t border-border animate-fade-up">
                <p className="text-xs text-muted-foreground leading-relaxed pt-3">{info.detail}</p>
                <div>
                  <div className="font-display text-[11px] text-muted-foreground mb-1.5">Возможные причины</div>
                  {info.causes.map((c) => <div key={c} className="flex items-start gap-2 text-xs py-1"><span className="text-accent mt-0.5 shrink-0">•</span>{c}</div>)}
                </div>
                <div>
                  <div className="font-display text-[11px] text-muted-foreground mb-1.5">Рекомендуемые действия</div>
                  {info.actions.map((a, i) => <div key={a} className="flex items-start gap-2 text-xs py-1"><span className="text-cyan shrink-0">{i + 1}.</span>{a}</div>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page: History ─────────────────────────────────────────────────────────────
function PageHistory() {
  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <div className="font-display text-xl text-cyan-glow mb-1">История проверок</div>
        <div className="text-xs text-muted-foreground">{HISTORY_MOCK.length} сохранённых диагностики</div>
      </div>
      <div className="space-y-3">
        {HISTORY_MOCK.map((h) => (
          <div key={h.id} className={`bg-card rounded-xl p-4 ${h.status === 'error' ? 'border-glow-error' : h.status === 'warn' ? 'border-glow-accent' : 'border-glow'}`}>
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${h.status === 'error' ? 'bg-destructive/15' : h.status === 'warn' ? 'bg-accent/15' : 'bg-green-400/10'}`}>
                <Icon name="Car" size={20} className={h.status === 'error' ? 'text-destructive' : h.status === 'warn' ? 'text-accent' : 'text-green-400'} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">{h.make}</div>
                <div className="text-xs text-muted-foreground font-mono mt-0.5 truncate">{h.vin}</div>
                <div className="text-xs text-muted-foreground mt-1">{h.date}</div>
              </div>
              <div className="text-right shrink-0">
                {h.codes.length > 0 ? (
                  <div className="flex flex-col gap-1">{h.codes.map((c) => <span key={c} className="font-mono text-xs bg-secondary px-2 py-0.5 rounded text-accent">{c}</span>)}</div>
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

// ── App ───────────────────────────────────────────────────────────────────────
const Index = () => {
  const [tab, setTab] = useState('home');

  const pages: Record<string, JSX.Element> = {
    home:      <PageHome setTab={setTab} />,
    vin:       <PageVin />,
    bluetooth: <PageBluetooth setTab={setTab} />,
    history:   <PageHistory />,
    dtc:       <PageDTC />,
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
            <span className="w-2 h-2 rounded-full bg-accent" />v1.0
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
