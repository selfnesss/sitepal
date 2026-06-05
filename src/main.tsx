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
  Loader2,
  Palette,
  PanelRightOpen,
  Smartphone,
  Sparkles,
  Upload,
  Wand2,
  X,
} from "lucide-react";
import goldenSpiralImage from "./assets/golden-spiral.svg";
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
type ColorRole = keyof SitePalette["colors"];
type AiStatus = "idle" | "loading" | "done" | "error";

type AiAnalysisResult = {
  summary: string;
  score: number;
  strengths: string[];
  issues: string[];
  actions: string[];
};

const colorRoleLabels: Record<ColorRole, string> = {
  bg: "Фон",
  surface: "Поверхность",
  text: "Текст",
  muted: "Описание",
  primary: "Основной",
  secondary: "Вторичный",
  accent: "Акцент",
};

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
  { id: "blindness", label: "Баннеры", icon: EyeOff },
];

const analysisViews = ruleViews.filter((view) => view.id === "phi" || view.id === "thirds");

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

function normalizeUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function screenshotUrlFor(url: string) {
  return `https://image.thum.io/get/width/1440/crop/900/noanimate/${url}`;
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Не удалось прочитать файл"));
    reader.readAsDataURL(file);
  });
}

async function requestAiAnalysis({
  imageDataUrl,
  overlay,
  screenshotUrl,
  targetUrl,
}: {
  imageDataUrl: string | null;
  overlay: RuleView;
  screenshotUrl: string | null;
  targetUrl: string | null;
}) {
  const response = await fetch("/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageDataUrl, overlay, screenshotUrl, targetUrl }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || "AI-анализ сейчас не ответил");
  }

  return data as AiAnalysisResult;
}

async function requestAiPalettes(prompt: string, mood: string) {
  const response = await fetch("/api/ai/palettes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, mood }),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || "AI-подбор сейчас не ответил");
  }

  return data.palettes as SitePalette[];
}

function App() {
  const [prompt, setPrompt] = React.useState("онлайн-школа дизайна для начинающих");
  const [mood, setMood] = React.useState("спокойно");
  const [palettes, setPalettes] = React.useState(starterPalettes);
  const [selected, setSelected] = React.useState(starterPalettes[0]);
  const [paletteStatus, setPaletteStatus] = React.useState<AiStatus>("idle");
  const [paletteError, setPaletteError] = React.useState("");
  const [ruleView, setRuleView] = React.useState<RuleView>("phi");
  const [copiedColor, setCopiedColor] = React.useState<string | null>(null);
  const [analysisOpen, setAnalysisOpen] = React.useState(false);
  const [analysisInput, setAnalysisInput] = React.useState("");
  const [analysisTargetUrl, setAnalysisTargetUrl] = React.useState<string | null>(null);
  const [analysisImage, setAnalysisImage] = React.useState<string | null>(null);
  const [analysisView, setAnalysisView] = React.useState<RuleView>("phi");
  const [aiStatus, setAiStatus] = React.useState<AiStatus>("idle");
  const [aiResult, setAiResult] = React.useState<AiAnalysisResult | null>(null);
  const [aiError, setAiError] = React.useState("");

  const generate = async () => {
    if (prompt.trim().length < 3) {
      return;
    }

    setPaletteStatus("loading");
    setPaletteError("");
    try {
      const next = await requestAiPalettes(prompt, mood);
      setPalettes(next);
      setSelected(next[0]);
      setCopiedColor(null);
      setPaletteStatus("done");
    } catch (error) {
      setPaletteStatus("error");
      setPaletteError(error instanceof Error ? error.message : "AI-подбор сейчас недоступен");
    }
  };

  const copyColor = async (color: string) => {
    try {
      await navigator.clipboard.writeText(color);
      setCopiedColor(color);
    } catch {
      setCopiedColor(null);
    }
  };

  const openAnalysisUrl = () => {
    const normalized = normalizeUrl(analysisInput);
    if (!normalized) {
      return;
    }

    setAnalysisTargetUrl(normalized);
    setAnalysisImage(null);
    setAiResult(null);
    setAiError("");
  };

  const loadAnalysisImage = async (file?: File) => {
    if (!file) {
      return;
    }

    const nextImage = await fileToDataUrl(file);
    setAnalysisImage(nextImage);
    setAnalysisTargetUrl(null);
    setAiResult(null);
    setAiError("");
  };

  const runAiAnalysis = async () => {
    if (!analysisImage && !analysisTargetUrl) {
      setAiStatus("error");
      setAiError("Сначала добавьте скриншот или ссылку на сайт.");
      return;
    }

    setAiStatus("loading");
    setAiError("");
    try {
      const result = await requestAiAnalysis({
        imageDataUrl: analysisImage,
        overlay: analysisView,
        screenshotUrl: analysisTargetUrl ? screenshotUrlFor(analysisTargetUrl) : null,
        targetUrl: analysisTargetUrl,
      });
      setAiResult(result);
      setAiStatus("done");
    } catch (error) {
      setAiStatus("error");
      setAiError(error instanceof Error ? error.message : "AI-анализ сейчас недоступен");
    }
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
          <button className="nav-action" onClick={() => setAnalysisOpen(true)} type="button">
            AI-анализ
          </button>
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
              placeholder="Например: сервис аналитики, кофейня, детский центр"
              rows={4}
            />
          </label>

          <div className="mood-grid" aria-label="Настроение">
            {moods.map((item) => (
              <button
                className={item === mood ? "chip active" : "chip"}
                key={item}
                onClick={() => setMood(item)}
                aria-pressed={item === mood}
                type="button"
              >
                {item}
              </button>
            ))}
          </div>

          <button
            className="generate"
            disabled={prompt.trim().length < 3 || paletteStatus === "loading"}
            onClick={generate}
            type="button"
          >
            {paletteStatus === "loading" ? <Loader2 className="spin" size={18} /> : <Wand2 size={18} />}
            <span>{paletteStatus === "loading" ? "Генерирую" : "Сгенерировать"}</span>
          </button>

          {paletteStatus === "error" && <p className="palette-error">{paletteError}</p>}

          <div className="palette-list">
            {palettes.map((palette) => (
              <button
                className={palette.id === selected.id ? "palette-card active" : "palette-card"}
                key={palette.id}
                onClick={() => setSelected(palette)}
                aria-pressed={palette.id === selected.id}
                type="button"
              >
                <span className="palette-meta">
                  <span>
                    <strong>{palette.name}</strong>
                    {palette.id === selected.id && (
                      <em>
                        <Check size={14} />
                        Выбрано
                      </em>
                    )}
                  </span>
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

          <div className="color-values" aria-label="Значения выбранной палитры">
            {Object.entries(selected.colors).map(([role, color]) => (
              <button
                className={copiedColor === color ? "color-value copied" : "color-value"}
                key={`${role}-${color}`}
                onClick={() => copyColor(color)}
                title={`Скопировать ${color}`}
                type="button"
              >
                <span style={{ background: color }} />
                <strong>{colorRoleLabels[role as ColorRole]}</strong>
                <code>{copiedColor === color ? "Скопировано" : color}</code>
              </button>
            ))}
          </div>
        </aside>

        <ExperienceSection onOpenAnalysis={() => setAnalysisOpen(true)} ruleView={ruleView} />
      </section>

      <section className="rules" id="rules">
        <div className="rules-heading">
          <div>
            <p>13 правил в действии</p>
            <h2>Визуальные проверки без режима статьи</h2>
          </div>
          <div className="segmented rules-switch" aria-label="Визуализации правил">
            {ruleViews.map((view) => (
              <button
                className={ruleView === view.id ? "icon-toggle active" : "icon-toggle"}
                key={view.id}
                onClick={() => setRuleView(view.id)}
                aria-pressed={ruleView === view.id}
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
          <RuleVisualization view={ruleView} onOpenAnalysis={() => setAnalysisOpen(true)} />
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

      {analysisOpen && (
        <AnalysisWindow
          aiError={aiError}
          aiResult={aiResult}
          aiStatus={aiStatus}
          image={analysisImage}
          input={analysisInput}
          onClose={() => setAnalysisOpen(false)}
          onImageChange={loadAnalysisImage}
          onInputChange={setAnalysisInput}
          onRunAi={runAiAnalysis}
          onUrlOpen={openAnalysisUrl}
          onViewChange={setAnalysisView}
          targetUrl={analysisTargetUrl}
          view={analysisView}
        />
      )}

      <a className="to-top" href="#workspace" aria-label="Наверх">
        <ArrowUp size={20} />
      </a>
    </main>
  );
}

function ExperienceSection({
  onOpenAnalysis,
  ruleView,
}: {
  onOpenAnalysis: () => void;
  ruleView: RuleView;
}) {
  return (
    <section className="experience" id="experience" aria-label="Живой пример сайта">
      <div className="experience-heading">
        <div>
          <p>Живой пример</p>
          <h2>Этот сайт меняется вместе с выбранной палитрой</h2>
        </div>
        <button className="compact-action" onClick={onOpenAnalysis} type="button">
          <PanelRightOpen size={17} />
          <span>Открыть анализ</span>
        </button>
      </div>

      <section className="example-hero">
        {ruleView === "thirds" && <ThirdsOverlay />}
        <div className="example-copy">
          <span className="eyebrow">Дизайн без хаоса</span>
          <h3>Подберите палитру и сразу почувствуйте сайт</h3>
          <p>
            Цвета проверяются на настоящем интерфейсе: фоне, навигации, кнопках,
            карточках, тексте и визуальных правилах ниже.
          </p>
          <div className="example-actions">
            <a href="#generator">Начать подбор</a>
            <button className="ghost-button" onClick={onOpenAnalysis} type="button">
              Проверить сайт
            </button>
          </div>
        </div>
        <div className="example-visual" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <div className="palette-samples" aria-label="Примеры интерфейса в выбранной палитре">
        <article className="sample-card sample-cta">
          <span>CTA</span>
          <strong>Основное действие</strong>
          <button type="button">Записаться</button>
        </article>
        <article className="sample-card sample-text">
          <span>Текст</span>
          <strong>Заголовок блока</strong>
          <p>Описание остается читаемым на фоне и показывает, насколько мягко работает muted-цвет.</p>
        </article>
        <article className="sample-card sample-product">
          <span>Карточка</span>
          <div>
            <i />
            <strong>Тариф Studio</strong>
            <p>Акцент, вторичный фон и текст собираются в один рабочий компонент.</p>
          </div>
        </article>
      </div>
    </section>
  );
}

function RuleVisualization({
  onOpenAnalysis,
  view,
}: {
  onOpenAnalysis: () => void;
  view: RuleView;
}) {
  if (view === "thirds") {
    return (
      <div className="visual-card thirds-demo">
        <ThirdsOverlay />
        <div className="visual-copy">
          <strong>Правило третей</strong>
          <p>Ключевые объекты попадают в точки пересечения, взгляд считывает экран быстрее.</p>
          <button onClick={onOpenAnalysis} type="button">
            Проверить свой сайт
          </button>
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
      <figure className="golden-image-frame">
        <img
          src={goldenSpiralImage}
          alt="Золотое сечение: прямоугольники и спираль Фибоначчи"
        />
      </figure>
      <div className="visual-copy">
        <strong>Золотое сечение</strong>
        <p>Схема вписана в прямоугольник Фибоначчи и не растягивается под чужой размер.</p>
        <button onClick={onOpenAnalysis} type="button">
          Открыть окно анализа
        </button>
      </div>
    </div>
  );
}

function ThirdsOverlay() {
  return (
    <div className="thirds-overlay" aria-hidden="true">
      <span className="thirds-point top-left" />
      <span className="thirds-point top-right" />
      <span className="thirds-point bottom-left" />
      <span className="thirds-point bottom-right" />
    </div>
  );
}

function AnalysisWindow({
  aiError,
  aiResult,
  aiStatus,
  image,
  input,
  onClose,
  onImageChange,
  onInputChange,
  onRunAi,
  onUrlOpen,
  onViewChange,
  targetUrl,
  view,
}: {
  aiError: string;
  aiResult: AiAnalysisResult | null;
  aiStatus: AiStatus;
  image: string | null;
  input: string;
  onClose: () => void;
  onImageChange: (file?: File) => void;
  onInputChange: (value: string) => void;
  onRunAi: () => void;
  onUrlOpen: () => void;
  onViewChange: (view: RuleView) => void;
  targetUrl: string | null;
  view: RuleView;
}) {
  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <section className="analysis-modal" aria-label="Окно анализа сайта" role="dialog">
      <div className="analysis-window">
        <header className="analysis-top">
          <div>
            <p>AI-анализ композиции</p>
            <h2>Проверьте сайт через сечение и разметку</h2>
          </div>
          <button className="icon-close" onClick={onClose} aria-label="Закрыть анализ" type="button">
            <X size={21} />
          </button>
        </header>

        <div className="analysis-layout">
          <aside className="analysis-sidebar">
            <label className="analysis-url">
              <span>URL</span>
              <input
                value={input}
                onChange={(event) => onInputChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    onUrlOpen();
                  }
                }}
                placeholder="site.ru"
              />
            </label>

            <div className="analysis-button-row">
              <button className="analysis-action" onClick={onUrlOpen} type="button">
                Открыть ссылку
              </button>
              <label className="analysis-upload">
                <Upload size={17} />
                Скриншот
                <input
                  accept="image/*"
                  onChange={(event) => onImageChange(event.target.files?.[0])}
                  type="file"
                />
              </label>
            </div>

            <div className="analysis-mode-list" aria-label="Разметка анализа">
              {analysisViews.map((item) => (
                <button
                  className={view === item.id ? "analysis-mode active" : "analysis-mode"}
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  aria-pressed={view === item.id}
                  type="button"
                >
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            <button
              className="ai-run"
              disabled={aiStatus === "loading"}
              onClick={onRunAi}
              type="button"
            >
              {aiStatus === "loading" ? <Loader2 className="spin" size={18} /> : <Sparkles size={18} />}
              <span>{aiStatus === "loading" ? "Анализирую" : "Получить рекомендации"}</span>
            </button>

            <AiResult error={aiError} result={aiResult} status={aiStatus} />
          </aside>

          <div className="analysis-canvas-shell">
            <div className="analysis-source">
              <span>{image ? "Скриншот" : targetUrl || "Нет источника"}</span>
            </div>
            <div className="analysis-canvas">
              {image ? (
                <img className="analysis-preview" src={image} alt="Скриншот сайта для анализа" />
              ) : targetUrl ? (
                <iframe
                  className="analysis-site-frame"
                  src={targetUrl}
                  title="Сайт для анализа"
                  loading="lazy"
                  sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation-by-user-activation"
                />
              ) : (
                <div className="analysis-empty">
                  <strong>Добавьте URL или скриншот</strong>
                  <span>Разметка появится поверх изображения, а AI даст рекомендации по композиции.</span>
                </div>
              )}
              <AnalysisOverlay view={view} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AiResult({
  error,
  result,
  status,
}: {
  error: string;
  result: AiAnalysisResult | null;
  status: AiStatus;
}) {
  if (status === "error") {
    return (
      <div className="ai-result error">
        <strong>Не получилось</strong>
        <span>{error}</span>
      </div>
    );
  }

  if (status === "loading") {
    return (
      <div className="ai-result muted">
        <strong>Смотрю композицию</strong>
        <span>Проверяю иерархию, попадание в точки внимания, CTA, контраст и перегруженные зоны.</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="ai-result muted">
        <strong>Рекомендации появятся здесь</strong>
        <span>Лучше загрузить скриншот: так AI видит реальный экран, а не только адрес сайта.</span>
      </div>
    );
  }

  return (
    <div className="ai-result">
      <div className="ai-score">
        <strong>{result.score}/100</strong>
        <span>{result.summary}</span>
      </div>
      <ResultList title="Сильные стороны" items={result.strengths} />
      <ResultList title="Проблемы" items={result.issues} />
      <ResultList title="Что поправить" items={result.actions} />
    </div>
  );
}

function ResultList({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="result-list">
      <strong>{title}</strong>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function AnalysisOverlay({ view }: { view: RuleView }) {
  if (view === "thirds") {
    return <ThirdsOverlay />;
  }

  if (view === "phi") {
    return (
      <div className="analysis-golden" aria-hidden="true">
        <img src={goldenSpiralImage} alt="" />
      </div>
    );
  }

  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
