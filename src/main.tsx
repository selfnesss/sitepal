import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import * as React from "react";
import {
  ArrowUp,
  Check,
  Contrast,
  EyeOff,
  Gauge,
  Grid3X3,
  Layers3,
  Palette,
  Smartphone,
  Sparkles,
  Wand2,
} from "lucide-react";
import "./styles.css";

type SitePalette = {
  id: string;
  name: string;
  role: string;
  colors: {
    bg: string;
    surface: string;
    text: string;
    muted: string;
    primary: string;
    secondary: string;
    accent: string;
  };
};

type RuleView = "phi" | "thirds" | "contrast" | "blindness";

const starterPalettes: SitePalette[] = [
  {
    id: "quiet-saas",
    name: "Quiet SaaS",
    role: "для сервиса и личного кабинета",
    colors: {
      bg: "#f5f7f4",
      surface: "#ffffff",
      text: "#1b241d",
      muted: "#66736a",
      primary: "#286b4f",
      secondary: "#d9eee5",
      accent: "#c46d3a",
    },
  },
  {
    id: "editorial",
    name: "Editorial Studio",
    role: "для портфолио и студии",
    colors: {
      bg: "#f8f2e9",
      surface: "#fffaf3",
      text: "#241d1a",
      muted: "#70615a",
      primary: "#8b2f45",
      secondary: "#ead9c4",
      accent: "#207a8a",
    },
  },
  {
    id: "fresh-retail",
    name: "Fresh Retail",
    role: "для магазина и каталога",
    colors: {
      bg: "#f4f8fb",
      surface: "#ffffff",
      text: "#172232",
      muted: "#647184",
      primary: "#155bd5",
      secondary: "#e0f0ff",
      accent: "#f5a623",
    },
  },
];

const moods = [
  "технологично",
  "премиально",
  "тепло",
  "минималистично",
  "смело",
  "спокойно",
];

const ruleViews: Array<{
  id: RuleView;
  label: string;
  icon: typeof Layers3;
}> = [
  { id: "phi", label: "Сечение", icon: Layers3 },
  { id: "thirds", label: "Трети", icon: Grid3X3 },
  { id: "contrast", label: "Контраст", icon: Contrast },
  { id: "blindness", label: "Слепота", icon: EyeOff },
];

const checkItems: Array<{
  title: string;
  text: string;
  icon: typeof Layers3;
}> = [
  { title: "Скорость", text: "легкий интерфейс без лишнего шума", icon: Gauge },
  { title: "Навигация", text: "понятные зоны и короткий путь к действию", icon: Layers3 },
  { title: "Шрифты", text: "крупная иерархия вместо декоративности", icon: Check },
  { title: "Адаптив", text: "одна палитра проверяется на трех размерах", icon: Smartphone },
];

function hashText(value: string) {
  return value.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
}

function hsl(h: number, s: number, l: number) {
  return `hsl(${Math.round((h + 360) % 360)} ${Math.round(s)}% ${Math.round(l)}%)`;
}

function generatedPalettes(prompt: string, mood: string): SitePalette[] {
  const base = hashText(`${prompt}-${mood || "sitepal"}`) % 360;
  const families = [
    {
      name: "Clear Signal",
      role: "контрастная основа для CTA и навигации",
      bg: hsl(base + 38, 38, 96),
      surface: "#ffffff",
      text: hsl(base + 205, 36, 13),
      muted: hsl(base + 208, 13, 43),
      primary: hsl(base, 67, 38),
      secondary: hsl(base + 10, 46, 90),
      accent: hsl(base + 118, 66, 42),
    },
    {
      name: "Soft Trust",
      role: "мягкая палитра для экспертного сайта",
      bg: hsl(base + 168, 28, 95),
      surface: hsl(base + 168, 30, 99),
      text: hsl(base + 224, 32, 16),
      muted: hsl(base + 223, 12, 46),
      primary: hsl(base + 190, 54, 32),
      secondary: hsl(base + 190, 35, 88),
      accent: hsl(base + 28, 72, 47),
    },
    {
      name: "Bold Product",
      role: "выразительная схема для первого экрана",
      bg: hsl(base + 250, 25, 12),
      surface: hsl(base + 250, 23, 18),
      text: hsl(base + 55, 46, 94),
      muted: hsl(base + 48, 18, 70),
      primary: hsl(base + 52, 82, 56),
      secondary: hsl(base + 250, 18, 25),
      accent: hsl(base + 162, 74, 54),
    },
  ];

  return families.map((item, index) => ({
    id: `${hashText(prompt + mood)}-${index}`,
    name: item.name,
    role: item.role,
    colors: {
      bg: item.bg,
      surface: item.surface,
      text: item.text,
      muted: item.muted,
      primary: item.primary,
      secondary: item.secondary,
      accent: item.accent,
    },
  }));
}

function colorVars(palette: SitePalette) {
  return {
    "--page": palette.colors.bg,
    "--surface": palette.colors.surface,
    "--text": palette.colors.text,
    "--muted": palette.colors.muted,
    "--primary": palette.colors.primary,
    "--secondary": palette.colors.secondary,
    "--accent": palette.colors.accent,
  } as React.CSSProperties;
}

function App() {
  const [prompt, setPrompt] = React.useState("онлайн-школа дизайна для начинающих");
  const [mood, setMood] = React.useState("спокойно");
  const [palettes, setPalettes] = React.useState(starterPalettes);
  const [selected, setSelected] = React.useState(starterPalettes[0]);
  const [ruleView, setRuleView] = React.useState<RuleView>("phi");

  const generate = () => {
    const next = generatedPalettes(prompt, mood);
    setPalettes(next);
    setSelected(next[0]);
  };

  return (
    <main className="app" style={colorVars(selected)}>
      <header className="topbar">
        <a className="brand" href="#workspace" aria-label="SitePal">
          <span className="brand-mark">
            <Palette size={21} />
          </span>
          <span>SitePal</span>
        </a>
        <nav className="nav" aria-label="Разделы">
          <a href="#generator">Палитры</a>
          <a href="#experience">Пример</a>
          <a href="#rules">Правила</a>
        </nav>
      </header>

      <section className="workspace" id="workspace">
        <aside className="panel generator" id="generator" aria-label="Генератор палитр">
          <div className="panel-title">
            <Sparkles size={20} />
            <div>
              <p>ИИ-подбор</p>
              <h1>Палитра для будущего сайта</h1>
            </div>
          </div>

          <label className="field">
            <span>Описание проекта</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={4}
            />
          </label>

          <div className="mood-grid" aria-label="Настроение">
            {moods.map((item) => (
              <button
                className={item === mood ? "chip active" : "chip"}
                key={item}
                onClick={() => setMood(item)}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <button className="generate" onClick={generate} type="button">
            <Wand2 size={18} />
            Сгенерировать
          </button>

          <div className="palette-list">
            {palettes.map((palette) => (
              <button
                className={palette.id === selected.id ? "palette-card active" : "palette-card"}
                key={palette.id}
                onClick={() => setSelected(palette)}
                type="button"
              >
                <span className="palette-meta">
                  <strong>{palette.name}</strong>
                  <small>{palette.role}</small>
                </span>
                <span className="swatches" aria-hidden="true">
                  {Object.values(palette.colors).map((color) => (
                    <i key={color} style={{ background: color }} />
                  ))}
                </span>
              </button>
            ))}
          </div>
        </aside>

        <ExperienceSection ruleView={ruleView} />
      </section>

      <section className="rules" id="rules">
        <div className="rules-heading">
          <div>
            <p>13 правил в действии</p>
            <h2>Не статья, а визуальные проверки</h2>
          </div>
          <div className="segmented rules-switch" aria-label="Визуализации правил">
            {ruleViews.map((view) => (
              <button
                className={ruleView === view.id ? "icon-toggle active" : "icon-toggle"}
                key={view.id}
                onClick={() => setRuleView(view.id)}
                title={view.label}
                type="button"
              >
                <view.icon size={17} />
                <span>{view.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rule-stage">
          <RuleVisualization view={ruleView} />
          <div className="rule-checks">
            {checkItems.map(({ title, text, icon: Icon }) => (
              <article className="check-card" key={title}>
                <Icon size={18} />
                <strong>{title}</strong>
                <span>{text}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <a className="to-top" href="#workspace" aria-label="Наверх">
        <ArrowUp size={20} />
      </a>
    </main>
  );
}

function ExperienceSection({ ruleView }: { ruleView: RuleView }) {
  return (
    <section className="experience" id="experience" aria-label="Живой пример сайта">
      <div className="experience-heading">
        <p>Живой пример</p>
        <h2>Этот сайт и есть пример выбранной палитры</h2>
      </div>

      <section className="example-hero">
        {ruleView === "thirds" && <div className="thirds-overlay" aria-hidden="true" />}
        {ruleView === "phi" && <GoldenHeroOverlay />}
        <div className="example-copy">
          <span className="eyebrow">Дизайн без хаоса</span>
          <h3>Подберите палитру и сразу почувствуйте сайт</h3>
          <p>
            Цвета проверяются на настоящем интерфейсе: фоне, навигации, кнопках,
            карточках, тексте и визуальных правилах ниже.
          </p>
          <div className="example-actions">
            <button type="button">Начать подбор</button>
            <button className="ghost" type="button">Смотреть правила</button>
          </div>
        </div>
        <div className="example-visual" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <div className="example-grid">
        {[
          ["Композиция", "сетки и пропорции видны на странице"],
          ["Контраст", "кнопки и текст проверяются сразу"],
          ["Адаптив", "блоки перестраиваются без отдельного макета"],
        ].map(([title, text]) => (
          <article key={title}>
            <i />
            <strong>{title}</strong>
            <span>{text}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

function GoldenHeroOverlay() {
  return (
    <div className="phi-overlay" aria-hidden="true">
      <span className="phi-line vertical" />
      <span className="phi-line horizontal" />
      <span className="phi-label main">61.8%</span>
      <span className="phi-label side">38.2%</span>
      <span className="phi-label bottom">61.8 / 38.2</span>
      <span className="phi-target" />
    </div>
  );
}

function RuleVisualization({ view }: { view: RuleView }) {
  if (view === "thirds") {
    return (
      <div className="visual-card thirds-demo">
        <div className="thirds-overlay" />
        <span className="focus-point one" />
        <span className="focus-point two" />
        <div className="visual-copy">
          <strong>Правило третей</strong>
          <p>Ключевые объекты попадают в точки пересечения, взгляд считывает экран быстрее.</p>
        </div>
      </div>
    );
  }

  if (view === "contrast") {
    return (
      <div className="visual-card contrast-demo">
        <div className="contrast-good">
          <strong>Хороший контраст</strong>
          <span>Кнопка и текст читаются сразу</span>
        </div>
        <div className="contrast-bad">
          <strong>Слабый контраст</strong>
          <span>Текст похож на фон</span>
        </div>
      </div>
    );
  }

  if (view === "blindness") {
    return (
      <div className="visual-card blindness-demo">
        <div className="fake-banner">Скидка 90%</div>
        <div className="real-content">
          <strong>Полезный блок виден лучше рекламы</strong>
          <span>Важные действия встроены в сценарий, а не выглядят как баннер.</span>
        </div>
        <div className="content-row" />
        <div className="content-row short" />
      </div>
    );
  }

  return (
    <div className="visual-card phi-demo">
      <svg
        className="golden-diagram"
        viewBox="0 0 809 500"
        role="img"
        aria-label="Золотой прямоугольник с делением 61.8 на 38.2 и спиралью Фибоначчи"
      >
        <rect className="golden-bg" x="39" y="24" width="731.4" height="452" rx="0" />
        <rect className="golden-main" x="39" y="24" width="452" height="452" />
        <rect className="golden-side" x="491" y="24" width="279.4" height="452" />
        <line className="golden-ratio-line" x1="491" y1="24" x2="491" y2="476" />
        <line className="golden-ratio-line" x1="39" y1="303.3" x2="770.4" y2="303.3" />
        <text className="golden-text" x="265" y="64" textAnchor="middle">
          61.8%
        </text>
        <text className="golden-text" x="630.7" y="64" textAnchor="middle">
          38.2%
        </text>
        <text className="golden-note" x="404" y="456" textAnchor="middle">
          Пропорция 1.618:1
        </text>

        <g className="fib-grid" transform="translate(70 118) scale(0.62)">
          <rect x="0" y="0" width="320" height="320" />
          <rect x="320" y="0" width="200" height="200" />
          <rect x="320" y="200" width="120" height="120" />
          <rect x="440" y="200" width="80" height="80" />
          <rect x="440" y="280" width="40" height="40" />
          <rect x="480" y="280" width="40" height="40" />
          <path
            className="fib-spiral"
            d="M 320 320 A 320 320 0 0 1 0 0
               A 200 200 0 0 1 520 0
               A 120 120 0 0 1 320 320
               A 80 80 0 0 1 520 200
               A 40 40 0 0 1 440 320
               A 40 40 0 0 1 520 280"
          />
        </g>
      </svg>
      <div className="visual-copy">
        <strong>Золотое сечение</strong>
        <p>Главная зона занимает 61.8%, вторичная 38.2%, а схема показывает спираль по квадратам Фибоначчи.</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
