import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import TutorChat from '@/components/TutorChat';

const MASCOT = 'https://cdn.poehali.dev/projects/9c84ab67-0481-49f6-b840-91ab3c78d672/files/aac1ae14-e378-404b-abd8-feb99f7c08c1.jpg';

const NAV = [
  { id: 'home', label: 'Главная', icon: 'House' },
  { id: 'variants', label: 'Варианты', icon: 'FileStack' },
  { id: 'tutor', label: 'Наставник', icon: 'Sparkles' },
  { id: 'progress', label: 'Прогресс', icon: 'TrendingUp' },
  { id: 'profile', label: 'Профиль', icon: 'User' },
];

const SUBJECTS = [
  { name: 'Математика', icon: 'Calculator', color: 'from-indigo-500 to-blue-600', done: 12, total: 20 },
  { name: 'Русский язык', icon: 'BookOpen', color: 'from-rose-500 to-orange-500', done: 8, total: 18 },
  { name: 'Физика', icon: 'Atom', color: 'from-teal-500 to-emerald-600', done: 5, total: 15 },
  { name: 'Информатика', icon: 'Cpu', color: 'from-violet-500 to-indigo-600', done: 3, total: 14 },
];

const MILESTONES = [
  { icon: 'CalendarCheck', label: 'Неделя без пропусков', got: true },
  { icon: 'CircleCheck', label: '100 заданий решено', got: true },
  { icon: 'BookMarked', label: 'Все темы пройдены', got: false },
  { icon: 'Medal', label: 'Пробник на 4+', got: false },
];

function Stat({ icon, value, label, color }: { icon: string; value: string; label: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-soft flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-white shrink-0`}>
        <Icon name={icon} size={22} />
      </div>
      <div>
        <div className="font-display font-extrabold text-lg leading-none">{value}</div>
        <div className="text-xs text-muted-foreground font-semibold mt-1">{label}</div>
      </div>
    </div>
  );
}

const Index = () => {
  const [tab, setTab] = useState('home');

  return (
    <div className="min-h-screen gradient-mesh pb-28">
      {/* Top bar */}
      <header className="max-w-5xl mx-auto px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center text-white">
            <Icon name="GraduationCap" size={22} />
          </div>
          <span className="font-display font-extrabold text-lg">Наставник ОГЭ</span>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-full pl-3 pr-1.5 py-1.5 shadow-soft">
          <Icon name="Flame" size={18} className="text-secondary" />
          <span className="font-extrabold text-sm">7 дней</span>
          <div className="w-8 h-8 rounded-full gradient-hero" />
        </div>
      </header>

      {tab === 'tutor' ? (
        <main className="max-w-2xl mx-auto px-5 mt-6">
          <h1 className="font-display font-extrabold text-2xl mb-1">Личный наставник</h1>
          <p className="text-muted-foreground font-semibold text-sm mb-5">
            Объяснит тему простыми словами и поддержит. Спрашивай без стеснения.
          </p>
          <TutorChat />
        </main>
      ) : (
        <main className="max-w-5xl mx-auto px-5 mt-6">
          {/* Hero */}
          <section className="relative gradient-hero rounded-[1.8rem] p-6 sm:p-8 overflow-hidden shadow-pop animate-pop-in">
            <div className="absolute -right-6 -top-6 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="relative flex items-center justify-between gap-4">
              <div className="text-white max-w-md">
                <span className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs font-bold mb-3">
                  <Icon name="Calendar" size={14} /> До ОГЭ 214 дней
                </span>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl leading-tight">
                  Спокойно идём к цели. Шаг за шагом.
                </h1>
                <p className="text-white/85 font-semibold mt-2 text-sm">
                  Сегодня всего 5 заданий — и ты станешь увереннее. Я рядом.
                </p>
                <Button
                  onClick={() => setTab('variants')}
                  className="mt-5 bg-white text-primary hover:bg-white/90 font-extrabold rounded-2xl h-12 px-6 text-base"
                >
                  Продолжить подготовку
                  <Icon name="ArrowRight" size={18} className="ml-1" />
                </Button>
              </div>
              <img src={MASCOT} alt="Наставник" className="w-28 h-28 sm:w-40 sm:h-40 object-contain animate-float rounded-3xl shrink-0" />
            </div>
          </section>

          {/* Stats */}
          <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <Stat icon="CircleCheck" value="148" label="Решено заданий" color="bg-gradient-to-br from-indigo-500 to-blue-600" />
            <Stat icon="TrendingUp" value="78%" label="Точность" color="bg-gradient-to-br from-teal-500 to-emerald-600" />
            <Stat icon="Clock" value="32 ч" label="Времени учёбы" color="bg-gradient-to-br from-rose-500 to-orange-500" />
            <Stat icon="Flame" value="7 дн." label="Без пропусков" color="bg-gradient-to-br from-violet-500 to-indigo-600" />
          </section>

          {/* Goal progress */}
          <section className="bg-white rounded-2xl p-5 mt-5 shadow-soft">
            <div className="flex items-center justify-between mb-3">
              <span className="font-display font-bold">Готовность к экзамену</span>
              <span className="text-sm font-bold text-primary">68%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div className="h-full gradient-hero rounded-full" style={{ width: '68%' }} />
            </div>
            <p className="text-xs text-muted-foreground font-semibold mt-2">
              Уверенный темп. Так держать — ты на правильном пути.
            </p>
          </section>

          {/* Subjects / variants */}
          <section className="mt-7">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-extrabold text-xl">Варианты по предметам</h2>
              <span className="text-xs font-semibold text-muted-foreground">из заданий прошлых лет</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {SUBJECTS.map((s) => (
                <div key={s.name} className="bg-white rounded-2xl p-5 shadow-soft hover:-translate-y-0.5 transition-transform cursor-pointer group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white`}>
                      <Icon name={s.icon} size={24} />
                    </div>
                    <div>
                      <div className="font-display font-bold">{s.name}</div>
                      <div className="text-xs text-muted-foreground font-semibold">{s.done} из {s.total} вариантов</div>
                    </div>
                    <Icon name="ChevronRight" size={20} className="ml-auto text-muted-foreground group-hover:translate-x-1 transition-transform" />
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${s.color} rounded-full`} style={{ width: `${(s.done / s.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tutor card */}
          <section className="mt-7 bg-white rounded-2xl p-6 shadow-soft relative overflow-hidden">
            <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white shrink-0">
                <Icon name="Sparkles" size={28} />
              </div>
              <div className="flex-1">
                <h3 className="font-display font-bold text-lg">Не понял тему? Спроси наставника</h3>
                <p className="text-sm text-muted-foreground font-semibold mt-1">
                  Объяснит спокойно и по шагам, разберёт ошибки и поддержит — как заботливый учитель рядом.
                </p>
              </div>
              <Button
                onClick={() => setTab('tutor')}
                className="rounded-2xl font-extrabold h-12 px-6 gradient-hero hover:opacity-90 shrink-0"
              >
                <Icon name="MessageCircle" size={18} className="mr-1" /> Открыть чат
              </Button>
            </div>
          </section>

          {/* Milestones */}
          <section className="mt-7">
            <h2 className="font-display font-extrabold text-xl mb-4">Твои достижения</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {MILESTONES.map((a) => (
                <div key={a.label} className={`rounded-2xl p-4 shadow-soft transition ${a.got ? 'bg-white' : 'bg-white/60'}`}>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${a.got ? 'gradient-hero text-white' : 'bg-muted text-muted-foreground'}`}>
                    <Icon name={a.got ? a.icon : 'Lock'} size={22} />
                  </div>
                  <div className="text-sm font-bold mt-2 leading-tight">{a.label}</div>
                  {a.got && <div className="text-xs text-accent font-semibold mt-0.5">Получено</div>}
                </div>
              ))}
            </div>
          </section>

          {/* Telegram banner */}
          <section className="mt-7 gradient-hero rounded-2xl p-5 flex items-center gap-4 shadow-pop">
            <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-white shrink-0">
              <Icon name="Send" size={24} />
            </div>
            <div className="text-white flex-1">
              <div className="font-display font-bold">Подготовка в Telegram</div>
              <div className="text-white/85 text-sm font-semibold">Мягкие напоминания, задания и наставник в боте</div>
            </div>
            <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl font-extrabold shrink-0">
              Открыть
            </Button>
          </section>
        </main>
      )}

      {/* Bottom nav */}
      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white rounded-full px-2 py-2 shadow-pop flex items-center gap-1 w-[calc(100%-2rem)] max-w-md justify-between">
        {NAV.map((n) => (
          <button
            key={n.id}
            onClick={() => setTab(n.id)}
            className={`flex flex-col items-center justify-center rounded-full px-3 py-2 flex-1 transition ${
              tab === n.id ? 'gradient-hero text-white' : 'text-muted-foreground'
            }`}
          >
            <Icon name={n.icon} size={20} />
            <span className="text-[10px] font-bold mt-0.5">{n.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Index;
