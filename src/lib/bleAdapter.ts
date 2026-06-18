// ── BLE Adapter ───────────────────────────────────────────────────────────────
// Единый интерфейс для:
//   - Web Bluetooth API (Chrome браузер)
//   - @capacitor-community/bluetooth-le (нативный Android APK)
// Автоматически определяет окружение и использует нужный транспорт.

import { BleClient, type BleDevice } from '@capacitor-community/bluetooth-le';
import { Capacitor } from '@capacitor/core';

const OBD_SERVICE_UUID    = '0000fff0-0000-1000-8000-00805f9b34fb';
const OBD_WRITE_CHAR_UUID = '0000fff2-0000-1000-8000-00805f9b34fb';
const OBD_NOTIFY_CHAR_UUID= '0000fff1-0000-1000-8000-00805f9b34fb';
const VLINK_SERVICE_UUID  = 'e7810a71-73ae-499d-8c15-faa9aef0c3f2';
const VLINK_CHAR_UUID     = 'bef8d6c9-9c21-4c9e-b632-bd58c1009f9f';

// Определяем: нативный (APK) или браузер
const isNative = () => Capacitor.isNativePlatform();

// ── Нативный транспорт (Capacitor BLE) ───────────────────────────────────────

export class NativeBleTransport {
  private deviceId: string | null = null;
  private serviceUUID: string = OBD_SERVICE_UUID;
  private writeUUID: string = OBD_WRITE_CHAR_UUID;
  private notifyUUID: string = OBD_NOTIFY_CHAR_UUID;
  private responseBuffer = '';
  private pendingResolve: ((v: string) => void) | null = null;
  private onDisconnectCb: (() => void) | null = null;

  onDisconnect(cb: () => void) {
    this.onDisconnectCb = cb;
  }

  async connect(): Promise<string> {
    await BleClient.initialize({ androidNeverForLocation: true });

    const device: BleDevice = await BleClient.requestDevice({
      namePrefix: undefined,
      services: [OBD_SERVICE_UUID, VLINK_SERVICE_UUID],
      optionalServices: [OBD_SERVICE_UUID, VLINK_SERVICE_UUID],
    });

    this.deviceId = device.deviceId;

    await BleClient.connect(this.deviceId, () => {
      this.deviceId = null;
      this.onDisconnectCb?.();
    });

    // Пробуем найти рабочий сервис
    const services = await BleClient.getServices(this.deviceId);
    const vlinkSvc = services.find(s => s.uuid.toLowerCase() === VLINK_SERVICE_UUID);
    const obdSvc   = services.find(s => s.uuid.toLowerCase() === OBD_SERVICE_UUID);

    if (vlinkSvc) {
      this.serviceUUID = VLINK_SERVICE_UUID;
      this.writeUUID   = VLINK_CHAR_UUID;
      this.notifyUUID  = VLINK_CHAR_UUID;
    } else if (obdSvc) {
      this.serviceUUID = OBD_SERVICE_UUID;
      this.writeUUID   = OBD_WRITE_CHAR_UUID;
      this.notifyUUID  = OBD_NOTIFY_CHAR_UUID;
    } else {
      // Fallback: берём первый сервис с характеристикой на запись
      const fallback = services[0];
      if (!fallback) throw new Error('Адаптер ELM327 найден, но сервис OBD не обнаружен.');
      this.serviceUUID = fallback.uuid;
      const chars = fallback.characteristics || [];
      const writable = chars.find(c => c.properties.write || c.properties.writeWithoutResponse);
      const notifiable = chars.find(c => c.properties.notify);
      if (!writable || !notifiable) throw new Error('Не найдены характеристики записи/уведомления.');
      this.writeUUID  = writable.uuid;
      this.notifyUUID = notifiable.uuid;
    }

    // Подписываемся на уведомления
    await BleClient.startNotifications(
      this.deviceId,
      this.serviceUUID,
      this.notifyUUID,
      (value: DataView) => {
        const chunk = new TextDecoder().decode(value.buffer);
        this.responseBuffer += chunk;
        if (this.responseBuffer.includes('>') || this.responseBuffer.includes('\r')) {
          this.pendingResolve?.(this.responseBuffer);
          this.pendingResolve = null;
          this.responseBuffer = '';
        }
      },
    );

    return device.name || device.deviceId;
  }

  async disconnect(): Promise<void> {
    if (this.deviceId) {
      await BleClient.stopNotifications(this.deviceId, this.serviceUUID, this.notifyUUID).catch(() => {});
      await BleClient.disconnect(this.deviceId).catch(() => {});
      this.deviceId = null;
    }
  }

  isConnected(): boolean {
    return !!this.deviceId;
  }

  async sendRaw(data: string): Promise<string> {
    if (!this.deviceId) throw new Error('Не подключено');
    return new Promise((resolve, reject) => {
      this.pendingResolve = resolve;
      const encoded = new TextEncoder().encode(data + '\r');
      BleClient.writeWithoutResponse(
        this.deviceId!,
        this.serviceUUID,
        this.writeUUID,
        new DataView(encoded.buffer),
      ).catch(reject);
      setTimeout(() => { this.pendingResolve = null; resolve('TIMEOUT'); }, 3000);
    });
  }
}

// ── Web Bluetooth транспорт (браузер Chrome) ──────────────────────────────────

export class WebBleTransport {
  private device: BluetoothDevice | null = null;
  private writeChar: BluetoothRemoteGATTCharacteristic | null = null;
  private responseBuffer = '';
  private pendingResolve: ((v: string) => void) | null = null;
  private onDisconnectCb: (() => void) | null = null;

  onDisconnect(cb: () => void) {
    this.onDisconnectCb = cb;
  }

  async connect(): Promise<string> {
    if (!navigator.bluetooth) {
      throw new Error('Web Bluetooth не поддерживается. Используйте Chrome на Android или скачайте APK.');
    }

    this.device = await navigator.bluetooth.requestDevice({
      filters: [
        { namePrefix: 'OBD' }, { namePrefix: 'ELM' }, { namePrefix: 'V-LINK' },
        { namePrefix: 'OBDII' }, { namePrefix: 'Vgate' }, { namePrefix: 'OBDLink' },
        { namePrefix: 'LELink' }, { namePrefix: 'Konnwei' }, { namePrefix: 'TONWON' },
      ],
      optionalServices: [OBD_SERVICE_UUID, VLINK_SERVICE_UUID],
    });

    this.device.addEventListener('gattserverdisconnected', () => {
      this.cleanup();
      this.onDisconnectCb?.();
    });

    const server = await this.device.gatt!.connect();

    let service: BluetoothRemoteGATTService | null = null;
    let writeUUID = OBD_WRITE_CHAR_UUID;
    let notifyUUID = OBD_NOTIFY_CHAR_UUID;

    for (const [svc, w, n] of [
      [OBD_SERVICE_UUID, OBD_WRITE_CHAR_UUID, OBD_NOTIFY_CHAR_UUID],
      [VLINK_SERVICE_UUID, VLINK_CHAR_UUID, VLINK_CHAR_UUID],
    ]) {
      try { service = await server.getPrimaryService(svc); writeUUID = w; notifyUUID = n; break; }
      catch { /* пробуем следующий */ }
    }

    if (!service) throw new Error('Адаптер найден, но сервис OBD не обнаружен.');

    this.writeChar = await service.getCharacteristic(writeUUID);
    const notifyChar = await service.getCharacteristic(notifyUUID);
    await notifyChar.startNotifications();
    notifyChar.addEventListener('characteristicvaluechanged', (e: Event) => {
      const target = e.target as BluetoothRemoteGATTCharacteristic;
      const chunk = new TextDecoder().decode(target.value!);
      this.responseBuffer += chunk;
      if (this.responseBuffer.includes('>') || this.responseBuffer.includes('\r')) {
        this.pendingResolve?.(this.responseBuffer);
        this.pendingResolve = null;
        this.responseBuffer = '';
      }
    });

    return this.device.name || 'OBD Adapter';
  }

  async disconnect(): Promise<void> {
    if (this.device?.gatt?.connected) this.device.gatt.disconnect();
    this.cleanup();
  }

  isConnected(): boolean {
    return !!(this.device?.gatt?.connected);
  }

  async sendRaw(data: string): Promise<string> {
    if (!this.writeChar) throw new Error('Не подключено');
    return new Promise((resolve, reject) => {
      this.pendingResolve = resolve;
      const encoded = new TextEncoder().encode(data + '\r');
      this.writeChar!.writeValue(encoded).catch(reject);
      setTimeout(() => { this.pendingResolve = null; resolve('TIMEOUT'); }, 3000);
    });
  }

  private cleanup() {
    this.writeChar = null;
    this.pendingResolve = null;
    this.responseBuffer = '';
  }
}

// ── Универсальный адаптер ─────────────────────────────────────────────────────

export type BleTransport = NativeBleTransport | WebBleTransport;

export function createBleTransport(): BleTransport {
  return isNative() ? new NativeBleTransport() : new WebBleTransport();
}
