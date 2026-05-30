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
  Monitor,
  Palette,
  Smartphone,
  Sparkles,
  Tablet,
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

type PreviewSize = "desktop" | "tablet" | "mobile";
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
  const [previewSize, setPreviewSize] = React.useState<PreviewSize>("desktop");
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
          <a href="#preview">Пример</a>
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

        <section className="live-area" id="preview" aria-label="Живой предпросмотр">
          <div className="preview-toolbar">
            <div>
              <p>Живой пример</p>
              <h2>Клик по палитре меняет весь сайт</h2>
            </div>
            <div className="segmented" aria-label="Размер предпросмотра">
              <IconToggle
                active={previewSize === "desktop"}
                label="Desktop"
                onClick={() => setPreviewSize("desktop")}
              >
                <Monitor size={17} />
              </IconToggle>
              <IconToggle
                active={previewSize === "tablet"}
                label="Tablet"
                onClick={() => setPreviewSize("tablet")}
              >
                <Tablet size={17} />
              </IconToggle>
              <IconToggle
                active={previewSize === "mobile"}
                label="Mobile"
                onClick={() => setPreviewSize("mobile")}
              >
                <Smartphone size={17} />
              </IconToggle>
            </div>
          </div>

          <div className={`site-preview ${previewSize}`}>
            <PreviewMockup ruleView={ruleView} />
          </div>
        </section>
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

function IconToggle({
  active,
  children,
  label,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? "icon-toggle active" : "icon-toggle"}
      onClick={onClick}
      title={label}
      type="button"
    >
      {children}
      <span className="sr-only">{label}</span>
    </button>
  );
}

function PreviewMockup({ ruleView }: { ruleView: RuleView }) {
  return (
    <div className="mock-page">
      <div className="mock-nav">
        <strong>Academy</strong>
        <span>Курсы</span>
        <span>Отзывы</span>
        <button type="button">Записаться</button>
      </div>
      <section className="mock-hero">
        {ruleView === "thirds" && <div className="thirds-overlay" aria-hidden="true" />}
        {ruleView === "phi" && <div className="phi-overlay" aria-hidden="true" />}
        <div className="mock-copy">
          <span className="eyebrow">Дизайн без хаоса</span>
          <h3>Научитесь собирать визуально сильные сайты</h3>
          <p>
            Палитра сразу проверяется на кнопках, карточках, тексте и акцентах.
          </p>
          <div className="mock-actions">
            <button type="button">Начать</button>
            <button className="ghost" type="button">Смотреть план</button>
          </div>
        </div>
        <div className="mock-visual" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      </section>
      <div className="mock-grid">
        {["Композиция", "Контраст", "Адаптив"].map((item) => (
          <article key={item}>
            <i />
            <strong>{item}</strong>
            <span>Проверка на живом блоке</span>
          </article>
        ))}
      </div>
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
      <div className="phi-box large" />
      <div className="phi-box medium" />
      <div className="phi-box small" />
      <div className="phi-arc" />
      <div className="visual-copy">
        <strong>Золотое сечение</strong>
        <p>Главная зона шире вторичной примерно в пропорции 1.618.</p>
      </div>
    </div>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
