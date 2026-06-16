// ── База данных автомобилей ───────────────────────────────────────────────────
// Структура: Регион → Марка → Модели → Годы → Блоки управления → Функции

export interface EcuFunction {
  id: string;
  name: string;
  type: 'service' | 'special' | 'adaptation' | 'activation';
  description: string;
  warning?: string;
}

export interface EcuBlock {
  id: string;
  name: string;
  address: string; // OBD адрес / протокол
  protocol: string;
  functions: EcuFunction[];
}

export interface VehicleModel {
  id: string;
  name: string;
  years: number[];
  ecus: EcuBlock[];
}

export interface VehicleMake {
  id: string;
  name: string;
  logo: string; // эмодзи или аббревиатура
  region: string;
  models: VehicleModel[];
}

// ── Блоки управления (общие шаблоны) ─────────────────────────────────────────

const VAG_ENGINE_ECU = (addr = '0x01'): EcuBlock => ({
  id: 'engine', name: 'Блок управления двигателем (ECM)', address: addr, protocol: 'KWP2000/CAN',
  functions: [
    { id: 'dtc_read',    name: 'Чтение кодов DTC',          type: 'special',    description: 'Считать все сохранённые коды неисправностей' },
    { id: 'dtc_clear',   name: 'Удаление кодов DTC',         type: 'special',    description: 'Очистить память ошибок блока управления', warning: 'Ошибки будут удалены безвозвратно' },
    { id: 'live_data',   name: 'Поток данных',               type: 'special',    description: 'Параметры двигателя в реальном времени' },
    { id: 'inj_test',   name: 'Тест форсунок',              type: 'activation', description: 'Активация форсунок по одной для диагностики' },
    { id: 'throttle_adapt', name: 'Адаптация дроссельной заслонки', type: 'adaptation', description: 'Сброс и повторная адаптация дросселя', warning: 'Двигатель должен быть прогрет' },
    { id: 'idle_adapt',  name: 'Адаптация холостого хода',  type: 'adaptation', description: 'Обучение оборотов холостого хода' },
    { id: 'lambda_test', name: 'Тест лямбда-зонда',          type: 'activation', description: 'Проверка работы датчиков O2' },
    { id: 'egr_test',    name: 'Тест клапана EGR',           type: 'activation', description: 'Активация и проверка клапана EGR' },
  ],
});

const VAG_TRANSMISSION_ECU = (): EcuBlock => ({
  id: 'transmission', name: 'Блок управления АКПП/DSG (TCM)', address: '0x02', protocol: 'KWP2000/CAN',
  functions: [
    { id: 'dtc_read',  name: 'Чтение кодов DTC',   type: 'special', description: 'Ошибки трансмиссии' },
    { id: 'dtc_clear', name: 'Удаление кодов DTC',  type: 'special', description: 'Очистка ошибок трансмиссии', warning: 'Будут удалены все коды' },
    { id: 'live_data', name: 'Поток данных',        type: 'special', description: 'Температура масла, передача, обороты' },
    { id: 'dsg_basic', name: 'Базовая настройка DSG', type: 'adaptation', description: 'Инициализация точек зацепления сцепления DSG', warning: 'Только для роботизированных КПП DSG/S-Tronic' },
    { id: 'oil_reset', name: 'Сброс счётчика масла АКПП', type: 'service', description: 'Обнуление интервала замены масла в АКПП' },
    { id: 'selector_adapt', name: 'Адаптация селектора', type: 'adaptation', description: 'Обучение положений рычага АКПП' },
  ],
});

const VAG_ABS_ECU = (): EcuBlock => ({
  id: 'abs', name: 'Блок ABS / ESP / ESC', address: '0x03', protocol: 'KWP2000/CAN',
  functions: [
    { id: 'dtc_read',    name: 'Чтение кодов DTC',     type: 'special',    description: 'Ошибки системы ABS/ESP' },
    { id: 'dtc_clear',   name: 'Удаление кодов DTC',    type: 'special',    description: 'Очистка ошибок ABS/ESP', warning: 'Убедитесь в устранении неисправности' },
    { id: 'live_data',   name: 'Поток данных',          type: 'special',    description: 'Скорость колёс, датчик ускорения' },
    { id: 'abs_bleed',   name: 'Прокачка тормозов ABS', type: 'activation', description: 'Активация насоса ABS для удаления воздуха', warning: 'Нужен помощник для прокачки' },
    { id: 'steer_adapt', name: 'Адаптация датчика угла руля', type: 'adaptation', description: 'Калибровка датчика рулевого угла (SAS)', warning: 'Установить руль ровно по центру' },
    { id: 'brake_pads',  name: 'Сброс счётчика тормозных колодок', type: 'service', description: 'Обнуление ресурса тормозных колодок' },
    { id: 'esp_calib',   name: 'Калибровка датчика ускорения G', type: 'adaptation', description: 'Обнуление нулевого положения датчика G-sensor', warning: 'Автомобиль должен стоять на ровной поверхности' },
  ],
});

const VAG_AIRBAG_ECU = (): EcuBlock => ({
  id: 'airbag', name: 'Модуль SRS / Airbag', address: '0x15', protocol: 'KWP2000/CAN',
  functions: [
    { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки системы SRS' },
    { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок SRS', warning: '⚠️ ОПАСНО! Работа с SRS требует специальной подготовки. Случайное срабатывание подушки может привести к травмам.' },
    { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Состояние цепей пиропатронов' },
    { id: 'crash_data', name: 'Данные аварии',     type: 'special', description: 'Чтение данных о срабатывании подушек' },
  ],
});

const VAG_CLIMATE_ECU = (): EcuBlock => ({
  id: 'climate', name: 'Блок климатической установки', address: '0x08', protocol: 'KWP2000/CAN',
  functions: [
    { id: 'dtc_read',  name: 'Чтение кодов DTC',     type: 'special',    description: 'Ошибки климат-контроля' },
    { id: 'dtc_clear', name: 'Удаление кодов DTC',    type: 'special',    description: 'Очистка ошибок климата' },
    { id: 'live_data', name: 'Поток данных',          type: 'special',    description: 'Температуры, положение заслонок' },
    { id: 'ac_recalib', name: 'Базовая настройка климата', type: 'adaptation', description: 'Инициализация моторчиков и заслонок кондиционера' },
    { id: 'pollen_filter', name: 'Сброс счётчика салонного фильтра', type: 'service', description: 'Обнуление интервала замены фильтра' },
  ],
});

const VAG_INSTRUMENT_ECU = (): EcuBlock => ({
  id: 'instrument', name: 'Панель приборов (BCM/Kombi)', address: '0x17', protocol: 'KWP2000/CAN',
  functions: [
    { id: 'dtc_read',   name: 'Чтение кодов DTC',      type: 'special',    description: 'Ошибки приборной панели' },
    { id: 'dtc_clear',  name: 'Удаление кодов DTC',     type: 'special',    description: 'Очистка ошибок' },
    { id: 'service_reset', name: 'Сброс сервисного интервала (ТО)', type: 'service', description: 'Обнуление счётчика километров до ТО' },
    { id: 'oil_reset',  name: 'Сброс счётчика масла',  type: 'service',    description: 'Сброс индикатора замены масла' },
    { id: 'coding',     name: 'Кодирование опций',      type: 'special',    description: 'Активация/деактивация функций автомобиля' },
    { id: 'hidden_menu', name: 'Скрытое меню дилера',  type: 'special',    description: 'Доступ к инженерному меню панели приборов' },
  ],
});

const VAG_STEERING_ECU = (): EcuBlock => ({
  id: 'steering', name: 'Электроусилитель руля (EPS)', address: '0x44', protocol: 'CAN',
  functions: [
    { id: 'dtc_read',   name: 'Чтение кодов DTC',    type: 'special',    description: 'Ошибки электроусилителя' },
    { id: 'dtc_clear',  name: 'Удаление кодов DTC',   type: 'special',    description: 'Очистка ошибок EPS' },
    { id: 'live_data',  name: 'Поток данных',         type: 'special',    description: 'Угол руля, момент, ток двигателя EPS' },
    { id: 'eps_calib',  name: 'Калибровка EPS',       type: 'adaptation', description: 'Обучение нулевого положения руля', warning: 'Установить колёса ровно перед выполнением' },
    { id: 'torque_adj', name: 'Настройка усилия на руле', type: 'special', description: 'Изменение характеристики усилия EPS' },
  ],
});

const BMW_ENGINE_ECU = (): EcuBlock => ({
  id: 'engine', name: 'Блок управления двигателем (DME)', address: '0x12', protocol: 'BMW-ENET/CAN',
  functions: [
    { id: 'dtc_read',    name: 'Чтение кодов DTC',        type: 'special',    description: 'Коды неисправностей DME' },
    { id: 'dtc_clear',   name: 'Удаление кодов DTC',       type: 'special',    description: 'Очистка ошибок DME' },
    { id: 'live_data',   name: 'Поток данных',             type: 'special',    description: 'Параметры двигателя в реальном времени' },
    { id: 'vanos_test',  name: 'Тест VANOS',               type: 'activation', description: 'Проверка муфт VANOS (фазы ГРМ)' },
    { id: 'swirl_test',  name: 'Тест завихрительных заслонок', type: 'activation', description: 'Диагностика заслонок впускного коллектора' },
    { id: 'inj_test',    name: 'Тест форсунок',            type: 'activation', description: 'Активация форсунок по одной' },
    { id: 'oil_cond',    name: 'Состояние масла',          type: 'special',    description: 'Качество масла, срок следующей замены' },
    { id: 'oil_reset',   name: 'Сброс CBS (ТО)',           type: 'service',    description: 'Сброс счётчиков технического обслуживания BMW CBS', warning: 'Выполнять только после проведения ТО' },
  ],
});

const BMW_ABS_ECU = (): EcuBlock => ({
  id: 'abs', name: 'Блок DSC (ABS/ESP)', address: '0x56', protocol: 'BMW-ENET/CAN',
  functions: [
    { id: 'dtc_read',    name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки DSC' },
    { id: 'dtc_clear',   name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок DSC' },
    { id: 'live_data',   name: 'Поток данных',            type: 'special',    description: 'Скорость колёс, G-sensor, руль' },
    { id: 'brake_bleed', name: 'Прокачка тормозов',      type: 'activation', description: 'Активация насоса DSC для прокачки' },
    { id: 'sas_calib',   name: 'Калибровка датчика угла руля', type: 'adaptation', description: 'Обучение SAS', warning: 'Колёса прямо, руль по центру' },
    { id: 'brake_reset', name: 'Сброс счётчика колодок',  type: 'service',    description: 'Обнуление ресурса тормозных колодок' },
    { id: 'epdl_adapt',  name: 'Адаптация тормозного диска', type: 'adaptation', description: 'Калибровка новых тормозных дисков/колодок' },
  ],
});

const BMW_GEARBOX_ECU = (): EcuBlock => ({
  id: 'transmission', name: 'Блок EGS (АКПП)', address: '0x18', protocol: 'BMW-ENET/CAN',
  functions: [
    { id: 'dtc_read',    name: 'Чтение кодов DTC',    type: 'special',    description: 'Ошибки EGS' },
    { id: 'dtc_clear',   name: 'Удаление кодов DTC',   type: 'special',    description: 'Очистка ошибок EGS' },
    { id: 'live_data',   name: 'Поток данных',         type: 'special',    description: 'Температура масла, передача, блокировка' },
    { id: 'adapt_reset', name: 'Сброс адаптаций АКПП', type: 'adaptation', description: 'Обнуление обучения переключений', warning: 'После сброса АКПП будет работать резко до полного обучения' },
    { id: 'oil_reset',   name: 'Сброс масла АКПП',    type: 'service',    description: 'Обнуление интервала замены масла АКПП' },
  ],
});

const TOYOTA_ENGINE_ECU = (): EcuBlock => ({
  id: 'engine', name: 'Блок управления двигателем (ECM)', address: '0x10', protocol: 'Toyota-CAN/ISO14229',
  functions: [
    { id: 'dtc_read',    name: 'Чтение кодов DTC',        type: 'special',    description: 'Коды неисправностей ECM' },
    { id: 'dtc_clear',   name: 'Удаление кодов DTC',       type: 'special',    description: 'Очистка ошибок ECM' },
    { id: 'live_data',   name: 'Поток данных',             type: 'special',    description: 'Параметры двигателя в реальном времени' },
    { id: 'vvti_test',   name: 'Тест VVT-i',               type: 'activation', description: 'Проверка системы изменения фаз газораспределения VVT-i' },
    { id: 'inj_balance', name: 'Балансировка форсунок',    type: 'adaptation', description: 'Обучение коррекции подачи топлива по цилиндрам' },
    { id: 'throttle_init', name: 'Инициализация дросселя', type: 'adaptation', description: 'Процедура инициализации электронного дросселя' },
    { id: 'idle_learn',  name: 'Обучение холостого хода',  type: 'adaptation', description: 'Автоматическое обучение оборотов ХХ' },
    { id: 'oil_reset',   name: 'Сброс счётчика масла',    type: 'service',    description: 'Обнуление интервала замены масла' },
  ],
});

const TOYOTA_ABS_ECU = (): EcuBlock => ({
  id: 'abs', name: 'Блок ABS / VSC / TRC', address: '0x25', protocol: 'Toyota-CAN',
  functions: [
    { id: 'dtc_read',    name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки ABS/VSC' },
    { id: 'dtc_clear',   name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок ABS/VSC' },
    { id: 'live_data',   name: 'Поток данных',            type: 'special',    description: 'Скорость колёс, датчики' },
    { id: 'sas_reset',   name: 'Калибровка угла руля',    type: 'adaptation', description: 'Обнуление датчика угла поворота', warning: 'Руль должен быть по центру' },
    { id: 'brake_bleed', name: 'Прокачка тормозов',      type: 'activation', description: 'Режим прокачки с активацией насоса ABS' },
    { id: 'pad_reset',   name: 'Сброс ресурса колодок',  type: 'service',    description: 'Обнуление счётчика тормозных колодок' },
  ],
});

const MERCEDES_ENGINE_ECU = (): EcuBlock => ({
  id: 'engine', name: 'Блок управления двигателем (ME/CDI)', address: '0x01', protocol: 'Mercedes-CAN/UDS',
  functions: [
    { id: 'dtc_read',    name: 'Чтение кодов DTC',        type: 'special',    description: 'Коды неисправностей ME/CDI' },
    { id: 'dtc_clear',   name: 'Удаление кодов DTC',       type: 'special',    description: 'Очистка ошибок' },
    { id: 'live_data',   name: 'Поток данных',             type: 'special',    description: 'Параметры двигателя в реальном времени' },
    { id: 'inj_test',    name: 'Тест форсунок',            type: 'activation', description: 'Активация форсунок для диагностики (дизель)' },
    { id: 'swirl_adapt', name: 'Адаптация завихрительных заслонок', type: 'adaptation', description: 'Обучение положения заслонок впуска' },
    { id: 'service_a',   name: 'Сброс Сервиса A',          type: 'service',    description: 'Сброс малого ТО Mercedes' },
    { id: 'service_b',   name: 'Сброс Сервиса B',          type: 'service',    description: 'Сброс большого ТО Mercedes' },
    { id: 'adblue_reset', name: 'Сброс счётчика AdBlue',   type: 'service',    description: 'Обнуление после заправки реагента AdBlue' },
  ],
});

// ── База марок и моделей ─────────────────────────────────────────────────────

export const VEHICLE_DB: VehicleMake[] = [
  // ── VOLKSWAGEN ──
  {
    id: 'vw', name: 'Volkswagen', logo: '🔵', region: 'europe',
    models: [
      {
        id: 'golf', name: 'Golf (VII/VIII)', years: [2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU(), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU(), VAG_INSTRUMENT_ECU(), VAG_STEERING_ECU(),
          { id: 'parking', name: 'Электрический стояночный тормоз (EPB)', address: '0x35', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',     name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки EPB' },
              { id: 'dtc_clear',    name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок EPB' },
              { id: 'brake_service', name: 'Сервисный режим (замена колодок)', type: 'service', description: 'Раздвинуть поршни суппорта для замены задних колодок', warning: 'Выполнять только при замене тормозных колодок!' },
              { id: 'brake_adapt',  name: 'Адаптация стояночного тормоза', type: 'adaptation', description: 'Обучение усилия зажима EPB после замены колодок' },
            ]},
        ],
      },
      {
        id: 'passat', name: 'Passat (B7/B8)', years: [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022],
        ecus: [VAG_ENGINE_ECU(), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU(), VAG_INSTRUMENT_ECU(), VAG_STEERING_ECU()],
      },
      {
        id: 'tiguan', name: 'Tiguan (I/II)', years: [2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU(), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU(), VAG_INSTRUMENT_ECU(),
          { id: '4motion', name: 'Блок управления 4Motion (Haldex)', address: '0x22', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',         type: 'special',    description: 'Ошибки муфты 4Motion' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC',        type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',              type: 'special',    description: 'Момент блокировки, температура муфты' },
              { id: 'haldex_oil', name: 'Сброс масла Haldex',      type: 'service',    description: 'Обнуление интервала замены масла в муфте Haldex' },
              { id: 'haldex_adapt', name: 'Адаптация муфты Haldex', type: 'adaptation', description: 'Обучение базового давления муфты' },
            ]},
        ],
      },
      {
        id: 'polo', name: 'Polo (V/VI)', years: [2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022],
        ecus: [VAG_ENGINE_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_INSTRUMENT_ECU()],
      },
    ],
  },

  // ── AUDI ──
  {
    id: 'audi', name: 'Audi', logo: '⚪', region: 'europe',
    models: [
      {
        id: 'a4', name: 'A4 (B8/B9)', years: [2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU(), VAG_INSTRUMENT_ECU(), VAG_STEERING_ECU()],
      },
      {
        id: 'a6', name: 'A6 (C7/C8)', years: [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU(), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU(), VAG_INSTRUMENT_ECU(), VAG_STEERING_ECU(),
          { id: 'airsusp', name: 'Пневматическая подвеска (Airmatic)', address: '0x34', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки пневмоподвески' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',            type: 'special',    description: 'Давление, высота кузова' },
              { id: 'height_calib', name: 'Калибровка высоты кузова', type: 'adaptation', description: 'Обучение датчиков высоты', warning: 'Автомобиль должен стоять на ровной поверхности без груза' },
              { id: 'compressor_test', name: 'Тест компрессора',  type: 'activation', description: 'Запуск компрессора для проверки' },
            ]},
        ],
      },
      {
        id: 'q5', name: 'Q5 (8R/FY)', years: [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU(), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU(), VAG_INSTRUMENT_ECU()],
      },
    ],
  },

  // ── BMW ──
  {
    id: 'bmw', name: 'BMW', logo: '🔷', region: 'europe',
    models: [
      {
        id: '3series', name: '3 Series (F30/G20)', years: [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [BMW_ENGINE_ECU(), BMW_ABS_ECU(), BMW_GEARBOX_ECU(),
          { id: 'airbag', name: 'Модуль SRS (MRS)', address: '0x00', protocol: 'BMW-ENET',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок SRS', warning: '⚠️ Только при исправной системе SRS' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Состояние пиропатронов' },
            ]},
          { id: 'instrument', name: 'Комбинация приборов (KOMBI)', address: '0x80', protocol: 'BMW-ENET',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',    type: 'special', description: 'Ошибки KOMBI' },
              { id: 'service_reset', name: 'Сброс CBS (ТО)',     type: 'service', description: 'Сброс счётчиков обслуживания BMW' },
              { id: 'oil_reset',   name: 'Сброс масла',         type: 'service', description: 'Обнуление счётчика масла' },
              { id: 'coding',      name: 'Кодирование',         type: 'special', description: 'Активация скрытых функций BMW' },
            ]},
        ],
      },
      {
        id: '5series', name: '5 Series (F10/G30)', years: [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [BMW_ENGINE_ECU(), BMW_ABS_ECU(), BMW_GEARBOX_ECU(),
          { id: 'airsusp', name: 'Электронная подвеска (EDC)', address: '0xA0', protocol: 'BMW-ENET',
            functions: [
              { id: 'dtc_read',   name: 'Чтение кодов DTC',   type: 'special',    description: 'Ошибки EDC' },
              { id: 'dtc_clear',  name: 'Удаление кодов DTC',  type: 'special',    description: 'Очистка ошибок' },
              { id: 'edc_calib',  name: 'Калибровка EDC',      type: 'adaptation', description: 'Обучение датчиков положения кузова' },
            ]},
        ],
      },
      {
        id: 'x5', name: 'X5 (E70/F15/G05)', years: [2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [BMW_ENGINE_ECU(), BMW_ABS_ECU(), BMW_GEARBOX_ECU()],
      },
    ],
  },

  // ── MERCEDES ──
  {
    id: 'mercedes', name: 'Mercedes-Benz', logo: '⭐', region: 'europe',
    models: [
      {
        id: 'c-class', name: 'C-Class (W204/W205)', years: [2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021],
        ecus: [MERCEDES_ENGINE_ECU(),
          { id: 'abs', name: 'Блок ESP (ABS)', address: '0x03', protocol: 'Mercedes-CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки ESP' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',            type: 'special',    description: 'Скорость колёс, датчики' },
              { id: 'sas_adapt', name: 'Адаптация датчика угла руля', type: 'adaptation', description: 'Калибровка SAS', warning: 'Руль по центру, колёса прямо' },
              { id: 'brake_bleed', name: 'Прокачка тормозов',    type: 'activation', description: 'Режим прокачки ESP' },
              { id: 'pad_reset',  name: 'Сброс ресурса колодок', type: 'service',    description: 'Обнуление счётчика колодок' },
            ]},
          { id: 'airbag', name: 'Модуль SRS/Airbag', address: '0x15', protocol: 'Mercedes-CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка', warning: '⚠️ Требует специальной подготовки' },
            ]},
        ],
      },
      {
        id: 'e-class', name: 'E-Class (W212/W213)', years: [2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [MERCEDES_ENGINE_ECU()],
      },
    ],
  },

  // ── TOYOTA ──
  {
    id: 'toyota', name: 'Toyota', logo: '🔴', region: 'asia',
    models: [
      {
        id: 'camry', name: 'Camry (V50/V70)', years: [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [TOYOTA_ENGINE_ECU(), TOYOTA_ABS_ECU(),
          { id: 'transmission', name: 'Блок управления АКПП (ECT)', address: '0x28', protocol: 'Toyota-CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',      type: 'special',    description: 'Ошибки АКПП' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',     type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data',   name: 'Поток данных',           type: 'special',    description: 'Температура масла, передача' },
              { id: 'adapt_reset', name: 'Сброс адаптаций АКПП',  type: 'adaptation', description: 'Обнуление обучения переключений', warning: 'После сброса нужно обкатать АКПП' },
            ]},
          { id: 'airbag', name: 'Модуль SRS/Airbag', address: '0x11', protocol: 'Toyota-CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка', warning: '⚠️ Осторожно с системой SRS' },
            ]},
        ],
      },
      {
        id: 'rav4', name: 'RAV4 (IV/V)', years: [2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [TOYOTA_ENGINE_ECU(), TOYOTA_ABS_ECU()],
      },
      {
        id: 'land-cruiser', name: 'Land Cruiser (200/300)', years: [2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [TOYOTA_ENGINE_ECU(), TOYOTA_ABS_ECU(),
          { id: 'kdss', name: 'Гидропневматическая подвеска KDSS', address: '0x3E', protocol: 'Toyota-CAN',
            functions: [
              { id: 'dtc_read',   name: 'Чтение кодов DTC',      type: 'special',    description: 'Ошибки KDSS' },
              { id: 'dtc_clear',  name: 'Удаление кодов DTC',     type: 'special',    description: 'Очистка ошибок' },
              { id: 'kdss_calib', name: 'Калибровка KDSS',        type: 'adaptation', description: 'Обучение после замены компонентов', warning: 'Ровная поверхность, без нагрузки' },
              { id: 'height_adj', name: 'Настройка высоты кузова', type: 'adaptation', description: 'Регулировка высоты для KDSS' },
            ]},
        ],
      },
    ],
  },

  // ── KIA ──
  {
    id: 'kia', name: 'Kia', logo: '🟡', region: 'asia',
    models: [
      {
        id: 'rio', name: 'Rio (III/IV)', years: [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'Блок управления двигателем (ECM)', address: '0x01', protocol: 'KIA-CAN/UDS',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки двигателя' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data',   name: 'Поток данных',            type: 'special',    description: 'Параметры двигателя' },
              { id: 'throttle',    name: 'Адаптация дросселя',      type: 'adaptation', description: 'Обучение электронного дросселя' },
              { id: 'idle',        name: 'Адаптация ХХ',            type: 'adaptation', description: 'Обучение холостого хода' },
              { id: 'oil_reset',   name: 'Сброс счётчика масла',   type: 'service',    description: 'Обнуление интервала замены масла' },
            ]},
          { id: 'abs', name: 'Блок ABS / ESP', address: '0x0C', protocol: 'KIA-CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',        type: 'special',    description: 'Ошибки ABS/ESP' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC',       type: 'special',    description: 'Очистка ошибок' },
              { id: 'sas_calib', name: 'Калибровка датчика угла руля', type: 'adaptation', description: 'Обнуление SAS', warning: 'Руль по центру' },
              { id: 'brake_bleed', name: 'Прокачка тормозов',     type: 'activation', description: 'Режим прокачки' },
            ]},
        ],
      },
      {
        id: 'sportage', name: 'Sportage (III/IV/V)', years: [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'Блок управления двигателем (ECM)', address: '0x01', protocol: 'KIA-CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',   type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC',  type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',        type: 'special', description: 'Параметры двигателя' },
              { id: 'dpf_reset', name: 'Регенерация DPF',    type: 'service', description: 'Принудительная регенерация сажевого фильтра (дизель)' },
              { id: 'oil_reset', name: 'Сброс масла',        type: 'service', description: 'Обнуление счётчика масла' },
            ]},
        ],
      },
    ],
  },

  // ── LADA / AVTOVAZ ──
  {
    id: 'lada', name: 'LADA (АвтоВАЗ)', logo: '🇷🇺', region: 'russia',
    models: [
      {
        id: 'vesta', name: 'Vesta / Vesta Cross', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'Блок управления двигателем (BOSCH/ЯНВАРЬ)', address: '0x01', protocol: 'ISO14230/CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки двигателя' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data',   name: 'Поток данных',            type: 'special',    description: 'Параметры двигателя' },
              { id: 'inj_test',    name: 'Тест форсунок',           type: 'activation', description: 'Активация форсунок по одному' },
              { id: 'throttle',    name: 'Адаптация дросселя',      type: 'adaptation', description: 'Обучение нулевого положения дросселя' },
              { id: 'idle',        name: 'Адаптация ХХ',            type: 'adaptation', description: 'Обучение холостого хода' },
              { id: 'oil_reset',   name: 'Сброс ТО',               type: 'service',    description: 'Обнуление сервисного интервала' },
            ]},
          { id: 'abs', name: 'Блок ABS (Bosch 9.0)', address: '0x0C', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',        type: 'special',    description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC',       type: 'special',    description: 'Очистка ошибок' },
              { id: 'sas_calib', name: 'Калибровка датчика угла руля', type: 'adaptation', description: 'Обнуление SAS после ТО рулевого', warning: 'Руль по центру' },
              { id: 'brake_bleed', name: 'Прокачка тормозов',     type: 'activation', description: 'Режим прокачки с насосом ABS' },
            ]},
        ],
      },
      {
        id: 'xray', name: 'XRAY / XRAY Cross', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'Блок управления двигателем', address: '0x01', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Обнуление сервисного счётчика' },
            ]},
        ],
      },
    ],
  },
  // ── HYUNDAI ──
  {
    id: 'hyundai', name: 'Hyundai', logo: '🔵', region: 'asia',
    models: [
      { id: 'solaris', name: 'Solaris (I/II)', years: [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (Kefico/Bosch)', address: '0x01', protocol: 'KWP2000/CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special',    description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special',    description: 'Параметры двигателя' },
              { id: 'throttle',  name: 'Адаптация дросселя', type: 'adaptation', description: 'Инициализация электронного дросселя' },
              { id: 'idle',      name: 'Адаптация ХХ',       type: 'adaptation', description: 'Обучение холостого хода' },
              { id: 'oil_reset', name: 'Сброс счётчика масла', type: 'service',  description: 'Обнуление индикатора ТО' },
            ]},
          { id: 'abs', name: 'Блок ABS / ESC', address: '0x0C', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',         type: 'special',    description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC',        type: 'special',    description: 'Очистка ошибок' },
              { id: 'sas_calib', name: 'Калибровка датчика руля',   type: 'adaptation', description: 'Обнуление SAS', warning: 'Руль по центру' },
            ]},
        ]},
      { id: 'creta', name: 'Creta (I/II)', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс интервала ТО' },
            ]},
        ]},
      { id: 'tucson', name: 'Tucson (II/III/IV)', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'dpf_reset', name: 'Регенерация DPF',   type: 'service', description: 'Принудительная регенерация сажевого фильтра (дизель)' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс интервала ТО' },
            ]},
        ]},
    ],
  },

  // ── HAVAL (Haval/Tank) ──
  {
    id: 'haval', name: 'Haval / Tank', logo: '🟢', region: 'china',
    models: [
      { id: 'jolion', name: 'Jolion', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя GW4B15A', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',     name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки двигателя' },
              { id: 'dtc_clear',    name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data',    name: 'Поток данных',            type: 'special',    description: 'Параметры двигателя 1.5T' },
              { id: 'throttle',     name: 'Адаптация дросселя',      type: 'adaptation', description: 'Инициализация ETC' },
              { id: 'oil_reset',    name: 'Сброс счётчика масла',   type: 'service',    description: 'Обнуление напоминания о замене масла' },
              { id: 'dpf_regen',    name: 'Регенерация DPF',        type: 'service',    description: 'Принудительная регенерация (дизель)' },
            ]},
          { id: 'dct', name: 'Блок DCT (7-ст. робот)', address: '0x17', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',   type: 'special',    description: 'Ошибки DCT' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',  type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data',   name: 'Поток данных',        type: 'special',    description: 'Температура, передача, сцепление' },
              { id: 'clutch_adapt', name: 'Адаптация сцепления DCT', type: 'adaptation', description: 'Обучение точки схватывания сцепления', warning: 'Прогреть КПП до рабочей температуры' },
              { id: 'oil_reset',   name: 'Сброс масла DCT',    type: 'service',    description: 'Обнуление интервала масла в DCT' },
            ]},
          { id: 'abs', name: 'Блок ABS / ESC (Bosch/Mando)', address: '0x0C', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',         type: 'special',    description: 'Ошибки ABS/ESC' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',        type: 'special',    description: 'Очистка ошибок' },
              { id: 'sas_calib',   name: 'Калибровка датчика руля',   type: 'adaptation', description: 'Обнуление SAS после ТО рулевого', warning: 'Руль ровно по центру' },
              { id: 'brake_bleed', name: 'Прокачка тормозов',        type: 'activation', description: 'Режим прокачки с насосом ABS' },
            ]},
        ]},
      { id: 'f7', name: 'F7 / F7x', years: [2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя GW4C20NT', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки двигателя 2.0T' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс масла',        type: 'service', description: 'Обнуление ТО' },
            ]},
        ]},
      { id: 'tank300', name: 'Tank 300', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя 2.0T', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Обнуление сервисного интервала' },
            ]},
          { id: 'transfer', name: 'Раздаточная коробка (4WD)', address: '0x2A', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',   name: 'Чтение кодов DTC',         type: 'special',    description: 'Ошибки раздаточной коробки' },
              { id: 'dtc_clear',  name: 'Удаление кодов DTC',        type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data',  name: 'Поток данных',              type: 'special',    description: 'Режим 4WD, момент блокировки' },
              { id: '4wd_calib',  name: 'Калибровка 4WD',           type: 'adaptation', description: 'Обучение электронной блокировки' },
            ]},
        ]},
      { id: 'tank500', name: 'Tank 500', years: [2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя 3.0T V6', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки двигателя V6' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры V6' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс интервала ТО' },
            ]},
        ]},
    ],
  },

  // ── CHERY / OMODA / EXEED ──
  {
    id: 'chery', name: 'Chery / Omoda / Exeed', logo: '🔴', region: 'china',
    models: [
      { id: 'tiggo4pro', name: 'Tiggo 4 Pro', years: [2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ SQRE4T15B (1.5T)', address: '0x01', protocol: 'CAN/ISO14229',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special',    description: 'Ошибки двигателя 1.5T' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special',    description: 'Параметры двигателя' },
              { id: 'throttle',  name: 'Адаптация дросселя', type: 'adaptation', description: 'Обучение нулевого положения ETC' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service',    description: 'Обнуление счётчика масла' },
            ]},
          { id: 'cvt', name: 'Блок CVT (вариатор)', address: '0x17', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',   type: 'special',    description: 'Ошибки CVT' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC',  type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',        type: 'special',    description: 'Температура, передаточное число' },
              { id: 'cvt_adapt', name: 'Адаптация CVT',      type: 'adaptation', description: 'Обучение вариатора после замены масла', warning: 'Только после замены масла в CVT' },
            ]},
          { id: 'abs', name: 'Блок ABS / ESC', address: '0x0C', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',         type: 'special',    description: 'Ошибки ABS' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',        type: 'special',    description: 'Очистка ошибок' },
              { id: 'sas_calib',   name: 'Калибровка датчика руля',   type: 'adaptation', description: 'Обнуление SAS', warning: 'Руль по центру' },
            ]},
        ]},
      { id: 'tiggo7pro', name: 'Tiggo 7 Pro / 7 Pro Max', years: [2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ SQRE4T15C (1.5T)', address: '0x01', protocol: 'CAN/ISO14229',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс сервисного интервала' },
            ]},
        ]},
      { id: 'omoda5', name: 'Omoda 5', years: [2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ 1.6T TGDI', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки двигателя Omoda 5' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс масла' },
            ]},
        ]},
      { id: 'omoda-c5', name: 'Omoda C5', years: [2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ 1.6T', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс масла' },
            ]},
        ]},
    ],
  },

  // ── GEELY / ZEEKR ──
  {
    id: 'geely', name: 'Geely / Zeekr', logo: '🔵', region: 'china',
    models: [
      { id: 'atlas-pro', name: 'Atlas / Atlas Pro', years: [2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ JLD-4G20 (2.0T)', address: '0x01', protocol: 'CAN/ISO14229',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special',    description: 'Ошибки двигателя Atlas' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special',    description: 'Параметры' },
              { id: 'throttle',  name: 'Адаптация дросселя', type: 'adaptation', description: 'Обучение ETC' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service',    description: 'Сброс интервала ТО' },
            ]},
          { id: 'dct7', name: 'Блок 7DCT (Getrag)', address: '0x17', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки Getrag 7DCT' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка' },
              { id: 'live_data',   name: 'Поток данных',            type: 'special',    description: 'Температура, сцепления' },
              { id: 'clutch_adapt', name: 'Адаптация сцепления',   type: 'adaptation', description: 'Обучение точки схватывания', warning: 'Температура КПП 30–60°C' },
              { id: 'oil_reset',   name: 'Сброс масла 7DCT',       type: 'service',    description: 'Обнуление интервала масла' },
            ]},
        ]},
      { id: 'coolray', name: 'Coolray', years: [2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ JLH-3G15TD (1.5T)', address: '0x01', protocol: 'CAN/ISO14229',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки Coolray 1.5T' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
      { id: 'monjaro', name: 'Monjaro / Xingyue L', years: [2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ 2.0T HD4', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
    ],
  },

  // ── CHANGAN ──
  {
    id: 'changan', name: 'Changan', logo: '🔷', region: 'china',
    models: [
      { id: 'cs55plus', name: 'CS55 Plus', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ BlueCORE 1.5T', address: '0x01', protocol: 'CAN/ISO14229',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special',    description: 'Ошибки двигателя CS55' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных',       type: 'special',    description: 'Параметры' },
              { id: 'throttle',  name: 'Адаптация дросселя', type: 'adaptation', description: 'Обучение ETC' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service',    description: 'Сброс интервала ТО' },
            ]},
          { id: 'abs', name: 'Блок ABS / ESC', address: '0x0C', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',         type: 'special',    description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC',        type: 'special',    description: 'Очистка' },
              { id: 'sas_calib', name: 'Калибровка датчика руля',   type: 'adaptation', description: 'Обнуление SAS', warning: 'Руль по центру' },
            ]},
        ]},
      { id: 'cs35plus', name: 'CS35 Plus', years: [2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ 1.4T / 1.6L', address: '0x01', protocol: 'CAN/ISO14229',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
      { id: 'uni-t', name: 'UNI-T / UNI-V / UNI-K', years: [2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ BlueCORE 1.5T TGDI', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки UNI' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
    ],
  },

  // ── BYD ──
  {
    id: 'byd', name: 'BYD', logo: '🟩', region: 'china',
    models: [
      { id: 'seal', name: 'Seal / Sea Lion', years: [2022,2023,2024],
        ecus: [
          { id: 'bms', name: 'Система управления АКБ (BMS)', address: '0x05', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',   name: 'Чтение кодов DTC',   type: 'special',    description: 'Ошибки батарейного блока' },
              { id: 'dtc_clear',  name: 'Удаление кодов DTC',  type: 'special',    description: 'Очистка ошибок BMS' },
              { id: 'live_data',  name: 'Поток данных',        type: 'special',    description: 'SOC, напряжение ячеек, температура' },
              { id: 'cell_bal',   name: 'Балансировка ячеек',  type: 'adaptation', description: 'Запуск балансировки ячеек АКБ' },
            ]},
          { id: 'motor', name: 'Инвертор / Мотор (MCU)', address: '0x0A', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки мотора и инвертора' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Ток, момент, обороты мотора' },
            ]},
          { id: 'vcu', name: 'VCU (главный контроллер)', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки VCU' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Режим работы, мощность, рекуперация' },
            ]},
        ]},
      { id: 'song-plus', name: 'Song Plus / Song Pro', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ 1.5T DM-i (PHEV)', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки DM-i' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры PHEV' },
            ]},
        ]},
    ],
  },

  // ── EXEED / JETOUR / JAECOO ──
  {
    id: 'exeed', name: 'Exeed / Jetour / Jaecoo', logo: '⭐', region: 'china',
    models: [
      { id: 'txl', name: 'Exeed TXL', years: [2019,2020,2021,2022,2023],
        ecus: [
          { id: 'engine', name: 'ЭБУ 2.0T TGDI', address: '0x01', protocol: 'CAN/ISO14229',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки Exeed TXL' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
      { id: 'jetour-x70', name: 'Jetour X70 / Dashing', years: [2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ 1.5T/2.0T', address: '0x01', protocol: 'CAN/ISO14229',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки Jetour' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
      { id: 'jaecoo7', name: 'Jaecoo 7 / Jaecoo 8', years: [2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ 1.6T TGDI', address: '0x01', protocol: 'CAN/UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки Jaecoo' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
    ],
  },

  // ── CHERY ARRIZO / DAMAS ──
  {
    id: 'nissan', name: 'Nissan', logo: '⚪', region: 'asia',
    models: [
      { id: 'qashqai', name: 'Qashqai (J10/J11)', years: [2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (ECM)', address: '0x01', protocol: 'Nissan-CAN/ISO14229',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки двигателя' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data',   name: 'Поток данных',            type: 'special',    description: 'Параметры двигателя' },
              { id: 'idle_adapt',  name: 'Адаптация холостого хода', type: 'adaptation', description: 'Обучение ХХ после чистки дросселя' },
              { id: 'throttle',    name: 'Адаптация дросселя TPS',  type: 'adaptation', description: 'Калибровка электронного дросселя' },
              { id: 'oil_reset',   name: 'Сброс счётчика масла',   type: 'service',    description: 'Обнуление интервала ТО' },
            ]},
          { id: 'abs', name: 'Блок ABS / VDC', address: '0x0C', protocol: 'Nissan-CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',         type: 'special',    description: 'Ошибки ABS/VDC' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',        type: 'special',    description: 'Очистка ошибок' },
              { id: 'sas_calib',   name: 'Калибровка датчика руля',   type: 'adaptation', description: 'Обнуление SAS', warning: 'Руль по центру' },
            ]},
        ]},
      { id: 'x-trail', name: 'X-Trail (T31/T32)', years: [2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x01', protocol: 'Nissan-CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки X-Trail' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс интервала' },
            ]},
        ]},
    ],
  },

  // ── RENAULT ──
  {
    id: 'renault', name: 'Renault', logo: '🟡', region: 'europe',
    models: [
      { id: 'duster', name: 'Duster (I/II)', years: [2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (ECM)', address: '0x01', protocol: 'CAN/K-Line',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки двигателя Duster' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data',   name: 'Поток данных',            type: 'special',    description: 'Параметры двигателя' },
              { id: 'idle_adapt',  name: 'Адаптация холостого хода', type: 'adaptation', description: 'Обучение ХХ' },
              { id: 'oil_reset',   name: 'Сброс ТО',               type: 'service',    description: 'Обнуление интервала ТО' },
            ]},
          { id: 'abs', name: 'Блок ABS / ESP', address: '0x0C', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',         type: 'special',    description: 'Ошибки ABS' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',        type: 'special',    description: 'Очистка' },
              { id: 'sas_calib',   name: 'Калибровка датчика руля',   type: 'adaptation', description: 'Обнуление SAS', warning: 'Руль по центру' },
              { id: 'brake_bleed', name: 'Прокачка тормозов',        type: 'activation', description: 'Режим прокачки тормозов' },
            ]},
        ]},
      { id: 'logan', name: 'Logan / Sandero (I/II)', years: [2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021],
        ecus: [
          { id: 'engine', name: 'ЭБУ Siemens/Bosch', address: '0x01', protocol: 'CAN/K-Line',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки Logan' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
    ],
  },

  // ── FORD ──
  {
    id: 'ford', name: 'Ford', logo: '🔵', region: 'usa',
    models: [
      { id: 'focus', name: 'Focus (II/III)', years: [2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'CAN/Ford-UDS',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки двигателя Focus' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка ошибок' },
              { id: 'live_data',   name: 'Поток данных',            type: 'special',    description: 'Параметры двигателя' },
              { id: 'idle_adapt',  name: 'Адаптация холостого хода', type: 'adaptation', description: 'Обучение ХХ после чистки дросселя' },
              { id: 'oil_reset',   name: 'Сброс счётчика масла',   type: 'service',    description: 'Обнуление Message Center' },
            ]},
          { id: 'abs', name: 'Блок ABS / AdvanceTrac', address: '0x0C', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',         type: 'special',    description: 'Ошибки ABS' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',        type: 'special',    description: 'Очистка' },
              { id: 'sas_calib',   name: 'Калибровка датчика руля',   type: 'adaptation', description: 'Обнуление SAS', warning: 'Руль по центру' },
            ]},
        ]},
      { id: 'kuga', name: 'Kuga / Escape (II/III)', years: [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'CAN/Ford-UDS',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки Kuga' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
    ],
  },

  // ── MAZDA ──
  {
    id: 'mazda', name: 'Mazda', logo: '🔴', region: 'asia',
    models: [
      { id: 'cx5', name: 'CX-5 (I/II)', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ SKYACTIV-G/D', address: '0x7E0', protocol: 'Mazda-CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки CX-5' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка' },
              { id: 'live_data',   name: 'Поток данных',            type: 'special',    description: 'Параметры SKYACTIV' },
              { id: 'dpf_regen',   name: 'Регенерация DPF',        type: 'service',    description: 'Принудительная регенерация (дизель SKYACTIV-D)' },
              { id: 'oil_reset',   name: 'Сброс счётчика масла',   type: 'service',    description: 'Обнуление Mazda Oil Life Monitor' },
            ]},
        ]},
      { id: 'mazda6', name: 'Mazda 6 (GJ)', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023],
        ecus: [
          { id: 'engine', name: 'ЭБУ SKYACTIV-G 2.0/2.5', address: '0x7E0', protocol: 'Mazda-CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки Mazda6' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс масла',        type: 'service', description: 'Сброс Oil Life' },
            ]},
        ]},
    ],
  },

  // ── SUBARU ──
  {
    id: 'subaru', name: 'Subaru', logo: '⭐', region: 'asia',
    models: [
      { id: 'outback', name: 'Outback / Legacy (V/VI)', years: [2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (ECM)', address: '0x7E0', protocol: 'Subaru-CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',        type: 'special',    description: 'Ошибки Subaru' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',       type: 'special',    description: 'Очистка' },
              { id: 'live_data',   name: 'Поток данных',             type: 'special',    description: 'Параметры оппозитного двигателя' },
              { id: 'idle_adapt',  name: 'Адаптация холостого хода', type: 'adaptation', description: 'Обучение ХХ после чистки дросселя' },
              { id: 'oil_reset',   name: 'Сброс ТО',                type: 'service',    description: 'Сброс сервисного интервала Subaru' },
            ]},
          { id: 'awdcontrol', name: 'Блок AWD / VTD', address: '0x1A', protocol: 'Subaru-CAN',
            functions: [
              { id: 'dtc_read',   name: 'Чтение кодов DTC',        type: 'special',    description: 'Ошибки AWD/VTD' },
              { id: 'dtc_clear',  name: 'Удаление кодов DTC',       type: 'special',    description: 'Очистка' },
              { id: 'live_data',  name: 'Поток данных',             type: 'special',    description: 'Момент на осях, блокировки' },
              { id: 'awd_calib',  name: 'Калибровка AWD',          type: 'adaptation', description: 'Обучение системы AWD после замены компонентов' },
            ]},
        ]},
      { id: 'forester', name: 'Forester (SJ/SK)', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'Subaru-CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки Forester' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
    ],
  },

  // ── MITSUBISHI ──
  {
    id: 'mitsubishi', name: 'Mitsubishi', logo: '♦', region: 'asia',
    models: [
      { id: 'outlander', name: 'Outlander (III)', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (ECM)', address: '0x7E0', protocol: 'Mitsubishi-CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',       type: 'special',    description: 'Ошибки Outlander' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',      type: 'special',    description: 'Очистка' },
              { id: 'live_data',   name: 'Поток данных',            type: 'special',    description: 'Параметры' },
              { id: 'idle_adapt',  name: 'Адаптация холостого хода', type: 'adaptation', description: 'Обучение ХХ' },
              { id: 'oil_reset',   name: 'Сброс ТО',               type: 'service',    description: 'Сброс интервала ТО' },
            ]},
          { id: 'abs', name: 'Блок ABS / ASC', address: '0x0C', protocol: 'CAN',
            functions: [
              { id: 'dtc_read',    name: 'Чтение кодов DTC',         type: 'special',    description: 'Ошибки ABS' },
              { id: 'dtc_clear',   name: 'Удаление кодов DTC',        type: 'special',    description: 'Очистка' },
              { id: 'sas_calib',   name: 'Калибровка датчика руля',   type: 'adaptation', description: 'Обнуление SAS', warning: 'Руль по центру' },
            ]},
        ]},
      { id: 'pajero-sport', name: 'Pajero Sport (III)', years: [2016,2017,2018,2019,2020,2021,2022,2023],
        ecus: [
          { id: 'engine', name: 'ЭБУ 2.4D / 3.0 MIVEC', address: '0x7E0', protocol: 'Mitsubishi-CAN',
            functions: [
              { id: 'dtc_read',  name: 'Чтение кодов DTC',  type: 'special', description: 'Ошибки Pajero Sport' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных',       type: 'special', description: 'Параметры' },
              { id: 'dpf_regen', name: 'Регенерация DPF',   type: 'service', description: 'Принудительная регенерация (дизель)' },
              { id: 'oil_reset', name: 'Сброс ТО',          type: 'service', description: 'Сброс ТО' },
            ]},
        ]},
    ],
  },

  // ── Европа ────────────────────────────────────────────────────────────────

  {
    id: 'skoda', name: 'Škoda', logo: 'ŠK', region: 'europe',
    models: [
      { id: 'octavia', name: 'Octavia (A8)', years: [2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU(), VAG_INSTRUMENT_ECU()] },
      { id: 'superb', name: 'Superb (III)', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU()] },
      { id: 'kodiaq', name: 'Kodiaq', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU()] },
      { id: 'karoq', name: 'Karoq', years: [2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU()] },
      { id: 'rapid', name: 'Rapid / Scala', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_ABS_ECU(), VAG_AIRBAG_ECU()] },
      { id: 'fabia', name: 'Fabia (IV)', years: [2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_ABS_ECU(), VAG_AIRBAG_ECU()] },
    ],
  },

  {
    id: 'seat', name: 'SEAT / Cupra', logo: 'SE', region: 'europe',
    models: [
      { id: 'leon', name: 'Leon (IV)', years: [2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU()] },
      { id: 'ateca', name: 'Ateca / Cupra Ateca', years: [2016,2017,2018,2019,2020,2021,2022,2023],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU()] },
      { id: 'formentor', name: 'Cupra Formentor', years: [2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU()] },
      { id: 'ibiza', name: 'Ibiza (V)', years: [2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_ABS_ECU(), VAG_AIRBAG_ECU()] },
    ],
  },

  {
    id: 'porsche', name: 'Porsche', logo: 'PR', region: 'europe',
    models: [
      { id: 'cayenne', name: 'Cayenne (III)', years: [2018,2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU(),
          { id: 'pasm', name: 'Активная подвеска PASM', address: '0x36', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки PASM' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Высота, жёсткость, датчики' },
              { id: 'calib', name: 'Калибровка PASM', type: 'adaptation', description: 'Обучение нулевого положения', warning: 'Автомобиль должен стоять на ровной поверхности' },
            ]} ] },
      { id: 'macan', name: 'Macan (I/II)', years: [2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU()] },
      { id: 'panamera', name: 'Panamera (II)', years: [2016,2017,2018,2019,2020,2021,2022,2023],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU()] },
      { id: '911', name: '911 (992)', years: [2019,2020,2021,2022,2023,2024],
        ecus: [VAG_ENGINE_ECU('0x01'), VAG_TRANSMISSION_ECU(), VAG_ABS_ECU(), VAG_AIRBAG_ECU()] },
      { id: 'taycan', name: 'Taycan (EV)', years: [2020,2021,2022,2023,2024],
        ecus: [
          { id: 'mcu', name: 'Блок управления двигателем (MCU)', address: '0x7E0', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки MCU' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Мощность, ток, температура' },
            ]},
          { id: 'bms', name: 'BMS (АКБ 800В)', address: '0x7E4', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки батареи' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'SOC, SOH, температура, ячейки' },
              { id: 'cell_balance', name: 'Балансировка ячеек', type: 'adaptation', description: 'Принудительная балансировка', warning: 'Только при SOC 50-80%' },
            ]},
          VAG_ABS_ECU(), VAG_AIRBAG_ECU(), VAG_CLIMATE_ECU(),
        ] },
    ],
  },

  {
    id: 'volvo', name: 'Volvo', logo: 'VV', region: 'europe',
    models: [
      { id: 'xc90', name: 'XC90 (II)', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (ECM)', address: '0x7E0', protocol: 'Volvo-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс интервала сервиса' },
            ]},
          { id: 'abs', name: 'DSTC (ABS/ESP)', address: '0x7E1', protocol: 'Volvo-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки DSTC' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'brake_bleed', name: 'Прокачка тормозов', type: 'activation', description: 'Режим прокачки тормозной системы' },
            ]},
          { id: 'airbag', name: 'SRS/Airbag (RCM)', address: '0x7E2', protocol: 'Volvo-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
          { id: 'air_susp', name: 'Пневмоподвеска Four-C', address: '0x7E5', protocol: 'Volvo-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки подвески' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Высота, давление, датчики' },
              { id: 'calib', name: 'Калибровка высоты', type: 'adaptation', description: 'Обучение нулевого положения кузова', warning: 'На ровной поверхности, без нагрузки' },
            ]},
        ] },
      { id: 'xc60', name: 'XC60 (II)', years: [2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'Volvo-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс счётчика сервиса' },
            ]},
          { id: 'abs', name: 'DSTC (ABS/ESP)', address: '0x7E1', protocol: 'Volvo-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки DSTC' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
          { id: 'airbag', name: 'SRS/Airbag', address: '0x7E2', protocol: 'Volvo-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'v90', name: 'V90 / S90', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'Volvo-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
            ]},
        ] },
    ],
  },

  {
    id: 'peugeot', name: 'Peugeot', logo: 'PG', region: 'europe',
    models: [
      { id: '3008', name: '3008 / 5008 (II)', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (BSM)', address: '0x7E0', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'dpf_regen', name: 'Регенерация DPF', type: 'service', description: 'Принудительная регенерация сажевого фильтра (дизель)' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс сервисного интервала' },
            ]},
          { id: 'abs', name: 'ABS/ESP (ABSVDP)', address: '0x7E1', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS/ESP' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'brake_bleed', name: 'Прокачка тормозов', type: 'activation', description: 'Режим прокачки с насосом ABS' },
            ]},
          { id: 'airbag', name: 'SRS/Airbag (BSI)', address: '0x7E2', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
          { id: 'epb', name: 'Электр. стояночный тормоз (EPB)', address: '0x76', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки EPB' },
              { id: 'epb_open', name: 'Открыть EPB', type: 'activation', description: 'Разжать тормозные колодки для замены', warning: 'Только для замены колодок!' },
              { id: 'epb_close', name: 'Закрыть EPB', type: 'activation', description: 'Зажать колодки после замены' },
              { id: 'pad_reset', name: 'Сброс колодок', type: 'adaptation', description: 'Обнуление износа тормозных колодок' },
            ]},
        ] },
      { id: '208', name: '208 / e-208 (II)', years: [2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя / MCU', address: '0x7E0', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя/мотора' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
            ]},
          { id: 'abs', name: 'ABS/ESP', address: '0x7E1', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: '508', name: '508 (II)', years: [2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры' },
            ]},
        ] },
    ],
  },

  {
    id: 'citroen', name: 'Citroën / DS', logo: 'CI', region: 'europe',
    models: [
      { id: 'c5x', name: 'C5 X', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс сервисного интервала' },
            ]},
          { id: 'suspension', name: 'Гидропневматическая подвеска', address: '0x7E5', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки подвески' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Высота, давление, датчики' },
              { id: 'height_calib', name: 'Калибровка высоты', type: 'adaptation', description: 'Обучение нулевого уровня', warning: 'На ровной поверхности без нагрузки' },
            ]},
        ] },
      { id: 'berlingo', name: 'Berlingo / Rifter (III)', years: [2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'dpf_regen', name: 'Регенерация DPF', type: 'service', description: 'Принудительная регенерация DPF (дизель)' },
            ]},
        ] },
      { id: 'ds7', name: 'DS 7 Crossback', years: [2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'PSA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
            ]},
        ] },
    ],
  },

  {
    id: 'opel', name: 'Opel / Vauxhall', logo: 'OP', region: 'europe',
    models: [
      { id: 'astra', name: 'Astra (L)', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (ECM)', address: '0x7E0', protocol: 'GM-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка ошибок' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс масла/ТО', type: 'service', description: 'Сброс счётчика ТО (Oil Life)' },
            ]},
          { id: 'abs', name: 'ABS/ESC', address: '0x7E1', protocol: 'GM-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS/ESC' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
          { id: 'airbag', name: 'SRS/Airbag (SDM)', address: '0x7E2', protocol: 'GM-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'mokka', name: 'Mokka-e / Mokka (B)', years: [2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ / MCU', address: '0x7E0', protocol: 'GM-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя/мотора' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры' },
            ]},
        ] },
      { id: 'insignia', name: 'Insignia (B)', years: [2017,2018,2019,2020,2021,2022,2023],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'GM-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс Oil Life Monitor' },
            ]},
          { id: 'abs', name: 'ABS/ESC (EBCM)', address: '0x7E1', protocol: 'GM-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'brake_bleed', name: 'Прокачка тормозов', type: 'activation', description: 'Режим прокачки' },
            ]},
        ] },
    ],
  },

  {
    id: 'fiat', name: 'Fiat / Alfa Romeo / Lancia', logo: 'FT', region: 'europe',
    models: [
      { id: 'tipo', name: 'Fiat Tipo (356)', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс интервала ТО' },
            ]},
          { id: 'abs', name: 'ABS/ESP', address: '0x7E1', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'alfa_giulia', name: 'Alfa Romeo Giulia', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс масла', type: 'service', description: 'Сброс Oil Life' },
            ]},
          { id: 'abs', name: 'ABS/ESC', address: '0x7E1', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
          { id: 'airbag', name: 'SRS/Airbag', address: '0x7E2', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'alfa_stelvio', name: 'Alfa Romeo Stelvio', years: [2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры' },
            ]},
        ] },
    ],
  },

  {
    id: 'jaguar_lr', name: 'Jaguar / Land Rover', logo: 'JLR', region: 'europe',
    models: [
      { id: 'range_rover', name: 'Range Rover (L460)', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (ECM)', address: '0x7E0', protocol: 'JLR-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс интервала ТО' },
            ]},
          { id: 'abs', name: 'ABS/DSC', address: '0x7E1', protocol: 'JLR-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки DSC' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'brake_bleed', name: 'Прокачка тормозов', type: 'activation', description: 'Режим прокачки' },
            ]},
          { id: 'airbag', name: 'SRS/Airbag (RCM)', address: '0x7E2', protocol: 'JLR-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
          { id: 'air_susp', name: 'Пневмоподвеска AIRS', address: '0x7E5', protocol: 'JLR-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки подвески' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Высота, давление, режим' },
              { id: 'height_calib', name: 'Калибровка высоты', type: 'adaptation', description: 'Обнуление датчиков высоты кузова', warning: 'На ровной поверхности без нагрузки' },
            ]},
        ] },
      { id: 'defender', name: 'Defender (L663)', years: [2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'JLR-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
            ]},
          { id: 'abs', name: 'ABS/DSC', address: '0x7E1', protocol: 'JLR-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки DSC' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
          { id: 'terrain', name: 'Terrain Response', address: '0x76', protocol: 'JLR-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки Terrain Response' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Режим, муфты, дифференциалы' },
            ]},
        ] },
      { id: 'f-pace', name: 'Jaguar F-Pace / E-Pace', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'JLR-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
            ]},
        ] },
    ],
  },

  // ── США ───────────────────────────────────────────────────────────────────

  {
    id: 'chevrolet', name: 'Chevrolet / GMC / Cadillac', logo: 'GM', region: 'usa',
    models: [
      { id: 'equinox', name: 'Equinox / Traverse (III)', years: [2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'GM-LAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс Oil Life', type: 'service', description: 'Сброс Oil Life Monitor GM' },
            ]},
          { id: 'abs', name: 'ABS/ESC (EBCM)', address: '0x7E1', protocol: 'GM-LAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки EBCM' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'brake_bleed', name: 'Прокачка тормозов', type: 'activation', description: 'Режим автоматической прокачки' },
            ]},
          { id: 'airbag', name: 'SRS/Airbag (SDM)', address: '0x7E2', protocol: 'GM-LAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки SDM' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'tahoe', name: 'Tahoe / Suburban (V)', years: [2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'GM-LAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры V8/V6' },
              { id: 'oil_reset', name: 'Сброс Oil Life', type: 'service', description: 'Сброс счётчика масла' },
            ]},
          { id: 'abs', name: 'EBCM (ABS/StabiliTrak)', address: '0x7E1', protocol: 'GM-LAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки StabiliTrak' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'brake_bleed', name: 'Прокачка тормозов', type: 'activation', description: 'Автопрокачка с EBCM' },
            ]},
        ] },
      { id: 'cadillac_xt', name: 'Cadillac XT5 / XT6', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'GM-LAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки PCM' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс Oil Life', type: 'service', description: 'Сброс масла' },
            ]},
          { id: 'abs', name: 'EBCM (ABS)', address: '0x7E1', protocol: 'GM-LAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
    ],
  },

  {
    id: 'chrysler', name: 'Chrysler / Dodge / RAM / Jeep', logo: 'CR', region: 'usa',
    models: [
      { id: 'jeep_grand_cher', name: 'Jeep Grand Cherokee (WL)', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс Oil Life', type: 'service', description: 'Сброс Oil Life Monitor' },
            ]},
          { id: 'abs', name: 'ABS/ESP (EBC)', address: '0x7E1', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки EBC' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'brake_bleed', name: 'Прокачка тормозов', type: 'activation', description: 'Режим прокачки' },
            ]},
          { id: 'airbag', name: 'SRS/Airbag (ORC)', address: '0x7E2', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
          { id: 'transfer', name: 'Раздаточная коробка (NV244)', address: '0x7E6', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки раздатки' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Режим 4WD, муфты' },
            ]},
        ] },
      { id: 'ram1500', name: 'RAM 1500 (DT)', years: [2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки PCM' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс Oil Life' },
            ]},
          { id: 'abs', name: 'ABS/ESP', address: '0x7E1', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'dodge_charger', name: 'Dodge Charger / Challenger', years: [2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'FCA-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки PCM' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры V6/V8 Hemi' },
            ]},
        ] },
    ],
  },

  {
    id: 'tesla', name: 'Tesla', logo: 'TL', region: 'usa',
    models: [
      { id: 'model3', name: 'Model 3 / Model Y', years: [2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'vehicle', name: 'VCU (Vehicle Control Unit)', address: '0x7E0', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Коды неисправностей автомобиля' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Мощность, ток, температура' },
            ]},
          { id: 'bms', name: 'BMS (Battery Management)', address: '0x7E4', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки батареи' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'SOC, SOH, температура ячеек, ток зарядки' },
            ]},
          { id: 'abs', name: 'ABS/ESC (Bosch iBooster)', address: '0x7E1', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'brake_bleed', name: 'Прокачка тормозов', type: 'activation', description: 'Режим прокачки iBooster', warning: 'Только с профессиональным оборудованием' },
            ]},
        ] },
      { id: 'modelS', name: 'Model S / Model X', years: [2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'vehicle', name: 'VCU (Vehicle Control)', address: '0x7E0', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Коды неисправностей' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры трансмиссии, климата' },
            ]},
          { id: 'bms', name: 'BMS (АКБ)', address: '0x7E4', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки батареи' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'SOC, SOH, деградация, ячейки' },
            ]},
        ] },
    ],
  },

  // ── Япония (дополнительные марки) ─────────────────────────────────────────

  {
    id: 'honda', name: 'Honda / Acura', logo: 'HN', region: 'asia',
    models: [
      { id: 'cr-v', name: 'CR-V (VI)', years: [2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (ECM/PCM)', address: '0x7E0', protocol: 'Honda-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс Oil Life', type: 'service', description: 'Сброс Honda Maintenance Minder' },
              { id: 'throttle_init', name: 'Инициализация дросселя', type: 'adaptation', description: 'Сброс и обучение электронного дросселя' },
            ]},
          { id: 'abs', name: 'ABS/VSA', address: '0x7E1', protocol: 'Honda-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS/VSA' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'brake_bleed', name: 'Прокачка тормозов', type: 'activation', description: 'Режим прокачки ABS' },
            ]},
          { id: 'airbag', name: 'SRS/Airbag', address: '0x7E2', protocol: 'Honda-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
          { id: 'epb', name: 'Электр. стояночный тормоз (EPB)', address: '0x7D6', protocol: 'Honda-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки EPB' },
              { id: 'epb_open', name: 'Открыть EPB (сервис)', type: 'activation', description: 'Разжать колодки для замены', warning: 'Только при замене тормозных колодок' },
              { id: 'epb_close', name: 'Закрыть EPB', type: 'activation', description: 'Зажать колодки после замены' },
            ]},
        ] },
      { id: 'civic', name: 'Civic (XI)', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'Honda-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры 1.5T / e:HEV' },
              { id: 'oil_reset', name: 'Сброс Oil Life', type: 'service', description: 'Сброс Maintenance Minder' },
            ]},
          { id: 'abs', name: 'ABS/VSA', address: '0x7E1', protocol: 'Honda-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS/VSA' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'pilot', name: 'Honda Pilot / Passport', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'Honda-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки PCM' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры V6 3.5' },
              { id: 'oil_reset', name: 'Сброс Oil Life', type: 'service', description: 'Сброс Maintenance Minder' },
            ]},
        ] },
    ],
  },

  {
    id: 'mazda_new', name: 'Mazda', logo: 'MZ', region: 'asia',
    models: [
      { id: 'cx50', name: 'CX-50 / CX-90', years: [2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'Mazda-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя SKYACTIV' },
              { id: 'oil_reset', name: 'Сброс ТО (iActivsense)', type: 'service', description: 'Сброс счётчика ТО' },
              { id: 'dpf_regen', name: 'Регенерация DPF (SKYACTIV-D)', type: 'service', description: 'Принудительная регенерация DPF', warning: 'Только для дизельных версий' },
            ]},
          { id: 'abs', name: 'ABS/DSC', address: '0x7E1', protocol: 'Mazda-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки DSC' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'brake_bleed', name: 'Прокачка тормозов', type: 'activation', description: 'Режим прокачки с ABS' },
            ]},
          { id: 'airbag', name: 'SRS/Airbag', address: '0x7E2', protocol: 'Mazda-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки SRS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
    ],
  },

  {
    id: 'suzuki', name: 'Suzuki', logo: 'SZ', region: 'asia',
    models: [
      { id: 'vitara', name: 'Vitara / S-Cross (II)', years: [2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя (PCM)', address: '0x7E0', protocol: 'Suzuki-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс сервисного интервала' },
              { id: 'throttle_init', name: 'Инициализация дросселя', type: 'adaptation', description: 'Сброс и обучение дросселя' },
            ]},
          { id: 'abs', name: 'ABS/ESP', address: '0x7E1', protocol: 'Suzuki-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'jimny', name: 'Jimny (IV)', years: [2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'Suzuki-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя 1.5' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
            ]},
          { id: 'transfer', name: 'Раздаточная коробка', address: '0x7E6', protocol: 'Suzuki-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки 4WD' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Режим 4WD, муфты' },
            ]},
        ] },
    ],
  },

  {
    id: 'isuzu', name: 'Isuzu', logo: 'IZ', region: 'asia',
    models: [
      { id: 'd-max', name: 'D-Max / mu-X (III)', years: [2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ дизеля (ECM)', address: '0x7E0', protocol: 'Isuzu-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки дизеля 1.9D / 3.0D' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры дизеля' },
              { id: 'dpf_regen', name: 'Регенерация DPF', type: 'service', description: 'Принудительная регенерация сажевого фильтра' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс счётчика ТО' },
            ]},
          { id: 'abs', name: 'ABS/ESC', address: '0x7E1', protocol: 'Isuzu-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
    ],
  },

  // ── Корея (дополнительные) ─────────────────────────────────────────────────

  {
    id: 'ssangyong', name: 'SsangYong / KGM', logo: 'SY', region: 'asia',
    models: [
      { id: 'tivoli', name: 'Tivoli / XLV', years: [2015,2016,2017,2018,2019,2020,2021,2022],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'SsangYong-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс сервисного интервала' },
            ]},
          { id: 'abs', name: 'ABS/ESP', address: '0x7E1', protocol: 'SsangYong-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'rexton', name: 'Rexton G4 / Torres', years: [2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя / дизеля', address: '0x7E0', protocol: 'SsangYong-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры' },
              { id: 'dpf_regen', name: 'Регенерация DPF', type: 'service', description: 'Регенерация DPF (дизель)' },
            ]},
        ] },
    ],
  },

  // ── Индия ─────────────────────────────────────────────────────────────────

  {
    id: 'tata', name: 'Tata Motors', logo: 'TT', region: 'asia',
    models: [
      { id: 'nexon', name: 'Nexon / Nexon EV', years: [2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя / MCU', address: '0x7E0', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя/мотора' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс сервисного интервала' },
            ]},
          { id: 'bms', name: 'BMS (Nexon EV)', address: '0x7E4', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки батареи' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'SOC, SOH, температура ячеек' },
            ]},
          { id: 'abs', name: 'ABS/ESP', address: '0x7E1', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'safari', name: 'Tata Safari / Harrier', years: [2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ дизеля Kryotec', address: '0x7E0', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки дизеля' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры дизеля' },
            ]},
        ] },
    ],
  },

  {
    id: 'mahindra', name: 'Mahindra', logo: 'MH', region: 'asia',
    models: [
      { id: 'thar', name: 'Thar (2020)', years: [2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя mStallion/mHawk', address: '0x7E0', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
            ]},
          { id: 'transfer', name: 'Раздаточная коробка', address: '0x7E6', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки раздатки' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Режим 4WD' },
            ]},
        ] },
      { id: 'xuv700', name: 'XUV700', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя', address: '0x7E0', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс интервала ТО' },
            ]},
        ] },
    ],
  },

  // ── Китай (дополнительные) ─────────────────────────────────────────────────

  {
    id: 'mg_saic', name: 'MG / Roewe (SAIC)', logo: 'MG', region: 'china',
    models: [
      { id: 'mg5', name: 'MG5 / MG ZS EV', years: [2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ / MCU (EV)', address: '0x7E0', protocol: 'SAIC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя/мотора' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Мощность, ток, температура' },
            ]},
          { id: 'bms', name: 'BMS (SAIC/CATL)', address: '0x7E4', protocol: 'SAIC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки батареи' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'SOC, SOH, температура, ячейки' },
            ]},
          { id: 'abs', name: 'ABS/ESP', address: '0x7E1', protocol: 'SAIC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'mg4', name: 'MG4 (MULAN) EV', years: [2022,2023,2024],
        ecus: [
          { id: 'mcu', name: 'MCU (Motor Control)', address: '0x7E0', protocol: 'SAIC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки MCU' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Мощность, ток, обороты' },
            ]},
          { id: 'bms', name: 'BMS 64/77 кВтч', address: '0x7E4', protocol: 'SAIC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки батареи' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'SOC, SOH, температура, балансировка' },
            ]},
        ] },
    ],
  },

  {
    id: 'changan', name: 'Changan / Deepal / Avatr', logo: 'CA', region: 'china',
    models: [
      { id: 'cs75plus', name: 'CS75 Plus / CS85', years: [2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя Blue Core', address: '0x7E0', protocol: 'Changan-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс сервисного интервала' },
            ]},
          { id: 'abs', name: 'ABS/ESP', address: '0x7E1', protocol: 'Changan-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'deepal_l7', name: 'Deepal L7 / S7 (EV/PHEV)', years: [2022,2023,2024],
        ecus: [
          { id: 'mcu', name: 'MCU (EV)', address: '0x7E0', protocol: 'Changan-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки электромотора' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Мощность, ток, температура' },
            ]},
          { id: 'bms', name: 'BMS (CATL LFP)', address: '0x7E4', protocol: 'Changan-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки батареи' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'SOC, SOH, температура' },
            ]},
        ] },
    ],
  },

  {
    id: 'gac', name: 'GAC / Trumpchi / Aion', logo: 'GA', region: 'china',
    models: [
      { id: 'gs8', name: 'Trumpchi GS8 (II)', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя 2.0T', address: '0x7E0', protocol: 'GAC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс сервисного интервала' },
            ]},
          { id: 'abs', name: 'ABS/ESP', address: '0x7E1', protocol: 'GAC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
      { id: 'aion_s', name: 'Aion S / Aion Y (EV)', years: [2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'mcu', name: 'MCU (Motor Control)', address: '0x7E0', protocol: 'GAC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки MCU' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Мощность, ток, температура' },
            ]},
          { id: 'bms', name: 'BMS (CATL/BYD)', address: '0x7E4', protocol: 'GAC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки батареи' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'SOC, SOH, температура, ячейки' },
            ]},
        ] },
    ],
  },

  {
    id: 'nio_li', name: 'NIO / Li Auto / Xpeng', logo: 'NL', region: 'china',
    models: [
      { id: 'li_l9', name: 'Li L9 / L8 / L7 (EREV)', years: [2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ генератора (Range Extender)', address: '0x7E0', protocol: 'Li-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя-генератора' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Обороты, мощность генерации' },
            ]},
          { id: 'bms', name: 'BMS (CATL 40 кВтч)', address: '0x7E4', protocol: 'Li-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки батареи' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'SOC, SOH, температура' },
            ]},
          { id: 'mcu', name: 'MCU (двойной электромотор)', address: '0x7E3', protocol: 'Li-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки MCU' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Мощность, ток, крутящий момент' },
            ]},
        ] },
      { id: 'xpeng_p7', name: 'Xpeng P7 / G9', years: [2020,2021,2022,2023,2024],
        ecus: [
          { id: 'mcu', name: 'MCU (EV)', address: '0x7E0', protocol: 'Xpeng-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки MCU' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Мощность, ток, температура' },
            ]},
          { id: 'bms', name: 'BMS', address: '0x7E4', protocol: 'Xpeng-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки батареи' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'SOC, SOH, температура, ячейки' },
            ]},
        ] },
    ],
  },

  {
    id: 'jac_sehol', name: 'JAC / Sehol', logo: 'JC', region: 'china',
    models: [
      { id: 'js4', name: 'JAC JS4 / Sehol X4 Plus', years: [2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя 1.5T', address: '0x7E0', protocol: 'JAC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс сервисного интервала' },
            ]},
          { id: 'abs', name: 'ABS/ESP', address: '0x7E1', protocol: 'JAC-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
    ],
  },

  // ── Россия (дополнительные) ────────────────────────────────────────────────

  {
    id: 'gaz_group', name: 'ГАЗ (Газель / Соболь / Валдай)', logo: 'ГАЗ', region: 'russia',
    models: [
      { id: 'gazelle_next', name: 'Газель NEXT / NN', years: [2013,2014,2015,2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя УМЗ/Cummins/YUNNEI', address: '0x7E0', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс сервисного интервала' },
            ]},
          { id: 'abs', name: 'ABS (Wabco)', address: '0x7E1', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
        ] },
    ],
  },

  {
    id: 'uaz', name: 'УАЗ', logo: 'УАЗ', region: 'russia',
    models: [
      { id: 'patriot', name: 'Патриот (с 2016)', years: [2016,2017,2018,2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ Январь 7.2 / Bosch ME17', address: '0x7E0', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя ZMZ PRO' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
              { id: 'idle_adapt', name: 'Адаптация холостого хода', type: 'adaptation', description: 'Обучение оборотов ХХ' },
              { id: 'oil_reset', name: 'Сброс ТО', type: 'service', description: 'Сброс счётчика ТО' },
            ]},
          { id: 'abs', name: 'ABS (Bosch)', address: '0x7E1', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки ABS' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
            ]},
          { id: 'transfer', name: 'Раздаточная коробка (BorgWarner)', address: '0x7E6', protocol: 'CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки раздатки' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Режим 4WD' },
            ]},
        ] },
      { id: 'hunter', name: 'УАЗ Хантер / 469', years: [2003,2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018,2019,2020,2021,2022],
        ecus: [
          { id: 'engine', name: 'ЭБУ Микас 7.1 / Январь 5.1', address: '0x7E0', protocol: 'ISO9141',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки УМЗ 421/4213' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
            ]},
        ] },
    ],
  },

  // ── Япония — Ford/Toyota совместно ────────────────────────────────────────

  {
    id: 'daihatsu', name: 'Daihatsu', logo: 'DH', region: 'asia',
    models: [
      { id: 'rocky', name: 'Rocky / Terios (II)', years: [2019,2020,2021,2022,2023,2024],
        ecus: [
          { id: 'engine', name: 'ЭБУ двигателя 1.0T', address: '0x7E0', protocol: 'Toyota-CAN',
            functions: [
              { id: 'dtc_read', name: 'Чтение кодов DTC', type: 'special', description: 'Ошибки двигателя' },
              { id: 'dtc_clear', name: 'Удаление кодов DTC', type: 'special', description: 'Очистка' },
              { id: 'live_data', name: 'Поток данных', type: 'special', description: 'Параметры двигателя' },
            ]},
        ] },
    ],
  },
];

export const REGIONS = [
  { id: 'europe', name: 'Европа',  flag: '🇪🇺' },
  { id: 'asia',   name: 'Азия',    flag: '🌏' },
  { id: 'russia', name: 'Россия',  flag: '🇷🇺' },
  { id: 'china',  name: 'Китай',   flag: '🇨🇳' },
  { id: 'usa',    name: 'США',     flag: '🇺🇸' },
];