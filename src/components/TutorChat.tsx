import { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/icon';

interface Msg {
  role: 'user' | 'tutor';
  text: string;
}

const QUICK = [
  'Объясни теорему Пифагора',
  'Как решать уравнения с дробями?',
  'Разбери задание №21',
  'Дай план на сегодня',
];

const GREETING: Msg = {
  role: 'tutor',
  text: 'Привет! Я твой наставник по подготовке к ОГЭ. Спрашивай что угодно — объясню тему простыми словами, разберём ошибки вместе. С чего начнём?',
};

function replyFor(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('пифагор'))
    return 'Хорошо, давай по шагам. Теорема Пифагора работает только в прямоугольном треугольнике. Она говорит: квадрат гипотенузы (длинной стороны напротив прямого угла) равен сумме квадратов двух катетов. Формула: c² = a² + b². Например, если катеты 3 и 4, то c² = 9 + 16 = 25, значит c = 5. Хочешь, решим задачу вместе?';
  if (t.includes('дроб') || t.includes('уравнен'))
    return 'Отличный вопрос. Главный приём — избавиться от дробей. Находим общий знаменатель и умножаем на него обе части уравнения — дроби исчезают, остаётся обычное уравнение. Дальше решаем как привыкли. Скинь конкретный пример — разберём по шагам.';
  if (t.includes('план'))
    return 'Давай составим спокойный план на сегодня: 1) 20 минут — теория по слабой теме, 2) 5 заданий из варианта, 3) разбор ошибок со мной. Это всего 40 минут, но даёт устойчивый результат. Готов начать?';
  return 'Понял тебя. Давай разберёмся вместе — расскажи чуть подробнее или пришли само задание, и я объясню шаг за шагом, без спешки. Ты справишься.';
}

const TutorChat = () => {
  const [msgs, setMsgs] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, typing]);

  const send = (text: string) => {
    const value = text.trim();
    if (!value || typing) return;
    setMsgs((m) => [...m, { role: 'user', text: value }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [...m, { role: 'tutor', text: replyFor(value) }]);
      setTyping(false);
    }, 1100);
  };

  return (
    <div className="bg-white rounded-3xl shadow-soft flex flex-col h-[560px] overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-11 h-11 rounded-2xl gradient-hero flex items-center justify-center text-white">
          <Icon name="GraduationCap" size={22} />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold leading-tight">Наставник</div>
          <div className="flex items-center gap-1.5 text-xs text-accent font-semibold">
            <span className="w-2 h-2 rounded-full bg-accent" /> на связи
          </div>
        </div>
        <Icon name="Sparkles" size={20} className="text-primary" />
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/40">
        {msgs.map((m, i) => (
          <div key={i} className={`flex animate-msg-in ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[82%] px-4 py-3 text-sm font-semibold leading-relaxed ${
                m.role === 'user'
                  ? 'bg-primary text-primary-foreground rounded-3xl rounded-br-lg'
                  : 'bg-white text-foreground rounded-3xl rounded-bl-lg shadow-soft'
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start animate-msg-in">
            <div className="bg-white rounded-3xl rounded-bl-lg shadow-soft px-4 py-3 flex gap-1.5">
              {[0, 1, 2].map((d) => (
                <span
                  key={d}
                  className="w-2 h-2 rounded-full bg-primary"
                  style={{ animation: `typing-dot 1.2s ${d * 0.2}s infinite` }}
                />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* quick prompts */}
      <div className="px-3 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q)}
            className="shrink-0 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition rounded-full px-3 py-2"
          >
            {q}
          </button>
        ))}
      </div>

      {/* input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="p-3 flex items-center gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Спроси наставника..."
          className="flex-1 bg-muted rounded-2xl px-4 py-3 text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button
          type="submit"
          className="w-12 h-12 rounded-2xl gradient-hero text-white flex items-center justify-center shrink-0 hover:opacity-90 transition disabled:opacity-50"
          disabled={!input.trim() || typing}
        >
          <Icon name="Send" size={20} />
        </button>
      </form>
    </div>
  );
};

export default TutorChat;
