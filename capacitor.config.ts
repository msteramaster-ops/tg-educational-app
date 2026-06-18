import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'dev.poehali.obdpro',
  appName: 'OBD Диагностика',
  webDir: 'dist',
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
  plugins: {
    Filesystem: {},
    Preferences: {
      group: 'OBDProStorage',
    },
    BluetoothLe: {
      displayStrings: {
        scanning: 'Поиск OBD-адаптеров...',
        cancel: 'Отмена',
        availableDevices: 'Найденные адаптеры',
        noDeviceFound: 'Адаптеры не найдены',
      },
    },
  },
};

export default config;