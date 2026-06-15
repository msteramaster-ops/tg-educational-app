// ── Web Bluetooth API — ELM327 OBD-II ────────────────────────────────────────
// Протокол: ELM327 AT-команды → OBD-II PIDs (SAE J1979)
// Работает в Chrome Android 6+, Chrome Desktop

export interface BluetoothState {
  connected: boolean;
  deviceName: string | null;
  error: string | null;
}

// ELM327 service/characteristic UUIDs (SPP over BLE)
const OBD_SERVICE_UUID      = '0000fff0-0000-1000-8000-00805f9b34fb';
const OBD_WRITE_CHAR_UUID   = '0000fff2-0000-1000-8000-00805f9b34fb';
const OBD_NOTIFY_CHAR_UUID  = '0000fff1-0000-1000-8000-00805f9b34fb';

// Альтернативные UUID для разных версий ELM327 BLE
const ALT_SERVICE_UUID      = '00001101-0000-1000-8000-00805f9b34fb';
const VLINK_SERVICE_UUID    = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
const VLINK_WRITE_CHAR_UUID = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';

// OBD-II PIDs (Mode 01)
export const OBD_PIDS = {
  ENGINE_RPM:        '010C',  // Обороты (÷4)
  VEHICLE_SPEED:     '010D',  // Скорость км/ч
  COOLANT_TEMP:      '0105',  // Температура ОЖ (−40)
  INTAKE_TEMP:       '010F',  // Температура впускного воздуха
  THROTTLE_POS:      '0111',  // Положение дросселя %
  ENGINE_LOAD:       '0104',  // Нагрузка на двигатель %
  FUEL_PRESSURE:     '010A',  // Давление топлива кПа
  MAP_SENSOR:        '010B',  // Давление во впуске кПа
  MAF_SENSOR:        '0110',  // Поток воздуха г/с
  O2_B1S1:           '0114',  // Лямбда банк1 датчик1
  O2_B1S2:           '0115',  // Лямбда банк1 датчик2
  STFT_B1:           '0106',  // Краткосрочная коррекция топлива %
  LTFT_B1:           '0107',  // Долгосрочная коррекция топлива %
  FUEL_LEVEL:        '012F',  // Уровень топлива %
  BAROMETRIC:        '0133',  // Барометрическое давление кПа
  AMBIENT_TEMP:      '0146',  // Температура окружающей среды
  OIL_TEMP:          '015C',  // Температура масла двигателя
  FUEL_RAIL_PRES:    '0123',  // Давление топливной рампы (дизель) кПа
  EGR_COMMANDED:     '012C',  // Командованный EGR %
  EGR_ERROR:         '012D',  // Ошибка EGR %
  EVAP_PURGE:        '012E',  // Клапан продувки EVAP %
  TIMING_ADVANCE:    '010E',  // Угол опережения зажигания
  RUNTIME:           '011F',  // Время работы двигателя с
  DISTANCE_MIL:      '0121',  // Пробег с MIL км
  CONTROL_MODULE_V:  '0142',  // Напряжение АКБ (модуль) В
  CATALYST_TEMP_B1:  '013C',  // Температура катализатора банк1
} as const;

// DTC чтение (Mode 03)
// Сброс DTC (Mode 04)

export interface LiveParam {
  id: string;
  name: string;
  pid: string;
  value: string;
  unit: string;
  raw: number | null;
  group: 'engine' | 'fuel' | 'air' | 'exhaust' | 'electrical' | 'other';
}

class ELM327Service {
  private device: BluetoothDevice | null = null;
  private server: BluetoothRemoteGATTServer | null = null;
  private writeChar: BluetoothRemoteGATTCharacteristic | null = null;
  private notifyChar: BluetoothRemoteGATTCharacteristic | null = null;
  private responseBuffer = '';
  private pendingResolve: ((v: string) => void) | null = null;
  private onDisconnectCb: (() => void) | null = null;

  isConnected(): boolean {
    return !!(this.device?.gatt?.connected);
  }

  getDeviceName(): string | null {
    return this.device?.name || null;
  }

  onDisconnect(cb: () => void) {
    this.onDisconnectCb = cb;
  }

  async connect(): Promise<void> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth не поддерживается в этом браузере. Используйте Chrome на Android или Chrome Desktop.');
    }

    // Запрашиваем устройство с фильтром по сервисам ELM327
    this.device = await navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: 'OBD' },
        { namePrefix: 'ELM' },
        { namePrefix: 'V-LINK' },
        { namePrefix: 'OBDII' },
        { namePrefix: 'Vgate' },
        { namePrefix: 'OBDLink' },
        { namePrefix: 'LELink' },
        { namePrefix: 'Konnwei' },
        { namePrefix: 'TONWON' },
      ],
      optionalServices: [
        OBD_SERVICE_UUID,
        ALT_SERVICE_UUID,
        VLINK_SERVICE_UUID,
        'battery_service',
      ],
    });

    this.device.addEventListener('gattserverdisconnected', () => {
      this.cleanup();
      this.onDisconnectCb?.();
    });

    this.server = await this.device.gatt!.connect();

    // Пробуем найти сервис — разные адаптеры используют разные UUID
    let service: BluetoothRemoteGATTService | null = null;
    let writeUUID = OBD_WRITE_CHAR_UUID;
    let notifyUUID = OBD_NOTIFY_CHAR_UUID;

    for (const [svcUUID, wUUID, nUUID] of [
      [OBD_SERVICE_UUID,   OBD_WRITE_CHAR_UUID,   OBD_NOTIFY_CHAR_UUID],
      [VLINK_SERVICE_UUID, VLINK_WRITE_CHAR_UUID,  VLINK_WRITE_CHAR_UUID],
    ]) {
      try {
        service = await this.server.getPrimaryService(svcUUID);
        writeUUID = wUUID; notifyUUID = nUUID;
        break;
      } catch { /* пробуем следующий */ }
    }

    if (!service) throw new Error('Адаптер ELM327 найден, но сервис OBD не обнаружен. Попробуйте другой адаптер или обновите прошивку.');

    this.writeChar  = await service.getCharacteristic(writeUUID);
    this.notifyChar = await service.getCharacteristic(notifyUUID);

    await this.notifyChar.startNotifications();
    this.notifyChar.addEventListener('characteristicvaluechanged', (e: Event) => {
      const target = e.target as BluetoothRemoteGATTCharacteristic;
      const chunk = new TextDecoder().decode(target.value!);
      this.responseBuffer += chunk;
      if (this.responseBuffer.includes('>') || this.responseBuffer.includes('\r')) {
        this.pendingResolve?.(this.responseBuffer);
        this.pendingResolve = null;
        this.responseBuffer = '';
      }
    });

    // Инициализация ELM327
    await this.sendATCommand('ATZ');    // Сброс
    await this.delay(1000);
    await this.sendATCommand('ATE0');   // Echo off
    await this.sendATCommand('ATL0');   // Linefeeds off
    await this.sendATCommand('ATS0');   // Spaces off
    await this.sendATCommand('ATH0');   // Headers off
    await this.sendATCommand('ATSP0'); // Auto protocol
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) {
      this.device.gatt.disconnect();
    }
    this.cleanup();
  }

  private cleanup() {
    this.writeChar = null;
    this.notifyChar = null;
    this.server = null;
    this.pendingResolve = null;
    this.responseBuffer = '';
  }

  private delay(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }

  private async sendRaw(data: string): Promise<string> {
    if (!this.writeChar) throw new Error('Не подключено');
    return new Promise((resolve, reject) => {
      this.pendingResolve = resolve;
      const encoded = new TextEncoder().encode(data + '\r');
      this.writeChar!.writeValue(encoded).catch(reject);
      setTimeout(() => { this.pendingResolve = null; resolve('TIMEOUT'); }, 3000);
    });
  }

  async sendATCommand(cmd: string): Promise<string> {
    const resp = await this.sendRaw(cmd);
    return resp.replace(/\r/g, '').replace(/>/g, '').trim();
  }

  async readPID(pid: string): Promise<string> {
    const resp = await this.sendRaw(pid);
    return resp.replace(/\r/g, '').replace(/>/g, '').trim();
  }

  // Парсинг ответа OBD PID
  parsePIDValue(pid: string, response: string): number | null {
    const clean = response.replace(/\s/g, '').toUpperCase();
    if (clean.includes('NODATA') || clean.includes('ERROR') || clean.includes('TIMEOUT')) return null;

    // Убираем префикс ответа (41 0C → берём байты данных)
    const mode = pid.slice(0, 2);
    const pidCode = pid.slice(2);
    const expectedPrefix = String(parseInt(mode) + 40).padStart(2, '0') + pidCode;

    const idx = clean.indexOf(expectedPrefix);
    if (idx === -1) return null;
    const data = clean.slice(idx + expectedPrefix.length);

    const A = parseInt(data.slice(0, 2), 16);
    const B = data.length >= 4 ? parseInt(data.slice(2, 4), 16) : 0;
    const C = data.length >= 6 ? parseInt(data.slice(4, 6), 16) : 0;

    switch (pid) {
      case '010C': return (A * 256 + B) / 4;            // RPM
      case '010D': return A;                             // Скорость
      case '0105': return A - 40;                       // Температура ОЖ
      case '010F': return A - 40;                       // Температура впуска
      case '0111': return A * 100 / 255;                // Дроссель %
      case '0104': return A * 100 / 255;                // Нагрузка %
      case '010A': return A * 3;                        // Давление топлива кПа
      case '010B': return A;                             // MAP кПа
      case '0110': return (A * 256 + B) / 100;          // MAF г/с
      case '0114': case '0115': return A / 200;         // O2 V
      case '0106': case '0107': return (A - 128) * 100 / 128; // STFT/LTFT %
      case '012F': return A * 100 / 255;                // Топливо %
      case '0133': return A;                             // Барометр кПа
      case '0146': return A - 40;                       // Наружная темп.
      case '015C': return A - 40;                       // Масло темп.
      case '012C': return A * 100 / 255;                // EGR %
      case '012E': return A * 100 / 255;                // EVAP %
      case '010E': return A / 2 - 64;                   // Опережение зажигания
      case '011F': return A * 256 + B;                  // Время работы с
      case '0121': return A * 256 + B;                  // Пробег с MIL
      case '0142': return (A * 256 + B) / 1000;         // Напряжение В
      case '013C': return (A * 256 + B) / 10 - 40;     // Катализатор темп.
      case '0123': return (A * 256 + B) * 10;           // Давление рампы (дизель)
      default: return A;
    }
  }

  // Чтение всех Live-параметров
  async readAllLiveData(pids: string[]): Promise<Map<string, number | null>> {
    const result = new Map<string, number | null>();
    for (const pid of pids) {
      try {
        const resp = await this.readPID(pid);
        result.set(pid, this.parsePIDValue(pid, resp));
      } catch {
        result.set(pid, null);
      }
    }
    return result;
  }

  // Чтение кодов ошибок (Mode 03)
  async readDTC(): Promise<string[]> {
    const resp = await this.readPID('03');
    return this.parseDTC(resp);
  }

  private parseDTC(response: string): string[] {
    const dtcs: string[] = [];
    const clean = response.replace(/\s/g, '').replace(/43/i, '').toUpperCase();
    if (clean.includes('NODATA') || clean.length < 4) return dtcs;

    for (let i = 0; i < clean.length - 3; i += 4) {
      const byte1 = parseInt(clean.slice(i, i + 2), 16);
      const byte2 = parseInt(clean.slice(i + 2, i + 4), 16);
      if (byte1 === 0 && byte2 === 0) continue;

      const type = (byte1 >> 6) & 0x03;
      const prefix = ['P', 'C', 'B', 'U'][type];
      const digit2 = (byte1 >> 4) & 0x03;
      const digit3 = byte1 & 0x0F;
      const digit4 = (byte2 >> 4) & 0x0F;
      const digit5 = byte2 & 0x0F;
      dtcs.push(`${prefix}${digit2}${digit3.toString(16).toUpperCase()}${digit4.toString(16).toUpperCase()}${digit5.toString(16).toUpperCase()}`);
    }
    return dtcs;
  }

  // Сброс ошибок (Mode 04)
  async clearDTC(): Promise<boolean> {
    const resp = await this.sendRaw('04');
    return !resp.includes('ERROR');
  }

  // Поддерживаемые PIDs (Mode 01 PID 00)
  async getSupportedPIDs(): Promise<Set<string>> {
    const supported = new Set<string>();
    const resp = await this.readPID('0100');
    if (resp.includes('NODATA') || resp.includes('ERROR')) return supported;
    // Парсинг битового поля поддерживаемых PID
    const clean = resp.replace(/\s/g, '').toUpperCase();
    const idx = clean.indexOf('4100');
    if (idx === -1) return supported;
    const bits = parseInt(clean.slice(idx + 4, idx + 12), 16);
    for (let i = 0; i < 32; i++) {
      if (bits & (1 << (31 - i))) {
        supported.add(`01${(i + 1).toString(16).padStart(2, '0').toUpperCase()}`);
      }
    }
    return supported;
  }
}

// Singleton
export const elm327 = new ELM327Service();

// ── Описания параметров для UI ────────────────────────────────────────────────
export const LIVE_PARAMS_CONFIG: Omit<LiveParam, 'value' | 'raw'>[] = [
  // Двигатель
  { id: 'rpm',        name: 'Обороты двигателя',       pid: '010C', unit: 'RPM',  group: 'engine' },
  { id: 'load',       name: 'Нагрузка на двигатель',   pid: '0104', unit: '%',    group: 'engine' },
  { id: 'timing',     name: 'Угол опережения зажигания', pid: '010E', unit: '°',  group: 'engine' },
  { id: 'runtime',    name: 'Время работы',             pid: '011F', unit: 'сек', group: 'engine' },
  // Температуры
  { id: 'coolant',    name: 'Температура ОЖ',           pid: '0105', unit: '°C',  group: 'engine' },
  { id: 'intake',     name: 'Температура впуска',        pid: '010F', unit: '°C',  group: 'air' },
  { id: 'oil',        name: 'Температура масла',         pid: '015C', unit: '°C',  group: 'engine' },
  { id: 'ambient',    name: 'Температура окружающей среды', pid: '0146', unit: '°C', group: 'other' },
  { id: 'catalyst',   name: 'Температура катализатора', pid: '013C', unit: '°C',  group: 'exhaust' },
  // Воздух
  { id: 'speed',      name: 'Скорость',                 pid: '010D', unit: 'км/ч', group: 'engine' },
  { id: 'throttle',   name: 'Положение дросселя',       pid: '0111', unit: '%',   group: 'air' },
  { id: 'map',        name: 'Давление во впуске (MAP)',  pid: '010B', unit: 'кПа', group: 'air' },
  { id: 'maf',        name: 'Поток воздуха (MAF)',       pid: '0110', unit: 'г/с', group: 'air' },
  { id: 'baro',       name: 'Барометрическое давление', pid: '0133', unit: 'кПа', group: 'air' },
  // Топливо
  { id: 'fuel_pres',  name: 'Давление топлива',          pid: '010A', unit: 'кПа', group: 'fuel' },
  { id: 'fuel_rail',  name: 'Давление рампы (дизель)',   pid: '0123', unit: 'кПа', group: 'fuel' },
  { id: 'fuel_level', name: 'Уровень топлива',            pid: '012F', unit: '%',  group: 'fuel' },
  { id: 'stft',       name: 'Краткосрочная коррекция топлива', pid: '0106', unit: '%', group: 'fuel' },
  { id: 'ltft',       name: 'Долгосрочная коррекция топлива',  pid: '0107', unit: '%', group: 'fuel' },
  { id: 'evap',       name: 'Клапан продувки EVAP',      pid: '012E', unit: '%',  group: 'fuel' },
  // Выхлоп
  { id: 'o2_b1s1',    name: 'Лямбда-зонд B1S1',          pid: '0114', unit: 'В',  group: 'exhaust' },
  { id: 'o2_b1s2',    name: 'Лямбда-зонд B1S2',          pid: '0115', unit: 'В',  group: 'exhaust' },
  { id: 'egr',        name: 'Клапан EGR',                 pid: '012C', unit: '%',  group: 'exhaust' },
  // Электрика
  { id: 'voltage',    name: 'Напряжение бортовой сети',  pid: '0142', unit: 'В',  group: 'electrical' },
  { id: 'distance',   name: 'Пробег с Check Engine',     pid: '0121', unit: 'км', group: 'other' },
];

export const PARAM_GROUPS: Record<string, { label: string; icon: string }> = {
  engine:     { label: 'Двигатель',     icon: 'Gauge' },
  air:        { label: 'Воздух / Впуск', icon: 'Wind' },
  fuel:       { label: 'Топливо',        icon: 'Droplets' },
  exhaust:    { label: 'Выхлоп',         icon: 'Flame' },
  electrical: { label: 'Электрика',      icon: 'Zap' },
  other:      { label: 'Прочее',         icon: 'MoreHorizontal' },
};
