// ── VIN расширенная база данных ────────────────────────────────────────────────
// Источники: открытые стандарты ISO 3779, WMI-реестр NHTSA, базы производителей

// ── WMI коды производителей ────────────────────────────────────────────────────
export const WMI_DB: Record<string, { make: string; country: string; plant?: string }> = {
  // Toyota
  'JTD': { make: 'Toyota', country: 'Япония' },
  'JTM': { make: 'Toyota', country: 'Япония' },
  'JTN': { make: 'Toyota', country: 'Япония' },
  'JTE': { make: 'Toyota', country: 'Япония' },
  'JTJ': { make: 'Toyota', country: 'Япония' },
  'JTK': { make: 'Toyota', country: 'Япония' },
  'SB1': { make: 'Toyota', country: 'Великобритания' },
  '5TD': { make: 'Toyota', country: 'США' },
  '2T1': { make: 'Toyota', country: 'Канада' },
  // Honda
  'JHM': { make: 'Honda', country: 'Япония' },
  '1HG': { make: 'Honda', country: 'США' },
  '2HG': { make: 'Honda', country: 'Канада' },
  'SHH': { make: 'Honda', country: 'Великобритания' },
  // Nissan
  'JN1': { make: 'Nissan', country: 'Япония' },
  'JN6': { make: 'Nissan', country: 'Япония' },
  'JN8': { make: 'Nissan', country: 'Япония' },
  'VNV': { make: 'Nissan', country: 'Вьетнам' },
  '1N4': { make: 'Nissan', country: 'США' },
  'MNT': { make: 'Nissan', country: 'Таиланд' },
  // Mazda
  'JM1': { make: 'Mazda', country: 'Япония' },
  'JMZ': { make: 'Mazda', country: 'Япония' },
  // Subaru
  'JF1': { make: 'Subaru', country: 'Япония' },
  'JF2': { make: 'Subaru', country: 'Япония' },
  // Mitsubishi
  'JA3': { make: 'Mitsubishi', country: 'Япония' },
  'JA4': { make: 'Mitsubishi', country: 'Япония' },
  'JMB': { make: 'Mitsubishi', country: 'Япония' },
  'MNB': { make: 'Mitsubishi', country: 'Таиланд' },
  // Suzuki
  'JS1': { make: 'Suzuki', country: 'Япония' },
  'JS3': { make: 'Suzuki', country: 'Япония' },
  // Lexus
  'JTH': { make: 'Lexus', country: 'Япония' },
  // Volkswagen
  'WVW': { make: 'Volkswagen', country: 'Германия' },
  'WV1': { make: 'Volkswagen', country: 'Германия' },
  'WV2': { make: 'Volkswagen', country: 'Германия' },
  '3VW': { make: 'Volkswagen', country: 'Мексика' },
  'NVW': { make: 'Volkswagen', country: 'Польша' },
  // Audi
  'WAU': { make: 'Audi', country: 'Германия' },
  'TRU': { make: 'Audi', country: 'Венгрия' },
  // BMW
  'WBA': { make: 'BMW', country: 'Германия' },
  'WBY': { make: 'BMW', country: 'Германия' },
  'WBS': { make: 'BMW', country: 'Германия' },
  '5UX': { make: 'BMW', country: 'США' },
  // Mercedes-Benz
  'WDB': { make: 'Mercedes-Benz', country: 'Германия' },
  'WDD': { make: 'Mercedes-Benz', country: 'Германия' },
  'WDC': { make: 'Mercedes-Benz', country: 'Германия' },
  'W1K': { make: 'Mercedes-Benz', country: 'Германия' },
  'W1N': { make: 'Mercedes-Benz', country: 'Германия' },
  'W1X': { make: 'Mercedes-Benz', country: 'Германия' },
  '4JG': { make: 'Mercedes-Benz', country: 'США' },
  // Porsche
  'WP0': { make: 'Porsche', country: 'Германия' },
  'WP1': { make: 'Porsche', country: 'Германия' },
  // Škoda
  'TMB': { make: 'Škoda', country: 'Чехия' },
  'TMJ': { make: 'Škoda', country: 'Чехия' },
  // SEAT
  'VSS': { make: 'SEAT', country: 'Испания' },
  'VXK': { make: 'SEAT', country: 'Испания' },
  // Volvo
  'YV1': { make: 'Volvo', country: 'Швеция' },
  'YV4': { make: 'Volvo', country: 'Швеция' },
  // Renault
  'VF1': { make: 'Renault', country: 'Франция' },
  'VF3': { make: 'Peugeot', country: 'Франция' },
  'VF7': { make: 'Citroën', country: 'Франция' },
  'VF6': { make: 'Renault', country: 'Франция' },
  // Opel
  'W0L': { make: 'Opel/Vauxhall', country: 'Германия' },
  // Fiat/Alfa
  'ZAR': { make: 'Alfa Romeo', country: 'Италия' },
  'ZFA': { make: 'Fiat', country: 'Италия' },
  'ZFF': { make: 'Ferrari', country: 'Италия' },
  // Hyundai
  'KMH': { make: 'Hyundai', country: 'Южная Корея' },
  'KMF': { make: 'Hyundai', country: 'Южная Корея' },
  'KNA': { make: 'Kia', country: 'Южная Корея' },
  'KNB': { make: 'Kia', country: 'Южная Корея' },
  'KNC': { make: 'Kia', country: 'Южная Корея' },
  'KNM': { make: 'Kia', country: 'Южная Корея' },
  // Lada
  'XTA': { make: 'LADA (АвтоВАЗ)', country: 'Россия' },
  'XTT': { make: 'LADA (АвтоВАЗ)', country: 'Россия' },
  // UAZ
  'XTH': { make: 'УАЗ', country: 'Россия' },
  // GAZ
  'XUF': { make: 'ГАЗ', country: 'Россия' },
  // Land Rover
  'SAL': { make: 'Land Rover', country: 'Великобритания' },
  'SMA': { make: 'Land Rover', country: 'Великобритания' },
  // Jaguar
  'SAJ': { make: 'Jaguar', country: 'Великобритания' },
  // Mini
  'WMW': { make: 'Mini', country: 'Германия' },
  'SED': { make: 'Mini', country: 'Великобритания' },
  // Ford
  'WF0': { make: 'Ford', country: 'Германия' },
  '1FA': { make: 'Ford', country: 'США' },
  '1FB': { make: 'Ford', country: 'США' },
  '1FM': { make: 'Ford', country: 'США' },
  '1FT': { make: 'Ford', country: 'США' },
  '2FT': { make: 'Ford', country: 'Канада' },
  '3FA': { make: 'Ford', country: 'Мексика' },
  // GM / Chevrolet / Cadillac
  '1G1': { make: 'Chevrolet', country: 'США' },
  '1GC': { make: 'Chevrolet', country: 'США' },
  '2G1': { make: 'Chevrolet', country: 'Канада' },
  '1G6': { make: 'Cadillac', country: 'США' },
  'W04': { make: 'Buick', country: 'Германия' },
  // Jeep / Dodge / Chrysler / RAM
  '1C4': { make: 'Jeep', country: 'США' },
  '1C6': { make: 'RAM', country: 'США' },
  '2C3': { make: 'Dodge', country: 'Канада' },
  '1B3': { make: 'Dodge', country: 'США' },
  // Tesla
  '5YJ': { make: 'Tesla', country: 'США' },
  '7SA': { make: 'Tesla', country: 'США' },
  'LRW': { make: 'Tesla', country: 'Китай' },
  // Китайские
  'LFV': { make: 'Volkswagen', country: 'Китай' },
  'LGB': { make: 'Buick', country: 'Китай' },
  'LGX': { make: 'Haval', country: 'Китай' },
  'LHG': { make: 'Honda', country: 'Китай' },
  'LJC': { make: 'Chery', country: 'Китай' },
  'LS5': { make: 'Chevrolet', country: 'Китай' },
  'LVS': { make: 'Volvo', country: 'Китай' },
  'LVV': { make: 'Geely', country: 'Китай' },
  'LVG': { make: 'Geely', country: 'Китай' },
  'LKL': { make: 'Hyundai', country: 'Китай' },
  'LFP': { make: 'Toyota', country: 'Китай' },
  'LBE': { make: 'BMW', country: 'Китай' },
  'LSG': { make: 'BYD', country: 'Китай' },
  'DBH': { make: 'BYD', country: 'Китай' },
  // Индия
  'MA3': { make: 'Suzuki', country: 'Индия' },
  'MBH': { make: 'Honda', country: 'Индия' },
  'MEE': { make: 'Toyota', country: 'Индия' },
};

// ── Год производства по символу позиции 10 ──────────────────────────────────
export const YEAR_MAP: Record<string, number> = {
  'A': 1980, 'B': 1981, 'C': 1982, 'D': 1983, 'E': 1984,
  'F': 1985, 'G': 1986, 'H': 1987, 'J': 1988, 'K': 1989,
  'L': 1990, 'M': 1991, 'N': 1992, 'P': 1993, 'R': 1994,
  'S': 1995, 'T': 1996, 'V': 1997, 'W': 1998, 'X': 1999,
  'Y': 2000, '1': 2001, '2': 2002, '3': 2003, '4': 2004,
  '5': 2005, '6': 2006, '7': 2007, '8': 2008, '9': 2009,
  'A2': 2010, 'B2': 2011, 'C2': 2012, 'D2': 2013, 'E2': 2014,
  'F2': 2015, 'G2': 2016, 'H2': 2017, 'J2': 2018, 'K2': 2019,
  'L2': 2020, 'M2': 2021, 'N2': 2022, 'P2': 2023, 'R2': 2024,
};

// ── Заводы производства ───────────────────────────────────────────────────────
export const PLANT_DB: Record<string, Record<string, string>> = {
  Toyota: {
    'A': 'Айти, Япония (Tsutsumi)',
    'B': 'Айти, Япония (Takaoka)',
    'C': 'Айти, Япония (Kigo)',
    'E': 'Хоккайдо, Япония',
    'F': 'Фукуока, Япония (Miyata)',
    'G': 'Гёда, Япония (Kanto AutoWorks)',
    'J': 'Джорджтаун, США',
    'K': 'Вулверхэмптон, Великобритания',
    'L': 'Валенсия, Испания',
    'M': 'Самут-Пракан, Таиланд',
    'T': 'Бурса, Турция',
    'U': 'Фудзи, Япония (Fuji Heavy)',
    'W': 'Тяньцзинь, Китай',
    'Z': 'Йокохама, Япония',
  },
  Volkswagen: {
    'W': 'Вольфсбург, Германия',
    'N': 'Эмден, Германия',
    'H': 'Ганновер, Германия',
    'E': 'Брюссель, Бельгия',
    'M': 'Млада-Болеслав, Чехия',
    'P': 'Памплона, Испания',
    'S': 'Куритиба, Бразилия',
    'X': 'Пуэбла, Мексика',
    'Z': 'Поцнань, Польша',
  },
  BMW: {
    'A': 'Мюнхен, Германия',
    'B': 'Дингольфинг, Германия',
    'C': 'Регенсбург, Германия',
    'E': 'Берлин, Германия',
    'J': 'Гринвилл, США',
    'K': 'Оксфорд, Великобритания',
    'N': 'Калаллун, Южная Африка',
  },
  'Mercedes-Benz': {
    'A': 'Зиндельфинген, Германия',
    'B': 'Бремен, Германия',
    'C': 'Раштатт, Германия',
    'D': 'Дюссельдорф, Германия',
    'E': 'Гамбург, Германия',
    'J': 'Джеффарсон, США (Alabama)',
    'N': 'Нидерринде, Германия',
    'X': 'Пекин, Китай',
  },
  Hyundai: {
    'A': 'Ульсан, Южная Корея (завод 1)',
    'B': 'Ульсан, Южная Корея (завод 2)',
    'C': 'Ульсан, Южная Корея (завод 3)',
    'D': 'Ульсан, Южная Корея (завод 4)',
    'E': 'Ульсан, Южная Корея (завод 5)',
    'H': 'Аса, Южная Корея',
    'Z': 'Носовицы, Чехия',
    'M': 'Монтерей, Мексика',
    '5': 'Аламабама, США',
    'N': 'Пекин, Китай',
  },
  Kia: {
    'A': 'Кванмён, Южная Корея',
    'B': 'Хвасон, Южная Корея',
    'C': 'Чонджу, Южная Корея',
    'U': 'Зилина, Словакия',
    '5': 'Джорджия, США',
  },
};

// ── Расширенная база моделей Toyota по VDS ──────────────────────────────────
// VDS = символы 4-9 VIN (позиция 4 = тип кузова, 5 = двигатель, 6-7 = серия)
export const TOYOTA_MODELS: Record<string, {
  name: string;
  bodyCode: string;
  generation: string;
  years: string;
  body: string;
  engine: string;
  engineVol: string;
  fuel: string;
  power: string;
  transmission: string;
  drive: string;
  description: string;
}> = {
  // Corolla E120 (2001-2007)
  'DE70K': { name: 'Corolla', bodyCode: 'CDE120', generation: 'E120', years: '2001–2007', body: 'Седан', engine: '1CD-FTV', engineVol: '2.0 л', fuel: 'Дизель', power: '116 л.с.', transmission: 'МКПП 5-ступ.', drive: 'Передний', description: 'Дизельная версия Corolla E120 для европейского рынка' },
  'DE70E': { name: 'Corolla', bodyCode: 'CDE120', generation: 'E120', years: '2001–2007', body: 'Хэтчбек 5д', engine: '1CD-FTV', engineVol: '2.0 л', fuel: 'Дизель', power: '116 л.с.', transmission: 'МКПП 5-ступ.', drive: 'Передний', description: 'Дизельная Corolla E120 хэтчбек' },
  'NDE70': { name: 'Corolla', bodyCode: 'NDE120', generation: 'E120', years: '2001–2006', body: 'Седан', engine: '1ND-TV', engineVol: '1.4 л', fuel: 'Дизель', power: '75 л.с.', transmission: 'МКПП 5-ступ.', drive: 'Передний', description: 'Corolla E120 с дизелем 1.4 для Европы' },
  'ZZE12': { name: 'Corolla', bodyCode: 'ZZE120', generation: 'E120', years: '2001–2007', body: 'Седан', engine: '1ZZ-FE', engineVol: '1.8 л', fuel: 'Бензин', power: '136 л.с.', transmission: 'АКПП 4-ступ.', drive: 'Передний', description: 'Corolla E120 с атмосферным 1.8 — основная бензиновая версия E120' },
  'CE12': { name: 'Corolla', bodyCode: 'CE120', generation: 'E120', years: '2001–2007', body: 'Универсал', engine: '1CE-FTV', engineVol: '2.0 л', fuel: 'Дизель', power: '116 л.с.', transmission: 'МКПП 5-ступ.', drive: 'Передний', description: 'Corolla Verso / универсал E120 дизель' },

  // Corolla E140/E150 (2006-2013)
  'ZRE14': { name: 'Corolla', bodyCode: 'ZRE140', generation: 'E140', years: '2006–2013', body: 'Седан', engine: '2ZR-FE', engineVol: '1.6 л', fuel: 'Бензин', power: '124 л.с.', transmission: 'АКПП 4-ступ.', drive: 'Передний', description: 'Corolla E140 бензин 1.6 — основная версия для России и СНГ' },
  'NDE15': { name: 'Corolla', bodyCode: 'NDE150', generation: 'E150', years: '2006–2013', body: 'Хэтчбек', engine: '1ND-TV', engineVol: '1.4 л', fuel: 'Дизель', power: '90 л.с.', transmission: 'МКПП 5-ступ.', drive: 'Передний', description: 'Corolla E150 хэтчбек дизель для Европы' },
  'ADE15': { name: 'Corolla', bodyCode: 'ADE150', generation: 'E150', years: '2006–2013', body: 'Седан', engine: '1AD-FTV', engineVol: '2.0 л', fuel: 'Дизель', power: '126 л.с.', transmission: 'МКПП 6-ступ.', drive: 'Передний', description: 'Corolla E150 дизель 2.0 D-4D' },

  // Corolla E170 (2012-2019)
  'ZRE17': { name: 'Corolla', bodyCode: 'ZRE170', generation: 'E170', years: '2012–2019', body: 'Седан', engine: '2ZR-FE', engineVol: '1.6 л', fuel: 'Бензин', power: '122 л.с.', transmission: 'МКПП 6-ступ.', drive: 'Передний', description: 'Corolla E170 1.6 для России — самая массовая версия' },
  'ZRE18': { name: 'Corolla', bodyCode: 'ZRE180', generation: 'E170', years: '2012–2019', body: 'Седан', engine: '1ZR-FE', engineVol: '1.6 л', fuel: 'Бензин', power: '122 л.с.', transmission: 'АКПП CVT', drive: 'Передний', description: 'Corolla E170 1.6 с вариатором CVT' },
  'AVE18': { name: 'Corolla', bodyCode: 'AVE180', generation: 'E170', years: '2012–2019', body: 'Седан', engine: '2AR-FXE', engineVol: '1.8 л', fuel: 'Гибрид (HSD)', power: '136 л.с.', transmission: 'АКПП CVT', drive: 'Передний', description: 'Corolla E170 Hybrid 1.8 HSD — гибридная версия' },

  // Corolla E210 (2019+)
  'ZWE21': { name: 'Corolla', bodyCode: 'ZWE210', generation: 'E210', years: '2019–н.в.', body: 'Седан', engine: '2ZR-FXE', engineVol: '1.8 л', fuel: 'Гибрид (HSD)', power: '122 л.с.', transmission: 'АКПП CVT', drive: 'Передний', description: 'Corolla E210 Hybrid 1.8 — флагманская гибридная версия' },
  'ZRE21': { name: 'Corolla', bodyCode: 'ZRE210', generation: 'E210', years: '2019–н.в.', body: 'Седан', engine: 'M20A-FKS', engineVol: '2.0 л', fuel: 'Бензин', power: '152 л.с.', transmission: 'МКПП 6-ступ.', drive: 'Передний', description: 'Corolla E210 2.0 Dynamic Force — флагманский бензиновый двигатель' },
  'AXPE1': { name: 'Corolla Cross', bodyCode: 'AXPE10', generation: 'E10', years: '2021–н.в.', body: 'Кроссовер', engine: '2ZR-FXE', engineVol: '1.8 л', fuel: 'Гибрид (HSD)', power: '122 л.с.', transmission: 'АКПП CVT', drive: 'Передний/Полный', description: 'Corolla Cross гибридный кроссовер' },

  // Camry
  'ACV3': { name: 'Camry', bodyCode: 'ACV30', generation: 'XV30', years: '2001–2006', body: 'Седан', engine: '2AZ-FE', engineVol: '2.4 л', fuel: 'Бензин', power: '152 л.с.', transmission: 'АКПП 5-ступ.', drive: 'Передний', description: 'Camry XV30 2.4 — пятое поколение Camry' },
  'ACV4': { name: 'Camry', bodyCode: 'ACV40', generation: 'XV40', years: '2006–2011', body: 'Седан', engine: '2AZ-FE', engineVol: '2.4 л', fuel: 'Бензин', power: '167 л.с.', transmission: 'АКПП 5-ступ.', drive: 'Передний', description: 'Camry XV40 2.4 — шестое поколение для России' },
  'GSV4': { name: 'Camry', bodyCode: 'GSV40', generation: 'XV40', years: '2006–2011', body: 'Седан', engine: '2GR-FE', engineVol: '3.5 л V6', fuel: 'Бензин', power: '277 л.с.', transmission: 'АКПП 6-ступ.', drive: 'Передний', description: 'Camry XV40 V6 3.5 — топовая версия шестого поколения' },
  'ASV5': { name: 'Camry', bodyCode: 'ASV50', generation: 'XV50', years: '2011–2018', body: 'Седан', engine: '2AR-FE', engineVol: '2.5 л', fuel: 'Бензин', power: '181 л.с.', transmission: 'АКПП 6-ступ.', drive: 'Передний', description: 'Camry XV50 2.5 — седьмое поколение, самая популярная версия в России' },
  'AVV5': { name: 'Camry', bodyCode: 'AVV50', generation: 'XV50', years: '2011–2018', body: 'Седан', engine: '2AR-FXE', engineVol: '2.5 л', fuel: 'Гибрид (HSD)', power: '205 л.с.', transmission: 'АКПП CVT', drive: 'Передний', description: 'Camry XV50 Hybrid — гибридная версия седьмого поколения' },
  'GSV5': { name: 'Camry', bodyCode: 'GSV50', generation: 'XV50', years: '2011–2018', body: 'Седан', engine: '2GR-FE', engineVol: '3.5 л V6', fuel: 'Бензин', power: '277 л.с.', transmission: 'АКПП 6-ступ.', drive: 'Передний', description: 'Camry XV50 V6 3.5 — топовая бензиновая версия' },
  'ASV7': { name: 'Camry', bodyCode: 'ASV70', generation: 'XV70', years: '2017–н.в.', body: 'Седан', engine: '2AR-FE', engineVol: '2.5 л', fuel: 'Бензин', power: '181 л.с.', transmission: 'АКПП 6-ступ.', drive: 'Передний', description: 'Camry XV70 2.5 — восьмое поколение на платформе TNGA' },
  'AVV7': { name: 'Camry', bodyCode: 'AVV70', generation: 'XV70', years: '2017–н.в.', body: 'Седан', engine: '2AR-FXE', engineVol: '2.5 л', fuel: 'Гибрид (HSD)', power: '215 л.с.', transmission: 'АКПП CVT', drive: 'Передний', description: 'Camry XV70 Hybrid — гибрид восьмого поколения' },
  'GSV7': { name: 'Camry', bodyCode: 'GSV70', generation: 'XV70', years: '2017–н.в.', body: 'Седан', engine: '2GR-FKS', engineVol: '3.5 л V6', fuel: 'Бензин', power: '300 л.с.', transmission: 'АКПП 8-ступ.', drive: 'Передний', description: 'Camry XV70 V6 3.5 Dynamic Force — топовая версия 8 поколения' },

  // RAV4
  'ACA2': { name: 'RAV4', bodyCode: 'ACA20', generation: 'XA20', years: '2000–2005', body: 'Кроссовер 5д', engine: '1AZ-FE', engineVol: '2.0 л', fuel: 'Бензин', power: '152 л.с.', transmission: 'АКПП 4-ступ.', drive: 'Полный AWD', description: 'RAV4 XA20 — второе поколение' },
  'ACA3': { name: 'RAV4', bodyCode: 'ACA30', generation: 'XA30', years: '2005–2012', body: 'Кроссовер 5д', engine: '2AZ-FE', engineVol: '2.4 л', fuel: 'Бензин', power: '170 л.с.', transmission: 'АКПП 4-ступ.', drive: 'Полный AWD', description: 'RAV4 XA30 2.4 — третье поколение' },
  'ZSA4': { name: 'RAV4', bodyCode: 'ZSA40', generation: 'XA40', years: '2012–2019', body: 'Кроссовер 5д', engine: '3ZR-FAE', engineVol: '2.0 л', fuel: 'Бензин', power: '146 л.с.', transmission: 'АКПП 6-ступ.', drive: 'Передний/Полный', description: 'RAV4 XA40 2.0 — четвёртое поколение' },
  'ALA4': { name: 'RAV4', bodyCode: 'ALA40', generation: 'XA40', years: '2012–2019', body: 'Кроссовер 5д', engine: '1AD-FTV', engineVol: '2.2 л', fuel: 'Дизель', power: '150 л.с.', transmission: 'АКПП 6-ступ.', drive: 'Полный AWD', description: 'RAV4 XA40 дизель 2.2 для Европы' },
  'ASA4': { name: 'RAV4', bodyCode: 'ASA44', generation: 'XA40', years: '2012–2019', body: 'Кроссовер 5д', engine: '2AR-FE', engineVol: '2.5 л', fuel: 'Бензин', power: '180 л.с.', transmission: 'АКПП 6-ступ.', drive: 'Полный AWD', description: 'RAV4 XA40 2.5 для рынков США/Канада/Россия' },
  'AXAH5': { name: 'RAV4', bodyCode: 'AXAH54', generation: 'XA50', years: '2018–н.в.', body: 'Кроссовер 5д', engine: '2AR-FXE', engineVol: '2.5 л', fuel: 'Гибрид (HSD)', power: '222 л.с.', transmission: 'АКПП CVT', drive: 'Полный E-AWD', description: 'RAV4 XA50 Hybrid — пятое поколение, гибридная система E-Four' },
  'AXAP5': { name: 'RAV4', bodyCode: 'AXAP54', generation: 'XA50', years: '2018–н.в.', body: 'Кроссовер 5д', engine: 'M20A-FKS', engineVol: '2.0 л', fuel: 'Бензин', power: '149 л.с.', transmission: 'АКПП CVT', drive: 'Полный AWD', description: 'RAV4 XA50 2.0 — базовая версия пятого поколения' },

  // Land Cruiser
  'UZJ10': { name: 'Land Cruiser', bodyCode: 'UZJ100', generation: 'J100', years: '1998–2007', body: 'Внедорожник 5д', engine: '2UZ-FE', engineVol: '4.7 л V8', fuel: 'Бензин', power: '235 л.с.', transmission: 'АКПП 4-ступ.', drive: 'Полный 4WD', description: 'Land Cruiser 100 V8 4.7 — десятое поколение, рамный SUV' },
  'HDJ10': { name: 'Land Cruiser', bodyCode: 'HDJ100', generation: 'J100', years: '1998–2007', body: 'Внедорожник 5д', engine: '1HD-FTE', engineVol: '4.2 л', fuel: 'Дизель', power: '204 л.с.', transmission: 'АКПП 4-ступ.', drive: 'Полный 4WD', description: 'Land Cruiser 100 дизель 4.2 — для Ближнего Востока и Африки' },
  'UZJ20': { name: 'Land Cruiser', bodyCode: 'UZJ200', generation: 'J200', years: '2007–2021', body: 'Внедорожник 5д', engine: '2UZ-FE / 3UR-FE', engineVol: '4.7/5.7 л V8', fuel: 'Бензин', power: '235/381 л.с.', transmission: 'АКПП 6-ступ.', drive: 'Полный 4WD', description: 'Land Cruiser 200 — V8 платформа, рамный внедорожник' },
  'GRJ20': { name: 'Land Cruiser', bodyCode: 'GRJ200', generation: 'J200', years: '2007–2021', body: 'Внедорожник 5д', engine: '1GR-FE', engineVol: '4.0 л V6', fuel: 'Бензин', power: '282 л.с.', transmission: 'АКПП 6-ступ.', drive: 'Полный 4WD', description: 'Land Cruiser 200 V6 4.0 — для рынков Ближнего Востока' },
  'VJA30': { name: 'Land Cruiser', bodyCode: 'VJA300', generation: 'J300', years: '2021–н.в.', body: 'Внедорожник 5д', engine: 'V35A-FTS', engineVol: '3.5 л V6 Twin Turbo', fuel: 'Бензин', power: '415 л.с.', transmission: 'АКПП 10-ступ.', drive: 'Полный 4WD', description: 'Land Cruiser 300 — 11 поколение на платформе TNGA-F, V6 twin-turbo' },
  'FJA30': { name: 'Land Cruiser', bodyCode: 'FJA300', generation: 'J300', years: '2021–н.в.', body: 'Внедорожник 5д', engine: 'F33A-FTV', engineVol: '3.3 л V6 дизель', fuel: 'Дизель', power: '309 л.с.', transmission: 'АКПП 10-ступ.', drive: 'Полный 4WD', description: 'Land Cruiser 300 дизель V6 3.3 для мировых рынков' },
};

// ── Цвета кузова по коду (последние 2 символа VIN или отдельный поиск) ────────
// Коды цветов Toyota (примеры — реальные коды из NHTSA и TIS)
export const COLOR_CODES: Record<string, { name: string; hex: string }> = {
  // Белые
  '040': { name: 'Белый перламутр (Super White)', hex: '#F5F5F5' },
  '070': { name: 'Белый (White)', hex: '#FFFFFF' },
  '089': { name: 'Белый перламутр (Pearl White)', hex: '#F0EEE8' },
  '8X8': { name: 'Platinum White Pearl', hex: '#F2F0EB' },
  // Серебристые
  '1F7': { name: 'Серебристый металлик (Silky Gold Metallic)', hex: '#C0C0C0' },
  '1J4': { name: 'Серебристый (Silver Metallic)', hex: '#B8B8B8' },
  '202': { name: 'Серебристый (Classic Silver Metallic)', hex: '#A0A0A0' },
  '1D6': { name: 'Серый металлик (Magnetic Gray Metallic)', hex: '#5C5C5C' },
  // Чёрные
  '202': { name: 'Чёрный (Attitude Black Metallic)', hex: '#1A1A1A' },
  '220': { name: 'Чёрный перламутр (Black Crystal Shine)', hex: '#0D0D0D' },
  // Красные
  '3R3': { name: 'Красный (Classic Red)', hex: '#C0392B' },
  '3T3': { name: 'Тёмно-красный (Barcelona Red Metallic)', hex: '#922B21' },
  '3R1': { name: 'Красный перламутр (Racy Red)', hex: '#E74C3C' },
  // Синие
  '8S6': { name: 'Тёмно-синий металлик (Blue Streak Metallic)', hex: '#2C3E7A' },
  '8V5': { name: 'Голубой металлик (Celestial Silver Metallic)', hex: '#3498DB' },
  // Серые/Коричневые
  '4V2': { name: 'Бежевый (Beige)', hex: '#D4B896' },
  '6X3': { name: 'Коричневый металлик (Black Truffle)', hex: '#5C4033' },
};

// ── Опции и комплектации ──────────────────────────────────────────────────────
export interface VehicleOptions {
  transmission: string;
  drive: string;
  engine: string;
  engineVol: string;
  power: string;
  fuel: string;
  body: string;
  doors: string;
  seats: string;
  bodyCode: string;
  generation: string;
  productionYears: string;
  plant: string;
  series: string;
  checkDigit: string;
  modelYear: number | null;
  description: string;
  // Доп. опции из VDS
  options: {
    label: string;
    value: string;
    icon: string;
  }[];
}

// ── Главная функция расширенного декодирования VIN ───────────────────────────
export function decodeVinExtended(vin: string): VehicleOptions {
  const v = vin.toUpperCase().trim();
  const wmi = v.slice(0, 3);          // Позиции 1-3: производитель
  const vds = v.slice(3, 9);          // Позиции 4-9: описание авто
  const vis = v.slice(9);             // Позиции 10-17: идентификатор
  const yearChar = v[9];              // Позиция 10: год
  const plantChar = v[10];            // Позиция 11: завод
  const serial = v.slice(11);         // Позиции 12-17: серийный номер

  // Определяем год (с учётом повторения цикла после 2009→2010=A, 2011=B...)
  const wmiData = WMI_DB[wmi];
  const make = wmiData?.make || 'Неизвестно';

  let modelYear: number | null = YEAR_MAP[yearChar] || null;
  // Корректировка цикла 2010-2024
  if (modelYear && modelYear <= 2009) {
    // Цикл повторяется: если А — может быть и 1980 и 2010
    // Определяем по WMI эпохе — если WMI современный, скорее 2010+
    const modernWmis = ['KMH', 'KNA', 'KNM', 'SB1', 'LGX', 'LVV', 'LSG'];
    if (modernWmis.includes(wmi) || (wmiData && parseInt(serial) > 100000)) {
      modelYear = modelYear + 30; // Сдвиг на 30 лет для нового цикла
    }
  }

  // Завод производства
  const plantDb = PLANT_DB[make] || {};
  const plant = plantDb[plantChar] || `Код завода: ${plantChar}`;

  // Ищем модель по VDS (первые 5 символов)
  let modelData = null;
  for (let len = 5; len >= 3; len--) {
    const key = vds.slice(0, len);
    if (TOYOTA_MODELS[key]) {
      modelData = TOYOTA_MODELS[key];
      break;
    }
  }

  // Формируем опции
  const options: VehicleOptions['options'] = [];

  if (modelData) {
    options.push({ label: 'Тип кузова', value: modelData.body, icon: 'Car' });
    options.push({ label: 'Двигатель', value: `${modelData.engine} ${modelData.engineVol}`, icon: 'Zap' });
    options.push({ label: 'Мощность', value: modelData.power, icon: 'Gauge' });
    options.push({ label: 'Топливо', value: modelData.fuel, icon: 'Fuel' });
    options.push({ label: 'Трансмиссия', value: modelData.transmission, icon: 'Settings2' });
    options.push({ label: 'Привод', value: modelData.drive, icon: 'GitMerge' });
    options.push({ label: 'Период производства', value: modelData.years, icon: 'Calendar' });
    options.push({ label: 'Код кузова', value: modelData.bodyCode, icon: 'Hash' });
    options.push({ label: 'Поколение', value: modelData.generation, icon: 'Layers' });
  }

  // Добавляем VIN структуру
  options.push({ label: 'Код WMI', value: wmi, icon: 'Factory' });
  options.push({ label: 'Завод изготовления', value: plant, icon: 'MapPin' });
  options.push({ label: 'Серийный номер', value: serial, icon: 'Hash' });
  if (yearChar) options.push({ label: 'Символ года', value: `${yearChar} (${modelYear || '—'})`, icon: 'Calendar' });

  return {
    transmission: modelData?.transmission || '—',
    drive: modelData?.drive || '—',
    engine: modelData ? `${modelData.engine} ${modelData.engineVol}` : '—',
    engineVol: modelData?.engineVol || '—',
    power: modelData?.power || '—',
    fuel: modelData?.fuel || '—',
    body: modelData?.body || '—',
    doors: modelData?.body?.includes('5д') ? '5' : modelData?.body?.includes('4') ? '4' : '—',
    seats: '5',
    bodyCode: modelData?.bodyCode || vds,
    generation: modelData?.generation || '—',
    productionYears: modelData?.years || '—',
    plant,
    series: serial,
    checkDigit: v[8],
    modelYear,
    description: modelData?.description || '',
    options,
  };
}
