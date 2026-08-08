/// <reference types="@cloudflare/workers-types" />

import { Agent, getAgentByName, routeAgentRequest } from "agents";
import { WorkflowEntrypoint, WorkflowStep, type WorkflowEvent } from "cloudflare:workers";
import { KNOWLEDGE_DOCS, KNOWLEDGE_VERSION, type KnowledgeDoc } from "./knowledge";

type Lang = "en" | "es";
type ChatRole = "user" | "assistant";

type AiBinding = {
  run(model: string, input: unknown, options?: unknown): Promise<unknown>;
};

type SearchBinding = {
  search(input: unknown): Promise<{
    search_query?: string;
    chunks?: Array<{
      id: string;
      score: number;
      text: string;
      item?: {
        key?: string;
        metadata?: Record<string, unknown>;
      };
    }>;
  }>;
};

interface Env extends Cloudflare.Env {
  AI: AiBinding;
  SITE_SEARCH?: SearchBinding;
  ANALYTICS_DB?: D1Database;
  REPORTS_BUCKET?: R2Bucket;
  LEAD_JOBS?: Queue<LeadJob>;
  MK_METRICS?: AnalyticsEngineDataset;
  BROWSER?: BrowserRun;
  API_RATE_LIMITER?: RateLimit;
  LEAD_ENRICHMENT_WORKFLOW?: Workflow<LeadJob>;
  DAILY_DIGEST_WORKFLOW?: Workflow<LeadJob>;
  AUDIT_WORKFLOW?: Workflow<LeadJob>;
  CreativeMkConcierge: DurableObjectNamespace;
  QuotaGate: DurableObjectNamespace;
  AI_MODEL?: string;
  AI_FALLBACK_MODEL?: string;
  ADMIN_TOKEN?: string;
  TRUST_CF_ACCESS?: string;
  EMAIL_FORWARD_TO?: string;
  FORM_FALLBACK_ENDPOINT?: string;
  PUBLIC_ORIGINS?: string;
  CONTACT_URL?: string;
  TURNSTILE_SECRET_KEY?: string;
  PUBLIC_TURNSTILE_SITE_KEY?: string;
  TURNSTILE_REQUIRED?: string;
}

type Message = {
  role: ChatRole;
  content: string;
  at: number;
};

type Profile = {
  goal?: string;
  business?: string;
  businessType?: string;
  channel?: string;
  offer?: string;
  audience?: string;
  budget?: string;
  budgetSlug?: string;
  urgency?: string;
  timelineSlug?: string;
  serviceSlug?: string;
  url?: string;
  language?: Lang;
  constraints?: string[];
};

type KnowledgeSource = {
  id: string;
  title: string;
  serviceSlug?: string;
  origin: "local" | "ai-search";
  snippet: string;
  score?: number;
};

type LeadScore = {
  score: number;
  signals: string[];
};

type Diagnostic = {
  primaryServiceSlug: string;
  primaryService: string;
  supportServiceSlugs: string[];
  supportServices: string[];
  confidence: number;
  blockers: string[];
  leadScore: LeadScore;
  nextQuestion: string;
  updatedAt: string;
};

type AuditResult = {
  url: string;
  title: string;
  description: string;
  h1: string;
  ctas: string[];
  clarityScore: number;
  conversionScore: number;
  nextAction: string;
  findings: string[];
  truncated: boolean;
  rendered?: {
    attempted: boolean;
    status?: number;
    title?: string;
    browserMs?: number;
    screenshotCaptured?: boolean;
  };
};

type Brief = {
  source: "mk-growth-concierge";
  createdAt: string;
  lang: Lang;
  recommendedService: string;
  serviceSlug: string;
  supportServices: string[];
  leadScore: number;
  budget: string;
  budgetSlug: string;
  timeline: string;
  timelineSlug: string;
  summary: string;
  notes: string;
  audit?: Pick<AuditResult, "url" | "title" | "h1" | "nextAction">;
};

type ConciergeState = {
  turns: number;
  searches: number;
  audits: number;
  briefs: number;
  events: number;
  captures: number;
  consented?: boolean;
  leadId?: string;
  messages: Message[];
  profile: Profile;
  diagnostic?: Diagnostic;
  brief?: Brief;
  lastAudit?: AuditResult;
};

type QuotaState = {
  date: string;
  aiCalls: number;
  browserRuns: number;
  routeBuckets?: Record<string, { resetAt: number; count: number }>;
};

type LeadJob = {
  type: "lead.created" | "brief.created" | "audit.completed" | "daily.rollup" | "report.generate" | "email.ingest";
  sessionHash?: string;
  leadId?: string;
  auditId?: string;
  briefId?: string;
  day?: string;
  payload?: Record<string, unknown>;
  createdAt: string;
};

type LeadCaptureResult = {
  leadId: string;
  status: string;
  nextStep: string;
  dashboardPriority: "hot" | "warm" | "standard";
  reportId?: string;
  reportUrl?: string;
  reports?: {
    brief?: ReportReceipt;
    audit?: ReportReceipt;
  };
};

type ReportReceipt = {
  reportId: string;
  type: "brief" | "audit";
  reportUrl: string;
  storage: "d1" | "r2";
};

type ServiceStatusItem = {
  enabled: boolean;
  mode: string;
  note: string;
};

const LIMITS = {
  dailyAiCalls: 120,
  maxTurns: 8,
  maxSearches: 5,
  maxAudits: 1,
  maxBriefs: 2,
  maxEvents: 80,
  maxCaptures: 3,
  maxAdminPageSize: 50,
  maxMessageChars: 800,
  maxAuditBytes: 150_000,
  auditTimeoutMs: 4_000,
  browserAuditsPerDay: 3
};

const ROUTE_LIMITS = {
  chat: { limit: 18, periodSeconds: 60 },
  events: { limit: 90, periodSeconds: 60 },
  audit: { limit: 4, periodSeconds: 300 },
  brief: { limit: 8, periodSeconds: 300 },
  leadCapture: { limit: 4, periodSeconds: 600 },
  consent: { limit: 8, periodSeconds: 300 },
  admin: { limit: 45, periodSeconds: 60 },
  default: { limit: 120, periodSeconds: 60 }
};

const RETENTION = {
  anonymousSessionDays: 90,
  anonymousEventDays: 180,
  completedTaskDays: 180
};

const DEFAULT_MODEL = "@cf/zai-org/glm-4.7-flash";
const FALLBACK_MODEL = "@cf/meta/llama-3.2-1b-instruct";
const CLOUDFLARE_ACCOUNT_ID = "2a432f7e8d56266c9dd713199ecf5b47";

const SERVICE_MAP = [
  {
    slug: "web-design",
    en: "Websites",
    es: "Sitios Web",
    signals: ["website", "web", "site", "pagina", "página", "sitio", "redesign", "redisen", "rediseño", "seo", "conversion", "conversión"]
  },
  {
    slug: "landing-pages",
    en: "Growth & Marketing",
    es: "Growth & Marketing",
    signals: ["landing", "lead", "campaign", "campana", "campaña", "launch", "lanzamiento", "offer", "oferta"]
  },
  {
    slug: "sales-funnels",
    en: "Growth & Marketing",
    es: "Growth & Marketing",
    signals: ["funnel", "embudo", "sales", "ventas", "crm", "nurture", "email", "whatsapp"]
  },
  {
    slug: "meta-ads",
    en: "Growth & Marketing",
    es: "Growth & Marketing",
    signals: ["ads", "meta", "facebook", "instagram", "pauta", "trafico", "tráfico", "traffic", "acquisition"]
  },
  {
    slug: "social-media",
    en: "Growth & Marketing",
    es: "Growth & Marketing",
    signals: ["social", "contenido", "content", "instagram", "reels", "tiktok", "community"]
  },
  {
    slug: "branding",
    en: "Branding",
    es: "Branding",
    signals: ["brand", "branding", "logo", "identity", "identidad", "manual", "visual", "marca"]
  },
  {
    slug: "app-development",
    en: "Development",
    es: "Desarrollo",
    signals: ["app", "software", "platform", "portal", "dashboard", "saas", "product", "producto"]
  },
  {
    slug: "ux-ui-design",
    en: "Digital Product UX/UI",
    es: "Producto Digital UX/UI",
    signals: ["ux", "ui", "prototype", "prototipo", "flow", "user experience", "experiencia"]
  },
  {
    slug: "ai-automation",
    en: "AI Automation",
    es: "Automatización IA",
    signals: ["ai", "ia", "automation", "automatizacion", "automatización", "chatbot", "agent", "agente", "workflow"]
  }
];

const SUPPORT_STACKS: Record<string, string[]> = {
  branding: ["landing-pages", "social-media"],
  "meta-ads": ["landing-pages", "sales-funnels"],
  "sales-funnels": ["landing-pages", "ai-automation"],
  "ai-automation": ["sales-funnels", "web-design"],
  "app-development": ["ux-ui-design", "ai-automation"],
  "social-media": ["branding", "meta-ads"],
  "landing-pages": ["sales-funnels", "meta-ads"],
  "ux-ui-design": ["app-development", "web-design"],
  "web-design": ["landing-pages", "ai-automation"]
};

const BUSINESS_TYPES = [
  { slug: "local-service", signals: ["clinic", "salon", "restaurant", "venue", "local", "medspa", "real estate", "inmobiliaria", "clinica", "restaurante"] },
  { slug: "professional-service", signals: ["consulting", "agency", "law", "accounting", "coach", "consultoria", "agencia", "servicio"] },
  { slug: "ecommerce", signals: ["ecommerce", "shop", "store", "product", "tienda", "producto", "catalog"] },
  { slug: "creator-brand", signals: ["creator", "influencer", "personal brand", "coach", "curso", "course"] },
  { slug: "software-product", signals: ["saas", "software", "app", "portal", "dashboard", "platform"] }
];

const BUDGETS = [
  { slug: "not-sure", en: "Not sure yet", es: "No estoy seguro", signals: ["not sure", "no se", "unsure", "later"] },
  { slug: "under-1000", en: "Under $1,000", es: "Menos de $1,000", signals: ["under 1000", "menos de 1000", "<1000", "$500"] },
  { slug: "1000-3000", en: "$1,000-$3,000", es: "$1,000-$3,000", signals: ["1000", "2000", "3000", "1k", "2k", "3k"] },
  { slug: "3000-7500", en: "$3,000-$7,500", es: "$3,000-$7,500", signals: ["5000", "7500", "5k", "7k"] },
  { slug: "7500-15000", en: "$7,500-$15,000", es: "$7,500-$15,000", signals: ["10000", "15000", "10k", "15k"] },
  { slug: "15000-plus", en: "$15,000+", es: "$15,000+", signals: ["20000", "25000", "enterprise", "15k+", "large"] }
];

const TIMELINES = [
  { slug: "asap", en: "ASAP", es: "Lo antes posible", signals: ["asap", "urgent", "urgente", "ya", "now", "rapido"] },
  { slug: "2-4-weeks", en: "2-4 weeks", es: "2-4 semanas", signals: ["2 weeks", "4 weeks", "semanas", "month"] },
  { slug: "1-2-months", en: "1-2 months", es: "1-2 meses", signals: ["1 month", "2 months", "mes", "meses"] },
  { slug: "this-quarter", en: "This quarter", es: "Este trimestre", signals: ["quarter", "q", "trimestre"] },
  { slug: "flexible", en: "Flexible", es: "Flexible", signals: ["flexible", "no rush", "sin prisa"] }
];

function initialConciergeState(): ConciergeState {
  return {
    turns: 0,
    searches: 0,
    audits: 0,
    briefs: 0,
    events: 0,
    captures: 0,
    messages: [],
    profile: {}
  };
}

function normalizeState(state?: Partial<ConciergeState> | null): ConciergeState {
  const base = initialConciergeState();
  if (!state) return base;

  return {
    ...base,
    ...state,
    turns: Number.isFinite(state.turns) ? Number(state.turns) : 0,
    searches: Number.isFinite(state.searches) ? Number(state.searches) : 0,
    audits: Number.isFinite(state.audits) ? Number(state.audits) : 0,
    briefs: Number.isFinite(state.briefs) ? Number(state.briefs) : 0,
    events: Number.isFinite(state.events) ? Number(state.events) : 0,
    captures: Number.isFinite(state.captures) ? Number(state.captures) : 0,
    consented: Boolean(state.consented),
    leadId: typeof state.leadId === "string" ? state.leadId : undefined,
    messages: Array.isArray(state.messages) ? state.messages.slice(-18) : [],
    profile: state.profile && typeof state.profile === "object" ? state.profile : {}
  };
}

function clean(input: unknown, max = LIMITS.maxMessageChars): string {
  return String(input ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}

function htmlEscape(input: unknown): string {
  return clean(input, 4000)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseJsonArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string" || !value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function wantsJson(request: Request): boolean {
  const url = new URL(request.url);
  const format = clean(url.searchParams.get("format"), 20);
  const accept = request.headers.get("Accept") || "";
  return format === "json" || /\bapplication\/json\b/i.test(accept);
}

function langFrom(input: unknown): Lang {
  return input === "es" ? "es" : "en";
}

function labelFor<T extends { en: string; es: string }>(item: T | undefined, lang: Lang): string {
  if (!item) return lang === "es" ? "No estoy seguro" : "Not sure yet";
  return lang === "es" ? item.es : item.en;
}

function findBySlug<T extends { slug: string }>(items: T[], slug?: string): T | undefined {
  return items.find((item) => item.slug === slug);
}

function detectSlug(items: Array<{ slug: string; signals: string[] }>, text: string): string | undefined {
  const value = text.toLowerCase();
  let best: { slug: string; score: number } | undefined;

  for (const item of items) {
    const score = item.signals.reduce((total, signal) => total + (value.includes(signal) ? 1 : 0), 0);
    if (score > 0 && (!best || score > best.score)) {
      best = { slug: item.slug, score };
    }
  }

  return best?.slug;
}

function detectBusinessType(text: string): string | undefined {
  return detectSlug(BUSINESS_TYPES, text);
}

function includesAny(text: string, words: string[]): boolean {
  const value = text.toLowerCase();
  return words.some((word) => value.includes(word));
}

function detectUrl(text: string): string | undefined {
  const match = text.match(/https?:\/\/[^\s)]+|(?:www\.)?[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[^\s)]*)?/i);
  if (!match) return undefined;
  const value = match[0].startsWith("http") ? match[0] : `https://${match[0]}`;
  try {
    return new URL(value).toString();
  } catch {
    return undefined;
  }
}

function updateProfile(current: Profile, text: string, context?: Record<string, unknown>, lang?: Lang): Profile {
  const next: Profile = { ...current };
  const serviceSlug = detectSlug(SERVICE_MAP, text);
  const budgetSlug = detectSlug(BUDGETS, text);
  const timelineSlug = detectSlug(TIMELINES, text);
  const businessType = detectBusinessType(text);
  const url = detectUrl(text);

  if (serviceSlug) next.serviceSlug = serviceSlug;
  if (budgetSlug) next.budgetSlug = budgetSlug;
  if (timelineSlug) next.timelineSlug = timelineSlug;
  if (businessType) next.businessType = businessType;
  if (url) next.url = url;
  if (lang) next.language = lang;

  const lower = text.toLowerCase();
  if (!next.goal || /goal|objetivo|quiero|need|necesito|grow|scale|vender|ventas/.test(lower)) {
    next.goal = text.slice(0, 220);
  }
  if (!next.business && includesAny(lower, ["business", "company", "brand", "negocio", "empresa", "marca"])) {
    next.business = text.slice(0, 160);
  }
  if (!next.offer && includesAny(lower, ["offer", "service", "producto", "servicio", "vendo", "sell", "package"])) {
    next.offer = text.slice(0, 180);
  }
  if (!next.audience && includesAny(lower, ["audience", "clients", "customers", "target", "publico", "clientes", "buyer"])) {
    next.audience = text.slice(0, 160);
  }
  if (!next.urgency && includesAny(lower, ["urgent", "urgente", "asap", "rapido", "soon", "launch", "lanzar"])) {
    next.urgency = text.slice(0, 120);
  }
  if (context?.page && typeof context.page === "string") {
    next.channel = context.page;
  }

  return next;
}

function serviceStack(profile: Profile): string[] {
  switch (profile.serviceSlug) {
    case "branding":
      return ["Brand positioning", "Visual identity", "Launch landing page"];
    case "meta-ads":
      return ["Offer path", "Traffic test", "Conversion tracking"];
    case "sales-funnels":
      return ["Offer map", "Follow-up system", "Automation handoff"];
    case "ai-automation":
      return ["Workflow audit", "AI assistant", "CRM or form automation"];
    case "app-development":
      return ["UX prototype", "Development", "Analytics loop"];
    case "social-media":
      return ["Content pillars", "Editorial rhythm", "Campaign support"];
    case "landing-pages":
      return ["Offer refinement", "Landing page", "Lead capture follow-up"];
    case "ux-ui-design":
      return ["UX diagnostic", "Prototype", "Design system"];
    case "web-design":
    default:
      return ["Messaging clarity", "Website conversion", "Traffic or automation layer"];
  }
}

function serviceName(slug: string | undefined, lang: Lang): string {
  return labelFor(findBySlug(SERVICE_MAP, slug || "web-design"), lang);
}

function supportSlugsFor(primarySlug: string): string[] {
  return SUPPORT_STACKS[primarySlug] || SUPPORT_STACKS["web-design"];
}

function profileCompleteness(profile: Profile): number {
  const fields: Array<keyof Profile> = ["goal", "businessType", "serviceSlug", "budgetSlug", "timelineSlug", "audience", "offer"];
  const complete = fields.filter((field) => Boolean(profile[field])).length;
  return Math.round((complete / fields.length) * 100);
}

function leadScoreFor(profile: Profile, state: ConciergeState): LeadScore {
  const signals: string[] = [];
  let score = 18;

  if (profile.goal) {
    score += 12;
    signals.push("goal");
  }
  if (profile.businessType || profile.business) {
    score += 10;
    signals.push("business");
  }
  if (profile.serviceSlug) {
    score += 14;
    signals.push("service-fit");
  }
  if (profile.offer || profile.audience) {
    score += 10;
    signals.push("offer-context");
  }
  if (profile.budgetSlug && profile.budgetSlug !== "not-sure") {
    score += 14;
    signals.push("budget");
  } else if (profile.budgetSlug === "not-sure") {
    score += 5;
  }
  if (profile.timelineSlug && profile.timelineSlug !== "flexible") {
    score += 12;
    signals.push("timeline");
  } else if (profile.timelineSlug === "flexible") {
    score += 5;
  }
  if (profile.url || state.lastAudit) {
    score += 10;
    signals.push("website-context");
  }
  if (state.turns >= 2) {
    score += 6;
    signals.push("engaged");
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    signals
  };
}

function nextQuestionFor(profile: Profile, lang: Lang): string {
  if (!profile.goal) {
    return lang === "es"
      ? "¿Cuál es el resultado principal que quieres lograr en los próximos 90 días?"
      : "What main result do you want to achieve in the next 90 days?";
  }
  if (!profile.businessType && !profile.business) {
    return lang === "es"
      ? "¿Qué tipo de negocio es y qué vendes principalmente?"
      : "What type of business is it, and what do you mainly sell?";
  }
  if (!profile.serviceSlug) {
    return lang === "es"
      ? "¿Hoy el cuello de botella está en marca, sitio web, growth, seguimiento, automatización o producto?"
      : "Is the bottleneck brand, website, growth, follow-up, automation, or product?";
  }
  if (!profile.budgetSlug) {
    return lang === "es"
      ? "¿Tienes un rango de presupuesto o prefieres que empecemos con una fase diagnóstica?"
      : "Do you have a budget range, or should we start with a diagnostic phase?";
  }
  if (!profile.timelineSlug) {
    return lang === "es"
      ? "¿Qué tan pronto necesitas lanzar o ver la primera versión funcionando?"
      : "How soon do you need to launch or see the first working version?";
  }
  if (!profile.url) {
    return lang === "es"
      ? "¿Quieres pegar tu URL para una mini-auditoría antes de armar el brief?"
      : "Want to paste your URL for a mini-audit before building the brief?";
  }
  return lang === "es"
    ? "¿Quieres que convierta esto en un brief listo para enviar?"
    : "Want me to turn this into a brief ready to send?";
}

function blockersFor(profile: Profile, lang: Lang): string[] {
  const blockers: string[] = [];
  if (!profile.goal) blockers.push(lang === "es" ? "objetivo poco claro" : "unclear goal");
  if (!profile.serviceSlug) blockers.push(lang === "es" ? "servicio sin definir" : "service not selected");
  if (!profile.budgetSlug) blockers.push(lang === "es" ? "presupuesto pendiente" : "budget missing");
  if (!profile.timelineSlug) blockers.push(lang === "es" ? "timeline pendiente" : "timeline missing");
  return blockers.slice(0, 4);
}

function buildDiagnostic(state: ConciergeState, lang: Lang): Diagnostic {
  const profile = state.profile || {};
  const primaryServiceSlug = profile.serviceSlug || "web-design";
  const supportServiceSlugs = supportSlugsFor(primaryServiceSlug);
  const leadScore = leadScoreFor(profile, state);
  const completeness = profileCompleteness(profile);
  const confidence = Math.max(35, Math.min(96, Math.round((leadScore.score * 0.65) + (completeness * 0.35))));

  return {
    primaryServiceSlug,
    primaryService: serviceName(primaryServiceSlug, lang),
    supportServiceSlugs,
    supportServices: supportServiceSlugs.map((slug) => serviceName(slug, lang)),
    confidence,
    blockers: blockersFor(profile, lang),
    leadScore,
    nextQuestion: nextQuestionFor(profile, lang),
    updatedAt: new Date().toISOString()
  };
}

function fallbackChat(lang: Lang, profile: Profile, reason?: string): string {
  const service = labelFor(findBySlug(SERVICE_MAP, profile.serviceSlug || "web-design"), lang);
  const stack = serviceStack(profile).join(" + ");
  const question = nextQuestionFor(profile, lang);

  if (lang === "es") {
    const opener = reason === "limit"
      ? "Llegamos al límite gratis de esta sesión, pero puedo dejarte una ruta clara."
      : "Puedo orientarte con el mapa base de CREATIVE MK.";
    return `${opener}\n\nMi recomendación inicial: ${service}. Lo armaría como ${stack}.\n\n${question}`;
  }

  const opener = reason === "limit"
    ? "We hit the free session limit, but I can still leave you with a clear route."
    : "I can guide you from CREATIVE MK's core service map.";
  return `${opener}\n\nInitial recommendation: ${service}. I would shape it as ${stack}.\n\n${question}`;
}

function suggestedActions(state: ConciergeState): string[] {
  const actions: string[] = [];
  if (state.audits < LIMITS.maxAudits) actions.unshift("audit-url");
  if (state.turns < LIMITS.maxTurns) actions.unshift("chat");
  if (state.briefs < LIMITS.maxBriefs) actions.push("brief");
  return actions;
}

function compactHistory(messages: Message[]): Array<{ role: ChatRole; content: string }> {
  return messages.slice(-8).map((message) => ({
    role: message.role,
    content: message.content.slice(0, 700)
  }));
}

function systemPrompt(lang: Lang, profile: Profile, diagnostic: Diagnostic, searchContext: string, audit?: AuditResult): string {
  const serviceList = SERVICE_MAP.map((item) => `${item.en} (${item.slug})`).join(", ");
  const language = lang === "es" ? "Spanish" : "English";
  const auditContext = audit
    ? `Latest audit: URL ${audit.url}; title "${audit.title}"; H1 "${audit.h1}"; next action "${audit.nextAction}".`
    : "No website audit yet.";

  return [
    "You are MK Growth Concierge for CREATIVE MK, a premium digital agency.",
    `Reply in ${language}. Keep answers concise, useful, and calm. Maximum 110 words.`,
    "Do not ask for or capture name, email, phone, payment data, or sensitive information.",
    "Guide the visitor toward the current contact form only when a brief is ready.",
    "Recommend one practical stack using these services:",
    serviceList,
    "Choose one primary service and up to two support layers. Do not list the full catalog.",
    "Use this structure: recommendation sentence, three short bullets max, one next question.",
    "Use the retrieved site context when relevant. If context is thin, say you are using the CREATIVE MK service map.",
    "Never promise guaranteed revenue, rankings, or ad results.",
    "Prefer the structured diagnostic over guessing.",
    `Current profile: ${JSON.stringify(profile).slice(0, 900)}.`,
    `Structured diagnostic: ${JSON.stringify(diagnostic).slice(0, 1100)}.`,
    `Knowledge corpus version: ${KNOWLEDGE_VERSION}.`,
    auditContext,
    searchContext ? `Retrieved site context:\n${searchContext}` : "Retrieved site context: none."
  ].join("\n");
}

function normalizeAiText(result: unknown): string {
  if (typeof result === "string") return result.trim();
  if (!result || typeof result !== "object") return "";

  const record = result as Record<string, unknown>;
  if (typeof record.response === "string") return record.response.trim();
  if (typeof record.result === "string") return record.result.trim();

  const choices = record.choices;
  if (Array.isArray(choices)) {
    const first = choices[0] as Record<string, unknown> | undefined;
    const message = first?.message as Record<string, unknown> | undefined;
    if (typeof message?.content === "string") return message.content.trim();
    if (typeof first?.text === "string") return first.text.trim();
  }

  return "";
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function corsHeaders(request: Request, env?: Env): Headers {
  const headers = new Headers();
  const origin = request.headers.get("Origin") || "";
  const allowed = (env?.PUBLIC_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  const localhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  const allowedOrigin = allowed.includes(origin) || localhost ? origin : "https://creativemk.net";

  headers.set("Access-Control-Allow-Origin", allowedOrigin);
  headers.set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, x-admin-token");
  headers.set("Access-Control-Max-Age", "86400");
  headers.set("Vary", "Origin");
  return headers;
}

function json(data: unknown, request: Request, env: Env, status = 200): Response {
  const headers = corsHeaders(request, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  return new Response(JSON.stringify(data), { status, headers });
}

function withCors(response: Response, request: Request, env: Env): Response {
  const headers = new Headers(response.headers);
  corsHeaders(request, env).forEach((value, key) => headers.set(key, value));
  headers.set("Cache-Control", headers.get("Cache-Control") || "no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function tooManyRequests(request: Request, env: Env, retryAfterSeconds: number, route: string): Response {
  const headers = corsHeaders(request, env);
  headers.set("Content-Type", "application/json; charset=utf-8");
  headers.set("Cache-Control", "no-store");
  headers.set("Retry-After", String(Math.max(1, retryAfterSeconds)));
  return new Response(
    JSON.stringify({
      error: "Rate limit reached",
      route,
      retryAfterSeconds,
      fallback: "Please wait a moment and try again."
    }),
    { status: 429, headers }
  );
}

function parseAction(request: Request): string {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return parts[3] || "";
}

function parseSessionId(request: Request): string {
  const parts = new URL(request.url).pathname.split("/").filter(Boolean);
  return parts[2] || "anonymous";
}

function invalidMethod(request: Request, env: Env): Response {
  return json({ error: "Method not allowed" }, request, env, 405);
}

function reportUrlForRequest(request: Request, reportId: string): string {
  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  if (parts.length >= 4) {
    parts[3] = "report";
    parts[4] = reportId;
    parts.length = 5;
  } else {
    parts.push("report", reportId);
  }
  url.pathname = `/${parts.join("/")}`;
  url.search = "";
  return url.toString();
}

function reportReceiptForRequest(
  request: Request,
  reportId: string,
  type: "brief" | "audit",
  artifactKey?: string | null
): ReportReceipt {
  return {
    reportId,
    type,
    reportUrl: reportUrlForRequest(request, reportId),
    storage: artifactKey ? "r2" : "d1"
  };
}

async function safeJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const body = await request.json();
    return body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

async function requestData(request: Request): Promise<Record<string, unknown>> {
  const contentType = request.headers.get("Content-Type") || "";
  if (/multipart\/form-data|application\/x-www-form-urlencoded/i.test(contentType)) {
    const form = await request.formData();
    const data: Record<string, unknown> = {};
    for (const [key, value] of form.entries()) {
      if (typeof value === "string") data[key] = value;
    }
    return data;
  }

  return safeJson(request);
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function clientAddress(request: Request): string {
  return clean(
    request.headers.get("CF-Connecting-IP") ||
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown-client",
    80
  );
}

async function rateLimitKey(request: Request, route: string): Promise<string> {
  const userAgent = clean(request.headers.get("User-Agent"), 120);
  const sessionId = parseSessionId(request);
  const sessionPart = sessionId && sessionId !== "anonymous" ? sessionId : "";
  return sha256(`${route}:${clientAddress(request)}:${sessionPart}:${userAgent.slice(0, 48)}`);
}

async function timingSafeEqual(left: string, right: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const a = encoder.encode(left);
  const b = encoder.encode(right);
  if (a.length !== b.length) return false;

  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }
  return diff === 0;
}

function boolValue(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  const normalized = clean(value, 40).toLowerCase();
  return ["true", "1", "yes", "on", "accepted", "consent"].includes(normalized);
}

function validEmail(value: unknown): string {
  const email = clean(value, 254).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email : "";
}

function redactPII(value: unknown): string {
  return clean(value, 3000)
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\+?\d[\d\s().-]{7,}\d/g, "[phone]")
    .slice(0, 2200);
}

function scoreBand(score: number): number {
  return Math.max(0, Math.min(100, Math.floor(score / 20) * 20));
}

function slugFromLabel(items: Array<{ slug: string; en: string; es: string }>, value: unknown): string | undefined {
  const text = clean(value, 120).toLowerCase();
  if (!text) return undefined;
  const found = items.find((item) => [item.slug, item.en, item.es].some((label) => label.toLowerCase() === text));
  return found?.slug;
}

function pageFromMetadata(metadata?: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const page = (metadata as Record<string, unknown>).page;
  const value = clean(page, 240);
  return value || null;
}

function pageFromBody(body?: Record<string, unknown>): string | null {
  const value = clean(body?.page_url || body?.page || body?.landing_page, 500);
  if (!value) return null;
  try {
    const url = new URL(value);
    return `${url.pathname}${url.search}`.slice(0, 240) || "/";
  } catch {
    return value.slice(0, 240);
  }
}

function referrerLabel(value: unknown): string {
  const referrer = clean(value, 240);
  if (!referrer) return "";
  if (["direct", "internal", "unknown"].includes(referrer)) return referrer;
  try {
    const url = new URL(referrer);
    return url.hostname.replace(/^www\./, "").slice(0, 120);
  } catch {
    return referrer.replace(/^www\./, "").slice(0, 120);
  }
}

function utmFromBody(body?: Record<string, unknown>): Record<string, string> {
  const source = clean(body?.page_url, 800);
  const params = new URLSearchParams();
  try {
    if (source) new URL(source).searchParams.forEach((value, key) => params.set(key, value));
  } catch {
    // Page URL is optional and may be a relative path in local development.
  }

  const utm: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
    const value = clean(body?.[key] || params.get(key), 120);
    if (value) utm[key] = value;
  });
  const referrer = referrerLabel(body?.referrer || body?.referrer_type);
  if (referrer) utm.referrer = referrer;
  const sourceLabel = clean(body?.source, 120);
  if (sourceLabel) utm.source = sourceLabel;
  const landingPage = pageFromBody(body);
  if (landingPage) utm.landing_page = landingPage;
  return utm;
}

function attributionFromMetadata(metadata?: unknown): Record<string, string> {
  if (!metadata || typeof metadata !== "object") return {};
  const record = metadata as Record<string, unknown>;
  const attribution: Record<string, string> = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
    const value = clean(record[key], 120);
    if (value) attribution[key] = value;
  });
  const referrer = referrerLabel(record.referrer || record.referrer_type);
  if (referrer) attribution.referrer = referrer;
  const source = clean(record.source, 120);
  if (source) attribution.source = source;
  const page = pageFromMetadata(record);
  if (page) attribution.landing_page = page;
  return attribution;
}

async function sessionHashFromRequest(request: Request): Promise<string> {
  return sha256(parseSessionId(request));
}

async function hostnameHashForProfile(profile: Profile): Promise<string | null> {
  if (!profile.url) return null;
  try {
    return sha256(new URL(profile.url).hostname.toLowerCase());
  } catch {
    return null;
  }
}

function metadataSafe(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") return {};
  const record = input as Record<string, unknown>;
  const safe: Record<string, unknown> = {};
  const allowed = [
    "mode",
    "page",
    "action",
    "source",
    "hasAudit",
    "fallback",
    "scoreBand",
    "leadId",
    "status",
    "priority",
    "serviceSlug",
    "budgetSlug",
    "timelineSlug",
    "reason",
    "referrer",
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term"
  ];

  for (const key of allowed) {
    const value = record[key];
    if (typeof value === "string") safe[key] = value.slice(0, 120);
    if (typeof value === "number" || typeof value === "boolean") safe[key] = value;
  }

  return safe;
}

async function verifyTurnstile(env: Env, token: unknown): Promise<{ ok: boolean; enforced: boolean }> {
  if (!env.TURNSTILE_SECRET_KEY) return { ok: true, enforced: false };
  const value = clean(token, 2048);

  if (!value) {
    return { ok: env.TURNSTILE_REQUIRED !== "true", enforced: env.TURNSTILE_REQUIRED === "true" };
  }

  const form = new FormData();
  form.set("secret", env.TURNSTILE_SECRET_KEY);
  form.set("response", value);
  form.set("idempotency_key", crypto.randomUUID());

  try {
    const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form
    });
    const result = (await response.json()) as { success?: boolean };
    return { ok: Boolean(result.success), enforced: true };
  } catch {
    return { ok: env.TURNSTILE_REQUIRED !== "true", enforced: env.TURNSTILE_REQUIRED === "true" };
  }
}

function conversationSummary(state: ConciergeState, lang: Lang): string {
  const recent = state.messages
    .filter((message) => message.role === "user")
    .slice(-4)
    .map((message) => redactPII(message.content))
    .filter(Boolean);

  if (!recent.length) return "";
  const prefix = lang === "es" ? "Ultimos insights:" : "Latest insights:";
  return `${prefix} ${recent.join(" | ")}`.slice(0, 1800);
}

async function upsertSessionSnapshot(
  env: Env,
  request: Request,
  state: ConciergeState,
  lang: Lang,
  metadata?: unknown
): Promise<{ sessionHash: string; hostnameHash: string | null }> {
  const sessionHash = await sessionHashFromRequest(request);
  const hostnameHash = await hostnameHashForProfile(state.profile || {});
  const now = new Date().toISOString();
  const page = pageFromMetadata(metadata) || "/";
  const summary = conversationSummary(state, lang);
  const diagnostic = state.diagnostic || buildDiagnostic(state, lang);
  const attribution = attributionFromMetadata(metadata);

  if (!env.ANALYTICS_DB) return { sessionHash, hostnameHash };

  await env.ANALYTICS_DB.prepare(
    `INSERT INTO lead_sessions
      (session_hash, first_seen_at, last_seen_at, language, landing_page, utm_json, status, consented, conversation_summary)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_hash) DO UPDATE SET
      last_seen_at = excluded.last_seen_at,
      language = excluded.language,
      landing_page = COALESCE(lead_sessions.landing_page, excluded.landing_page),
      utm_json = CASE
        WHEN lead_sessions.utm_json IS NULL OR lead_sessions.utm_json = '' OR lead_sessions.utm_json = '{}'
        THEN excluded.utm_json
        ELSE lead_sessions.utm_json
      END,
      status = CASE WHEN lead_sessions.status = 'captured' THEN lead_sessions.status ELSE excluded.status END,
      consented = MAX(lead_sessions.consented, excluded.consented),
      conversation_summary = COALESCE(NULLIF(excluded.conversation_summary, ''), lead_sessions.conversation_summary)`
  )
    .bind(
      sessionHash,
      now,
      now,
      lang,
      page,
      JSON.stringify(attribution),
      state.leadId ? "captured" : state.consented ? "consented" : "anonymous",
      state.consented || state.leadId ? 1 : 0,
      summary
    )
    .run();

  await env.ANALYTICS_DB.prepare(
    `INSERT INTO lead_profiles
      (session_hash, goal, business_type, offer, audience, budget_slug, timeline_slug, service_slug, urgency, url_hostname_hash, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_hash) DO UPDATE SET
      goal = COALESCE(excluded.goal, lead_profiles.goal),
      business_type = COALESCE(excluded.business_type, lead_profiles.business_type),
      offer = COALESCE(excluded.offer, lead_profiles.offer),
      audience = COALESCE(excluded.audience, lead_profiles.audience),
      budget_slug = COALESCE(excluded.budget_slug, lead_profiles.budget_slug),
      timeline_slug = COALESCE(excluded.timeline_slug, lead_profiles.timeline_slug),
      service_slug = COALESCE(excluded.service_slug, lead_profiles.service_slug),
      urgency = COALESCE(excluded.urgency, lead_profiles.urgency),
      url_hostname_hash = COALESCE(excluded.url_hostname_hash, lead_profiles.url_hostname_hash),
      updated_at = excluded.updated_at`
  )
    .bind(
      sessionHash,
      state.profile.goal || null,
      state.profile.businessType || state.profile.business || null,
      state.profile.offer || null,
      state.profile.audience || null,
      state.profile.budgetSlug || null,
      state.profile.timelineSlug || null,
      state.profile.serviceSlug || diagnostic.primaryServiceSlug || null,
      state.profile.urgency || null,
      hostnameHash,
      now
    )
    .run();

  await env.ANALYTICS_DB.prepare(
    `INSERT INTO lead_diagnostics
      (session_hash, lead_score, confidence, primary_service, support_services_json, blockers_json, next_best_action, score_signals_json, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(session_hash) DO UPDATE SET
      lead_score = excluded.lead_score,
      confidence = excluded.confidence,
      primary_service = excluded.primary_service,
      support_services_json = excluded.support_services_json,
      blockers_json = excluded.blockers_json,
      next_best_action = excluded.next_best_action,
      score_signals_json = excluded.score_signals_json,
      updated_at = excluded.updated_at`
  )
    .bind(
      sessionHash,
      diagnostic.leadScore.score,
      diagnostic.confidence,
      diagnostic.primaryServiceSlug,
      JSON.stringify(diagnostic.supportServiceSlugs),
      JSON.stringify(diagnostic.blockers),
      diagnostic.nextQuestion,
      JSON.stringify(diagnostic.leadScore.signals),
      now
    )
    .run();

  return { sessionHash, hostnameHash };
}

function writeMetric(env: Env, eventType: string, state: ConciergeState, lang: Lang, metadata?: unknown): void {
  if (!env.MK_METRICS) return;

  const diagnostic = state.diagnostic || buildDiagnostic(state, lang);
  const meta = metadataSafe(metadata);
  const page = clean(meta.page, 120) || "unknown";
  const priority = clean(meta.priority, 40) || priorityForScore(diagnostic.leadScore.score);
  env.MK_METRICS.writeDataPoint({
    indexes: [eventType.slice(0, 80), diagnostic.primaryServiceSlug, lang],
    doubles: [
      diagnostic.leadScore.score,
      scoreBand(diagnostic.leadScore.score),
      state.turns,
      state.audits,
      state.briefs,
      state.captures
    ],
    blobs: [todayKey(), page, priority]
  });
}

async function logAnalyticsEvent(
  env: Env,
  request: Request,
  state: ConciergeState,
  eventType: string,
  lang: Lang,
  metadata?: unknown
): Promise<{ accepted: boolean; reason?: string }> {
  const safeMetadata = metadataSafe(metadata);
  const diagnostic = state.diagnostic || buildDiagnostic(state, lang);
  const serviceSlug = diagnostic.primaryServiceSlug || state.profile.serviceSlug || null;
  const leadScore = diagnostic.leadScore.score;
  const now = new Date().toISOString();

  writeMetric(env, eventType, state, lang, safeMetadata);

  if (!env.ANALYTICS_DB) return { accepted: false, reason: "analytics-disabled" };

  try {
    const { sessionHash, hostnameHash } = await upsertSessionSnapshot(env, request, state, lang, safeMetadata);
    await env.ANALYTICS_DB.prepare(
      `INSERT INTO concierge_events
        (id, session_hash, event_type, language, service_slug, lead_score, hostname_hash, metadata_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        crypto.randomUUID(),
        sessionHash,
        eventType.slice(0, 80),
        lang,
        serviceSlug,
        leadScore,
        hostnameHash,
        JSON.stringify(safeMetadata),
        now
      )
      .run();

    await env.ANALYTICS_DB.prepare(
      `INSERT INTO lead_events
        (id, event_type, session_hash, lead_id, service_slug, score_band, page, metadata_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        crypto.randomUUID(),
        eventType.slice(0, 80),
        sessionHash,
        state.leadId || null,
        serviceSlug,
        scoreBand(leadScore),
        pageFromMetadata(safeMetadata),
        JSON.stringify(safeMetadata),
        now
      )
      .run();
    return { accepted: true };
  } catch {
    return { accepted: false, reason: "analytics-error" };
  }
}

function scoreKnowledgeDoc(doc: KnowledgeDoc, query: string, profile: Profile): number {
  const value = `${query} ${profile.goal || ""} ${profile.offer || ""} ${profile.business || ""}`.toLowerCase();
  let score = 0;

  if (profile.serviceSlug && doc.serviceSlug === profile.serviceSlug) score += 6;
  if (doc.serviceSlug === "strategy") score += 1;
  for (const keyword of doc.keywords) {
    if (value.includes(keyword.toLowerCase())) score += 2;
  }
  for (const token of value.split(/\W+/).filter((item) => item.length > 4)) {
    if (doc.content.toLowerCase().includes(token)) score += 1;
  }

  return score;
}

function localKnowledgeSearch(query: string, profile: Profile, limit = 4): KnowledgeSource[] {
  return KNOWLEDGE_DOCS.map((doc) => ({
    doc,
    score: scoreKnowledgeDoc(doc, query, profile)
  }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ doc, score }) => ({
      id: doc.id,
      title: doc.title,
      serviceSlug: doc.serviceSlug,
      origin: "local" as const,
      score,
      snippet: doc.content.replace(/\s+/g, " ").slice(0, 520)
    }));
}

function sourcesToContext(sources: KnowledgeSource[]): string {
  return sources
    .slice(0, 6)
    .map((source, index) => `[${index + 1}] (${source.origin}:${source.id}) ${source.title}: ${source.snippet}`)
    .join("\n");
}

function serviceStatus(env: Env): Record<string, ServiceStatusItem> {
  return {
    d1: {
      enabled: Boolean(env.ANALYTICS_DB),
      mode: env.ANALYTICS_DB ? "primary" : "disabled",
      note: env.ANALYTICS_DB ? "CRM and analytics source of truth" : "D1 binding missing"
    },
    durableObjects: {
      enabled: Boolean(env.CreativeMkConcierge && env.QuotaGate),
      mode: "primary",
      note: "Agent sessions and free-tier quota gates"
    },
    workersAi: {
      enabled: Boolean(env.AI),
      mode: env.AI ? "primary-with-fallback" : "deterministic-fallback",
      note: env.AI ? "Worker AI model plus smaller fallback model" : "Local service-map replies only"
    },
    aiSearch: {
      enabled: Boolean(env.SITE_SEARCH),
      mode: env.SITE_SEARCH ? "rag" : "local-corpus",
      note: env.SITE_SEARCH ? "AI Search binding active" : "Waiting for AI Search beta token/binding"
    },
    queue: {
      enabled: Boolean(env.LEAD_JOBS),
      mode: env.LEAD_JOBS ? "async" : "inline",
      note: env.LEAD_JOBS ? "Lead jobs are queued" : "Worker handles jobs inline"
    },
    workflows: {
      enabled: Boolean(env.LEAD_ENRICHMENT_WORKFLOW && env.DAILY_DIGEST_WORKFLOW && env.AUDIT_WORKFLOW),
      mode: env.LEAD_ENRICHMENT_WORKFLOW ? "durable" : "disabled",
      note: env.LEAD_ENRICHMENT_WORKFLOW ? "Lead, digest and audit workflows deployed" : "Workflow bindings missing"
    },
    r2: {
      enabled: Boolean(env.REPORTS_BUCKET),
      mode: env.REPORTS_BUCKET ? "artifacts" : "d1-only",
      note: env.REPORTS_BUCKET ? "Reports and exports can be stored in R2" : "R2 disabled until bucket permission is available"
    },
    analyticsEngine: {
      enabled: Boolean(env.MK_METRICS),
      mode: env.MK_METRICS ? "datapoints" : "d1-rollups",
      note: env.MK_METRICS ? "Aggregated datapoints active" : "Using D1 rollups until Analytics Engine is enabled"
    },
    browserRun: {
      enabled: Boolean(env.BROWSER),
      mode: env.BROWSER ? "rendered-audits" : "html-audit",
      note: env.BROWSER ? "Hot leads can receive rendered page checks" : "Using free HTML audits until Browser Run binding is enabled"
    },
    turnstile: {
      enabled: Boolean(env.TURNSTILE_SECRET_KEY),
      mode: env.TURNSTILE_SECRET_KEY ? (env.TURNSTILE_REQUIRED === "true" ? "required" : "opportunistic") : "session-limits",
      note: env.TURNSTILE_SECRET_KEY && env.PUBLIC_TURNSTILE_SITE_KEY
        ? "Turnstile verification available for widget and contact form"
        : "Protected by quotas until Turnstile secret and public site key are set"
    },
    rateLimiting: {
      enabled: Boolean(env.API_RATE_LIMITER || env.QuotaGate),
      mode: env.API_RATE_LIMITER ? "native-binding-plus-do" : "durable-object-fallback",
      note: env.API_RATE_LIMITER ? "Cloudflare Rate Limiting binding is active" : "Route/IP/session guard is enforced through Durable Object fallback"
    },
    emailRouting: {
      enabled: Boolean(env.EMAIL_FORWARD_TO),
      mode: env.EMAIL_FORWARD_TO ? "ingest-and-forward" : "ingest-ready",
      note: env.EMAIL_FORWARD_TO ? "Inbound emails can be linked and forwarded" : "Email handler deployed; add Email Routing route and optional EMAIL_FORWARD_TO"
    },
    adminAuth: {
      enabled: Boolean(env.ADMIN_TOKEN || env.TRUST_CF_ACCESS === "true"),
      mode: env.TRUST_CF_ACCESS === "true" ? "cloudflare-access" : env.ADMIN_TOKEN ? "admin-token" : "locked",
      note: env.ADMIN_TOKEN ? "Admin API accepts bearer token" : "Admin API locked until ADMIN_TOKEN or Access is configured"
    }
  };
}

function budgetPercent(used: number, limit: number): number {
  if (!limit) return 0;
  return Math.max(0, Math.min(999, Math.round((used / limit) * 1000) / 10));
}

function budgetLevel(percent: number, projectedPercent: number, enabled = true): "ok" | "watch" | "danger" | "standby" {
  if (!enabled) return "standby";
  const signal = Math.max(percent, projectedPercent);
  if (signal >= 90) return "danger";
  if (signal >= 70) return "watch";
  return "ok";
}

function budgetItem(input: {
  key: string;
  label: string;
  used: number;
  limit: number;
  unit: string;
  source: string;
  detail: string;
  enabled?: boolean;
  hoursElapsed: number;
}): Record<string, unknown> {
  const projected = input.enabled === false ? 0 : Math.round((input.used / input.hoursElapsed) * 24);
  const percent = budgetPercent(input.used, input.limit);
  const projectedPercent = budgetPercent(projected, input.limit);
  return {
    key: input.key,
    label: input.label,
    used: input.used,
    limit: input.limit,
    unit: input.unit,
    source: input.source,
    detail: input.detail,
    percent,
    projected,
    projectedPercent,
    level: budgetLevel(percent, projectedPercent, input.enabled !== false),
    enabled: input.enabled !== false
  };
}

function buildFreeTierBudgetSentinel(
  usage: Record<string, unknown>,
  services: Record<string, ServiceStatusItem>
): Record<string, unknown> {
  const now = new Date();
  const hoursElapsed = Math.max(1, now.getUTCHours() + now.getUTCMinutes() / 60);
  const totalEvents = rowNumber(usage, "total_events");
  const sessions = rowNumber(usage, "sessions");
  const chats = rowNumber(usage, "chat_events");
  const audits = rowNumber(usage, "audit_events");
  const briefs = rowNumber(usage, "brief_events");
  const leads = rowNumber(usage, "lead_capture_events");
  const pageViews = rowNumber(usage, "page_views");
  const opens = rowNumber(usage, "open_events");
  const aiEstimate = chats + audits + briefs;
  const sessionBase = Math.max(1, sessions);

  const budgets = [
    budgetItem({
      key: "tracked-worker-interactions",
      label: "Tracked Worker interactions",
      used: totalEvents,
      limit: 100_000,
      unit: "D1 events/day",
      source: "lead_events",
      detail: "App-level proxy for public Worker traffic; admin/health requests are not counted here.",
      hoursElapsed
    }),
    budgetItem({
      key: "workers-ai",
      label: "Workers AI guard",
      used: aiEstimate,
      limit: LIMITS.dailyAiCalls,
      unit: "AI-intent events/day",
      source: "chat + audit + brief events",
      detail: "Conservative app cap before deterministic fallback protects free-tier AI usage.",
      hoursElapsed
    }),
    budgetItem({
      key: "html-audits",
      label: "HTML audit guard",
      used: audits,
      limit: sessionBase * LIMITS.maxAudits,
      unit: "audits/session",
      source: "audit-url events",
      detail: "Each session gets one lightweight audit before fallback messaging.",
      hoursElapsed
    }),
    budgetItem({
      key: "lead-capture",
      label: "Lead capture guard",
      used: leads,
      limit: sessionBase * LIMITS.maxCaptures,
      unit: "captures/session",
      source: "lead-capture events",
      detail: "Protects the CRM endpoint from repeated submissions without blocking real leads.",
      hoursElapsed
    }),
    budgetItem({
      key: "ai-search",
      label: "AI Search standby",
      used: services.aiSearch?.enabled ? chats : 0,
      limit: sessionBase * LIMITS.maxSearches,
      unit: "searches/session",
      source: services.aiSearch?.enabled ? "chat events proxy" : "binding inactive",
      detail: "Session search cap is ready; usage becomes meaningful after SITE_SEARCH is active.",
      enabled: Boolean(services.aiSearch?.enabled),
      hoursElapsed
    }),
    budgetItem({
      key: "browser-run",
      label: "Browser Run standby",
      used: 0,
      limit: LIMITS.browserAuditsPerDay,
      unit: "rendered audits/day",
      source: services.browserRun?.enabled ? "rendered audit counter" : "binding inactive",
      detail: "Rendered audits remain disabled until the Browser Run binding and free quota are confirmed.",
      enabled: Boolean(services.browserRun?.enabled),
      hoursElapsed
    })
  ];

  const levelRank = { danger: 0, watch: 1, ok: 2, standby: 3 };
  const activeBudgets = budgets.filter((item) => item.enabled);
  const danger = activeBudgets.filter((item) => item.level === "danger");
  const watch = activeBudgets.filter((item) => item.level === "watch");
  const recommendations: Array<{ priority: string; title: string; detail: string }> = [];

  if (danger.length) {
    recommendations.push({
      priority: "high",
      title: "Free-tier cap pressure",
      detail: `${danger[0].label} is projected near or above today's app guardrail. Keep fallback paths active.`
    });
  }
  if (watch.length) {
    recommendations.push({
      priority: "medium",
      title: "Watch today's usage velocity",
      detail: `${watch[0].label} is trending toward its guardrail; review traffic quality before raising caps.`
    });
  }
  if (pageViews > 0 && opens === 0) {
    recommendations.push({
      priority: "medium",
      title: "Widget visibility signal",
      detail: `${pageViews} tracked page view${pageViews === 1 ? "" : "s"} today but no chat opens; review entry placement or CTA copy.`
    });
  }
  if (aiEstimate === 0 && totalEvents > 0) {
    recommendations.push({
      priority: "low",
      title: "No AI spend today",
      detail: "Traffic is being tracked without AI-heavy interactions, so the free AI guardrail is calm."
    });
  }
  if (!recommendations.length) {
    recommendations.push({
      priority: "low",
      title: "Usage inside guardrails",
      detail: "Tracked app usage is comfortably within the configured Cloudflare Free safety caps."
    });
  }

  return {
    generatedAt: now.toISOString(),
    window: `${todayKey()} UTC`,
    source: "Cloudflare D1 lead_events plus Worker app guardrails",
    summary: {
      totalEvents,
      sessions,
      chats,
      audits,
      briefs,
      leads,
      pageViews,
      opens,
      aiEstimate,
      danger: danger.length,
      watch: watch.length
    },
    budgets: budgets.sort((a, b) => levelRank[a.level as keyof typeof levelRank] - levelRank[b.level as keyof typeof levelRank]),
    recommendations: recommendations.slice(0, 4)
  };
}

function buildPrivacyDataQualitySentinel(audit: Record<string, unknown>): Record<string, unknown> {
  const eventPiiSignals = rowNumber(audit, "event_pii_signals");
  const anonymousSummarySignals = rowNumber(audit, "anonymous_summary_email_signals");
  const anonymousBriefSignals = rowNumber(audit, "anonymous_brief_pii_signals");
  const leadsWithoutConsent = rowNumber(audit, "leads_without_consent_event");
  const anonymousSessionsDueCleanup = rowNumber(audit, "anonymous_sessions_due_cleanup");
  const anonymousEventsDueCleanup = rowNumber(audit, "anonymous_events_due_cleanup");
  const incompleteProfiles = rowNumber(audit, "incomplete_profiles");
  const missingGoal = rowNumber(audit, "missing_goal");
  const missingBudget = rowNumber(audit, "missing_budget");
  const missingTimeline = rowNumber(audit, "missing_timeline");
  const missingService = rowNumber(audit, "missing_service");
  const orphanProfiles = rowNumber(audit, "orphan_profiles");
  const orphanDiagnostics = rowNumber(audit, "orphan_diagnostics");
  const totalProfiles = rowNumber(audit, "total_profiles");
  const totalLeads = rowNumber(audit, "total_leads");
  const totalAnonymousSessions = rowNumber(audit, "anonymous_sessions");
  const possiblePiiSignals = eventPiiSignals + anonymousSummarySignals + anonymousBriefSignals;
  const cleanupDue = anonymousSessionsDueCleanup + anonymousEventsDueCleanup + orphanProfiles + orphanDiagnostics;

  const risks: Array<{ priority: "high" | "medium" | "low"; title: string; detail: string }> = [];
  if (possiblePiiSignals > 0) {
    risks.push({
      priority: "high",
      title: "Possible PII outside lead records",
      detail: `${possiblePiiSignals} aggregated signal${possiblePiiSignals === 1 ? "" : "s"} suggest email-like data may exist in anonymous/event surfaces. Review redaction paths before scaling traffic.`
    });
  }
  if (leadsWithoutConsent > 0) {
    risks.push({
      priority: "high",
      title: "Lead consent proof gap",
      detail: `${leadsWithoutConsent} captured lead${leadsWithoutConsent === 1 ? "" : "s"} do not have a linked consent event.`
    });
  }
  if (cleanupDue > 0) {
    risks.push({
      priority: "medium",
      title: "Retention cleanup due",
      detail: `${cleanupDue} anonymous/orphaned record${cleanupDue === 1 ? "" : "s"} are eligible for cleanup by the scheduled Worker job.`
    });
  }
  if (incompleteProfiles > 0) {
    risks.push({
      priority: totalProfiles && incompleteProfiles / totalProfiles > 0.5 ? "medium" : "low",
      title: "Lead profile quality gap",
      detail: `${incompleteProfiles} profile${incompleteProfiles === 1 ? "" : "s"} are missing at least one commercial field used by scoring and handoff.`
    });
  }
  if (!risks.length) {
    risks.push({
      priority: "low",
      title: "Privacy posture is clean",
      detail: "No aggregated PII, consent or retention risk signals were detected in the current D1 snapshot."
    });
  }

  const actions: Array<{ priority: "high" | "medium" | "low"; title: string; detail: string }> = [];
  if (possiblePiiSignals > 0) {
    actions.push({
      priority: "high",
      title: "Run a redaction review",
      detail: "Audit event metadata and anonymous summaries; keep raw contact details only in the leads table after consent."
    });
  }
  if (leadsWithoutConsent > 0) {
    actions.push({
      priority: "high",
      title: "Repair consent ledger",
      detail: "Confirm each captured lead has a consent_events record with scope and copy version."
    });
  }
  if (missingBudget > 0 || missingTimeline > 0 || missingService > 0 || missingGoal > 0) {
    actions.push({
      priority: "medium",
      title: "Ask sharper qualifying questions",
      detail: `Missing fields: ${missingGoal} goal / ${missingBudget} budget / ${missingTimeline} timeline / ${missingService} service.`
    });
  }
  if (cleanupDue > 0) {
    actions.push({
      priority: "medium",
      title: "Confirm scheduled cleanup",
      detail: "The cron job should run daily; check Data Retention after the next 06:15 UTC schedule."
    });
  }
  if (!actions.length) {
    actions.push({
      priority: "low",
      title: "Keep current policy",
      detail: "Continue storing redacted insight in analytics tables and PII only in consented lead records."
    });
  }

  const privacyScore = Math.max(0, 100 - (possiblePiiSignals * 18) - (leadsWithoutConsent * 22) - Math.min(20, cleanupDue * 2));
  const qualityPenalty = totalProfiles ? Math.round((incompleteProfiles / totalProfiles) * 45) : 0;
  const dataQualityScore = Math.max(0, 100 - qualityPenalty - Math.min(20, orphanProfiles + orphanDiagnostics));
  const priorityRank = { high: 0, medium: 1, low: 2 };

  return {
    generatedAt: new Date().toISOString(),
    policy: {
      piiAllowedOnlyIn: "leads table after consent",
      analyticsMode: "aggregated and redacted",
      anonymousSessionRetentionDays: RETENTION.anonymousSessionDays,
      anonymousEventRetentionDays: RETENTION.anonymousEventDays
    },
    scores: {
      privacy: privacyScore,
      dataQuality: dataQualityScore,
      posture:
        privacyScore >= 90 && dataQualityScore >= 80
          ? "Clean and operator-ready"
          : privacyScore >= 75
            ? "Usable with review items"
            : "Needs privacy review before scaling"
    },
    summary: {
      possiblePiiSignals,
      eventPiiSignals,
      anonymousSummarySignals,
      anonymousBriefSignals,
      leadsWithoutConsent,
      cleanupDue,
      anonymousSessionsDueCleanup,
      anonymousEventsDueCleanup,
      orphanProfiles,
      orphanDiagnostics,
      incompleteProfiles,
      totalProfiles,
      totalLeads,
      totalAnonymousSessions
    },
    qualityGaps: [
      { label: "Goal", missing: missingGoal, total: totalProfiles },
      { label: "Budget", missing: missingBudget, total: totalProfiles },
      { label: "Timeline", missing: missingTimeline, total: totalProfiles },
      { label: "Service", missing: missingService, total: totalProfiles }
    ],
    risks: risks.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]).slice(0, 5),
    actions: actions.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]).slice(0, 5)
  };
}

function buildActivationRunbook(
  services: Record<string, ServiceStatusItem>,
  items: Array<Record<string, unknown>>
): Record<string, unknown> {
  const guides: Record<
    string,
    {
      dashboardUrl: string;
      why: string;
      steps: string[];
      commands: string[];
      verify: string[];
      owner: string;
      freeGuardrail: string;
    }
  > = {
    r2: {
      dashboardUrl: `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/r2/overview`,
      why: "Move generated briefs, audit reports and exports out of hot D1 tables while staying in Cloudflare storage.",
      steps: [
        "Create bucket creative-mk-lead-artifacts in R2.",
        "Uncomment REPORTS_BUCKET in cloudflare/agent/wrangler.jsonc.",
        "Deploy the Worker and generate one brief/audit receipt to confirm artifact routing."
      ],
      commands: [
        "npx wrangler r2 bucket create creative-mk-lead-artifacts",
        "npx wrangler deploy --config cloudflare/agent/wrangler.jsonc"
      ],
      verify: [
        "GET /admin/api/metrics should show r2.enabled = true.",
        "A new lead capture should return report receipts with storage r2 when artifacts are generated."
      ],
      owner: "Cloudflare storage",
      freeGuardrail: "Keep reports small JSON/CSV and clean old artifacts monthly."
    },
    analyticsEngine: {
      dashboardUrl: `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/workers/analytics-engine`,
      why: "Send high-cardinality funnel datapoints to Analytics Engine while keeping D1 as the CRM source of truth.",
      steps: [
        "Enable Workers Analytics Engine in the account.",
        "Uncomment MK_METRICS analytics_engine_datasets binding.",
        "Deploy and confirm aggregate datapoints do not include PII."
      ],
      commands: ["npx wrangler deploy --config cloudflare/agent/wrangler.jsonc"],
      verify: [
        "GET /admin/api/metrics should show analyticsEngine.enabled = true.",
        "Operations Center should keep D1 as canonical CRM data."
      ],
      owner: "Cloudflare analytics",
      freeGuardrail: "Emit only aggregate datapoints; never email, phone, names or raw transcripts."
    },
    aiSearch: {
      dashboardUrl: `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/ai/ai-search/tokens`,
      why: "Ground concierge answers in CREATIVE MK site/corpus content without external RAG services.",
      steps: [
        "Create or confirm an AI Search token with the required beta permissions.",
        "Create creative-mk-site-search as a web crawler for creativemk.net.",
        "Uncomment SITE_SEARCH binding and deploy."
      ],
      commands: [
        "npx wrangler ai-search create creative-mk-site-search --type web-crawler --source creativemk.net",
        "npx wrangler deploy --config cloudflare/agent/wrangler.jsonc"
      ],
      verify: [
        "GET /admin/api/metrics should show aiSearch.enabled = true.",
        "Chat responses should include AI Search sources when relevant."
      ],
      owner: "AI knowledge",
      freeGuardrail: "Keep max 5 searches per session; local corpus remains fallback."
    },
    turnstile: {
      dashboardUrl: `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/turnstile`,
      why: "Protect lead capture, audit and brief actions before traffic scales.",
      steps: [
        "Create a Turnstile widget for creativemk.net.",
        "Set TURNSTILE_SECRET_KEY as a Worker secret and PUBLIC_TURNSTILE_SITE_KEY as a public var.",
        "Test in opportunistic mode before switching TURNSTILE_REQUIRED to true."
      ],
      commands: [
        "npx wrangler secret put TURNSTILE_SECRET_KEY --config cloudflare/agent/wrangler.jsonc",
        "npx wrangler deploy --config cloudflare/agent/wrangler.jsonc"
      ],
      verify: [
        "GET /admin/api/metrics should show turnstile.enabled = true.",
        "Lead capture without a valid token should fail only after TURNSTILE_REQUIRED is true."
      ],
      owner: "Cloudflare security",
      freeGuardrail: "Use Turnstile only on high-intent actions; keep session limits as fallback."
    },
    browserRun: {
      dashboardUrl: `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/workers/browser-rendering`,
      why: "Add rendered-page checks for hot leads while preserving the free HTML audit for everyone.",
      steps: [
        "Confirm Browser Rendering/Browser Run free quota is available in the account.",
        "Uncomment the BROWSER binding.",
        "Deploy and keep rendered audits restricted to high-intent sessions."
      ],
      commands: ["npx wrangler deploy --config cloudflare/agent/wrangler.jsonc"],
      verify: [
        "GET /admin/api/metrics should show browserRun.enabled = true.",
        "A high-score audit should include rendered.attempted = true when quota allows."
      ],
      owner: "Cloudflare browser rendering",
      freeGuardrail: `Cap rendered audits at ${LIMITS.browserAuditsPerDay}/day and fallback to HTML audit.`
    },
    emailRouting: {
      dashboardUrl: `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/creativemk.net/email/routing`,
      why: "Route replies to leads@creativemk.net back into D1 so follow-up work stays Cloudflare-only.",
      steps: [
        "Enable Email Routing for creativemk.net.",
        "Route leads@creativemk.net to the creative-mk-concierge Worker.",
        "Optionally set EMAIL_FORWARD_TO only for a verified internal recipient."
      ],
      commands: [
        "npx wrangler secret put EMAIL_FORWARD_TO --config cloudflare/agent/wrangler.jsonc",
        "npx wrangler deploy --config cloudflare/agent/wrangler.jsonc"
      ],
      verify: [
        "Send a test email to leads@creativemk.net.",
        "Admin Lead Inbox should show a new email-routing lead or task."
      ],
      owner: "Cloudflare Email Routing",
      freeGuardrail: "Store only redacted subject/metadata unless the email becomes a consented lead."
    },
    rateLimiting: {
      dashboardUrl: `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/workers`,
      why: "Add native Cloudflare rate limiting over the Durable Object fallback for public routes.",
      steps: [
        "Create a Rate Limiting namespace/binding if available in this account.",
        "Uncomment API_RATE_LIMITER in wrangler.jsonc with the namespace id.",
        "Deploy and keep Durable Object route buckets as fallback."
      ],
      commands: ["npx wrangler deploy --config cloudflare/agent/wrangler.jsonc"],
      verify: [
        "GET /admin/api/metrics should show rateLimiting.mode = native-binding-plus-do.",
        "Rapid repeated requests should return 429 before expensive work starts."
      ],
      owner: "Cloudflare security",
      freeGuardrail: "Apply strict limits to audit, lead-capture and admin routes first."
    },
    adminAuth: {
      dashboardUrl: `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/access`,
      why: "Replace shared admin token with Cloudflare Access when available.",
      steps: [
        "Create an Access application for /admin.",
        "Set TRUST_CF_ACCESS=true only after headers are verified.",
        "Keep ADMIN_TOKEN as emergency fallback during rollout."
      ],
      commands: ["npx wrangler deploy --config cloudflare/agent/wrangler.jsonc"],
      verify: [
        "GET /admin/api/metrics should show adminAuth.mode = cloudflare-access.",
        "Unauthenticated admin requests should return 401 or Access challenge."
      ],
      owner: "Cloudflare Zero Trust",
      freeGuardrail: "Use the smallest allowed admin identity group."
    }
  };

  const priorityForWeight = (weight: number): "high" | "medium" | "low" => {
    if (weight >= 7) return "high";
    if (weight >= 5) return "medium";
    return "low";
  };

  const runbookItems = items
    .filter((item) => !Boolean(item.enabled))
    .map((item) => {
      const key = rowString(item, "key");
      const guide = guides[key];
      const weight = rowNumber(item, "weight");
      const status = services[key] || { enabled: false, mode: "pending", note: "Binding inactive" };
      return {
        key,
        label: rowString(item, "label", titleFromSlug(key)),
        layer: rowString(item, "layer", "Stack"),
        priority: priorityForWeight(weight),
        mode: status.mode,
        currentState: status.note,
        why: guide?.why || rowString(item, "impact", "Improves Cloudflare-only operations."),
        steps: guide?.steps || [rowString(item, "activation", "Configure the Cloudflare binding and redeploy.")],
        commands: guide?.commands || ["npx wrangler deploy --config cloudflare/agent/wrangler.jsonc"],
        verify: guide?.verify || ["GET /admin/api/metrics should show this service enabled."],
        dashboardUrl: guide?.dashboardUrl || `https://dash.cloudflare.com/${CLOUDFLARE_ACCOUNT_ID}/workers`,
        owner: guide?.owner || "Cloudflare",
        freeGuardrail: guide?.freeGuardrail || "Keep feature-flagged until verified in the Free account.",
        weight
      };
    })
    .sort((a, b) => b.weight - a.weight || a.label.localeCompare(b.label));

  const completed = items
    .filter((item) => Boolean(item.enabled))
    .map((item) => ({
      key: rowString(item, "key"),
      label: rowString(item, "label", "Cloudflare service"),
      layer: rowString(item, "layer", "Stack"),
      mode: rowString(item, "mode", "active"),
      note: rowString(item, "note", "Detected active binding.")
    }));

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      pending: runbookItems.length,
      active: completed.length,
      next: runbookItems[0]?.label || "All tracked services active"
    },
    steps: runbookItems.slice(0, 8),
    completed: completed.slice(0, 8),
    safetyNotes: [
      "All commands use Wrangler and Cloudflare bindings; no external CRM or paid service is required.",
      "Secrets must be set with wrangler secret put, never stored in source files.",
      "After every activation, verify /admin/api/metrics before enabling stricter requirements."
    ]
  };
}

function buildCloudflareOperations(
  services: Record<string, ServiceStatusItem>,
  metrics: Record<string, unknown>,
  slaMonitor: Record<string, unknown>
): Record<string, unknown> {
  const blueprint = [
    {
      key: "d1",
      label: "D1 CRM source of truth",
      layer: "Data",
      weight: 14,
      impact: "Stores leads, sessions, briefs, diagnostics, consent and rollups.",
      activation: "Keep migrations applied before adding new capture fields."
    },
    {
      key: "durableObjects",
      label: "Durable Objects session memory",
      layer: "Capture",
      weight: 10,
      impact: "Keeps live agent state, quotas and per-session memory.",
      activation: "Verify Durable Object migrations after every class change."
    },
    {
      key: "workersAi",
      label: "Workers AI reasoning",
      layer: "Intelligence",
      weight: 10,
      impact: "Scores intent, summarizes conversations and recommends packages.",
      activation: "Watch daily AI caps and keep deterministic fallback active."
    },
    {
      key: "queue",
      label: "Queues async lead jobs",
      layer: "Automation",
      weight: 8,
      impact: "Moves enrichment, reports and events away from user-facing latency.",
      activation: "Confirm queue consumer retries are visible in Worker logs."
    },
    {
      key: "workflows",
      label: "Workflows orchestration",
      layer: "Automation",
      weight: 8,
      impact: "Coordinates enrichment, daily digest and audit flows.",
      activation: "Keep workflows feature-flag friendly if the account plan changes."
    },
    {
      key: "adminAuth",
      label: "Admin protection",
      layer: "Security",
      weight: 8,
      impact: "Locks the CRM API behind token or Cloudflare Access.",
      activation: "Prefer Cloudflare Access when available; keep ADMIN_TOKEN rotated."
    },
    {
      key: "rateLimiting",
      label: "Rate limiting guard",
      layer: "Security",
      weight: 8,
      impact: "Protects chat, audit, lead capture and admin routes from abuse.",
      activation: "Add native Rate Limiting binding when the namespace is created."
    },
    {
      key: "turnstile",
      label: "Turnstile trust gate",
      layer: "Security",
      weight: 7,
      impact: "Adds bot protection before audit, brief and lead capture.",
      activation: "Set site and secret keys, then switch TURNSTILE_REQUIRED after testing."
    },
    {
      key: "r2",
      label: "R2 report archive",
      layer: "Storage",
      weight: 7,
      impact: "Persists JSON/CSV artifacts outside hot D1 tables.",
      activation: "Create the reports bucket and enable the REPORTS_BUCKET binding."
    },
    {
      key: "analyticsEngine",
      label: "Analytics Engine metrics",
      layer: "Analytics",
      weight: 6,
      impact: "Captures aggregate high-cardinality funnel metrics without PII.",
      activation: "Enable the dataset binding and keep D1 as canonical CRM data."
    },
    {
      key: "aiSearch",
      label: "AI Search RAG",
      layer: "Knowledge",
      weight: 5,
      impact: "Grounds answers in the site/corpus with controlled search usage.",
      activation: "Create the AI Search instance and bind SITE_SEARCH when token permissions allow."
    },
    {
      key: "browserRun",
      label: "Browser Run audits",
      layer: "Intelligence",
      weight: 5,
      impact: "Adds rendered-page checks for hot leads while HTML audit remains free fallback.",
      activation: "Enable only after confirming free daily quota and keep strict per-day caps."
    },
    {
      key: "emailRouting",
      label: "Email Routing ingest",
      layer: "Follow-up",
      weight: 4,
      impact: "Links inbound lead replies back into Cloudflare D1.",
      activation: "Route leads@creativemk.net to the Worker and test an inbound reply."
    }
  ];

  const layerMap = new Map<string, { layer: string; enabledWeight: number; totalWeight: number; active: number; total: number }>();
  let enabledWeight = 0;
  let totalWeight = 0;

  const items = blueprint.map((item) => {
    const status = services[item.key] || { enabled: false, mode: "pending", note: "Binding not configured" };
    const enabled = Boolean(status.enabled);
    enabledWeight += enabled ? item.weight : 0;
    totalWeight += item.weight;
    const layer = layerMap.get(item.layer) || {
      layer: item.layer,
      enabledWeight: 0,
      totalWeight: 0,
      active: 0,
      total: 0
    };
    layer.enabledWeight += enabled ? item.weight : 0;
    layer.totalWeight += item.weight;
    layer.active += enabled ? 1 : 0;
    layer.total += 1;
    layerMap.set(item.layer, layer);
    return {
      ...item,
      enabled,
      mode: status.mode,
      note: status.note
    };
  });

  const readinessScore = totalWeight ? Math.round((enabledWeight / totalWeight) * 100) : 0;
  const leads = Number(metrics.leads || 0);
  const sessions = Number(metrics.sessions || 0);
  const audits = Number(metrics.audits || 0);
  const briefs = Number(metrics.briefs || 0);
  const openTasks = Number(metrics.open_tasks || 0);
  const overdueTasks = Number(metrics.overdue_tasks || 0);
  const slaSummary = (slaMonitor.summary || {}) as Record<string, unknown>;
  const highRisk = Number(slaSummary.highRisk || 0);

  const risks: Array<{ priority: "high" | "medium" | "low"; title: string; detail: string }> = [];
  if (!services.turnstile?.enabled) {
    risks.push({
      priority: leads > 0 || audits > 0 ? "high" : "medium",
      title: "Lead capture still relies on quotas",
      detail: "Turnstile is not active, so abuse protection is handled by session/IP limits until keys are configured."
    });
  }
  if (!services.r2?.enabled && (audits > 0 || briefs > 0)) {
    risks.push({
      priority: "medium",
      title: "Reports are D1-only",
      detail: `${audits + briefs} audit/brief artifact${audits + briefs === 1 ? "" : "s"} exist without R2 archival.`
    });
  }
  if (!services.analyticsEngine?.enabled && sessions >= 25) {
    risks.push({
      priority: "medium",
      title: "Aggregate metrics are D1-only",
      detail: "D1 rollups are working, but Analytics Engine would make high-volume funnel metrics cheaper to query."
    });
  }
  if (!services.aiSearch?.enabled) {
    risks.push({
      priority: "low",
      title: "Knowledge is local-corpus only",
      detail: "Answers stay functional, but AI Search would ground responses in crawled site content."
    });
  }
  if (!services.emailRouting?.enabled && leads > 0) {
    risks.push({
      priority: "medium",
      title: "Replies are not auto-linked",
      detail: "Inbound lead replies must be handled manually until Email Routing sends messages to the Worker."
    });
  }
  if (highRisk > 0 || overdueTasks > 0) {
    risks.push({
      priority: "high",
      title: "SLA attention needed",
      detail: `${highRisk} high-risk lead${highRisk === 1 ? "" : "s"} and ${overdueTasks} overdue task${overdueTasks === 1 ? "" : "s"} need operator review.`
    });
  }
  if (!risks.length) {
    risks.push({
      priority: "low",
      title: "Core stack is calm",
      detail: "No immediate operational risk detected from current Cloudflare bindings and D1 metrics."
    });
  }

  const priorityRank = { high: 0, medium: 1, low: 2 };
  const nextActivations = items
    .filter((item) => !item.enabled)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map((item) => ({
      key: item.key,
      label: item.label,
      layer: item.layer,
      impact: item.impact,
      activation: item.activation,
      weight: item.weight
    }));

  const actions = [
    ...risks
      .slice()
      .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority])
      .slice(0, 3)
      .map((risk) => ({
        priority: risk.priority,
        title: risk.title,
        detail: risk.detail
      })),
    ...nextActivations.slice(0, 3).map((item) => ({
      priority: item.weight >= 7 ? "medium" : "low",
      title: `Activate ${item.label}`,
      detail: item.activation
    }))
  ].slice(0, 5);
  const activationRunbook = buildActivationRunbook(services, items);

  return {
    readinessScore,
    posture:
      readinessScore >= 85
        ? "Premium Cloudflare-only stack"
        : readinessScore >= 65
          ? "Operational core live, premium edges pending"
          : "Foundation active, activation work remains",
    summary: {
      activeServices: items.filter((item) => item.enabled).length,
      totalServices: items.length,
      leads,
      sessions,
      openTasks,
      overdueTasks
    },
    layers: Array.from(layerMap.values()).map((layer) => ({
      layer: layer.layer,
      readiness: layer.totalWeight ? Math.round((layer.enabledWeight / layer.totalWeight) * 100) : 0,
      active: layer.active,
      total: layer.total,
      status: layer.active === layer.total ? "ready" : layer.active > 0 ? "partial" : "pending"
    })),
    services: items,
    risks: risks.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]).slice(0, 6),
    nextActivations,
    activationRunbook,
    actions,
    guardrails: [
      { label: "AI calls", value: `${LIMITS.dailyAiCalls}/day`, detail: "Global cap before deterministic fallback." },
      { label: "Chat turns", value: `${LIMITS.maxTurns}/session`, detail: "Keeps the concierge inside free-tier intent capture." },
      { label: "Audits", value: `${LIMITS.maxAudits}/session`, detail: "HTML audit always works; Browser Run stays capped separately." },
      { label: "Searches", value: `${LIMITS.maxSearches}/session`, detail: "Protects AI Search quota when the binding is active." },
      { label: "Admin page", value: `${LIMITS.maxAdminPageSize} rows`, detail: "Prevents broad D1 scans in the CRM UI." }
    ]
  };
}

function routeLimitRows(): Array<Record<string, unknown>> {
  return [
    {
      route: "chat",
      label: "Chat",
      limit: ROUTE_LIMITS.chat.limit,
      window: `${ROUTE_LIMITS.chat.periodSeconds}s`,
      protection: `${LIMITS.maxTurns} turns/session plus IP/session route gate`,
      risk: "Workers AI quota, spam prompts and noisy diagnostics"
    },
    {
      route: "events",
      label: "Events",
      limit: ROUTE_LIMITS.events.limit,
      window: `${ROUTE_LIMITS.events.periodSeconds}s`,
      protection: `${LIMITS.maxEvents} events/session plus metadata allowlist`,
      risk: "Analytics noise and inflated funnel metrics"
    },
    {
      route: "audit-url",
      label: "Audit URL",
      limit: ROUTE_LIMITS.audit.limit,
      window: `${ROUTE_LIMITS.audit.periodSeconds}s`,
      protection: `${LIMITS.maxAudits} audit/session, private URL rejection, ${LIMITS.maxAuditBytes / 1000} KB cap`,
      risk: "SSRF attempts, slow fetches and Browser Run overuse"
    },
    {
      route: "brief",
      label: "Brief",
      limit: ROUTE_LIMITS.brief.limit,
      window: `${ROUTE_LIMITS.brief.periodSeconds}s`,
      protection: `${LIMITS.maxBriefs} briefs/session and deterministic fallback`,
      risk: "Low-quality repeated brief generation"
    },
    {
      route: "lead-capture",
      label: "Lead Capture",
      limit: ROUTE_LIMITS.leadCapture.limit,
      window: `${ROUTE_LIMITS.leadCapture.periodSeconds}s`,
      protection: `${LIMITS.maxCaptures} captures/session, consent required, email validation`,
      risk: "Spam leads and consent bypass attempts"
    },
    {
      route: "consent",
      label: "Consent",
      limit: ROUTE_LIMITS.consent.limit,
      window: `${ROUTE_LIMITS.consent.periodSeconds}s`,
      protection: "Consent ledger in D1 with copy version",
      risk: "Missing proof of permission"
    },
    {
      route: "admin",
      label: "Admin API",
      limit: ROUTE_LIMITS.admin.limit,
      window: `${ROUTE_LIMITS.admin.periodSeconds}s`,
      protection: "Bearer admin token or Cloudflare Access, no-store responses",
      risk: "Unauthorized CRM access"
    }
  ];
}

function buildSecurityAbuseCenter(input: {
  metrics: Record<string, unknown>;
  events: Record<string, unknown>[];
  todayUsage: Record<string, unknown>;
  funnelGaps: Record<string, unknown>;
  privacyDataQuality: Record<string, unknown>;
  cloudflareServices: Record<string, ServiceStatusItem>;
  freeTierBudget: Record<string, unknown>;
}): Record<string, unknown> {
  const eventTotal = input.events.reduce((sum, row) => sum + rowNumber(row, "count"), 0);
  const errorEvents = eventCount(input.events, "error");
  const captureOpen = eventCount(input.events, "capture-open");
  const captureSubmit = eventCount(input.events, "capture-submit") || eventCount(input.events, "lead-capture");
  const leadCapture = eventCount(input.events, "lead-capture");
  const auditEvents = eventCount(input.events, "audit-url");
  const briefEvents = eventCount(input.events, "brief");
  const captureCompletion = percentPart(captureSubmit, captureOpen);
  const errorRate = percentPart(errorEvents, Math.max(1, eventTotal));
  const privacySummary = (input.privacyDataQuality.summary || {}) as Record<string, unknown>;
  const budgetSummary = (input.freeTierBudget.summary || {}) as Record<string, unknown>;
  const piiSignals = rowNumber(privacySummary, "possiblePiiSignals");
  const consentIssues = rowNumber(privacySummary, "leadsWithoutConsent");
  const captureDrop = rowNumber(input.funnelGaps, "capture_open_no_submit");
  const nativeRateLimit = Boolean(input.cloudflareServices.rateLimiting?.mode === "native-binding-plus-do");
  const turnstileEnabled = Boolean(input.cloudflareServices.turnstile?.enabled);
  const turnstileRequired = input.cloudflareServices.turnstile?.mode === "required";
  const adminProtected = Boolean(input.cloudflareServices.adminAuth?.enabled);
  const riskyTraffic = errorEvents > 0 || captureDrop > 0 || captureCompletion < 60 && captureOpen > 0;

  const actions: Array<{ priority: "high" | "medium" | "low"; title: string; detail: string; source: string }> = [];
  if (!adminProtected) {
    actions.push({
      priority: "high",
      title: "Protect admin API",
      detail: "Set ADMIN_TOKEN or enable Cloudflare Access before operating real lead data.",
      source: "Admin auth"
    });
  }
  if (!turnstileEnabled) {
    actions.push({
      priority: leadCapture > 0 || captureOpen > 0 ? "high" : "medium",
      title: "Activate Turnstile",
      detail: "Create a free Turnstile widget and set the public/secret keys so audit, brief and lead capture can verify humans.",
      source: "Turnstile"
    });
  } else if (!turnstileRequired && (leadCapture > 0 || riskyTraffic)) {
    actions.push({
      priority: "medium",
      title: "Graduate Turnstile to required mode",
      detail: "Turnstile is available but opportunistic; require it after confirming widget rendering across chat and contact form.",
      source: "Turnstile"
    });
  }
  if (!nativeRateLimit) {
    actions.push({
      priority: riskyTraffic ? "medium" : "low",
      title: "Add native Rate Limiting binding",
      detail: "Durable Object fallback is active. Add Cloudflare Rate Limiting binding when the namespace is available for defense in depth.",
      source: "Rate Limiting"
    });
  }
  if (piiSignals > 0 || consentIssues > 0) {
    actions.push({
      priority: "high",
      title: "Review privacy hygiene",
      detail: `${piiSignals} PII signal(s) and ${consentIssues} consent issue(s) need review in the Privacy & Data Quality Sentinel.`,
      source: "D1 privacy audit"
    });
  }
  if (captureDrop > 0 || (captureOpen > 0 && captureCompletion < 60)) {
    actions.push({
      priority: "medium",
      title: "Reduce capture abandonment",
      detail: `${captureDrop} capture-open session(s) did not submit; keep fields minimal and verify Turnstile does not block legitimate leads.`,
      source: "Lead capture funnel"
    });
  }
  if (errorEvents > 0) {
    actions.push({
      priority: errorEvents >= 5 ? "high" : "medium",
      title: "Investigate widget errors",
      detail: `${errorEvents} error event(s) appeared in the last 30 days. Review metadata-safe error categories and affected pages.`,
      source: "D1 lead_events"
    });
  }
  if (!actions.length) {
    actions.push({
      priority: "low",
      title: "Keep current guardrails",
      detail: "Session caps, route gates, metadata allowlists and admin auth are enough for current traffic volume.",
      source: "Worker guardrails"
    });
  }

  const protectedRoutes = routeLimitRows().map((route) => {
    const routeKey = rowString(route, "route");
    const eventMap: Record<string, string> = {
      chat: "chat",
      events: "state",
      "audit-url": "audit-url",
      brief: "brief",
      "lead-capture": "lead-capture",
      consent: "consent",
      admin: "admin-status-changed"
    };
    const eventType = eventMap[routeKey] || routeKey;
    return {
      ...route,
      events30d: eventCount(input.events, eventType),
      nativeRateLimit,
      turnstile: ["audit-url", "brief", "lead-capture"].includes(routeKey)
        ? input.cloudflareServices.turnstile?.mode || "session-limits"
        : "not-required"
    };
  });

  const threatSignals = [
    {
      label: "Error events",
      value: errorEvents,
      level: errorEvents >= 5 ? "danger" : errorEvents > 0 ? "watch" : "ok",
      detail: `${errorRate}% of tracked D1 events`
    },
    {
      label: "Capture abandonment",
      value: captureDrop,
      level: captureDrop > 0 || (captureOpen > 0 && captureCompletion < 60) ? "watch" : "ok",
      detail: `${captureCompletion}% capture completion`
    },
    {
      label: "Privacy signals",
      value: piiSignals + consentIssues,
      level: piiSignals + consentIssues > 0 ? "danger" : "ok",
      detail: `${piiSignals} PII signal(s), ${consentIssues} consent issue(s)`
    },
    {
      label: "Protected actions",
      value: auditEvents + briefEvents + leadCapture,
      level: turnstileEnabled || auditEvents + briefEvents + leadCapture === 0 ? "ok" : "watch",
      detail: `${auditEvents} audits / ${briefEvents} briefs / ${leadCapture} captures`
    }
  ];

  const posture = !adminProtected || piiSignals > 0 || consentIssues > 0
    ? "Security review needed"
    : turnstileRequired && nativeRateLimit
      ? "Defense in depth active"
      : turnstileEnabled || nativeRateLimit
        ? "Partially hardened"
        : "Guarded by Worker limits";

  return {
    source: "Cloudflare Worker guardrails, D1 events, Turnstile readiness and rate-limit bindings",
    summary: {
      posture,
      adminMode: input.cloudflareServices.adminAuth?.mode || "unknown",
      turnstileMode: input.cloudflareServices.turnstile?.mode || "session-limits",
      rateLimitMode: input.cloudflareServices.rateLimiting?.mode || "durable-object-fallback",
      eventTotal,
      errorEvents,
      errorRate,
      captureCompletion,
      protectedActions: auditEvents + briefEvents + leadCapture,
      freeTierWatch: rowNumber(budgetSummary, "watch"),
      freeTierDanger: rowNumber(budgetSummary, "danger")
    },
    routes: protectedRoutes,
    threatSignals,
    actions: actions.slice(0, 6),
    guardrails: [
      "Turnstile tokens are verified server-side only when the secret exists; otherwise route/session caps keep the flow usable.",
      "Sensitive endpoints use no-store responses and CORS is constrained to configured public origins plus localhost.",
      "Metadata logging uses an allowlist and redaction helpers to avoid storing raw PII in event analytics.",
      "Native Rate Limiting is optional; Durable Object route gates remain active as the free fallback.",
      "Admin data requires bearer token or Cloudflare Access before D1 lead details are returned."
    ]
  };
}

function routeLimitRule(request: Request): { route: string; limit: number; periodSeconds: number } | null {
  const url = new URL(request.url);
  if (request.method === "OPTIONS" || url.pathname === "/health") return null;

  if (url.pathname.startsWith("/admin/api/")) {
    return { route: "admin", ...ROUTE_LIMITS.admin };
  }

  const action = parseAction(request);
  switch (action) {
    case "chat":
      return { route: "chat", ...ROUTE_LIMITS.chat };
    case "events":
      return { route: "events", ...ROUTE_LIMITS.events };
    case "audit-url":
      return { route: "audit", ...ROUTE_LIMITS.audit };
    case "brief":
      return { route: "brief", ...ROUTE_LIMITS.brief };
    case "lead-capture":
      return { route: "lead-capture", ...ROUTE_LIMITS.leadCapture };
    case "consent":
      return { route: "consent", ...ROUTE_LIMITS.consent };
    default:
      return { route: action || "default", ...ROUTE_LIMITS.default };
  }
}

async function enforceRouteLimit(request: Request, env: Env): Promise<Response | null> {
  const rule = routeLimitRule(request);
  if (!rule) return null;

  const keyHash = await rateLimitKey(request, rule.route);
  const key = `${rule.route}:${keyHash.slice(0, 48)}`;

  if (env.API_RATE_LIMITER) {
    try {
      const outcome = await env.API_RATE_LIMITER.limit({ key });
      if (!outcome.success) {
        return tooManyRequests(request, env, rule.periodSeconds, rule.route);
      }
    } catch {
      // Continue to the Durable Object fallback if the native binding is unavailable.
    }
  }

  try {
    const gate = await getAgentByName<Env, QuotaGate>(
      env.QuotaGate as DurableObjectNamespace<QuotaGate>,
      "global"
    );
    const outcome = await gate.consumeRoute(key, rule.limit, rule.periodSeconds);
    if (!outcome.allowed) {
      return tooManyRequests(request, env, outcome.retryAfterSeconds, rule.route);
    }
  } catch {
    // If the fallback fails, session-level limits still protect expensive actions.
  }

  return null;
}

async function searchSite(env: Env, query: string, profile: Profile): Promise<{ context: string; used: boolean; sources: KnowledgeSource[]; fallback: boolean }> {
  if (!query.trim()) return { context: "", used: false, sources: [], fallback: true };

  const localSources = localKnowledgeSearch(query, profile);
  if (!env.SITE_SEARCH) {
    return {
      context: sourcesToContext(localSources),
      used: false,
      sources: localSources,
      fallback: true
    };
  }

  const results = await env.SITE_SEARCH.search({
    query,
    ai_search_options: {
      retrieval: {
        max_num_results: 4,
        match_threshold: 0.4
      },
      query_rewrite: {
        enabled: false
      },
      reranking: {
        enabled: false
      }
    }
  });

  const remoteSources: KnowledgeSource[] = (results.chunks || [])
    .slice(0, 4)
    .map((chunk) => ({
      id: chunk.id,
      title: String(chunk.item?.metadata?.title || chunk.item?.key || "CREATIVE MK site result"),
      serviceSlug: typeof chunk.item?.metadata?.serviceSlug === "string" ? chunk.item.metadata.serviceSlug : undefined,
      origin: "ai-search" as const,
      score: chunk.score,
      snippet: chunk.text.replace(/\s+/g, " ").slice(0, 520)
    }));
  const sources = [...remoteSources, ...localSources].slice(0, 6);

  return {
    context: sourcesToContext(sources),
    used: true,
    sources,
    fallback: remoteSources.length === 0
  };
}

async function runAi(env: Env, messages: Array<{ role: string; content: string }>): Promise<string> {
  const primary = env.AI_MODEL || DEFAULT_MODEL;
  const fallback = env.AI_FALLBACK_MODEL || FALLBACK_MODEL;
  const input = {
    messages,
    max_tokens: 520,
    temperature: 0.35
  };

  try {
    const result = await env.AI.run(primary, input);
    const text = normalizeAiText(result);
    if (text) return text;
  } catch {
    // Fall through to the cheaper fallback model.
  }

  const result = await env.AI.run(fallback, { ...input, max_tokens: 360, temperature: 0.25 });
  return normalizeAiText(result);
}

function blockedHost(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return (
    host === "localhost" ||
    host.endsWith(".localhost") ||
    host.endsWith(".local") ||
    host === "0.0.0.0" ||
    host === "::1" ||
    /^127\./.test(host) ||
    /^10\./.test(host) ||
    /^192\.168\./.test(host) ||
    /^169\.254\./.test(host) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
  );
}

function validPublicUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    if (url.username || url.password) return null;
    if (blockedHost(url.hostname)) return null;
    return url;
  } catch {
    return null;
  }
}

async function readLimitedText(response: Response): Promise<{ text: string; truncated: boolean }> {
  if (!response.body) {
    return { text: await response.text(), truncated: false };
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = 0;
  let text = "";
  let truncated = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;

    const remaining = LIMITS.maxAuditBytes - received;
    if (remaining <= 0) {
      truncated = true;
      break;
    }

    const chunk = value.byteLength > remaining ? value.slice(0, remaining) : value;
    received += chunk.byteLength;
    text += decoder.decode(chunk, { stream: true });

    if (value.byteLength > remaining) {
      truncated = true;
      break;
    }
  }

  text += decoder.decode();
  try {
    await reader.cancel();
  } catch {
    // Reader may already be closed.
  }

  return { text, truncated };
}

function attr(tag: string, name: string): string {
  const pattern = new RegExp(`${name}\\s*=\\s*["']([^"']*)["']`, "i");
  return tag.match(pattern)?.[1]?.trim() || "";
}

function stripTags(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractAudit(url: string, html: string, truncated: boolean): AuditResult {
  const title = stripTags(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
  const h1 = stripTags(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] || "");
  const metas = html.match(/<meta\s+[^>]*>/gi) || [];
  const description = stripTags(
    metas
      .map((tag) => {
        const name = attr(tag, "name").toLowerCase();
        const property = attr(tag, "property").toLowerCase();
        return name === "description" || property === "og:description" ? attr(tag, "content") : "";
      })
      .find(Boolean) || ""
  );

  const ctas = Array.from(html.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi))
    .map((match) => stripTags(match[2]))
    .filter((text) => /contact|book|call|quote|start|get|buy|shop|demo|learn|talk|agenda|cotiza|comprar|contacto|empezar|llamar|reserv/i.test(text))
    .slice(0, 6);

  const clarityScore = Math.max(1, Math.min(10, (title ? 3 : 0) + (description ? 3 : 0) + (h1 ? 3 : 0) + (title && h1 && title !== h1 ? 1 : 0)));
  const conversionScore = Math.max(1, Math.min(10, ctas.length >= 2 ? 8 : ctas.length === 1 ? 6 : 3));
  const findings = [
    title ? "Title is present." : "Missing or unreadable title.",
    description ? "Meta description is present." : "Missing meta description.",
    h1 ? "Primary H1 is present." : "Missing primary H1.",
    ctas.length ? `${ctas.length} visible CTA signal(s) found.` : "No clear CTA text detected in the first HTML pass."
  ];

  const nextAction = clarityScore < 7
    ? "Clarify the hero message before increasing traffic."
    : conversionScore < 7
      ? "Strengthen the primary CTA and lead capture path."
      : "Connect the page to a campaign or funnel test.";

  return {
    url,
    title,
    description,
    h1,
    ctas,
    clarityScore,
    conversionScore,
    nextAction,
    findings,
    truncated
  };
}

function deterministicAuditSummary(lang: Lang, audit: AuditResult): string {
  const line = lang === "es"
    ? `Claridad ${audit.clarityScore}/10, conversión ${audit.conversionScore}/10.`
    : `Clarity ${audit.clarityScore}/10, conversion ${audit.conversionScore}/10.`;
  const action = lang === "es" ? "Siguiente acción" : "Next action";
  const rendered = audit.rendered?.attempted
    ? lang === "es"
      ? ` Renderizado: ${audit.rendered.status || "ok"}.`
      : ` Rendered: ${audit.rendered.status || "ok"}.`
    : "";
  return `${line}${rendered}\n${audit.findings.slice(0, 3).join(" ")}\n${action}: ${audit.nextAction}`;
}

async function maybeEnhanceWithBrowserRun(
  env: Env,
  request: Request,
  audit: AuditResult,
  diagnostic: Diagnostic
): Promise<AuditResult> {
  if (!env.BROWSER || diagnostic.leadScore.score < 70) return audit;

  try {
    const gate = await getAgentByName<Env, QuotaGate>(
      env.QuotaGate as DurableObjectNamespace<QuotaGate>,
      "global"
    );
    const browserQuota = await gate.consumeBrowserRun(LIMITS.browserAuditsPerDay);
    if (!browserQuota.allowed) return { ...audit, rendered: { attempted: false } };
  } catch {
    return audit;
  }

  try {
    const response = await env.BROWSER.quickAction("snapshot", {
      url: audit.url,
      viewport: { width: 1365, height: 900, deviceScaleFactor: 1 },
      rejectResourceTypes: ["media", "font"],
      gotoOptions: { timeout: 12_000, waitUntil: "domcontentloaded" },
      actionTimeout: 15_000,
      cacheTTL: 300,
      screenshotOptions: { type: "webp", quality: 48, fullPage: false }
    });
    const browserMs = Number(response.headers.get("X-Browser-Ms-Used") || 0) || undefined;
    if (!response.ok) {
      return { ...audit, rendered: { attempted: true, status: response.status, browserMs, screenshotCaptured: false } };
    }

    const snapshot = (await response.json()) as BrowserRunSnapshotSuccessResponse;
    if (!snapshot.success) {
      return { ...audit, rendered: { attempted: true, status: response.status, browserMs, screenshotCaptured: false } };
    }

    const renderedAudit = extractAudit(audit.url, snapshot.result.content.slice(0, LIMITS.maxAuditBytes), snapshot.result.content.length > LIMITS.maxAuditBytes);
    const next: AuditResult = {
      ...audit,
      title: renderedAudit.title || audit.title,
      description: renderedAudit.description || audit.description,
      h1: renderedAudit.h1 || audit.h1,
      ctas: renderedAudit.ctas.length ? renderedAudit.ctas : audit.ctas,
      clarityScore: Math.max(audit.clarityScore, renderedAudit.clarityScore),
      conversionScore: Math.max(audit.conversionScore, renderedAudit.conversionScore),
      findings: [
        ...audit.findings,
        "Rendered Browser Run pass completed for high-intent session."
      ].slice(0, 6),
      rendered: {
        attempted: true,
        status: snapshot.meta.status,
        title: snapshot.meta.title,
        browserMs,
        screenshotCaptured: Boolean(snapshot.result.screenshot)
      }
    };

    await storeArtifact(env, "audit", await sessionHashFromRequest(request), {
      audit: {
        ...next,
        renderedScreenshotStored: false
      },
      browserRun: {
        status: snapshot.meta.status,
        title: snapshot.meta.title,
        browserMs,
        screenshotBytesApprox: snapshot.result.screenshot.length
      }
    });

    return next;
  } catch {
    return {
      ...audit,
      rendered: { attempted: true, screenshotCaptured: false }
    };
  }
}

function buildBrief(state: ConciergeState, lang: Lang): Brief {
  const service = findBySlug(SERVICE_MAP, state.profile.serviceSlug || "web-design") || SERVICE_MAP[0];
  const budget = findBySlug(BUDGETS, state.profile.budgetSlug || "not-sure") || BUDGETS[0];
  const timeline = findBySlug(TIMELINES, state.profile.timelineSlug || "flexible") || TIMELINES[4];
  const diagnostic = state.diagnostic || buildDiagnostic(state, lang);
  const recentUserNotes = state.messages
    .filter((message) => message.role === "user")
    .slice(-4)
    .map((message) => `- ${message.content}`)
    .join("\n");
  const stack = serviceStack({ ...state.profile, serviceSlug: service.slug }).join(" + ");
  const summary = lang === "es"
    ? `Recomendacion: ${service.es}. Stack sugerido: ${stack}.`
    : `Recommendation: ${service.en}. Suggested stack: ${stack}.`;
  const notes = [
    summary,
    state.lastAudit ? `${lang === "es" ? "Auditoria" : "Audit"}: ${state.lastAudit.url} - ${state.lastAudit.nextAction}` : "",
    recentUserNotes ? `${lang === "es" ? "Notas de conversacion" : "Conversation notes"}:\n${recentUserNotes}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    source: "mk-growth-concierge",
    createdAt: new Date().toISOString(),
    lang,
    recommendedService: labelFor(service, lang),
    serviceSlug: service.slug,
    supportServices: diagnostic.supportServices,
    leadScore: diagnostic.leadScore.score,
    budget: labelFor(budget, lang),
    budgetSlug: budget.slug,
    timeline: labelFor(timeline, lang),
    timelineSlug: timeline.slug,
    summary,
    notes,
    audit: state.lastAudit
      ? {
          url: state.lastAudit.url,
          title: state.lastAudit.title,
          h1: state.lastAudit.h1,
          nextAction: state.lastAudit.nextAction
        }
      : undefined
  };
}

function profileFromLeadBody(current: Profile, body: Record<string, unknown>, lang: Lang): Profile {
  const serviceSlug = slugFromLabel(SERVICE_MAP, body.service) || clean(body.service_slug, 80) || current.serviceSlug;
  const budgetSlug = slugFromLabel(BUDGETS, body.budget) || clean(body.budget_slug, 80) || current.budgetSlug;
  const timelineSlug = slugFromLabel(TIMELINES, body.timeline) || clean(body.timeline_slug, 80) || current.timelineSlug;
  const message = [body.message, body.notes, body.project_notes, body.company].map((item) => clean(item, 600)).filter(Boolean).join(" ");
  const next = updateProfile(current, message, { page: pageFromBody(body) || undefined }, lang);

  return {
    ...next,
    language: lang,
    serviceSlug: serviceSlug || next.serviceSlug,
    budgetSlug: budgetSlug || next.budgetSlug,
    timelineSlug: timelineSlug || next.timelineSlug,
    offer: next.offer || redactPII(body.message || body.notes).slice(0, 180),
    business: next.business || clean(body.company, 160)
  };
}

function priorityForScore(score: number): LeadCaptureResult["dashboardPriority"] {
  if (score >= 75) return "hot";
  if (score >= 50) return "warm";
  return "standard";
}

async function storeArtifact(
  env: Env,
  type: "brief" | "audit" | "lead" | "digest" | "export",
  sessionHash: string,
  payload: unknown
): Promise<string | null> {
  if (!env.REPORTS_BUCKET) return null;

  const date = todayKey();
  const key = `reports/${date}/${type}-${sessionHash.slice(0, 12)}-${crypto.randomUUID()}.json`;
  await env.REPORTS_BUCKET.put(key, JSON.stringify(payload, null, 2), {
    httpMetadata: { contentType: "application/json; charset=utf-8" },
    customMetadata: { type, createdAt: new Date().toISOString() }
  });
  return key;
}

async function enqueueLeadJob(env: Env, job: LeadJob): Promise<{ queued: boolean; workflow: boolean }> {
  let queued = false;
  let workflow = false;

  if (env.LEAD_JOBS) {
    try {
      await env.LEAD_JOBS.send(job, { contentType: "json" });
      queued = true;
    } catch {
      queued = false;
    }
  }

  try {
    if (job.type === "lead.created" && env.LEAD_ENRICHMENT_WORKFLOW) {
      await env.LEAD_ENRICHMENT_WORKFLOW.create({
        id: `lead-${job.leadId || crypto.randomUUID()}`,
        params: job
      });
      workflow = true;
    }
    if (job.type === "daily.rollup" && env.DAILY_DIGEST_WORKFLOW) {
      await env.DAILY_DIGEST_WORKFLOW.create({
        id: `digest-${job.day || todayKey()}`,
        params: job
      });
      workflow = true;
    }
    if (job.type === "audit.completed" && env.AUDIT_WORKFLOW) {
      await env.AUDIT_WORKFLOW.create({
        id: `audit-${job.auditId || crypto.randomUUID()}`,
        params: job
      });
      workflow = true;
    }
  } catch {
    workflow = false;
  }

  return { queued, workflow };
}

async function persistBriefRecord(
  env: Env,
  request: Request,
  state: ConciergeState,
  brief: Brief,
  leadId?: string
): Promise<{ briefId: string; artifactKey: string | null }> {
  const briefId = crypto.randomUUID();
  const sessionHash = await sessionHashFromRequest(request);
  const artifactKey = leadId
    ? await storeArtifact(env, "brief", sessionHash, { briefId, leadId, brief })
    : null;

  if (env.ANALYTICS_DB) {
    await env.ANALYTICS_DB.prepare(
      `INSERT INTO lead_briefs
        (id, lead_id, session_hash, summary, notes, budget, timeline, service_slug, artifact_r2_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        briefId,
        leadId || null,
        sessionHash,
        redactPII(brief.summary),
        redactPII(brief.notes),
        brief.budget,
        brief.timeline,
        brief.serviceSlug,
        artifactKey,
        new Date().toISOString()
      )
      .run();
  }

  await enqueueLeadJob(env, {
    type: "brief.created",
    sessionHash,
    leadId,
    briefId,
    payload: { serviceSlug: brief.serviceSlug, score: brief.leadScore },
    createdAt: new Date().toISOString()
  });

  return { briefId, artifactKey };
}

async function persistAuditRecord(
  env: Env,
  request: Request,
  state: ConciergeState,
  audit: AuditResult,
  leadId?: string
): Promise<{ auditId: string; reportKey: string | null }> {
  const auditId = crypto.randomUUID();
  const sessionHash = await sessionHashFromRequest(request);
  const hostnameHash = await sha256(new URL(audit.url).hostname.toLowerCase());
  const reportKey = leadId
    ? await storeArtifact(env, "audit", sessionHash, { auditId, leadId, audit })
    : null;

  if (env.ANALYTICS_DB) {
    await env.ANALYTICS_DB.prepare(
      `INSERT INTO lead_audits
        (id, lead_id, session_hash, hostname_hash, title, h1, clarity_score, conversion_score, findings_json, report_r2_key, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
      .bind(
        auditId,
        leadId || null,
        sessionHash,
        hostnameHash,
        audit.title.slice(0, 300),
        audit.h1.slice(0, 300),
        audit.clarityScore,
        audit.conversionScore,
        JSON.stringify(audit.findings),
        reportKey,
        new Date().toISOString()
      )
      .run();
  }

  await enqueueLeadJob(env, {
    type: "audit.completed",
    sessionHash,
    leadId,
    auditId,
    payload: {
      clarityScore: audit.clarityScore,
      conversionScore: audit.conversionScore,
      hostnameHash
    },
    createdAt: new Date().toISOString()
  });

  return { auditId, reportKey };
}

async function createFollowUpTask(env: Env, leadId: string, sessionHash: string, diagnostic: Diagnostic): Promise<void> {
  if (!env.ANALYTICS_DB) return;
  const existing = await env.ANALYTICS_DB.prepare(
    `SELECT id FROM lead_tasks WHERE lead_id = ? AND task_type = 'follow_up' AND status = 'open' LIMIT 1`
  )
    .bind(leadId)
    .first<Record<string, unknown>>();
  if (existing) return;

  const due = new Date(Date.now() + (diagnostic.leadScore.score >= 75 ? 4 : 24) * 60 * 60 * 1000).toISOString();
  await env.ANALYTICS_DB.prepare(
    `INSERT INTO lead_tasks
      (id, lead_id, session_hash, task_type, status, due_at, payload_json, completed_at, created_at)
     VALUES (?, ?, ?, 'follow_up', 'open', ?, ?, NULL, ?)`
  )
    .bind(
      crypto.randomUUID(),
      leadId,
      sessionHash,
      due,
      JSON.stringify({
        priority: priorityForScore(diagnostic.leadScore.score),
        nextBestAction: diagnostic.nextQuestion,
        primaryService: diagnostic.primaryServiceSlug
      }),
      new Date().toISOString()
    )
    .run();
}

export class QuotaGate extends Agent<Env, QuotaState> {
  initialState: QuotaState = {
    date: "",
    aiCalls: 0,
    browserRuns: 0,
    routeBuckets: {}
  };

  async consumeAi(limit = LIMITS.dailyAiCalls): Promise<{ allowed: boolean; remaining: number }> {
    const date = todayKey();
    const current = this.state.date === date ? this.state : { date, aiCalls: 0, browserRuns: 0, routeBuckets: this.state.routeBuckets || {} };

    if (current.aiCalls >= limit) {
      if (current !== this.state) this.setState(current);
      return { allowed: false, remaining: 0 };
    }

    const next = { ...current, date, aiCalls: current.aiCalls + 1, browserRuns: current.browserRuns || 0 };
    this.setState(next);
    return { allowed: true, remaining: Math.max(0, limit - next.aiCalls) };
  }

  async consumeBrowserRun(limit = LIMITS.browserAuditsPerDay): Promise<{ allowed: boolean; remaining: number }> {
    const date = todayKey();
    const current = this.state.date === date ? this.state : { date, aiCalls: 0, browserRuns: 0, routeBuckets: this.state.routeBuckets || {} };

    if ((current.browserRuns || 0) >= limit) {
      if (current !== this.state) this.setState(current);
      return { allowed: false, remaining: 0 };
    }

    const next = { ...current, date, browserRuns: (current.browserRuns || 0) + 1 };
    this.setState(next);
    return { allowed: true, remaining: Math.max(0, limit - next.browserRuns) };
  }

  async consumeRoute(key: string, limit: number, periodSeconds: number): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds: number }> {
    const now = Date.now();
    const buckets = { ...(this.state.routeBuckets || {}) };
    const existing = buckets[key];
    const resetAt = existing && existing.resetAt > now ? existing.resetAt : now + periodSeconds * 1000;
    const count = existing && existing.resetAt > now ? existing.count : 0;

    if (count >= limit) {
      const retryAfterSeconds = Math.max(1, Math.ceil((resetAt - now) / 1000));
      this.setState({ ...this.state, routeBuckets: buckets });
      return { allowed: false, remaining: 0, retryAfterSeconds };
    }

    buckets[key] = { resetAt, count: count + 1 };
    const cutoff = now - 60 * 60 * 1000;
    for (const [bucketKey, bucket] of Object.entries(buckets)) {
      if (bucket.resetAt < cutoff) delete buckets[bucketKey];
    }

    this.setState({ ...this.state, routeBuckets: buckets });
    return { allowed: true, remaining: Math.max(0, limit - buckets[key].count), retryAfterSeconds: Math.max(1, Math.ceil((resetAt - now) / 1000)) };
  }
}

export class CreativeMkConcierge extends Agent<Env, ConciergeState> {
  initialState: ConciergeState = initialConciergeState();

  async onRequest(request: Request): Promise<Response> {
    const action = parseAction(request);
    const readOnly = action === "state" || action === "report" || action === "config";

    if (request.method !== "POST" && !readOnly) {
      return invalidMethod(request, this.env);
    }

    if (action === "config") return this.handleConfig(request);
    if (action === "chat") return this.handleChat(request);
    if (action === "audit-url") return this.handleAuditUrl(request);
    if (action === "brief") return this.handleBrief(request);
    if (action === "events") return this.handleEvents(request);
    if (action === "lead-capture") return this.handleLeadCapture(request);
    if (action === "consent") return this.handleConsent(request);
    if (action === "report") return this.handleReport(request);
    if (action === "state") {
      const state = normalizeState(this.state);
      return json({ state, limits: LIMITS, knowledgeVersion: KNOWLEDGE_VERSION }, request, this.env);
    }

    return json({ error: "Unknown concierge action" }, request, this.env, 404);
  }

  private async handleConfig(request: Request): Promise<Response> {
    return json(
      {
        turnstile: {
          siteKey: clean(this.env.PUBLIC_TURNSTILE_SITE_KEY, 160),
          required: this.env.TURNSTILE_REQUIRED === "true",
          enabled: Boolean(this.env.TURNSTILE_SECRET_KEY && this.env.PUBLIC_TURNSTILE_SITE_KEY)
        },
        limits: {
          maxMessageChars: LIMITS.maxMessageChars,
          maxTurns: LIMITS.maxTurns,
          maxAudits: LIMITS.maxAudits,
          maxBriefs: LIMITS.maxBriefs
        },
        contactUrl: this.env.CONTACT_URL || "/contact.html?from=mk-concierge",
        knowledgeVersion: KNOWLEDGE_VERSION
      },
      request,
      this.env
    );
  }

  private async consumeAi(): Promise<{ allowed: boolean; remaining: number }> {
    try {
      const gate = await getAgentByName<Env, QuotaGate>(
        this.env.QuotaGate as DurableObjectNamespace<QuotaGate>,
        "global"
      );
      return await gate.consumeAi(LIMITS.dailyAiCalls);
    } catch {
      return { allowed: true, remaining: -1 };
    }
  }

  private async handleChat(request: Request): Promise<Response> {
    const body = await safeJson(request);
    const lang = langFrom(body.lang);
    const message = clean(body.message);

    if (!message) {
      return json({ error: lang === "es" ? "Escribe una pregunta." : "Please enter a question." }, request, this.env, 400);
    }

    const state = normalizeState(this.state);
    const profile = updateProfile(state.profile, message, body.context as Record<string, unknown> | undefined, lang);
    const diagnostic = buildDiagnostic({ ...state, profile }, lang);

    if (state.turns >= LIMITS.maxTurns) {
      const reply = fallbackChat(lang, profile, "limit");
      return json(
        {
          reply,
          mode: "fallback",
          fallback: true,
          limitReached: true,
          turnsRemaining: 0,
          suggestedActions: ["brief"],
          profile,
          diagnostic,
          leadScore: diagnostic.leadScore.score,
          nextQuestion: diagnostic.nextQuestion,
          sources: []
        },
        request,
        this.env
      );
    }

    let searchContext = "";
    let searchUsed = false;
    let searchFallback = true;
    let sources: KnowledgeSource[] = [];
    if (state.searches < LIMITS.maxSearches) {
      try {
        const search = await searchSite(this.env, message, profile);
        searchContext = search.context;
        searchUsed = search.used;
        searchFallback = search.fallback;
        sources = search.sources;
      } catch {
        searchContext = "";
      }
    } else {
      sources = localKnowledgeSearch(message, profile);
      searchContext = sourcesToContext(sources);
    }

    const quota = await this.consumeAi();
    let reply = "";
    let mode: "ai" | "fallback" = "fallback";

    if (quota.allowed) {
      try {
        reply = await runAi(this.env, [
          { role: "system", content: systemPrompt(lang, profile, diagnostic, searchContext, state.lastAudit) },
          ...compactHistory(state.messages),
          { role: "user", content: message }
        ]);
        mode = reply ? "ai" : "fallback";
      } catch {
        mode = "fallback";
      }
    }

    if (!reply) {
      reply = fallbackChat(lang, profile, quota.allowed ? undefined : "limit");
    }

    const nextState: ConciergeState = {
      ...state,
      turns: state.turns + 1,
      searches: state.searches + (searchUsed ? 1 : 0),
      profile,
      diagnostic,
      messages: [
        ...state.messages,
        { role: "user" as const, content: message, at: Date.now() },
        { role: "assistant" as const, content: reply, at: Date.now() }
      ].slice(-18)
    };
    this.setState(nextState);
    await logAnalyticsEvent(this.env, request, nextState, "chat", lang, {
      page: typeof body.context === "object" && body.context ? (body.context as Record<string, unknown>).page : undefined,
      fallback: mode === "fallback" || searchFallback,
      scoreBand: Math.floor(diagnostic.leadScore.score / 20) * 20
    });

    return json(
      {
        reply,
        mode,
        fallback: mode === "fallback" || searchFallback,
        turnsRemaining: Math.max(0, LIMITS.maxTurns - nextState.turns),
        searchesRemaining: Math.max(0, LIMITS.maxSearches - nextState.searches),
        aiRemainingToday: quota.remaining,
        suggestedActions: suggestedActions(nextState),
        profile,
        diagnostic,
        leadScore: diagnostic.leadScore.score,
        nextQuestion: diagnostic.nextQuestion,
        sources
      },
      request,
      this.env
    );
  }

  private async handleAuditUrl(request: Request): Promise<Response> {
    const body = await safeJson(request);
    const lang = langFrom(body.lang);
    const requestedUrl = clean(body.url, 500);
    const url = validPublicUrl(requestedUrl);

    if (!url) {
      return json(
        {
          error: lang === "es" ? "Pega una URL pública válida, por ejemplo https://example.com." : "Paste a valid public URL, for example https://example.com."
        },
        request,
        this.env,
        400
      );
    }

    const state = normalizeState(this.state);
    if (state.audits >= LIMITS.maxAudits) {
      const diagnostic = state.diagnostic || buildDiagnostic(state, lang);
      return json(
        {
          error: lang === "es" ? "Esta sesión ya usó su mini-auditoría gratuita." : "This session already used its free mini audit.",
          audit: state.lastAudit,
          reply: state.lastAudit ? deterministicAuditSummary(lang, state.lastAudit) : fallbackChat(lang, state.profile, "limit"),
          diagnostic,
          leadScore: diagnostic.leadScore.score,
          nextQuestion: diagnostic.nextQuestion,
          fallback: true
        },
        request,
        this.env,
        429
      );
    }

    const turnstile = await verifyTurnstile(this.env, body.turnstileToken);
    if (!turnstile.ok) {
      return json(
        {
          error: lang === "es" ? "No pude verificar la protección anti-abuso. Intenta de nuevo." : "I could not verify the anti-abuse check. Please try again."
        },
        request,
        this.env,
        403
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LIMITS.auditTimeoutMs);
    let audit: AuditResult;

    try {
      const response = await fetch(url.toString(), {
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "CREATIVE-MK-Concierge/1.0 (+https://creativemk.net)"
        }
      });
      if (!response.ok) {
        throw new Error(`Audit fetch returned ${response.status}`);
      }
      const contentType = response.headers.get("Content-Type") || "";
      if (!/text\/html|application\/xhtml\+xml|text\/plain/i.test(contentType)) {
        throw new Error("URL did not return an HTML document");
      }
      const limited = await readLimitedText(response);
      audit = extractAudit(url.toString(), limited.text, limited.truncated);
    } catch {
      clearTimeout(timer);
      return json(
        {
          error: lang === "es" ? "No pude leer esa página pública en menos de 4 segundos." : "I could not read that public page within 4 seconds."
        },
        request,
        this.env,
        422
      );
    } finally {
      clearTimeout(timer);
    }

    const profile = updateProfile({ ...state.profile, url: url.toString() }, `website audit ${url.toString()}`, undefined, lang);
    const initialDiagnostic = buildDiagnostic({ ...state, profile, lastAudit: audit }, lang);
    audit = await maybeEnhanceWithBrowserRun(this.env, request, audit, initialDiagnostic);
    const diagnostic = buildDiagnostic({ ...state, profile, lastAudit: audit }, lang);
    const quota = await this.consumeAi();
    let reply = deterministicAuditSummary(lang, audit);
    let mode: "ai" | "fallback" = "fallback";

    if (quota.allowed) {
      try {
        const aiReply = await runAi(this.env, [
          {
            role: "system",
            content: [
              systemPrompt(lang, profile, diagnostic, "", audit),
              "Turn the audit into a concise diagnostic with: clarity, conversion, one priority fix, and which CREATIVE MK service fits next.",
              "Do not request personal data."
            ].join("\n")
          },
          {
            role: "user",
            content: JSON.stringify({
              title: audit.title,
              description: audit.description,
              h1: audit.h1,
              ctas: audit.ctas,
              clarityScore: audit.clarityScore,
              conversionScore: audit.conversionScore
            })
          }
        ]);
        if (aiReply) {
          reply = aiReply;
          mode = "ai";
        }
      } catch {
        mode = "fallback";
      }
    }

    const nextState: ConciergeState = {
      ...state,
      audits: state.audits + 1,
      profile,
      diagnostic,
      lastAudit: audit,
      messages: [
        ...state.messages,
        { role: "user" as const, content: `Audit URL: ${url.toString()}`, at: Date.now() },
        { role: "assistant" as const, content: reply, at: Date.now() }
      ].slice(-18)
    };
    this.setState(nextState);
    await persistAuditRecord(this.env, request, nextState, audit, state.leadId);
    await logAnalyticsEvent(this.env, request, nextState, "audit-url", lang, {
      hasAudit: true,
      fallback: mode === "fallback",
      scoreBand: Math.floor(diagnostic.leadScore.score / 20) * 20
    });

    return json(
      {
        reply,
        mode,
        fallback: mode === "fallback",
        audit,
        auditsRemaining: Math.max(0, LIMITS.maxAudits - nextState.audits),
        aiRemainingToday: quota.remaining,
        suggestedActions: suggestedActions(nextState),
        diagnostic,
        leadScore: diagnostic.leadScore.score,
        nextQuestion: diagnostic.nextQuestion,
        sources: []
      },
      request,
      this.env
    );
  }

  private async handleBrief(request: Request): Promise<Response> {
    const body = await safeJson(request);
    const lang = langFrom(body.lang);
    const state = normalizeState(this.state);
    const diagnostic = state.diagnostic || buildDiagnostic(state, lang);

    if (state.briefs >= LIMITS.maxBriefs) {
      return json(
        {
          error: lang === "es" ? "Esta sesión ya preparó sus briefs gratuitos." : "This session already prepared its free briefs.",
          brief: state.brief,
          diagnostic,
          leadScore: diagnostic.leadScore.score,
          nextQuestion: diagnostic.nextQuestion,
          fallback: true
        },
        request,
        this.env,
        429
      );
    }

    const turnstile = await verifyTurnstile(this.env, body.turnstileToken);
    if (!turnstile.ok) {
      return json(
        {
          error: lang === "es" ? "No pude verificar la protección anti-abuso. Intenta de nuevo." : "I could not verify the anti-abuse check. Please try again."
        },
        request,
        this.env,
        403
      );
    }

    const nextBase = { ...state, diagnostic };
    const brief = buildBrief(nextBase, lang);

    const nextState: ConciergeState = {
      ...nextBase,
      briefs: state.briefs + 1,
      brief
    };
    this.setState(nextState);
    const briefRecord = await persistBriefRecord(this.env, request, nextState, brief, state.leadId);
    const briefReport = reportReceiptForRequest(request, briefRecord.briefId, "brief", briefRecord.artifactKey);
    await logAnalyticsEvent(this.env, request, nextState, "brief", lang, {
      hasAudit: Boolean(state.lastAudit),
      scoreBand: Math.floor(diagnostic.leadScore.score / 20) * 20
    });

    return json(
      {
        brief,
        diagnostic,
        leadScore: diagnostic.leadScore.score,
        nextQuestion: diagnostic.nextQuestion,
        briefsRemaining: Math.max(0, LIMITS.maxBriefs - nextState.briefs),
        storageKey: "creativeMkBrief",
        report: briefReport,
        reportId: briefReport.reportId,
        reportUrl: briefReport.reportUrl,
        contactUrl: this.env.CONTACT_URL || "/contact.html?from=mk-concierge"
      },
      request,
      this.env
    );
  }

  private async handleLeadCapture(request: Request): Promise<Response> {
    const body = await requestData(request);
    const lang = langFrom(body.lang || body.language);
    const state = normalizeState(this.state);

    if (clean(body._gotcha, 80)) {
      return json({ status: "ignored", nextStep: "Thanks." }, request, this.env);
    }

    if (state.captures >= LIMITS.maxCaptures && !state.leadId) {
      return json(
        {
          error: lang === "es" ? "Esta sesión alcanzó el límite de capturas." : "This session reached its capture limit."
        },
        request,
        this.env,
        429
      );
    }

    const turnstile = await verifyTurnstile(this.env, body.turnstileToken);
    if (!turnstile.ok) {
      return json(
        {
          error: lang === "es" ? "No pude verificar la protección anti-abuso. Intenta de nuevo." : "I could not verify the anti-abuse check. Please try again."
        },
        request,
        this.env,
        403
      );
    }

    const consent = boolValue(body.consent || body.privacy_consent || body.agree);
    const name = clean(body.name || body.full_name, 160);
    const email = validEmail(body.email || body.work_email);
    const phone = clean(body.phone, 80);
    const company = clean(body.company, 180);
    const source = clean(body.source || "mk-concierge", 120);

    if (!consent) {
      return json(
        {
          error: lang === "es" ? "Necesito tu consentimiento para guardar este diagnóstico." : "I need consent before saving this diagnostic."
        },
        request,
        this.env,
        400
      );
    }
    if (!name || !email) {
      return json(
        {
          error: lang === "es" ? "Nombre y email son requeridos." : "Name and email are required."
        },
        request,
        this.env,
        400
      );
    }

    const profile = profileFromLeadBody(state.profile, body, lang);
    const baseState: ConciergeState = {
      ...state,
      profile,
      consented: true
    };
    const diagnostic = buildDiagnostic(baseState, lang);
    const leadId = state.leadId || crypto.randomUUID();
    const nextState: ConciergeState = {
      ...baseState,
      captures: state.captures + 1,
      leadId,
      diagnostic
    };

    const sessionHash = await sessionHashFromRequest(request);
    const now = new Date().toISOString();
    const page = pageFromBody(body) || "/";
    const utm = utmFromBody(body);
    const priority = priorityForScore(diagnostic.leadScore.score);
    const nextStep = lang === "es"
      ? priority === "hot"
        ? "CREATIVE MK debería revisar este lead hoy con el brief y la auditoría."
        : "CREATIVE MK revisará el diagnóstico y responderá con el siguiente paso."
      : priority === "hot"
        ? "CREATIVE MK should review this lead today with the brief and audit."
        : "CREATIVE MK will review the diagnostic and reply with the next step.";

    this.setState(nextState);
    let briefReport: ReportReceipt | undefined;
    let auditReport: ReportReceipt | undefined;

    try {
      if (this.env.ANALYTICS_DB) {
        await upsertSessionSnapshot(this.env, request, nextState, lang, { page, source, priority, ...utm });
        await this.env.ANALYTICS_DB.prepare(
          `UPDATE lead_sessions
           SET last_seen_at = ?, landing_page = COALESCE(landing_page, ?), utm_json = ?, status = 'captured', consented = 1
           WHERE session_hash = ?`
        )
          .bind(now, page, JSON.stringify(utm), sessionHash)
          .run();

        await this.env.ANALYTICS_DB.prepare(
          `INSERT INTO leads
            (id, session_hash, name, email, phone, company, source, consent_at, status, owner_notes, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', NULL, ?, ?)
           ON CONFLICT(id) DO UPDATE SET
            name = excluded.name,
            email = excluded.email,
            phone = excluded.phone,
            company = excluded.company,
            source = excluded.source,
            consent_at = excluded.consent_at,
            updated_at = excluded.updated_at`
        )
          .bind(leadId, sessionHash, name, email, phone || null, company || null, source, now, now, now)
          .run();

        await this.env.ANALYTICS_DB.prepare(
          `INSERT INTO consent_events
            (id, session_hash, lead_id, scope, copy_version, created_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(
            crypto.randomUUID(),
            sessionHash,
            leadId,
            clean(body.consent_scope || "diagnostic-review", 120),
            clean(body.copy_version || "lead-capture-v1", 80),
            now
          )
          .run();

        await createFollowUpTask(this.env, leadId, sessionHash, diagnostic);
      }

      const brief = state.brief || buildBrief(nextState, lang);
      const briefRecord = await persistBriefRecord(this.env, request, nextState, brief, leadId);
      briefReport = reportReceiptForRequest(request, briefRecord.briefId, "brief", briefRecord.artifactKey);
      if (state.lastAudit) {
        const auditRecord = await persistAuditRecord(this.env, request, nextState, state.lastAudit, leadId);
        auditReport = reportReceiptForRequest(request, auditRecord.auditId, "audit", auditRecord.reportKey);
      }

      await storeArtifact(this.env, "lead", sessionHash, {
        leadId,
        capturedAt: now,
        source,
        priority,
        profile: nextState.profile,
        diagnostic,
        brief: state.brief || null,
        audit: state.lastAudit || null
      });

      await enqueueLeadJob(this.env, {
        type: "lead.created",
        sessionHash,
        leadId,
        payload: {
          priority,
          serviceSlug: diagnostic.primaryServiceSlug,
          score: diagnostic.leadScore.score
        },
        createdAt: now
      });

      await logAnalyticsEvent(this.env, request, nextState, "lead-capture", lang, {
        page,
        source,
        priority,
        serviceSlug: diagnostic.primaryServiceSlug,
        scoreBand: scoreBand(diagnostic.leadScore.score)
      });
    } catch {
      return json(
        {
          error: lang === "es" ? "No pude guardar el lead en Cloudflare. Intenta de nuevo." : "I could not save the lead in Cloudflare. Please try again."
        },
        request,
        this.env,
        500
      );
    }

    const result: LeadCaptureResult = {
      leadId,
      status: "captured",
      nextStep,
      dashboardPriority: priority,
      reportId: briefReport?.reportId || auditReport?.reportId,
      reportUrl: briefReport?.reportUrl || auditReport?.reportUrl,
      reports: {
        brief: briefReport,
        audit: auditReport
      }
    };
    return json({ ...result, diagnostic, leadScore: diagnostic.leadScore.score }, request, this.env);
  }

  private async handleConsent(request: Request): Promise<Response> {
    const body = await requestData(request);
    const lang = langFrom(body.lang || body.language);
    const state = normalizeState(this.state);
    const consent = boolValue(body.consent || body.accepted);

    if (!consent) {
      return json({ accepted: false, reason: "consent-required" }, request, this.env, 400);
    }

    const nextState = { ...state, consented: true };
    this.setState(nextState);

    if (this.env.ANALYTICS_DB) {
      const sessionHash = await sessionHashFromRequest(request);
      const now = new Date().toISOString();
      await upsertSessionSnapshot(this.env, request, nextState, lang, {
        page: pageFromBody(body) || "/",
        source: "consent"
      });
      await this.env.ANALYTICS_DB.prepare(
        `INSERT INTO consent_events
          (id, session_hash, lead_id, scope, copy_version, created_at)
         VALUES (?, ?, ?, ?, ?, ?)`
      )
        .bind(
          crypto.randomUUID(),
          sessionHash,
          state.leadId || null,
          clean(body.scope || "diagnostic-review", 120),
          clean(body.copy_version || "consent-v1", 80),
          now
        )
        .run();
    }

    await logAnalyticsEvent(this.env, request, nextState, "consent", lang, {
      page: pageFromBody(body) || "/",
      source: "consent"
    });

    return json({ accepted: true, consented: true }, request, this.env);
  }

  private reportHtmlResponse(request: Request, reportId: string, type: "brief" | "audit", record: Record<string, unknown>): Response {
    const findings = parseJsonArray(record.findings_json);
    const title = type === "brief" ? "Growth Diagnostic Receipt" : "Website Audit Receipt";
    const body = type === "brief"
      ? `
        <section>
          <span class="eyebrow">Recommended path</span>
          <h2>${htmlEscape(titleFromSlug(clean(record.service_slug, 120) || "web-design"))}</h2>
          <p>${htmlEscape(record.summary || "CREATIVE MK saved this diagnostic for review.")}</p>
        </section>
        <dl>
          <div><dt>Budget</dt><dd>${htmlEscape(record.budget || "Not specified")}</dd></div>
          <div><dt>Timeline</dt><dd>${htmlEscape(record.timeline || "Not specified")}</dd></div>
          <div><dt>Created</dt><dd>${htmlEscape(record.created_at || "")}</dd></div>
        </dl>
        <section>
          <span class="eyebrow">Notes</span>
          <p>${htmlEscape(record.notes || "CREATIVE MK will use this receipt to prepare the next step.")}</p>
        </section>`
      : `
        <section>
          <span class="eyebrow">Website audit</span>
          <h2>${htmlEscape(record.title || "Untitled page")}</h2>
          <p>${htmlEscape(record.h1 || "No H1 detected.")}</p>
        </section>
        <dl>
          <div><dt>Clarity</dt><dd>${Number(record.clarity_score || 0)}/100</dd></div>
          <div><dt>Conversion</dt><dd>${Number(record.conversion_score || 0)}/100</dd></div>
          <div><dt>Created</dt><dd>${htmlEscape(record.created_at || "")}</dd></div>
        </dl>
        <section>
          <span class="eyebrow">Findings</span>
          <ul>${findings.length ? findings.map((item) => `<li>${htmlEscape(item)}</li>`).join("") : "<li>No findings recorded.</li>"}</ul>
        </section>`;
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>CREATIVE MK ${htmlEscape(title)}</title>
  <style>
    :root{color-scheme:light;--ink:#111;--muted:#666;--line:rgba(17,17,17,.14);--teal:#0f766e;--paper:#fff;--wash:#f5f5f2}
    *{box-sizing:border-box}body{margin:0;background:var(--wash);color:var(--ink);font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
    main{max-width:820px;margin:0 auto;padding:clamp(22px,5vw,56px)}.card{display:grid;gap:22px;border:1px solid var(--line);border-radius:10px;background:var(--paper);padding:clamp(20px,4vw,34px)}
    header{display:grid;gap:8px;border-bottom:1px solid var(--line);padding-bottom:18px}.brand{font-weight:900;letter-spacing:.02em}.eyebrow{color:var(--teal);font-size:12px;font-weight:850;text-transform:uppercase}
    h1,h2,p{margin:0}h1{font-size:clamp(28px,5vw,44px);line-height:1}h2{font-size:clamp(22px,3vw,30px);line-height:1.08}p,li{color:var(--muted);line-height:1.55}
    dl{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:0}dl div{border:1px solid var(--line);border-radius:8px;padding:13px}dt{color:var(--muted);font-size:12px;font-weight:820;text-transform:uppercase}dd{margin:5px 0 0;font-weight:800}
    ul{margin:0;padding-left:20px}.footer{border-top:1px solid var(--line);padding-top:16px;color:var(--muted);font-size:13px}
    @media(max-width:640px){dl{grid-template-columns:1fr}}
  </style>
</head>
<body>
  <main>
    <article class="card">
      <header>
        <div class="brand">CREATIVE MK</div>
        <span class="eyebrow">Private session receipt</span>
        <h1>${htmlEscape(title)}</h1>
        <p>Report ID: ${htmlEscape(reportId)}</p>
      </header>
      ${body}
      <p class="footer">This private receipt is scoped to the current concierge session. CREATIVE MK stores the operational record in Cloudflare D1.</p>
    </article>
  </main>
</body>
</html>`;
    const headers = corsHeaders(request, this.env);
    headers.set("Content-Type", "text/html; charset=utf-8");
    headers.set("Cache-Control", "private, no-store");
    headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'; form-action 'none'");
    return new Response(html, { status: 200, headers });
  }

  private async handleReport(request: Request): Promise<Response> {
    const parts = new URL(request.url).pathname.split("/").filter(Boolean);
    const reportId = clean(parts[4], 80);
    if (!reportId) return json({ error: "Missing report id" }, request, this.env, 400);
    if (!this.env.ANALYTICS_DB) return json({ error: "Reports unavailable" }, request, this.env, 503);

    const sessionHash = await sessionHashFromRequest(request);
    const brief = await this.env.ANALYTICS_DB.prepare(
      `SELECT id, lead_id, summary, notes, budget, timeline, service_slug, artifact_r2_key, created_at
       FROM lead_briefs
       WHERE id = ? AND session_hash = ?`
    )
      .bind(reportId, sessionHash)
      .first<Record<string, unknown>>();

    const audit = brief
      ? null
      : await this.env.ANALYTICS_DB.prepare(
          `SELECT id, lead_id, title, h1, clarity_score, conversion_score, findings_json, report_r2_key, created_at
           FROM lead_audits
           WHERE id = ? AND session_hash = ?`
        )
          .bind(reportId, sessionHash)
          .first<Record<string, unknown>>();

    const record = brief || audit;
    if (!record) return json({ error: "Report not found" }, request, this.env, 404);
    const reportType = brief ? "brief" : "audit";

    if (!wantsJson(request)) {
      return this.reportHtmlResponse(request, reportId, reportType, record);
    }

    const key = clean(record.artifact_r2_key || record.report_r2_key, 500);
    if (key && this.env.REPORTS_BUCKET) {
      const object = await this.env.REPORTS_BUCKET.get(key);
      if (object) {
        const headers = corsHeaders(request, this.env);
        headers.set("Content-Type", "application/json; charset=utf-8");
        headers.set("Cache-Control", "private, max-age=60");
        return new Response(await object.text(), { headers });
      }
    }

    return json({ reportId, type: reportType, record }, request, this.env);
  }

  private async handleEvents(request: Request): Promise<Response> {
    const body = await safeJson(request);
    const lang = langFrom(body.lang);
    const state = normalizeState(this.state);
    const eventType = clean(body.eventType || body.type, 80) || "unknown";

    if (!/^(page-view|open|close|quick|chat|audit-url|brief|form-click|capture-open|capture-submit|lead-capture|consent|error|state)$/.test(eventType)) {
      return json({ error: "Unknown event type" }, request, this.env, 400);
    }

    if (state.events >= LIMITS.maxEvents) {
      return json({ accepted: false, reason: "event-limit" }, request, this.env, 429);
    }

    const nextState = { ...state, events: state.events + 1 };
    this.setState(nextState);
    const result = await logAnalyticsEvent(this.env, request, nextState, eventType, lang, body.metadata);
    return json(
      {
        ...result,
        diagnostic: nextState.diagnostic || buildDiagnostic(nextState, lang),
        limits: { maxEvents: LIMITS.maxEvents }
      },
      request,
      this.env
    );
  }
}

async function adminAuthorized(request: Request, env: Env): Promise<boolean> {
  if (
    env.TRUST_CF_ACCESS === "true" &&
    request.headers.get("Cf-Access-Authenticated-User-Email") &&
    request.headers.get("Cf-Access-Jwt-Assertion")
  ) {
    return true;
  }
  if (!env.ADMIN_TOKEN) return false;

  const authorization = request.headers.get("Authorization") || "";
  const bearer = authorization.replace(/^Bearer\s+/i, "").trim();
  const header = request.headers.get("x-admin-token") || "";
  const token = bearer || header;
  return token ? timingSafeEqual(token, env.ADMIN_TOKEN) : false;
}

function csvEscape(value: unknown): string {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function aggregateJsonArrayCounts(rows: Record<string, unknown>[], field: string, limit: number): Array<{ item: string; count: number }> {
  const counts = new Map<string, number>();
  for (const row of rows) {
    try {
      const values = JSON.parse(String(row[field] || "[]"));
      if (!Array.isArray(values)) continue;
      for (const value of values) {
        const key = clean(value, 120);
        if (!key) continue;
        counts.set(key, (counts.get(key) || 0) + 1);
      }
    } catch {
      // Ignore malformed historical rows.
    }
  }

  return Array.from(counts.entries())
    .map(([item, count]) => ({ item, count }))
    .sort((a, b) => b.count - a.count || a.item.localeCompare(b.item))
    .slice(0, limit);
}

function rowString(row: Record<string, unknown>, field: string, fallback = ""): string {
  return clean(row[field] ?? fallback, 180);
}

function rowNumber(row: Record<string, unknown>, field: string): number {
  const value = Number(row[field] || 0);
  return Number.isFinite(value) ? value : 0;
}

function titleFromSlug(value: string): string {
  const cleaned = clean(value || "unknown", 100);
  return cleaned
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function adminServiceLabel(slug: string): string {
  const service = findBySlug(SERVICE_MAP, slug);
  return service ? service.en : titleFromSlug(slug || "unknown");
}

function priorityFor(count: number, score = 0): "high" | "medium" | "low" {
  if (score >= 75 || count >= 5) return "high";
  if (score >= 55 || count >= 2) return "medium";
  return "low";
}

function buildContentOfferLab(input: {
  services: Record<string, unknown>[];
  budgets: Record<string, unknown>[];
  timelines: Record<string, unknown>[];
  blockers: Array<{ item: string; count: number }>;
  nextActions: Record<string, unknown>[];
  pages: Record<string, unknown>[];
}): Record<string, unknown> {
  const services = input.services
    .map((row) => {
      const slug = rowString(row, "service", "unknown");
      return {
        slug,
        label: adminServiceLabel(slug),
        count: rowNumber(row, "count"),
        avgScore: rowNumber(row, "avg_score")
      };
    })
    .filter((row) => row.count > 0 && row.slug !== "unknown");

  const budgets = input.budgets
    .map((row) => ({ slug: rowString(row, "budget", "unknown"), count: rowNumber(row, "count") }))
    .filter((row) => row.count > 0);
  const timelines = input.timelines
    .map((row) => ({ slug: rowString(row, "timeline", "unknown"), count: rowNumber(row, "count") }))
    .filter((row) => row.count > 0);
  const pages = input.pages
    .map((row) => ({
      page: rowString(row, "page", "unknown"),
      views: rowNumber(row, "views"),
      opens: rowNumber(row, "opens"),
      chats: rowNumber(row, "chats"),
      leads: rowNumber(row, "leads")
    }))
    .filter((row) => row.page !== "unknown");

  const topService = services[0];
  const topBudget = budgets[0];
  const topTimeline = timelines[0];
  const topBlocker = input.blockers[0];
  const topNextAction = input.nextActions[0];
  const pageGap = pages
    .map((page) => {
      const actionRate = page.views ? (page.opens + page.chats + page.leads) / page.views : 0;
      return { ...page, actionRate };
    })
    .sort((a, b) => b.views - a.views || a.actionRate - b.actionRate)[0];

  const contentIdeas: Array<Record<string, unknown>> = [];
  const offerOpportunities: Array<Record<string, unknown>> = [];
  const faqIdeas: Array<Record<string, unknown>> = [];

  if (topService) {
    contentIdeas.push({
      title: `${topService.label} decision guide`,
      angle: `Create a practical guide that explains when ${topService.label} is the right move, what CREATIVE MK needs to start, and what the first 30 days look like.`,
      signal: `${topService.count} service signals, average score ${topService.avgScore || 0}`,
      priority: priorityFor(topService.count, topService.avgScore)
    });
    faqIdeas.push({
      question: `How much should a serious ${topService.label} project include before launch?`,
      sourceSignal: `Top requested service: ${topService.label}`,
      priority: priorityFor(topService.count, topService.avgScore)
    });
  }

  if (topBlocker) {
    contentIdeas.push({
      title: `Objection handler: ${titleFromSlug(topBlocker.item)}`,
      angle: "Turn the repeated blocker into a short proof-led section on the site, with examples, expectations, and a clear next step.",
      signal: `${topBlocker.count} repeated blocker signals`,
      priority: priorityFor(topBlocker.count)
    });
    faqIdeas.push({
      question: `What happens if my ${topBlocker.item} is not clear yet?`,
      sourceSignal: `${topBlocker.count} blocker signals`,
      priority: priorityFor(topBlocker.count)
    });
  }

  if (pageGap && pageGap.views > 0) {
    const actionRate = Math.round(pageGap.actionRate * 100);
    contentIdeas.push({
      title: `Upgrade the CTA path on ${pageGap.page}`,
      angle: "Add a contextual Ask MK prompt and one service-specific proof point near the section visitors already see.",
      signal: `${pageGap.views} views with ${actionRate}% chat/open/lead action rate`,
      priority: pageGap.views >= 10 && actionRate < 8 ? "high" : "medium"
    });
  }

  if (topBudget?.slug === "not-sure" || topBlocker?.item.toLowerCase().includes("budget")) {
    offerOpportunities.push({
      title: "Paid diagnostic starter",
      offer: "A fixed-scope Growth System Diagnostic that clarifies budget, roadmap, and first sprint before a larger build.",
      trigger: topBudget ? `${topBudget.count} budget-not-sure signals` : "budget uncertainty blocker",
      priority: priorityFor(topBudget?.count || topBlocker?.count || 1)
    });
  }

  if (topTimeline && ["asap", "2-4-weeks"].includes(topTimeline.slug)) {
    offerOpportunities.push({
      title: "Rapid launch sprint",
      offer: "A 2-4 week package for landing page, tracking, lead capture, and one automation handoff.",
      trigger: `${topTimeline.count} short-timeline signals`,
      priority: priorityFor(topTimeline.count)
    });
  }

  if (topService) {
    const support = supportSlugsFor(topService.slug).map(adminServiceLabel);
    offerOpportunities.push({
      title: `${topService.label} system bundle`,
      offer: `Bundle ${topService.label} with ${support.join(" + ")} so high-intent leads see a complete growth system instead of a single deliverable.`,
      trigger: `Top service demand: ${topService.label}`,
      priority: priorityFor(topService.count, topService.avgScore)
    });
  }

  if (topTimeline) {
    faqIdeas.push({
      question: `What can CREATIVE MK realistically launch in ${titleFromSlug(topTimeline.slug)}?`,
      sourceSignal: `${topTimeline.count} timeline signals`,
      priority: priorityFor(topTimeline.count)
    });
  }

  if (topNextAction) {
    faqIdeas.push({
      question: `What does "${rowString(topNextAction, "next_best_action")}" mean for my project?`,
      sourceSignal: `${rowNumber(topNextAction, "count")} next-action signals`,
      priority: priorityFor(rowNumber(topNextAction, "count"))
    });
  }

  if (!contentIdeas.length) {
    contentIdeas.push({
      title: "First 10 conversations playbook",
      angle: "Use the concierge to collect goal, service, budget, timeline, and blocker signals, then revisit this lab once real visitor patterns appear.",
      signal: "Waiting for enough D1 events",
      priority: "low"
    });
  }

  return {
    summary: {
      topService: topService?.label || "No service signal yet",
      topBudget: titleFromSlug(topBudget?.slug || "unknown"),
      topTimeline: titleFromSlug(topTimeline?.slug || "unknown"),
      topBlocker: topBlocker?.item || "No blocker signal yet",
      source: "D1 lead intelligence, no extra AI calls"
    },
    contentIdeas: contentIdeas.slice(0, 4),
    offerOpportunities: offerOpportunities.slice(0, 4),
    faqIdeas: faqIdeas.slice(0, 5)
  };
}

const KNOWLEDGE_GAP_TOPICS = [
  {
    key: "case-studies",
    label: "Case Studies And Proof",
    keywords: ["case", "portfolio", "example", "examples", "proof", "testimonial", "results", "caso", "portafolio", "ejemplo", "resultado"],
    action: "Add short proof blocks and a knowledge doc that explains CREATIVE MK project examples without promising guaranteed outcomes."
  },
  {
    key: "process",
    label: "Delivery Process",
    keywords: ["process", "steps", "timeline", "delivery", "milestone", "revision", "proceso", "pasos", "entrega", "revision"],
    action: "Create a process FAQ covering discovery, first sprint, review cycles, launch and follow-up."
  },
  {
    key: "pricing",
    label: "Pricing And Scope",
    keywords: ["price", "pricing", "budget", "cost", "quote", "scope", "presupuesto", "precio", "cotizacion", "costo", "alcance"],
    action: "Expand budget guidance with ranges, what changes scope, and when to start with a diagnostic."
  },
  {
    key: "integrations",
    label: "Integrations And Automation",
    keywords: ["crm", "whatsapp", "zapier", "hubspot", "mailchimp", "integration", "integracion", "automatizar", "automation", "api"],
    action: "Add integration guidance for CRM, forms, WhatsApp, email follow-up and analytics handoff."
  },
  {
    key: "seo-local",
    label: "SEO And Local Visibility",
    keywords: ["seo", "google", "local", "maps", "search", "ranking", "busqueda", "posicionamiento"],
    action: "Add a local SEO and visibility FAQ connected to web design and landing page recommendations."
  },
  {
    key: "support",
    label: "Support After Launch",
    keywords: ["support", "maintenance", "hosting", "updates", "bugs", "soporte", "mantenimiento", "actualizaciones", "hosting"],
    action: "Create post-launch support guidance: what is included, what is optional, and how follow-up works."
  },
  {
    key: "ai-privacy",
    label: "AI Privacy And Trust",
    keywords: ["privacy", "data", "security", "ai", "chatbot", "agent", "privacidad", "datos", "seguridad", "ia", "agente"],
    action: "Add a privacy-first AI automation explainer with human handoff, data minimization and consent boundaries."
  },
  {
    key: "ecommerce-booking",
    label: "Ecommerce Or Booking",
    keywords: ["shop", "store", "ecommerce", "booking", "appointment", "calendar", "tienda", "ecommerce", "reserva", "cita", "calendario"],
    action: "Add qualification guidance for ecommerce, booking and appointment flows."
  }
] as const;

function knowledgeCoverageFor(topic: { keywords: readonly string[] }): {
  docs: number;
  titles: string[];
  score: number;
} {
  const matches = KNOWLEDGE_DOCS.filter((doc) => {
    const haystack = `${doc.title} ${doc.keywords.join(" ")} ${doc.content}`.toLowerCase();
    return topic.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
  });
  const score = Math.min(100, matches.length * 34);
  return {
    docs: matches.length,
    titles: matches.map((doc) => doc.title).slice(0, 3),
    score
  };
}

function signalTextFromRows(rows: Record<string, unknown>[]): string {
  return rows
    .map((row) => [
      rowString(row, "conversation_summary", ""),
      rowString(row, "goal", ""),
      rowString(row, "offer", ""),
      rowString(row, "audience", ""),
      rowString(row, "business_type", ""),
      rowString(row, "next_best_action", ""),
      rowString(row, "primary_service", ""),
      rowString(row, "budget_slug", ""),
      rowString(row, "timeline_slug", "")
    ].join(" "))
    .join(" ")
    .toLowerCase();
}

function topicSignalCount(topic: { keywords: readonly string[] }, text: string, blockers: Array<{ item: string; count: number }>, nextActions: Record<string, unknown>[]): number {
  let count = 0;
  for (const keyword of topic.keywords) {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const matches = text.match(new RegExp(`\\b${escaped}\\b`, "gi"));
    count += matches ? matches.length : 0;
  }
  for (const blocker of blockers) {
    const blockerText = blocker.item.toLowerCase();
    if (topic.keywords.some((keyword) => blockerText.includes(keyword.toLowerCase()))) count += blocker.count;
  }
  for (const action of nextActions) {
    const actionText = rowString(action, "next_best_action").toLowerCase();
    if (topic.keywords.some((keyword) => actionText.includes(keyword.toLowerCase()))) count += rowNumber(action, "count");
  }
  return count;
}

function buildKnowledgeGapRadar(input: {
  services: Record<string, unknown>[];
  blockers: Array<{ item: string; count: number }>;
  nextActions: Record<string, unknown>[];
  signalRows: Record<string, unknown>[];
  cloudflareServices: Record<string, ServiceStatusItem>;
}): Record<string, unknown> {
  const signalText = signalTextFromRows(input.signalRows);
  const gaps = KNOWLEDGE_GAP_TOPICS.map((topic) => {
    const signalCount = topicSignalCount(topic, signalText, input.blockers, input.nextActions);
    const coverage = knowledgeCoverageFor(topic);
    const gapScore = Math.max(0, signalCount * 18 + (100 - coverage.score));
    return {
      key: topic.key,
      label: topic.label,
      signalCount,
      coverageScore: coverage.score,
      coveredBy: coverage.titles,
      priority: priorityFor(signalCount, gapScore),
      action: topic.action,
      recommendedDoc: `${topic.label} FAQ`,
      gapScore
    };
  })
    .filter((gap) => gap.signalCount > 0 || gap.coverageScore < 70)
    .sort((a, b) => b.gapScore - a.gapScore || b.signalCount - a.signalCount)
    .slice(0, 8);

  const topService = input.services
    .map((row) => ({
      slug: rowString(row, "service", "unknown"),
      label: adminServiceLabel(rowString(row, "service", "unknown")),
      count: rowNumber(row, "count"),
      avgScore: rowNumber(row, "avg_score")
    }))
    .filter((row) => row.slug !== "unknown")[0];
  const docsByService = KNOWLEDGE_DOCS.reduce<Record<string, number>>((acc, doc) => {
    acc[doc.serviceSlug] = (acc[doc.serviceSlug] || 0) + 1;
    return acc;
  }, {});
  const serviceCoverage = SERVICE_MAP.map((service) => ({
    service: service.slug,
    label: service.en,
    docs: docsByService[service.slug] || 0,
    activeDemand: topService?.slug === service.slug ? topService.count : rowNumber(input.services.find((row) => rowString(row, "service") === service.slug) || {}, "count")
  }))
    .sort((a, b) => b.activeDemand - a.activeDemand || a.docs - b.docs)
    .slice(0, 8);

  const actions = gaps.slice(0, 4).map((gap) => ({
    priority: gap.priority,
    title: `Create ${gap.recommendedDoc}`,
    detail: gap.action,
    sourceSignal: `${gap.signalCount} signal${gap.signalCount === 1 ? "" : "s"} / ${gap.coverageScore}% corpus coverage`
  }));
  if (!actions.length) {
    actions.push({
      priority: "low",
      title: "Keep collecting questions",
      detail: "The corpus is ready; stronger recommendations will appear after more redacted visitor summaries enter D1.",
      sourceSignal: "Waiting for more D1 knowledge signal"
    });
  }

  const suggestedAiSearchDocs = gaps.slice(0, 5).map((gap) => ({
    title: gap.recommendedDoc,
    outline: [
      `When ${gap.label.toLowerCase()} matters`,
      "What CREATIVE MK recommends first",
      "What affects budget, timeline or risk",
      "What the visitor should prepare before contacting"
    ],
    priority: gap.priority
  }));

  return {
    source: "Cloudflare D1 redacted conversations, local knowledge corpus and AI Search readiness",
    summary: {
      knowledgeVersion: KNOWLEDGE_VERSION,
      localDocs: KNOWLEDGE_DOCS.length,
      signalRows: input.signalRows.length,
      detectedGaps: gaps.length,
      topGap: gaps[0]?.label || "No gap detected yet",
      aiSearchMode: input.cloudflareServices.aiSearch?.enabled ? "managed-ai-search" : "local-corpus",
      topService: topService?.label || "No service demand yet"
    },
    gaps,
    serviceCoverage,
    actions,
    suggestedAiSearchDocs,
    guardrails: [
      "Use redacted summaries only; do not store raw anonymous transcripts.",
      "Add new knowledge locally first, then crawl with AI Search when enabled.",
      "Keep pricing guidance directional and avoid guaranteed results.",
      "Prefer bilingual FAQ entries for EN/ES visitor demand."
    ]
  };
}

function percentPart(value: unknown, total: number): number {
  if (!total) return 0;
  return Math.round((Number(value || 0) / total) * 1000) / 10;
}

function buildLeadIntelligenceSnapshot(input: {
  funnelGaps?: Record<string, unknown> | null;
  profileQuality?: Record<string, unknown> | null;
  recentInsights: Record<string, unknown>[];
}): Record<string, unknown> {
  const gaps = input.funnelGaps || {};
  const quality = input.profileQuality || {};
  const totalProfiles = Number(quality.total_profiles || 0);
  const hotAnonymous = Number(gaps.hot_anonymous || 0);
  const auditNoLead = Number(gaps.audit_no_lead || 0);
  const briefNoLead = Number(gaps.brief_no_lead || 0);
  const captureOpenNoSubmit = Number(gaps.capture_open_no_submit || 0);

  const advice: Array<{ priority: string; title: string; action: string }> = [];
  if (hotAnonymous > 0) {
    advice.push({
      priority: "hot",
      title: "Recover high-intent anonymous sessions",
      action: "Review the latest insights and tighten the save-diagnostic prompt for visitors above 70 score."
    });
  }
  if (auditNoLead > 0) {
    advice.push({
      priority: "medium",
      title: "Turn audits into consult requests",
      action: "Add a stronger post-audit CTA: save the audit so CREATIVE MK can send a sharper review."
    });
  }
  if (briefNoLead > 0) {
    advice.push({
      priority: "medium",
      title: "Close the brief handoff gap",
      action: "When a brief is generated, make the form handoff feel like a saved strategy, not a generic contact form."
    });
  }
  if (captureOpenNoSubmit > 0) {
    advice.push({
      priority: "medium",
      title: "Reduce capture friction",
      action: "Keep capture fields minimal and delay phone/company until after the first response."
    });
  }
  if (!advice.length) {
    advice.push({
      priority: "low",
      title: "Build the first signal set",
      action: "Drive visitors to the Growth Diagnostic and Website Audit prompts until at least 10 sessions are recorded."
    });
  }

  return {
    funnelGaps: {
      hotAnonymous,
      auditNoLead,
      briefNoLead,
      captureOpenNoSubmit
    },
    profileCompleteness: {
      totalProfiles,
      goal: percentPart(quality.with_goal, totalProfiles),
      business: percentPart(quality.with_business, totalProfiles),
      offer: percentPart(quality.with_offer, totalProfiles),
      budget: percentPart(quality.with_budget, totalProfiles),
      timeline: percentPart(quality.with_timeline, totalProfiles),
      service: percentPart(quality.with_service, totalProfiles)
    },
    recentInsights: input.recentInsights.map((row) => ({
      lastSeenAt: row.last_seen_at,
      language: row.language,
      status: row.status,
      captured: Number(row.captured || 0) > 0,
      leadScore: Number(row.lead_score || 0),
      primaryService: row.primary_service || "unknown",
      budget: row.budget_slug || "unknown",
      timeline: row.timeline_slug || "unknown",
      nextBestAction: row.next_best_action || "",
      summary: clean(row.conversation_summary, 420)
    })),
    advice
  };
}

function auditPriority(clarity: number, conversion: number, captured: boolean): "high" | "medium" | "low" {
  if (!captured && (clarity < 55 || conversion < 55)) return "high";
  if (!captured || clarity < 70 || conversion < 70) return "medium";
  return "low";
}

function buildAuditLab(input: {
  stats?: Record<string, unknown> | null;
  recentAudits: Record<string, unknown>[];
  serviceRows: Record<string, unknown>[];
  findingPatterns: Array<{ item: string; count: number }>;
  cloudflareServices: Record<string, ServiceStatusItem>;
}): Record<string, unknown> {
  const stats = input.stats || {};
  const totalAudits = rowNumber(stats, "total_audits");
  const capturedAudits = rowNumber(stats, "captured_audits");
  const avgClarity = rowNumber(stats, "avg_clarity");
  const avgConversion = rowNumber(stats, "avg_conversion");
  const lowScoreAudits = rowNumber(stats, "low_score_audits");
  const recent7d = rowNumber(stats, "recent_7d");
  const archivedReports = rowNumber(stats, "archived_reports");
  const captureRate = percentPart(capturedAudits, totalAudits);
  const leakage = Math.max(0, totalAudits - capturedAudits);
  const topFinding = input.findingPatterns[0];
  const topService = input.serviceRows
    .map((row) => ({
      service: rowString(row, "service", "unknown"),
      label: adminServiceLabel(rowString(row, "service", "unknown")),
      audits: rowNumber(row, "audits"),
      leads: rowNumber(row, "leads"),
      avgClarity: rowNumber(row, "avg_clarity"),
      avgConversion: rowNumber(row, "avg_conversion")
    }))
    .filter((row) => row.service !== "unknown" || row.audits > 0)[0];

  let posture = "Waiting for audit signal";
  if (totalAudits > 0 && avgConversion < 55) posture = "Conversion drag detected";
  else if (totalAudits > 0 && captureRate < 35) posture = "Lead magnet leakage";
  else if (totalAudits > 0 && lowScoreAudits > 0) posture = "Audit quality gaps";
  else if (totalAudits > 0) posture = "Useful audit magnet";

  const actions: Array<{ priority: string; title: string; detail: string }> = [];
  if (!totalAudits) {
    actions.push({
      priority: "medium",
      title: "Drive the first audit cohort",
      detail: "Place the Website Audit prompt near service sections where visitors already show intent."
    });
  }
  if (leakage > 0) {
    actions.push({
      priority: leakage >= 3 || captureRate < 35 ? "high" : "medium",
      title: "Close audit-to-lead leakage",
      detail: `${leakage} audit${leakage === 1 ? "" : "s"} did not become captured leads. Make saving the audit feel like a premium review handoff.`
    });
  }
  if (lowScoreAudits > 0) {
    actions.push({
      priority: lowScoreAudits >= 3 ? "high" : "medium",
      title: "Productize the common fixes",
      detail: `${lowScoreAudits} audit${lowScoreAudits === 1 ? "" : "s"} show low clarity or conversion. Turn the repeated fixes into a clear audit follow-up package.`
    });
  }
  if (topFinding) {
    actions.push({
      priority: priorityFor(topFinding.count),
      title: `Address "${topFinding.item}"`,
      detail: `${topFinding.count} audit finding${topFinding.count === 1 ? "" : "s"} mention this. Add proof, CTA or copy guidance around it.`
    });
  }
  if (topService) {
    actions.push({
      priority: priorityFor(topService.audits, Math.max(topService.avgClarity, topService.avgConversion)),
      title: `Package audits into ${topService.label}`,
      detail: `${topService.audits} audit signal${topService.audits === 1 ? "" : "s"} point to this service path.`
    });
  }
  if (!input.cloudflareServices.r2?.enabled && totalAudits > 0) {
    actions.push({
      priority: "low",
      title: "Archive premium reports in R2",
      detail: "R2 is still standby, so audit artifacts remain served from D1 until the bucket is enabled."
    });
  }

  const recentAudits = input.recentAudits.map((row) => {
    const clarity = rowNumber(row, "clarity_score");
    const conversion = rowNumber(row, "conversion_score");
    const captured = Boolean(rowString(row, "captured_lead_id"));
    const findings = parseJsonArray(row.findings_json).map((item) => clean(item, 120)).filter(Boolean);
    return {
      id: rowString(row, "id"),
      leadId: rowString(row, "captured_lead_id"),
      leadName: rowString(row, "lead_name", captured ? "Captured lead" : "Anonymous audit"),
      leadStatus: rowString(row, "lead_status", captured ? "captured" : "anonymous"),
      title: rowString(row, "title", "Untitled audit"),
      h1: rowString(row, "h1"),
      service: rowString(row, "primary_service", "unknown"),
      serviceLabel: adminServiceLabel(rowString(row, "primary_service", "unknown")),
      leadScore: rowNumber(row, "lead_score"),
      clarityScore: clarity,
      conversionScore: conversion,
      captured,
      archived: Boolean(rowString(row, "report_r2_key")),
      findings: findings.slice(0, 3),
      priority: auditPriority(clarity, conversion, captured),
      createdAt: rowString(row, "created_at")
    };
  });

  return {
    window: "All audits with recent detail",
    posture,
    summary: {
      totalAudits,
      auditedSessions: rowNumber(stats, "audited_sessions"),
      capturedAudits,
      captureRate,
      avgClarity,
      avgConversion,
      lowScoreAudits,
      recent7d,
      archivedReports,
      browserRunMode: input.cloudflareServices.browserRun?.enabled ? "rendered-audits" : "html-audit",
      r2Mode: input.cloudflareServices.r2?.enabled ? "r2-archive" : "d1-receipts"
    },
    serviceBreakdown: input.serviceRows.map((row) => ({
      service: rowString(row, "service", "unknown"),
      label: adminServiceLabel(rowString(row, "service", "unknown")),
      audits: rowNumber(row, "audits"),
      leads: rowNumber(row, "leads"),
      avgClarity: rowNumber(row, "avg_clarity"),
      avgConversion: rowNumber(row, "avg_conversion")
    })),
    findingPatterns: input.findingPatterns,
    recentAudits,
    actions: actions.slice(0, 5)
  };
}

function buildExecutiveDigest(input: {
  metrics: Record<string, unknown>;
  services: Record<string, unknown>[];
  events: Record<string, unknown>[];
  pages: Record<string, unknown>[];
  attribution: {
    sources: Record<string, unknown>[];
    campaigns: Record<string, unknown>[];
    referrers: Record<string, unknown>[];
  };
  leadSnapshot: Record<string, unknown>;
  rollups: Record<string, unknown>[];
}): Record<string, unknown> {
  const leads = rowNumber(input.metrics, "leads");
  const sessions = rowNumber(input.metrics, "sessions");
  const chats = rowNumber(input.metrics, "chats");
  const audits = rowNumber(input.metrics, "audits");
  const briefs = rowNumber(input.metrics, "briefs");
  const hotLeads = rowNumber(input.metrics, "hot_leads");
  const openTasks = rowNumber(input.metrics, "open_tasks");
  const overdueTasks = rowNumber(input.metrics, "overdue_tasks");
  const conversionRate = sessions ? Math.round((leads / sessions) * 1000) / 10 : 0;
  const topService = input.services[0];
  const topSource = input.attribution.sources[0];
  const gaps = (input.leadSnapshot.funnelGaps || {}) as Record<string, unknown>;
  const hotAnonymous = Number(gaps.hotAnonymous || 0);
  const auditNoLead = Number(gaps.auditNoLead || 0);
  const briefNoLead = Number(gaps.briefNoLead || 0);
  const captureOpenNoSubmit = Number(gaps.captureOpenNoSubmit || 0);
  const yesterday = input.rollups[1] || null;

  const risks: Array<{ priority: string; title: string; detail: string }> = [];
  if (overdueTasks > 0) {
    risks.push({
      priority: "high",
      title: "Follow-up debt",
      detail: `${overdueTasks} open follow-up task${overdueTasks === 1 ? "" : "s"} are overdue.`
    });
  }
  if (hotAnonymous > 0) {
    risks.push({
      priority: "high",
      title: "Hot anonymous demand",
      detail: `${hotAnonymous} high-intent session${hotAnonymous === 1 ? "" : "s"} did not become leads yet.`
    });
  }
  if (captureOpenNoSubmit > 0) {
    risks.push({
      priority: "medium",
      title: "Capture friction",
      detail: `${captureOpenNoSubmit} visitor${captureOpenNoSubmit === 1 ? "" : "s"} opened capture but did not submit.`
    });
  }
  if (auditNoLead || briefNoLead) {
    risks.push({
      priority: "medium",
      title: "Lead magnet leakage",
      detail: `${auditNoLead} audit and ${briefNoLead} brief session${auditNoLead + briefNoLead === 1 ? "" : "s"} did not convert.`
    });
  }
  if (!risks.length) {
    risks.push({
      priority: "low",
      title: "No critical leakage detected",
      detail: "Keep driving traffic into the diagnostic until stronger patterns appear."
    });
  }

  const actions: Array<{ priority: string; action: string; why: string }> = [];
  if (openTasks > 0) {
    actions.push({
      priority: overdueTasks > 0 ? "high" : "medium",
      action: "Clear the Follow-up Command Center",
      why: `${openTasks} open task${openTasks === 1 ? "" : "s"} can turn saved diagnostics into conversations.`
    });
  }
  if (topService) {
    actions.push({
      priority: priorityFor(rowNumber(topService, "count"), rowNumber(topService, "avg_score")),
      action: `Feature ${adminServiceLabel(rowString(topService, "service"))} in the next CTA`,
      why: `${rowNumber(topService, "count")} service signal${rowNumber(topService, "count") === 1 ? "" : "s"} point there.`
    });
  }
  if (topSource) {
    actions.push({
      priority: rowNumber(topSource, "leads") > 0 ? "high" : "low",
      action: `Watch ${titleFromSlug(rowString(topSource, "source", "direct"))} traffic`,
      why: `${rowNumber(topSource, "sessions")} session${rowNumber(topSource, "sessions") === 1 ? "" : "s"} and ${rowNumber(topSource, "leads")} lead${rowNumber(topSource, "leads") === 1 ? "" : "s"} in the last 30 days.`
    });
  }
  if (!actions.length) {
    actions.push({
      priority: "low",
      action: "Collect the first 10 diagnostics",
      why: "The system needs more visitor signals before recommending aggressive changes."
    });
  }

  const headline = leads > 0
    ? `${leads} captured lead${leads === 1 ? "" : "s"} from ${sessions} session${sessions === 1 ? "" : "s"} at ${conversionRate}% conversion.`
    : `${sessions} session${sessions === 1 ? "" : "s"} recorded and no captured leads yet. Focus today on pushing visitors into diagnostic and save-diagnostic flows.`;

  return {
    generatedAt: new Date().toISOString(),
    headline,
    kpis: [
      { label: "Sessions", value: sessions, note: "All tracked concierge sessions" },
      { label: "Leads", value: leads, note: `${conversionRate}% conversion` },
      { label: "Chats", value: chats, note: "Chat events" },
      { label: "Audits", value: audits, note: "Website audits" },
      { label: "Briefs", value: briefs, note: "Generated briefs" },
      { label: "Hot", value: hotLeads, note: "Score 75+" }
    ],
    momentum: {
      previousDay: yesterday?.day || null,
      previousLeads: Number(yesterday?.leads || 0),
      previousChats: Number(yesterday?.chats || 0),
      previousAudits: Number(yesterday?.audits || 0)
    },
    risks: risks.slice(0, 4),
    actions: actions.slice(0, 4)
  };
}

function buildPipelineSnapshot(input: {
  stats?: Record<string, unknown> | null;
  leadSnapshot: Record<string, unknown>;
}): Record<string, unknown> {
  const stats = input.stats || {};
  const stages = [
    {
      key: "sessions",
      label: "Sessions",
      count: rowNumber(stats, "sessions"),
      note: "Visitors tracked by the concierge"
    },
    {
      key: "engaged",
      label: "Engaged",
      count: rowNumber(stats, "engaged"),
      note: "Opened chat or sent a message"
    },
    {
      key: "diagnosed",
      label: "Diagnosed",
      count: rowNumber(stats, "diagnosed"),
      note: "Received a service recommendation"
    },
    {
      key: "audited",
      label: "Audited",
      count: rowNumber(stats, "audited"),
      note: "Ran a website audit"
    },
    {
      key: "briefed",
      label: "Briefed",
      count: rowNumber(stats, "briefed"),
      note: "Generated a project brief"
    },
    {
      key: "captured",
      label: "Captured",
      count: rowNumber(stats, "captured"),
      note: "Saved lead with consent"
    },
    {
      key: "contacted",
      label: "Contacted+",
      count: rowNumber(stats, "contacted"),
      note: "Moved past new status"
    }
  ];

  const enrichedStages = stages.map((stage, index) => {
    const previous = index === 0 ? stage.count : stages[index - 1].count;
    const fromPrevious = index === 0 ? 100 : percentPart(stage.count, previous);
    const fromStart = percentPart(stage.count, stages[0].count);
    return {
      ...stage,
      fromPrevious,
      fromStart,
      dropFromPrevious: index === 0 ? 0 : Math.max(0, previous - stage.count)
    };
  });

  const transitions = enrichedStages.slice(1).map((stage, index) => ({
    from: enrichedStages[index].label,
    to: stage.label,
    drop: stage.dropFromPrevious,
    rate: stage.fromPrevious
  }));
  const biggestDrop = transitions.reduce((best, item) => (item.drop > best.drop ? item : best), transitions[0] || {
    from: "Sessions",
    to: "Engaged",
    drop: 0,
    rate: 0
  });

  const gaps = (input.leadSnapshot.funnelGaps || {}) as Record<string, unknown>;
  const actions: Array<{ priority: string; title: string; detail: string }> = [];
  if (rowNumber(stats, "sessions") > 0 && rowNumber(stats, "engaged") === 0) {
    actions.push({
      priority: "high",
      title: "Increase chat entry points",
      detail: "Sessions exist but no visitor has engaged; keep Ask MK visible near high-intent service sections."
    });
  }
  if (rowNumber(stats, "engaged") > rowNumber(stats, "diagnosed")) {
    actions.push({
      priority: "medium",
      title: "Push toward diagnosis faster",
      detail: "Use shorter prompts after the first answer so visitors reach a recommendation in fewer turns."
    });
  }
  if (Number(gaps.auditNoLead || 0) > 0 || Number(gaps.briefNoLead || 0) > 0) {
    actions.push({
      priority: "high",
      title: "Tighten save-diagnostic CTA",
      detail: "Audits or briefs are being created without lead capture; make saving the result feel like a premium review handoff."
    });
  }
  if (rowNumber(stats, "captured") > rowNumber(stats, "contacted")) {
    actions.push({
      priority: "high",
      title: "Contact captured leads",
      detail: "New captured leads should be moved to contacted after the first reply or outreach."
    });
  }
  if (!actions.length) {
    actions.push({
      priority: "low",
      title: "Collect more funnel signal",
      detail: "The Cloudflare D1 pipeline is ready; keep driving traffic into chat, audit and brief paths."
    });
  }

  return {
    window: "Last 30 days",
    overallConversion: percentPart(rowNumber(stats, "captured"), rowNumber(stats, "sessions")),
    stages: enrichedStages,
    leakage: {
      biggestDrop,
      transitions
    },
    actions: actions.slice(0, 4)
  };
}

function eventCount(rows: Record<string, unknown>[], eventType: string): number {
  const row = rows.find((item) => rowString(item, "event_type") === eventType);
  return row ? rowNumber(row, "count") : 0;
}

function buildConversionExperimentLab(input: {
  pages: Record<string, unknown>[];
  events: Record<string, unknown>[];
  services: Record<string, unknown>[];
  leadSnapshot: Record<string, unknown>;
  auditLab: Record<string, unknown>;
}): Record<string, unknown> {
  const pages = input.pages.map((row) => {
    const views = rowNumber(row, "views");
    const opens = rowNumber(row, "opens");
    const chats = rowNumber(row, "chats");
    const audits = rowNumber(row, "audits");
    const briefs = rowNumber(row, "briefs");
    const leads = rowNumber(row, "leads");
    const meaningfulActions = opens + chats + audits + briefs + leads;
    return {
      page: rowString(row, "page", "unknown"),
      views,
      opens,
      chats,
      audits,
      briefs,
      leads,
      sessions: rowNumber(row, "sessions"),
      openRate: percentPart(opens, views),
      chatRate: percentPart(chats, views),
      leadRate: percentPart(leads, views),
      actionRate: percentPart(meaningfulActions, views),
      liftPotential: Math.max(0, views - meaningfulActions)
    };
  });

  const totals = pages.reduce(
    (sum, page) => ({
      views: sum.views + page.views,
      opens: sum.opens + page.opens,
      chats: sum.chats + page.chats,
      audits: sum.audits + page.audits,
      briefs: sum.briefs + page.briefs,
      leads: sum.leads + page.leads,
      liftPotential: sum.liftPotential + page.liftPotential
    }),
    { views: 0, opens: 0, chats: 0, audits: 0, briefs: 0, leads: 0, liftPotential: 0 }
  );
  const gaps = (input.leadSnapshot.funnelGaps || {}) as Record<string, unknown>;
  const auditSummary = ((input.auditLab || {}).summary || {}) as Record<string, unknown>;
  const topPage = pages
    .filter((page) => page.page !== "unknown")
    .sort((a, b) => b.liftPotential - a.liftPotential || b.views - a.views)[0];
  const topService = input.services
    .map((row) => ({
      slug: rowString(row, "service", "unknown"),
      label: adminServiceLabel(rowString(row, "service", "unknown")),
      count: rowNumber(row, "count"),
      avgScore: rowNumber(row, "avg_score")
    }))
    .filter((row) => row.slug !== "unknown")[0];

  const captureOpen = eventCount(input.events, "capture-open");
  const captureSubmit = eventCount(input.events, "capture-submit");
  const leadCapture = eventCount(input.events, "lead-capture");
  const openRate = percentPart(totals.opens, totals.views);
  const chatToLeadRate = percentPart(leadCapture, Math.max(1, eventCount(input.events, "chat")));
  const captureCompletionRate = percentPart(captureSubmit || leadCapture, captureOpen);
  const auditCaptureRate = rowNumber(auditSummary, "captureRate");

  const experiments: Array<Record<string, unknown>> = [];
  if (totals.views > 0 && openRate < 8) {
    experiments.push({
      priority: "high",
      title: "Contextual Ask MK entry",
      hypothesis: "Visitors need a more specific chat prompt near the section they are reading, not only a global button.",
      change: topPage ? `Add a service-specific Ask MK prompt on ${topPage.page}.` : "Add a service-specific Ask MK prompt near the highest-intent service section.",
      successMetric: "Open rate from page-view to chat-open",
      target: "8-12% open rate",
      guardrail: "No auto-open; keep the widget subtle and mobile-safe.",
      sourceSignal: `${totals.views} views / ${totals.opens} opens`
    });
  }
  if (Number(gaps.auditNoLead || 0) > 0 || (totals.audits > 0 && auditCaptureRate < 35)) {
    experiments.push({
      priority: "high",
      title: "Save audit as premium review",
      hypothesis: "Audit users will share contact info when the next step feels like a saved expert review, not a generic form.",
      change: "After audit results, show a short capture prompt: save this diagnosis for CREATIVE MK to review.",
      successMetric: "Audit-to-lead capture rate",
      target: "35%+ audit capture",
      guardrail: "Ask only name/email with consent; keep URL storage privacy-safe.",
      sourceSignal: `${Number(gaps.auditNoLead || 0)} audit sessions without lead / ${auditCaptureRate}% capture`
    });
  }
  if (Number(gaps.briefNoLead || 0) > 0 || totals.briefs > totals.leads) {
    experiments.push({
      priority: "medium",
      title: "Brief handoff framing",
      hypothesis: "Brief users convert better when the handoff says their strategy is ready to review.",
      change: "Change the post-brief CTA from contact language to 'Save this project brief for review'.",
      successMetric: "Brief-to-lead capture rate",
      target: "40%+ brief capture",
      guardrail: "Do not request phone/company until after email consent.",
      sourceSignal: `${Number(gaps.briefNoLead || 0)} brief sessions without lead`
    });
  }
  if (Number(gaps.captureOpenNoSubmit || 0) > 0 || (captureOpen > 0 && captureCompletionRate < 65)) {
    experiments.push({
      priority: "medium",
      title: "Reduce capture friction",
      hypothesis: "High-intent visitors abandon when the capture step asks for too much or lacks value reinforcement.",
      change: "Keep the capture step to name, email and consent; move company/phone to optional context.",
      successMetric: "Capture-open to capture-submit rate",
      target: "65%+ completion",
      guardrail: "Turnstile remains optional until keys are configured; session limits stay active.",
      sourceSignal: `${captureOpen} capture opens / ${captureSubmit || leadCapture} submits`
    });
  }
  if (topService) {
    experiments.push({
      priority: priorityFor(topService.count, topService.avgScore),
      title: `${topService.label} CTA angle`,
      hypothesis: "The highest-demand service should get a sharper diagnostic CTA and proof point.",
      change: `Use a ${topService.label} prompt that names the likely bottleneck and invites a mini diagnosis.`,
      successMetric: "Service-specific chat starts and captured leads",
      target: "Lift service-specific chats by 20%",
      guardrail: "Keep copy bilingual and avoid overpromising results.",
      sourceSignal: `${topService.count} service signals / avg score ${topService.avgScore}`
    });
  }
  if (!experiments.length) {
    experiments.push({
      priority: "low",
      title: "Baseline measurement",
      hypothesis: "The site needs more tracked sessions before experiments can be ranked confidently.",
      change: "Keep collecting page-view, open, chat, audit, brief and lead-capture events.",
      successMetric: "At least 50 page views and 10 chat opens",
      target: "Enough signal for ranked experiments",
      guardrail: "Do not add paid services or extra tracking vendors.",
      sourceSignal: "Waiting for D1 event volume"
    });
  }

  const pageCandidates = pages
    .filter((page) => page.views > 0)
    .sort((a, b) => b.liftPotential - a.liftPotential || a.leadRate - b.leadRate)
    .slice(0, 8);

  return {
    source: "Cloudflare D1 event funnel, page funnel and lead magnet gaps",
    summary: {
      views: totals.views,
      opens: totals.opens,
      chats: totals.chats,
      audits: totals.audits,
      briefs: totals.briefs,
      leads: totals.leads,
      openRate,
      chatToLeadRate,
      captureCompletionRate,
      auditCaptureRate,
      topPage: topPage?.page || "No page signal yet",
      topService: topService?.label || "No service signal yet"
    },
    eventRates: [
      { label: "Open rate", value: openRate, detail: `${totals.opens}/${totals.views} opens from page views` },
      { label: "Chat to lead", value: chatToLeadRate, detail: `${leadCapture} leads from chat demand` },
      { label: "Capture completion", value: captureCompletionRate, detail: `${captureSubmit || leadCapture}/${captureOpen} capture submits` },
      { label: "Audit capture", value: auditCaptureRate, detail: "Lead capture after website audit" }
    ],
    experiments: experiments.slice(0, 6),
    pageCandidates,
    guardrails: [
      "Use only Cloudflare D1 events and anonymous page metadata.",
      "No auto-open chat experiments.",
      "No PII in experiment metrics.",
      "Roll back copy if capture friction or mobile overlap increases."
    ]
  };
}

function budgetMidpoint(slug: string): number {
  switch (slug) {
    case "under-1000":
      return 750;
    case "1000-3000":
      return 2000;
    case "3000-7500":
      return 5250;
    case "7500-15000":
      return 11250;
    case "15000-plus":
      return 20000;
    default:
      return 0;
  }
}

function stageProbability(status: string): number {
  switch (status) {
    case "won":
      return 1;
    case "proposal":
      return 0.7;
    case "qualified":
      return 0.5;
    case "contacted":
      return 0.3;
    case "new":
      return 0.15;
    default:
      return 0;
  }
}

function emptyForecastBucket(key: string, label: string): {
  key: string;
  label: string;
  count: number;
  gross: number;
  weighted: number;
  scoreTotal: number;
} {
  return { key, label, count: 0, gross: 0, weighted: 0, scoreTotal: 0 };
}

function buildRevenueForecast(rows: Record<string, unknown>[]): Record<string, unknown> {
  const byStage = new Map<string, ReturnType<typeof emptyForecastBucket>>();
  const byService = new Map<string, ReturnType<typeof emptyForecastBucket>>();
  let openGross = 0;
  let openWeighted = 0;
  let closedWon = 0;
  let knownBudgetLeads = 0;
  let missingBudgetLeads = 0;
  let proposalWeighted = 0;
  let newKnownValue = 0;

  for (const row of rows) {
    const status = rowString(row, "status", "new");
    const service = rowString(row, "primary_service", "unknown");
    const budget = rowString(row, "budget_slug", "unknown");
    const value = budgetMidpoint(budget);
    const score = rowNumber(row, "lead_score");
    const scoreFactor = Math.max(0.65, Math.min(1, score / 100));
    const probability = stageProbability(status);
    const weighted = Math.round(value * probability * scoreFactor);
    const isOpen = ["new", "contacted", "qualified", "proposal"].includes(status);

    if (value > 0) {
      knownBudgetLeads += 1;
      if (isOpen) {
        openGross += value;
        openWeighted += weighted;
      }
      if (status === "won") closedWon += value;
      if (status === "proposal") proposalWeighted += weighted;
      if (status === "new") newKnownValue += value;
    } else if (!["lost", "archived"].includes(status)) {
      missingBudgetLeads += 1;
    }

    const stageBucket = byStage.get(status) || emptyForecastBucket(status, titleFromSlug(status));
    stageBucket.count += 1;
    stageBucket.gross += value;
    stageBucket.weighted += weighted;
    stageBucket.scoreTotal += score;
    byStage.set(status, stageBucket);

    const serviceBucket = byService.get(service) || emptyForecastBucket(service, adminServiceLabel(service));
    serviceBucket.count += 1;
    serviceBucket.gross += value;
    serviceBucket.weighted += weighted;
    serviceBucket.scoreTotal += score;
    byService.set(service, serviceBucket);
  }

  const normalizeBuckets = (items: ReturnType<typeof emptyForecastBucket>[]) => items
    .map((item) => ({
      key: item.key,
      label: item.label,
      count: item.count,
      gross: Math.round(item.gross),
      weighted: Math.round(item.weighted),
      avgScore: item.count ? Math.round(item.scoreTotal / item.count) : 0
    }))
    .sort((a, b) => b.weighted - a.weighted || b.gross - a.gross || b.count - a.count);

  const topService = normalizeBuckets(Array.from(byService.values()))[0];
  const actions: Array<{ priority: string; title: string; detail: string }> = [];
  if (missingBudgetLeads > 0) {
    actions.push({
      priority: "high",
      title: "Close budget gaps",
      detail: `${missingBudgetLeads} open lead${missingBudgetLeads === 1 ? "" : "s"} cannot be forecast until budget is clarified.`
    });
  }
  if (proposalWeighted > 0) {
    actions.push({
      priority: "high",
      title: "Work proposal-stage opportunities",
      detail: "Proposal-stage budget signals carry the strongest weighted forecast; prioritize follow-up and scope clarity."
    });
  }
  if (newKnownValue > 0) {
    actions.push({
      priority: "medium",
      title: "Contact new budget-qualified leads",
      detail: "New leads with known budget should move into contacted status before the next daily digest."
    });
  }
  if (topService?.weighted > 0) {
    actions.push({
      priority: priorityFor(topService.count, topService.avgScore),
      title: `Package ${topService.label}`,
      detail: `${topService.label} is the strongest forecasted service signal by weighted budget.`
    });
  }
  if (!actions.length) {
    actions.push({
      priority: "low",
      title: "Build budget signal",
      detail: "Ask budget/timeline earlier in the concierge flow so the forecast can become useful."
    });
  }

  return {
    window: "Open and won leads from the last 90 days",
    methodology: "Budget midpoint x deal-stage probability x lead-score fit factor. Unknown budgets are excluded from value.",
    summary: {
      openGross: Math.round(openGross),
      openWeighted: Math.round(openWeighted),
      closedWon: Math.round(closedWon),
      knownBudgetLeads,
      missingBudgetLeads
    },
    stages: normalizeBuckets(Array.from(byStage.values())),
    services: normalizeBuckets(Array.from(byService.values())).slice(0, 6),
    actions: actions.slice(0, 4)
  };
}

function leadPlaybookPriority(row: Record<string, unknown>): "high" | "medium" | "low" {
  const score = rowNumber(row, "lead_score");
  const status = rowString(row, "status", "new");
  const overdueTasks = rowNumber(row, "overdue_tasks");
  const openTasks = rowNumber(row, "open_tasks");
  const budget = rowString(row, "budget_slug", "unknown");
  const hasBudget = budgetMidpoint(budget) > 0;

  if (overdueTasks > 0 || (status === "new" && score >= 75)) return "high";
  if (score >= 70 || !hasBudget || openTasks === 0 || ["qualified", "proposal"].includes(status)) return "medium";
  return "low";
}

function leadRecommendedMove(row: Record<string, unknown>): string {
  const status = rowString(row, "status", "new");
  const score = rowNumber(row, "lead_score");
  const openTasks = rowNumber(row, "open_tasks");
  const overdueTasks = rowNumber(row, "overdue_tasks");
  const audits = rowNumber(row, "audit_count");
  const briefs = rowNumber(row, "brief_count");
  const budget = rowString(row, "budget_slug", "unknown");
  const nextAction = rowString(row, "next_best_action");

  if (overdueTasks > 0) return "Clear the overdue follow-up and update the commercial stage.";
  if (status === "new" && score >= 75) return "Send a first-touch reply today with the diagnostic summary and one clear call CTA.";
  if (!budgetMidpoint(budget)) return "Ask for a budget range before preparing scope or proposal language.";
  if (audits > 0 && status === "new") return "Lead with the website audit finding, then ask permission to map a first sprint.";
  if (briefs > 0 && ["contacted", "qualified"].includes(status)) return "Turn the saved brief into a concrete first-sprint scope.";
  if (status === "proposal") return "Follow up on decision criteria, timeline and the smallest launchable scope.";
  if (openTasks === 0) return "Create a dated next task so this opportunity does not drift.";
  return nextAction || "Review the diagnostic and decide the next human touch.";
}

function serviceProofPoint(service: string): string {
  switch (service) {
    case "web-design":
      return "clarity, conversion structure and a stronger path from landing page to inquiry";
    case "landing-pages":
      return "a focused offer page, tracking and a cleaner lead capture flow";
    case "sales-funnels":
      return "follow-up logic, objection handling and a simple CRM handoff";
    case "meta-ads":
      return "campaign readiness, landing page alignment and measurement before spend";
    case "ai-automation":
      return "manual workflow reduction, lead routing and response consistency";
    case "branding":
      return "positioning clarity, identity consistency and stronger trust signals";
    case "app-development":
      return "a scoped MVP path with the highest-value workflow first";
    default:
      return "a practical first sprint tied to the strongest growth bottleneck";
  }
}

function buildSalesPlaybook(input: {
  leads: Record<string, unknown>[];
  revenueForecast: Record<string, unknown>;
  slaMonitor: Record<string, unknown>;
  auditLab: Record<string, unknown>;
}): Record<string, unknown> {
  const leads = input.leads
    .filter((row) => !["won", "lost", "archived"].includes(rowString(row, "status")))
    .map((row) => {
      const service = rowString(row, "primary_service", "unknown");
      const blockers = parseJsonArray(row.blockers_json).map((item) => clean(item, 120)).filter(Boolean);
      return {
        id: rowString(row, "id"),
        name: rowString(row, "name", "Unnamed lead"),
        company: rowString(row, "company"),
        status: rowString(row, "status", "new"),
        service,
        serviceLabel: adminServiceLabel(service),
        score: rowNumber(row, "lead_score"),
        budget: rowString(row, "budget_slug", "unknown"),
        timeline: rowString(row, "timeline_slug", "unknown"),
        openTasks: rowNumber(row, "open_tasks"),
        overdueTasks: rowNumber(row, "overdue_tasks"),
        audits: rowNumber(row, "audit_count"),
        briefs: rowNumber(row, "brief_count"),
        nextTaskDue: rowString(row, "next_task_due"),
        blockers: blockers.slice(0, 3),
        priority: leadPlaybookPriority(row),
        recommendedMove: leadRecommendedMove(row),
        nextBestAction: rowString(row, "next_best_action")
      };
    });

  const hot = leads.filter((lead) => lead.score >= 75);
  const stale = leads.filter((lead) => lead.overdueTasks > 0 || lead.openTasks === 0);
  const budgetGaps = leads.filter((lead) => !budgetMidpoint(lead.budget));
  const auditLed = leads.filter((lead) => lead.audits > 0);
  const proposalReady = leads.filter((lead) => ["qualified", "proposal"].includes(lead.status));
  const byService = new Map<string, { service: string; label: string; count: number; scoreTotal: number }>();
  for (const lead of leads) {
    const bucket = byService.get(lead.service) || { service: lead.service, label: lead.serviceLabel, count: 0, scoreTotal: 0 };
    bucket.count += 1;
    bucket.scoreTotal += lead.score;
    byService.set(lead.service, bucket);
  }
  const services = Array.from(byService.values())
    .map((item) => ({ ...item, avgScore: item.count ? Math.round(item.scoreTotal / item.count) : 0 }))
    .sort((a, b) => b.count - a.count || b.avgScore - a.avgScore);
  const topService = services[0];
  const primaryService = topService?.service || "growth-system";
  const primaryServiceLabel = topService?.label || "Growth System";

  const plays: Array<{ priority: string; title: string; detail: string; taskType: string; timing: string }> = [];
  if (hot.length) {
    plays.push({
      priority: "high",
      title: "Hot lead first touch",
      detail: `${hot.length} lead${hot.length === 1 ? "" : "s"} scored 75+. Reply with the diagnostic, one proof point and a call CTA.`,
      taskType: "follow_up",
      timing: "today"
    });
  }
  if (stale.length) {
    plays.push({
      priority: stale.some((lead) => lead.overdueTasks > 0) ? "high" : "medium",
      title: "Restore next actions",
      detail: `${stale.length} open opportunit${stale.length === 1 ? "y" : "ies"} need a dated next task or overdue cleanup.`,
      taskType: "follow_up",
      timing: "today"
    });
  }
  if (budgetGaps.length) {
    plays.push({
      priority: "medium",
      title: "Budget qualification",
      detail: `${budgetGaps.length} active lead${budgetGaps.length === 1 ? "" : "s"} need a budget range before scope or proposal.`,
      taskType: "schedule_call",
      timing: "next touch"
    });
  }
  if (auditLed.length) {
    plays.push({
      priority: "medium",
      title: "Audit-led close",
      detail: `${auditLed.length} lead${auditLed.length === 1 ? "" : "s"} have audit context. Lead with the clearest website bottleneck and propose a first sprint.`,
      taskType: "audit_review",
      timing: "next reply"
    });
  }
  if (proposalReady.length) {
    plays.push({
      priority: "high",
      title: "Proposal readiness",
      detail: `${proposalReady.length} lead${proposalReady.length === 1 ? "" : "s"} are qualified or proposal-stage. Confirm decision criteria, timeline and launch scope.`,
      taskType: "proposal_prep",
      timing: "24h"
    });
  }
  if (topService) {
    plays.push({
      priority: priorityFor(topService.count, topService.avgScore),
      title: `${primaryServiceLabel} proof angle`,
      detail: `Use ${serviceProofPoint(primaryService)} as the main sales angle for this cohort.`,
      taskType: "send_scope",
      timing: "this week"
    });
  }
  if (!plays.length) {
    plays.push({
      priority: "low",
      title: "Collect the next qualified lead",
      detail: "The playbook will sharpen after the concierge captures more consented leads.",
      taskType: "follow_up",
      timing: "after capture"
    });
  }

  const cadence = [
    {
      step: "0h",
      title: "First touch",
      detail: "Reference their diagnostic, name the strongest growth bottleneck, and ask for one focused next step."
    },
    {
      step: "24h",
      title: "Proof and scope",
      detail: `Send one ${primaryServiceLabel} proof angle and outline the smallest useful first sprint.`
    },
    {
      step: "72h",
      title: "Decision clarity",
      detail: "Ask what would block the decision: budget, timeline, assets, internal approval or technical risk."
    },
    {
      step: "7d",
      title: "Close or archive",
      detail: "Move the lead to qualified/proposal, create a future task, or archive so the dashboard stays clean."
    }
  ];

  const templates = [
    {
      title: "First-touch opener",
      subject: `Next step for ${primaryServiceLabel}`,
      body: `Thanks for sharing the diagnostic with CREATIVE MK. The strongest signal I see is ${primaryServiceLabel}: ${serviceProofPoint(primaryService)}. A useful next step would be a short first-sprint map: priority fix, assets needed, timeline and budget range.`
    },
    {
      title: "Budget qualifier",
      subject: "Quick scope question",
      body: "Before I suggest a build path, what budget range should we design around? That helps us recommend the right first sprint instead of overscoping the project."
    },
    {
      title: "Audit-led follow-up",
      subject: "Website audit next move",
      body: "The audit points to a clarity/conversion opportunity. The fastest win is to tighten the offer, CTA path and lead handoff before adding more traffic."
    }
  ];

  const slaSummary = (input.slaMonitor.summary || {}) as Record<string, unknown>;
  const forecastSummary = (input.revenueForecast.summary || {}) as Record<string, unknown>;
  const auditSummary = ((input.auditLab || {}).summary || {}) as Record<string, unknown>;

  return {
    source: "Cloudflare D1 lead, task, audit and forecast signals",
    summary: {
      activeLeads: leads.length,
      hotLeads: hot.length,
      staleLeads: stale.length,
      budgetGaps: budgetGaps.length,
      auditLed: auditLed.length,
      proposalReady: proposalReady.length,
      openWeighted: rowNumber(forecastSummary, "openWeighted"),
      overdueTasks: rowNumber(slaSummary, "overdueTasks"),
      auditCaptureRate: rowNumber(auditSummary, "captureRate"),
      topService: primaryServiceLabel
    },
    plays: plays.slice(0, 6),
    cadence,
    templates,
    priorityLeads: leads
      .sort((a, b) => {
        const rank = { high: 0, medium: 1, low: 2 };
        return rank[a.priority as keyof typeof rank] - rank[b.priority as keyof typeof rank] || b.score - a.score;
      })
      .slice(0, 8),
    serviceAngles: services.slice(0, 5).map((item) => ({
      service: item.service,
      label: item.label,
      count: item.count,
      avgScore: item.avgScore,
      proofPoint: serviceProofPoint(item.service)
    }))
  };
}

function commandPriority(value: unknown): "high" | "medium" | "low" {
  const priority = clean(value, 20).toLowerCase();
  if (priority === "hot" || priority === "high" || priority === "critical") return "high";
  if (priority === "medium" || priority === "warm") return "medium";
  return "low";
}

function buildGrowthCommandCenter(input: {
  metrics: Record<string, unknown>;
  leads: Record<string, unknown>[];
  salesPlaybook: Record<string, unknown>;
  auditLab: Record<string, unknown>;
  conversionExperimentLab: Record<string, unknown>;
  knowledgeGapRadar: Record<string, unknown>;
  cloudflareOperations: Record<string, unknown>;
}): Record<string, unknown> {
  const priorityRank = { high: 0, medium: 1, low: 2 };
  const commands: Array<Record<string, unknown>> = [];
  const addCommand = (item: Record<string, unknown>) => {
    const title = rowString(item, "title", "Command");
    const detail = rowString(item, "detail");
    if (!title || !detail) return;
    commands.push({
      id: rowString(item, "id") || `${rowString(item, "type", "command")}-${commands.length + 1}`,
      type: rowString(item, "type", "command"),
      priority: commandPriority(item.priority),
      title,
      detail,
      action: rowString(item, "action") || detail,
      leadId: rowString(item, "leadId"),
      meta: rowString(item, "meta"),
      copy: clean(item.copy, 1200),
      source: rowString(item, "source", "Cloudflare D1")
    });
  };

  const activeLeads = input.leads
    .filter((row) => !["won", "lost", "archived"].includes(rowString(row, "status")))
    .map((row) => ({
      id: rowString(row, "id"),
      name: rowString(row, "name", "Unnamed lead"),
      company: rowString(row, "company"),
      status: rowString(row, "status", "new"),
      score: rowNumber(row, "lead_score"),
      service: rowString(row, "primary_service", "unknown"),
      budget: rowString(row, "budget_slug", "unknown"),
      openTasks: rowNumber(row, "open_tasks"),
      overdueTasks: rowNumber(row, "overdue_tasks"),
      audits: rowNumber(row, "audit_count"),
      priority: leadPlaybookPriority(row),
      recommendedMove: leadRecommendedMove(row)
    }))
    .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.score - a.score);

  for (const lead of activeLeads.slice(0, 6)) {
    addCommand({
      type: "lead",
      id: `lead-${lead.id || lead.name}`,
      priority: lead.priority,
      title: `${lead.score >= 75 ? "Hot lead" : "Lead"}: ${lead.name}`,
      detail: lead.recommendedMove,
      action: "Open lead detail and complete the next human touch.",
      leadId: lead.id,
      meta: `${adminServiceLabel(lead.service)} / score ${lead.score} / ${titleFromSlug(lead.status)}`,
      source: "D1 leads, diagnostics and tasks"
    });
  }

  const plays = Array.isArray(input.salesPlaybook.plays) ? (input.salesPlaybook.plays as Record<string, unknown>[]) : [];
  for (const play of plays.slice(0, 3)) {
    addCommand({
      type: "sales-play",
      id: `play-${commands.length + 1}`,
      priority: play.priority,
      title: rowString(play, "title", "Sales play"),
      detail: rowString(play, "detail"),
      meta: `${rowString(play, "timing", "today")} / ${rowString(play, "taskType", "follow_up")}`,
      copy: `Play: ${rowString(play, "title", "Sales play")}\n\n${rowString(play, "detail")}`,
      source: "Sales Playbook"
    });
  }

  const auditActions = Array.isArray(input.auditLab.actions) ? (input.auditLab.actions as Record<string, unknown>[]) : [];
  for (const action of auditActions.slice(0, 2)) {
    addCommand({
      type: "audit",
      id: `audit-${commands.length + 1}`,
      priority: action.priority,
      title: rowString(action, "title", "Audit action"),
      detail: rowString(action, "detail"),
      copy: `Audit action: ${rowString(action, "title", "Audit action")}\n\n${rowString(action, "detail")}`,
      source: "Website Audit Lab"
    });
  }

  const experiments = Array.isArray(input.conversionExperimentLab.experiments)
    ? (input.conversionExperimentLab.experiments as Record<string, unknown>[])
    : [];
  for (const experiment of experiments.slice(0, 2)) {
    addCommand({
      type: "experiment",
      id: `experiment-${commands.length + 1}`,
      priority: experiment.priority,
      title: rowString(experiment, "title", "Conversion experiment"),
      detail: rowString(experiment, "hypothesis") || rowString(experiment, "change"),
      meta: rowString(experiment, "successMetric", "conversion lift"),
      copy: [
        `Experiment: ${rowString(experiment, "title", "Conversion experiment")}`,
        `Hypothesis: ${rowString(experiment, "hypothesis")}`,
        `Change: ${rowString(experiment, "change")}`,
        `Metric: ${rowString(experiment, "successMetric")}`,
        `Guardrail: ${rowString(experiment, "guardrail")}`
      ].join("\n"),
      source: "Conversion Experiment Lab"
    });
  }

  const knowledgeActions = Array.isArray(input.knowledgeGapRadar.actions)
    ? (input.knowledgeGapRadar.actions as Record<string, unknown>[])
    : [];
  const knowledgeGaps = Array.isArray(input.knowledgeGapRadar.gaps)
    ? (input.knowledgeGapRadar.gaps as Record<string, unknown>[])
    : [];
  for (const item of [...knowledgeActions.slice(0, 2), ...knowledgeGaps.slice(0, 2)]) {
    addCommand({
      type: "knowledge",
      id: `knowledge-${commands.length + 1}`,
      priority: item.priority,
      title: rowString(item, "title") || rowString(item, "label", "Knowledge gap"),
      detail: rowString(item, "detail") || rowString(item, "action"),
      meta: rowString(item, "sourceSignal") || `${rowNumber(item, "signalCount")} signals / ${rowNumber(item, "coverageScore")}% coverage`,
      copy: `Knowledge task: ${rowString(item, "title") || rowString(item, "label", "Knowledge gap")}\n\n${rowString(item, "detail") || rowString(item, "action")}`,
      source: "Knowledge Gap Radar"
    });
  }

  const opsRisks = Array.isArray(input.cloudflareOperations.risks) ? (input.cloudflareOperations.risks as Record<string, unknown>[]) : [];
  const opsActions = Array.isArray(input.cloudflareOperations.actions) ? (input.cloudflareOperations.actions as Record<string, unknown>[]) : [];
  const opsActivations = Array.isArray(input.cloudflareOperations.nextActivations)
    ? (input.cloudflareOperations.nextActivations as Record<string, unknown>[])
    : [];
  for (const item of [...opsRisks.slice(0, 2), ...opsActions.slice(0, 2), ...opsActivations.slice(0, 2)]) {
    addCommand({
      type: "cloudflare",
      id: `cloudflare-${commands.length + 1}`,
      priority: item.priority || (rowString(item, "enabled") === "false" ? "medium" : "low"),
      title: rowString(item, "title") || rowString(item, "label", "Cloudflare activation"),
      detail: rowString(item, "detail") || rowString(item, "why") || rowString(item, "currentState"),
      meta: rowString(item, "layer") || rowString(item, "service", "free-tier"),
      source: "Cloudflare Operations Center"
    });
  }

  const sortedCommands = commands
    .sort((a, b) => {
      const priorityDelta = priorityRank[commandPriority(a.priority)] - priorityRank[commandPriority(b.priority)];
      if (priorityDelta) return priorityDelta;
      const typeRank = { lead: 0, "sales-play": 1, audit: 2, experiment: 3, knowledge: 4, cloudflare: 5 };
      return (typeRank[rowString(a, "type") as keyof typeof typeRank] ?? 9) - (typeRank[rowString(b, "type") as keyof typeof typeRank] ?? 9);
    })
    .slice(0, 14);

  const commandCounts = sortedCommands.reduce<Record<string, number>>((acc, item) => {
    const type = rowString(item, "type", "command");
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
  const highPriority = sortedCommands.filter((item) => commandPriority(item.priority) === "high").length;
  const topCommand = sortedCommands[0];
  const salesSummary = (input.salesPlaybook.summary || {}) as Record<string, unknown>;
  const auditSummary = (input.auditLab.summary || {}) as Record<string, unknown>;
  const knowledgeSummary = (input.knowledgeGapRadar.summary || {}) as Record<string, unknown>;
  const opsSummary = (input.cloudflareOperations.summary || {}) as Record<string, unknown>;

  return {
    source: "Cloudflare D1, Durable Objects session snapshots, Queues/Workflows posture and Pages admin intelligence",
    summary: {
      posture: highPriority ? "Action required today" : sortedCommands.length ? "Operating normally" : "Waiting for more signal",
      topFocus: rowString(topCommand || {}, "title", "Collect qualified signal"),
      activeLeads: rowNumber(salesSummary, "activeLeads"),
      hotLeads: rowNumber(salesSummary, "hotLeads"),
      overdueTasks: rowNumber(salesSummary, "overdueTasks"),
      auditCaptureRate: rowNumber(auditSummary, "captureRate"),
      knowledgeTopGap: rowString(knowledgeSummary, "topGap", "No gap detected"),
      cloudflareReadiness: rowNumber(input.cloudflareOperations, "readinessScore"),
      activeServices: rowNumber(opsSummary, "activeServices"),
      totalCommands: sortedCommands.length,
      highPriority
    },
    commandCounts,
    commandQueue: sortedCommands,
    operatingCadence: [
      {
        step: "Morning",
        title: "Triage hot leads",
        detail: "Open the highest-priority lead commands first, clear overdue tasks, and move status after every human touch."
      },
      {
        step: "Midday",
        title: "Tighten conversion path",
        detail: "Pick one experiment or audit command and ship the smallest page/chat change that can improve capture quality."
      },
      {
        step: "Weekly",
        title: "Upgrade the knowledge base",
        detail: "Turn the top knowledge gap into a local corpus doc now, then mirror it into AI Search when the beta token is active."
      },
      {
        step: "Always",
        title: "Protect the free tier",
        detail: "Keep reports compact, rely on D1 summaries, use Queues/Workflows for background work, and degrade gracefully when optional bindings are off."
      }
    ],
    cloudflareAutomationMap: [
      { layer: "Capture", stack: "Pages + Worker + Durable Objects", detail: "Widget and form collect consented leads while sessions stay lightweight." },
      { layer: "Store", stack: "D1", detail: "Leads, diagnostics, summaries, tasks, audits and rollups remain inside Cloudflare." },
      { layer: "Process", stack: "Queues + Workflows + Cron", detail: "Background enrichment, daily digest and cleanup avoid blocking the visitor experience." },
      { layer: "Learn", stack: "Local corpus + AI Search-ready docs", detail: "Knowledge gaps become source material for the concierge without storing raw transcripts." },
      { layer: "Operate", stack: "Pages Admin + Worker API", detail: "A private workbench turns signals into follow-ups, experiments and activation tasks." }
    ],
    decisionRules: [
      "Lead commands outrank content work when score is 75+ or an SLA/task is overdue.",
      "Audit and experiment commands focus on conversion bottlenecks before asking for more traffic.",
      "Knowledge tasks are generated from redacted summaries, blockers and next-action patterns.",
      "Cloudflare activations stay feature-flagged until the account confirms free quota and binding availability."
    ]
  };
}

function hoursSince(value: unknown, now = Date.now()): number | null {
  const text = clean(value, 80);
  if (!text) return null;
  const timestamp = Date.parse(text);
  if (!Number.isFinite(timestamp)) return null;
  return Math.max(0, Math.round(((now - timestamp) / (60 * 60 * 1000)) * 10) / 10);
}

function slaHoursForStatus(status: string, score: number): number {
  if (status === "new") return score >= 75 ? 6 : 24;
  if (status === "contacted") return 48;
  if (status === "qualified") return 72;
  if (status === "proposal") return 48;
  return 72;
}

function buildSlaMonitor(rows: Record<string, unknown>[]): Record<string, unknown> {
  const now = Date.now();
  const items = rows.map((row) => {
    const status = rowString(row, "status", "new");
    const score = rowNumber(row, "lead_score");
    const leadAgeHours = hoursSince(row.created_at, now) || 0;
    const lastHumanAt = rowString(row, "last_admin_at") || rowString(row, "updated_at") || rowString(row, "created_at");
    const hoursSinceHuman = hoursSince(lastHumanAt, now);
    const openTasks = rowNumber(row, "open_tasks");
    const overdueTasks = rowNumber(row, "overdue_tasks");
    const slaHours = slaHoursForStatus(status, score);
    const needsFirstTouch = status === "new" && !rowString(row, "last_admin_at") && leadAgeHours >= slaHours;
    const staleDeal = status !== "new" && hoursSinceHuman !== null && hoursSinceHuman >= slaHours;
    const hasOverdueTask = overdueTasks > 0;

    let priority: "high" | "medium" | "low" = "low";
    let reason = "Within SLA";
    let action = "Keep monitoring this lead.";

    if (hasOverdueTask) {
      priority = "high";
      reason = `${overdueTasks} overdue task${overdueTasks === 1 ? "" : "s"}`;
      action = "Clear or reschedule overdue follow-up today.";
    } else if (needsFirstTouch) {
      priority = "high";
      reason = score >= 75 ? "Hot lead needs first touch" : "New lead is waiting for first touch";
      action = "Move to contacted or create a follow-up task.";
    } else if (staleDeal) {
      priority = status === "proposal" || score >= 75 ? "high" : "medium";
      reason = `${titleFromSlug(status)} stage is stale`;
      action = "Add the next task, update status, or archive if no longer active.";
    } else if (openTasks === 0 && ["contacted", "qualified", "proposal"].includes(status)) {
      priority = "medium";
      reason = "Open deal has no next task";
      action = "Create the next follow-up task so it does not drift.";
    }

    return {
      id: rowString(row, "id"),
      name: rowString(row, "name", "Unnamed lead"),
      company: rowString(row, "company"),
      status,
      primaryService: rowString(row, "primary_service", "unknown"),
      budget: rowString(row, "budget_slug", "unknown"),
      timeline: rowString(row, "timeline_slug", "unknown"),
      score,
      leadAgeHours,
      hoursSinceHuman,
      slaHours,
      openTasks,
      overdueTasks,
      nextTaskDue: rowString(row, "next_task_due"),
      priority,
      reason,
      action
    };
  });

  const priorityRank = { high: 0, medium: 1, low: 2 };
  const atRisk = items.filter((item) => item.priority !== "low");
  const highRisk = items.filter((item) => item.priority === "high");
  const needsFirstTouch = items.filter((item) => item.reason.toLowerCase().includes("first touch"));
  const staleDeals = items.filter((item) => item.reason.toLowerCase().includes("stale"));
  const overdueTasks = items.reduce((total, item) => total + item.overdueTasks, 0);

  return {
    summary: {
      monitored: items.length,
      atRisk: atRisk.length,
      highRisk: highRisk.length,
      overdueTasks,
      needsFirstTouch: needsFirstTouch.length,
      staleDeals: staleDeals.length
    },
    rules: [
      "Hot new leads: first touch within 6 hours",
      "Standard new leads: first touch within 24 hours",
      "Contacted leads: next action within 48 hours",
      "Qualified/proposal leads: next action within 48-72 hours"
    ],
    leads: items
      .sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || b.score - a.score || b.leadAgeHours - a.leadAgeHours)
      .slice(0, 10)
  };
}

async function handleAdminRequest(request: Request, env: Env): Promise<Response> {
  if (!env.ANALYTICS_DB) {
    return json({ error: "Admin database is not configured" }, request, env, 503);
  }

  if (!(await adminAuthorized(request, env))) {
    return json(
      {
        error: "Admin authentication required",
        auth: "Set ADMIN_TOKEN with wrangler secret put ADMIN_TOKEN or protect /admin with Cloudflare Access."
      },
      request,
      env,
      401
    );
  }

  const url = new URL(request.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const apiIndex = parts.findIndex((part, index) => part === "api" && parts[index - 1] === "admin");
  const agentAdminIndex = parts.findIndex((part, index) => part === "admin" && parts[index - 1] !== "api");
  const route = apiIndex >= 0 ? parts.slice(apiIndex + 1) : parts.slice(agentAdminIndex + 1);
  const [resource, id, action] = route;

  if (request.method === "GET" && resource === "metrics") {
    return handleAdminMetrics(request, env);
  }
  if (request.method === "GET" && resource === "leads" && !id) {
    return handleAdminLeadList(request, env);
  }
  if (request.method === "GET" && resource === "leads" && id) {
    return handleAdminLeadDetail(request, env, id);
  }
  if (request.method === "GET" && resource === "tasks" && !id) {
    return handleAdminTaskList(request, env);
  }
  if (request.method === "POST" && resource === "tasks" && id && action === "status") {
    return handleAdminTaskStatus(request, env, id);
  }
  if (request.method === "POST" && resource === "leads" && id && action === "status") {
    return handleAdminLeadStatus(request, env, id);
  }
  if (request.method === "POST" && resource === "leads" && id && action === "note") {
    return handleAdminLeadNote(request, env, id);
  }
  if (request.method === "POST" && resource === "leads" && id && action === "task") {
    return handleAdminLeadTaskCreate(request, env, id);
  }
  if (request.method === "POST" && resource === "ops" && id === "maintenance") {
    return handleAdminMaintenance(request, env);
  }
  if (request.method === "GET" && resource === "ops" && id === "health-check") {
    return handleAdminHealthCheck(request, env);
  }
  if (request.method === "GET" && resource === "export.csv") {
    return handleAdminExport(request, env);
  }
  if (request.method === "GET" && resource === "export.json") {
    return handleAdminExportJson(request, env);
  }

  return json({ error: "Unknown admin route" }, request, env, 404);
}

async function handleAdminMetrics(request: Request, env: Env): Promise<Response> {
  const today = todayKey();
  const todayStart = `${today}T00:00:00.000Z`;
  const tomorrowDate = new Date(todayStart);
  tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
  const todayEnd = tomorrowDate.toISOString();
  const [
    summary,
    services,
    events,
    recentRollups,
    budgets,
    timelines,
    blockers,
    nextActions,
    pages,
    retention,
    funnelGaps,
    profileQuality,
    recentInsights,
    attributionSources,
    attributionCampaigns,
    attributionReferrers,
    pipelineStats,
    revenueRows,
    slaRows,
    todayUsage,
    privacyAudit,
    auditStats,
    auditRecent,
    auditServices,
    auditFindings,
    knowledgeSignals
  ] = await Promise.all([
    env.ANALYTICS_DB!.prepare(
      `SELECT
        (SELECT COUNT(*) FROM leads) AS leads,
        (SELECT COUNT(*) FROM lead_sessions) AS sessions,
        (SELECT COUNT(*) FROM lead_audits) AS audits,
        (SELECT COUNT(*) FROM lead_briefs) AS briefs,
        (SELECT COUNT(*) FROM lead_diagnostics WHERE lead_score >= 75) AS hot_leads,
        (SELECT COUNT(*) FROM lead_events WHERE event_type = 'chat') AS chats,
        (SELECT COUNT(*) FROM lead_tasks WHERE status = 'open') AS open_tasks,
        (SELECT COUNT(*) FROM lead_tasks WHERE status = 'open' AND due_at IS NOT NULL AND datetime(due_at) <= datetime('now')) AS overdue_tasks`
    ).first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT COALESCE(primary_service, 'unknown') AS service, COUNT(*) AS count, ROUND(AVG(lead_score), 1) AS avg_score
       FROM lead_diagnostics
       GROUP BY primary_service
       ORDER BY count DESC, avg_score DESC
       LIMIT 12`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT event_type, COUNT(*) AS count
       FROM lead_events
       WHERE created_at >= datetime('now', '-30 days')
       GROUP BY event_type
       ORDER BY count DESC`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT * FROM daily_rollups
       ORDER BY day DESC
       LIMIT 14`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT COALESCE(budget_slug, 'unknown') AS budget, COUNT(*) AS count
       FROM lead_profiles
       GROUP BY budget_slug
       ORDER BY count DESC
       LIMIT 8`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT COALESCE(timeline_slug, 'unknown') AS timeline, COUNT(*) AS count
       FROM lead_profiles
       GROUP BY timeline_slug
       ORDER BY count DESC
       LIMIT 8`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT blockers_json
       FROM lead_diagnostics
       WHERE blockers_json IS NOT NULL AND blockers_json != '[]'
       ORDER BY updated_at DESC
       LIMIT 100`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT next_best_action, COUNT(*) AS count
       FROM lead_diagnostics
       WHERE next_best_action IS NOT NULL AND next_best_action != ''
       GROUP BY next_best_action
       ORDER BY count DESC
       LIMIT 8`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        COALESCE(NULLIF(page, ''), 'unknown') AS page,
        SUM(CASE WHEN event_type = 'page-view' THEN 1 ELSE 0 END) AS views,
        SUM(CASE WHEN event_type = 'open' THEN 1 ELSE 0 END) AS opens,
        SUM(CASE WHEN event_type = 'chat' THEN 1 ELSE 0 END) AS chats,
        SUM(CASE WHEN event_type = 'audit-url' THEN 1 ELSE 0 END) AS audits,
        SUM(CASE WHEN event_type = 'brief' THEN 1 ELSE 0 END) AS briefs,
        SUM(CASE WHEN event_type = 'lead-capture' THEN 1 ELSE 0 END) AS leads,
        COUNT(DISTINCT session_hash) AS sessions
       FROM lead_events
       WHERE created_at >= datetime('now', '-30 days')
       GROUP BY page
       ORDER BY leads DESC, chats DESC, views DESC
       LIMIT 12`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT *
       FROM data_retention_runs
       ORDER BY ran_at DESC
       LIMIT 1`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        COUNT(DISTINCT CASE WHEN COALESCE(d.lead_score, 0) >= 70 AND l.id IS NULL THEN s.session_hash END) AS hot_anonymous,
        COUNT(DISTINCT CASE WHEN a.id IS NOT NULL AND l.id IS NULL THEN s.session_hash END) AS audit_no_lead,
        COUNT(DISTINCT CASE WHEN b.id IS NOT NULL AND l.id IS NULL THEN s.session_hash END) AS brief_no_lead,
        COUNT(DISTINCT CASE WHEN e.event_type = 'capture-open' AND l.id IS NULL THEN s.session_hash END) AS capture_open_no_submit
       FROM lead_sessions s
       LEFT JOIN lead_diagnostics d ON d.session_hash = s.session_hash
       LEFT JOIN leads l ON l.session_hash = s.session_hash
       LEFT JOIN lead_audits a ON a.session_hash = s.session_hash
       LEFT JOIN lead_briefs b ON b.session_hash = s.session_hash
       LEFT JOIN lead_events e ON e.session_hash = s.session_hash
       WHERE s.last_seen_at >= datetime('now', '-30 days')`
    ).first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        COUNT(*) AS total_profiles,
        SUM(CASE WHEN goal IS NOT NULL AND goal != '' THEN 1 ELSE 0 END) AS with_goal,
        SUM(CASE WHEN business_type IS NOT NULL AND business_type != '' THEN 1 ELSE 0 END) AS with_business,
        SUM(CASE WHEN offer IS NOT NULL AND offer != '' THEN 1 ELSE 0 END) AS with_offer,
        SUM(CASE WHEN budget_slug IS NOT NULL AND budget_slug != '' THEN 1 ELSE 0 END) AS with_budget,
        SUM(CASE WHEN timeline_slug IS NOT NULL AND timeline_slug != '' THEN 1 ELSE 0 END) AS with_timeline,
        SUM(CASE WHEN service_slug IS NOT NULL AND service_slug != '' THEN 1 ELSE 0 END) AS with_service
       FROM lead_profiles`
    ).first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        s.last_seen_at,
        s.language,
        s.status,
        s.conversation_summary,
        CASE WHEN l.id IS NULL THEN 0 ELSE 1 END AS captured,
        d.lead_score,
        d.primary_service,
        d.next_best_action,
        p.budget_slug,
        p.timeline_slug
       FROM lead_sessions s
       LEFT JOIN leads l ON l.session_hash = s.session_hash
       LEFT JOIN lead_diagnostics d ON d.session_hash = s.session_hash
       LEFT JOIN lead_profiles p ON p.session_hash = s.session_hash
       WHERE s.conversation_summary IS NOT NULL AND s.conversation_summary != ''
       ORDER BY COALESCE(d.lead_score, 0) DESC, s.last_seen_at DESC
       LIMIT 6`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        COALESCE(
          NULLIF(json_extract(s.utm_json, '$.utm_source'), ''),
          NULLIF(json_extract(s.utm_json, '$.source'), ''),
          'direct'
        ) AS source,
        COUNT(DISTINCT s.session_hash) AS sessions,
        COUNT(DISTINCT l.id) AS leads,
        ROUND(AVG(COALESCE(d.lead_score, 0)), 1) AS avg_score
       FROM lead_sessions s
       LEFT JOIN leads l ON l.session_hash = s.session_hash
       LEFT JOIN lead_diagnostics d ON d.session_hash = s.session_hash
       WHERE s.last_seen_at >= datetime('now', '-30 days')
       GROUP BY source
       ORDER BY leads DESC, sessions DESC, avg_score DESC
       LIMIT 8`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        COALESCE(NULLIF(json_extract(s.utm_json, '$.utm_campaign'), ''), 'no-campaign') AS campaign,
        COUNT(DISTINCT s.session_hash) AS sessions,
        COUNT(DISTINCT l.id) AS leads,
        ROUND(AVG(COALESCE(d.lead_score, 0)), 1) AS avg_score
       FROM lead_sessions s
       LEFT JOIN leads l ON l.session_hash = s.session_hash
       LEFT JOIN lead_diagnostics d ON d.session_hash = s.session_hash
       WHERE s.last_seen_at >= datetime('now', '-30 days')
       GROUP BY campaign
       ORDER BY leads DESC, sessions DESC, avg_score DESC
       LIMIT 8`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        COALESCE(NULLIF(json_extract(s.utm_json, '$.referrer'), ''), 'direct') AS referrer,
        COUNT(DISTINCT s.session_hash) AS sessions,
        COUNT(DISTINCT l.id) AS leads,
        ROUND(AVG(COALESCE(d.lead_score, 0)), 1) AS avg_score
       FROM lead_sessions s
       LEFT JOIN leads l ON l.session_hash = s.session_hash
       LEFT JOIN lead_diagnostics d ON d.session_hash = s.session_hash
       WHERE s.last_seen_at >= datetime('now', '-30 days')
       GROUP BY referrer
       ORDER BY leads DESC, sessions DESC, avg_score DESC
       LIMIT 8`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        (SELECT COUNT(*)
         FROM lead_sessions
         WHERE last_seen_at >= datetime('now', '-30 days')) AS sessions,
        (SELECT COUNT(DISTINCT session_hash)
         FROM lead_events
         WHERE event_type IN ('open', 'chat')
           AND created_at >= datetime('now', '-30 days')) AS engaged,
        (SELECT COUNT(*)
         FROM lead_diagnostics
         WHERE updated_at >= datetime('now', '-30 days')) AS diagnosed,
        (SELECT COUNT(DISTINCT session_hash)
         FROM lead_audits
         WHERE created_at >= datetime('now', '-30 days')) AS audited,
        (SELECT COUNT(DISTINCT session_hash)
         FROM lead_briefs
         WHERE created_at >= datetime('now', '-30 days')) AS briefed,
        (SELECT COUNT(*)
         FROM leads
         WHERE created_at >= datetime('now', '-30 days')) AS captured,
        (SELECT COUNT(*)
         FROM leads
         WHERE created_at >= datetime('now', '-30 days')
           AND status IN ('contacted', 'qualified', 'proposal', 'won')) AS contacted`
    ).first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        l.id,
        l.status,
        l.created_at,
        COALESCE(d.lead_score, 0) AS lead_score,
        COALESCE(d.primary_service, p.service_slug, 'unknown') AS primary_service,
        COALESCE(p.budget_slug, 'unknown') AS budget_slug,
        COALESCE(p.timeline_slug, 'unknown') AS timeline_slug
       FROM leads l
       LEFT JOIN lead_diagnostics d ON d.session_hash = l.session_hash
       LEFT JOIN lead_profiles p ON p.session_hash = l.session_hash
       WHERE l.created_at >= datetime('now', '-90 days')
         AND l.status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')
       ORDER BY l.created_at DESC
       LIMIT 500`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        l.id,
        l.name,
        l.company,
        l.status,
        l.created_at,
        l.updated_at,
        COALESCE(d.lead_score, 0) AS lead_score,
        COALESCE(d.primary_service, p.service_slug, 'unknown') AS primary_service,
        d.next_best_action,
        d.blockers_json,
        COALESCE(p.budget_slug, 'unknown') AS budget_slug,
        COALESCE(p.timeline_slug, 'unknown') AS timeline_slug,
        (SELECT COUNT(*) FROM lead_tasks t WHERE t.lead_id = l.id AND t.status = 'open') AS open_tasks,
        (SELECT COUNT(*) FROM lead_tasks t WHERE t.lead_id = l.id AND t.status = 'open' AND t.due_at IS NOT NULL AND datetime(t.due_at) <= datetime('now')) AS overdue_tasks,
        (SELECT MIN(t.due_at) FROM lead_tasks t WHERE t.lead_id = l.id AND t.status = 'open') AS next_task_due,
        (SELECT COUNT(*) FROM lead_audits a WHERE a.session_hash = l.session_hash) AS audit_count,
        (SELECT COUNT(*) FROM lead_briefs b WHERE b.session_hash = l.session_hash) AS brief_count,
        (SELECT MAX(e.created_at) FROM lead_events e WHERE e.lead_id = l.id AND e.event_type LIKE 'admin-%') AS last_admin_at,
        (SELECT MAX(e.created_at) FROM lead_events e WHERE e.lead_id = l.id) AS last_event_at
       FROM leads l
       LEFT JOIN lead_diagnostics d ON d.session_hash = l.session_hash
       LEFT JOIN lead_profiles p ON p.session_hash = l.session_hash
       WHERE l.status IN ('new', 'contacted', 'qualified', 'proposal')
       ORDER BY COALESCE(d.lead_score, 0) DESC, l.created_at ASC
       LIMIT 100`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        COUNT(*) AS total_events,
        COUNT(DISTINCT session_hash) AS sessions,
        SUM(CASE WHEN event_type = 'page-view' THEN 1 ELSE 0 END) AS page_views,
        SUM(CASE WHEN event_type = 'open' THEN 1 ELSE 0 END) AS open_events,
        SUM(CASE WHEN event_type = 'chat' THEN 1 ELSE 0 END) AS chat_events,
        SUM(CASE WHEN event_type = 'audit-url' THEN 1 ELSE 0 END) AS audit_events,
        SUM(CASE WHEN event_type = 'brief' THEN 1 ELSE 0 END) AS brief_events,
        SUM(CASE WHEN event_type = 'lead-capture' THEN 1 ELSE 0 END) AS lead_capture_events,
        SUM(CASE WHEN event_type = 'consent' THEN 1 ELSE 0 END) AS consent_events
       FROM lead_events
       WHERE created_at >= ? AND created_at < ?`
    )
      .bind(todayStart, todayEnd)
      .first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        (SELECT COUNT(*) FROM lead_events
         WHERE lower(metadata_json) LIKE '%@%'
            OR lower(metadata_json) LIKE '%email%'
            OR lower(metadata_json) LIKE '%phone%'
            OR lower(metadata_json) LIKE '%tel%') AS event_pii_signals,
        (SELECT COUNT(*) FROM lead_sessions
         WHERE consented = 0
           AND conversation_summary IS NOT NULL
           AND lower(conversation_summary) LIKE '%@%') AS anonymous_summary_email_signals,
        (SELECT COUNT(*) FROM lead_briefs
         WHERE lead_id IS NULL
           AND (
            lower(COALESCE(summary, '')) LIKE '%@%'
            OR lower(COALESCE(notes, '')) LIKE '%@%'
           )) AS anonymous_brief_pii_signals,
        (SELECT COUNT(*)
         FROM leads l
         WHERE NOT EXISTS (
          SELECT 1 FROM consent_events c WHERE c.lead_id = l.id
         )) AS leads_without_consent_event,
        (SELECT COUNT(*) FROM lead_sessions
         WHERE consented = 0
           AND last_seen_at < datetime('now', '-${RETENTION.anonymousSessionDays} days')
           AND session_hash NOT IN (SELECT session_hash FROM leads)) AS anonymous_sessions_due_cleanup,
        (SELECT COUNT(*) FROM lead_events
         WHERE lead_id IS NULL
           AND created_at < datetime('now', '-${RETENTION.anonymousEventDays} days')) AS anonymous_events_due_cleanup,
        (SELECT COUNT(*) FROM lead_profiles) AS total_profiles,
        (SELECT COUNT(*) FROM leads) AS total_leads,
        (SELECT COUNT(*) FROM lead_sessions WHERE consented = 0) AS anonymous_sessions,
        (SELECT COUNT(*) FROM lead_profiles
         WHERE COALESCE(goal, '') = ''
            OR COALESCE(budget_slug, '') = ''
            OR COALESCE(timeline_slug, '') = ''
            OR COALESCE(service_slug, '') = '') AS incomplete_profiles,
        (SELECT COUNT(*) FROM lead_profiles WHERE COALESCE(goal, '') = '') AS missing_goal,
        (SELECT COUNT(*) FROM lead_profiles WHERE COALESCE(budget_slug, '') = '') AS missing_budget,
        (SELECT COUNT(*) FROM lead_profiles WHERE COALESCE(timeline_slug, '') = '') AS missing_timeline,
        (SELECT COUNT(*) FROM lead_profiles WHERE COALESCE(service_slug, '') = '') AS missing_service,
        (SELECT COUNT(*) FROM lead_profiles
         WHERE session_hash NOT IN (SELECT session_hash FROM lead_sessions)
           AND session_hash NOT IN (SELECT session_hash FROM leads)) AS orphan_profiles,
        (SELECT COUNT(*) FROM lead_diagnostics
         WHERE session_hash NOT IN (SELECT session_hash FROM lead_sessions)
           AND session_hash NOT IN (SELECT session_hash FROM leads)) AS orphan_diagnostics`
    ).first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        COUNT(*) AS total_audits,
        COUNT(DISTINCT a.session_hash) AS audited_sessions,
        COUNT(DISTINCT CASE WHEN l.id IS NOT NULL THEN a.id END) AS captured_audits,
        ROUND(AVG(COALESCE(a.clarity_score, 0)), 1) AS avg_clarity,
        ROUND(AVG(COALESCE(a.conversion_score, 0)), 1) AS avg_conversion,
        SUM(CASE WHEN COALESCE(a.clarity_score, 0) < 55 OR COALESCE(a.conversion_score, 0) < 55 THEN 1 ELSE 0 END) AS low_score_audits,
        SUM(CASE WHEN a.created_at >= datetime('now', '-7 days') THEN 1 ELSE 0 END) AS recent_7d,
        SUM(CASE WHEN a.report_r2_key IS NOT NULL AND a.report_r2_key != '' THEN 1 ELSE 0 END) AS archived_reports
       FROM lead_audits a
       LEFT JOIN leads l ON l.session_hash = a.session_hash`
    ).first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        a.id,
        a.session_hash,
        a.lead_id,
        a.title,
        a.h1,
        a.clarity_score,
        a.conversion_score,
        a.findings_json,
        a.report_r2_key,
        a.created_at,
        l.id AS captured_lead_id,
        COALESCE(l.name, 'Anonymous audit') AS lead_name,
        COALESCE(l.status, 'anonymous') AS lead_status,
        COALESCE(d.lead_score, 0) AS lead_score,
        COALESCE(d.primary_service, p.service_slug, 'unknown') AS primary_service
       FROM lead_audits a
       LEFT JOIN leads l ON l.session_hash = a.session_hash
       LEFT JOIN lead_diagnostics d ON d.session_hash = a.session_hash
       LEFT JOIN lead_profiles p ON p.session_hash = a.session_hash
       ORDER BY a.created_at DESC
       LIMIT 12`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        COALESCE(d.primary_service, p.service_slug, 'unknown') AS service,
        COUNT(*) AS audits,
        COUNT(DISTINCT l.id) AS leads,
        ROUND(AVG(COALESCE(a.clarity_score, 0)), 1) AS avg_clarity,
        ROUND(AVG(COALESCE(a.conversion_score, 0)), 1) AS avg_conversion
       FROM lead_audits a
       LEFT JOIN leads l ON l.session_hash = a.session_hash
       LEFT JOIN lead_diagnostics d ON d.session_hash = a.session_hash
       LEFT JOIN lead_profiles p ON p.session_hash = a.session_hash
       GROUP BY service
       ORDER BY audits DESC, leads DESC, avg_conversion ASC
       LIMIT 8`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT findings_json
       FROM lead_audits
       WHERE findings_json IS NOT NULL AND findings_json != '[]'
       ORDER BY created_at DESC
       LIMIT 100`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        s.conversation_summary,
        p.goal,
        p.business_type,
        p.offer,
        p.audience,
        p.budget_slug,
        p.timeline_slug,
        COALESCE(d.primary_service, p.service_slug, 'unknown') AS primary_service,
        d.next_best_action,
        d.blockers_json,
        d.lead_score,
        s.last_seen_at
       FROM lead_sessions s
       LEFT JOIN lead_profiles p ON p.session_hash = s.session_hash
       LEFT JOIN lead_diagnostics d ON d.session_hash = s.session_hash
       WHERE s.last_seen_at >= datetime('now', '-90 days')
         AND (
          COALESCE(s.conversation_summary, '') != ''
          OR COALESCE(p.goal, '') != ''
          OR COALESCE(p.offer, '') != ''
          OR COALESCE(d.next_best_action, '') != ''
         )
       ORDER BY COALESCE(d.lead_score, 0) DESC, s.last_seen_at DESC
       LIMIT 80`
    ).all<Record<string, unknown>>()
  ]);

  const metrics = summary || {};
  const leads = Number(metrics.leads || 0);
  const sessions = Number(metrics.sessions || 0);
  const serviceRows = services.results || [];
  const eventRows = events.results || [];
  const budgetRows = budgets.results || [];
  const timelineRows = timelines.results || [];
  const blockerRows = aggregateJsonArrayCounts(blockers.results || [], "blockers_json", 8);
  const nextActionRows = nextActions.results || [];
  const pageRows = pages.results || [];
  const contentLab = buildContentOfferLab({
    services: serviceRows,
    budgets: budgetRows,
    timelines: timelineRows,
    blockers: blockerRows,
    nextActions: nextActionRows,
    pages: pageRows
  });
  const leadSnapshot = buildLeadIntelligenceSnapshot({
    funnelGaps,
    profileQuality,
    recentInsights: recentInsights.results || []
  });
  const attribution = {
    sources: attributionSources.results || [],
    campaigns: attributionCampaigns.results || [],
    referrers: attributionReferrers.results || []
  };
  const executiveDigest = buildExecutiveDigest({
    metrics,
    services: serviceRows,
    events: eventRows,
    pages: pageRows,
    attribution,
    leadSnapshot,
    rollups: recentRollups.results || []
  });
  const pipeline = buildPipelineSnapshot({
    stats: pipelineStats,
    leadSnapshot
  });
  const revenueForecast = buildRevenueForecast(revenueRows.results || []);
  const slaMonitor = buildSlaMonitor(slaRows.results || []);
  const cloudflareServices = serviceStatus(env);
  const freeTierBudget = buildFreeTierBudgetSentinel(todayUsage || {}, cloudflareServices);
  const privacyDataQuality = buildPrivacyDataQualitySentinel(privacyAudit || {});
  const auditLab = buildAuditLab({
    stats: auditStats,
    recentAudits: auditRecent.results || [],
    serviceRows: auditServices.results || [],
    findingPatterns: aggregateJsonArrayCounts(auditFindings.results || [], "findings_json", 8),
    cloudflareServices
  });
  const conversionExperimentLab = buildConversionExperimentLab({
    pages: pageRows,
    events: eventRows,
    services: serviceRows,
    leadSnapshot,
    auditLab
  });
  const knowledgeGapRadar = buildKnowledgeGapRadar({
    services: serviceRows,
    blockers: blockerRows,
    nextActions: nextActionRows,
    signalRows: knowledgeSignals.results || [],
    cloudflareServices
  });
  const salesPlaybook = buildSalesPlaybook({
    leads: slaRows.results || [],
    revenueForecast,
    slaMonitor,
    auditLab
  });
  const cloudflareOperations = {
    ...buildCloudflareOperations(cloudflareServices, metrics, slaMonitor),
    budgetSentinel: freeTierBudget,
    privacyDataQuality
  };
  const securityAbuseCenter = buildSecurityAbuseCenter({
    metrics,
    events: eventRows,
    todayUsage: todayUsage || {},
    funnelGaps: funnelGaps || {},
    privacyDataQuality,
    cloudflareServices,
    freeTierBudget
  });
  const growthCommandCenter = buildGrowthCommandCenter({
    metrics,
    leads: slaRows.results || [],
    salesPlaybook,
    auditLab,
    conversionExperimentLab,
    knowledgeGapRadar,
    cloudflareOperations
  });

  return json(
    {
      generatedAt: new Date().toISOString(),
      today,
      summary: {
        sessions,
        leads,
        chats: Number(metrics.chats || 0),
        audits: Number(metrics.audits || 0),
        briefs: Number(metrics.briefs || 0),
        hotLeads: Number(metrics.hot_leads || 0),
        openTasks: Number(metrics.open_tasks || 0),
        overdueTasks: Number(metrics.overdue_tasks || 0),
        conversionRate: sessions ? Math.round((leads / sessions) * 1000) / 10 : 0
      },
      services: serviceRows,
      events: eventRows,
      rollups: recentRollups.results || [],
      intelligence: {
        budgets: budgetRows,
        timelines: timelineRows,
        blockers: blockerRows,
        nextActions: nextActionRows,
        pages: pageRows,
        attribution,
        executiveDigest,
        pipeline,
        revenueForecast,
        slaMonitor,
        cloudflareOperations,
        securityAbuseCenter,
        growthCommandCenter,
        freeTierBudget,
        privacyDataQuality,
        leadSnapshot,
        auditLab,
        conversionExperimentLab,
        knowledgeGapRadar,
        salesPlaybook,
        contentLab,
        retention: {
          policy: RETENTION,
          latestRun: (retention.results || [])[0] || null
        }
      },
      cloudflareServices
    },
    request,
    env
  );
}

async function handleAdminLeadList(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const limit = Math.min(LIMITS.maxAdminPageSize, Math.max(1, Number(url.searchParams.get("limit") || 25)));
  const offset = Math.max(0, Number(url.searchParams.get("offset") || 0));
  const status = clean(url.searchParams.get("status"), 40);
  const service = clean(url.searchParams.get("service"), 80);
  const filter = clean(url.searchParams.get("filter"), 40);

  const conditions: string[] = [];
  const binds: unknown[] = [];
  if (status) {
    conditions.push("l.status = ?");
    binds.push(status);
  }
  if (service) {
    conditions.push("d.primary_service = ?");
    binds.push(service);
  }
  if (filter === "hot") {
    conditions.push("COALESCE(d.lead_score, 0) >= 75");
  }
  if (filter === "audit") {
    conditions.push("EXISTS (SELECT 1 FROM lead_audits a WHERE a.session_hash = l.session_hash)");
  }
  if (filter === "tasks") {
    conditions.push("EXISTS (SELECT 1 FROM lead_tasks t WHERE t.lead_id = l.id AND t.status = 'open')");
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const leads = await env.ANALYTICS_DB!.prepare(
    `SELECT
      l.id, l.name, l.email, l.company, l.source, l.status, l.created_at, l.updated_at,
      d.lead_score, d.confidence, d.primary_service, d.next_best_action,
      p.budget_slug, p.timeline_slug,
      (SELECT COUNT(*) FROM lead_audits a WHERE a.session_hash = l.session_hash) AS audit_count,
      (SELECT COUNT(*) FROM lead_briefs b WHERE b.session_hash = l.session_hash) AS brief_count
     FROM leads l
     LEFT JOIN lead_diagnostics d ON d.session_hash = l.session_hash
     LEFT JOIN lead_profiles p ON p.session_hash = l.session_hash
     ${where}
     ORDER BY COALESCE(d.lead_score, 0) DESC, l.created_at DESC
     LIMIT ? OFFSET ?`
  )
    .bind(...binds, limit, offset)
    .all<Record<string, unknown>>();

  const total = await env.ANALYTICS_DB!.prepare(
    `SELECT COUNT(*) AS total
     FROM leads l
     LEFT JOIN lead_diagnostics d ON d.session_hash = l.session_hash
     LEFT JOIN lead_profiles p ON p.session_hash = l.session_hash
     ${where}`
  )
    .bind(...binds)
    .first<Record<string, unknown>>();

  return json({ leads: leads.results || [], total: Number(total?.total || 0), limit, offset }, request, env);
}

async function handleAdminTaskList(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const limit = Math.min(LIMITS.maxAdminPageSize, Math.max(1, Number(url.searchParams.get("limit") || 30)));
  const status = clean(url.searchParams.get("status") || "open", 40);
  const service = clean(url.searchParams.get("service"), 80);

  const conditions: string[] = [];
  const binds: unknown[] = [];
  if (status && status !== "all") {
    conditions.push("t.status = ?");
    binds.push(status);
  }
  if (service) {
    conditions.push("d.primary_service = ?");
    binds.push(service);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const tasks = await env.ANALYTICS_DB!.prepare(
    `SELECT
      t.id, t.lead_id, t.session_hash, t.task_type, t.status, t.due_at, t.payload_json, t.completed_at, t.created_at,
      l.name, l.email, l.company, l.status AS lead_status,
      d.lead_score, d.primary_service, d.next_best_action,
      p.budget_slug, p.timeline_slug
     FROM lead_tasks t
     LEFT JOIN leads l ON l.id = t.lead_id
     LEFT JOIN lead_diagnostics d ON d.session_hash = t.session_hash
     LEFT JOIN lead_profiles p ON p.session_hash = t.session_hash
     ${where}
     ORDER BY
      CASE
        WHEN t.status = 'open' AND t.due_at IS NOT NULL AND datetime(t.due_at) <= datetime('now') THEN 0
        WHEN t.status = 'open' THEN 1
        ELSE 2
      END,
      COALESCE(t.due_at, t.created_at) ASC
     LIMIT ?`
  )
    .bind(...binds, limit)
    .all<Record<string, unknown>>();

  const summary = await env.ANALYTICS_DB!.prepare(
    `SELECT
      SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) AS open_tasks,
      SUM(CASE WHEN status = 'open' AND due_at IS NOT NULL AND datetime(due_at) <= datetime('now') THEN 1 ELSE 0 END) AS overdue_tasks,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks
     FROM lead_tasks`
  ).first<Record<string, unknown>>();

  return json(
    {
      tasks: tasks.results || [],
      summary: {
        open: Number(summary?.open_tasks || 0),
        overdue: Number(summary?.overdue_tasks || 0),
        completed: Number(summary?.completed_tasks || 0)
      },
      limit
    },
    request,
    env
  );
}

async function handleAdminMaintenance(request: Request, env: Env): Promise<Response> {
  const body = await safeJson(request);
  const requestedDay = clean(body.day || todayKey(), 24);
  const day = /^\d{4}-\d{2}-\d{2}$/.test(requestedDay) ? requestedDay : todayKey();
  const started = Date.now();

  await generateDailyRollup(env, day);
  const cleanup = await runPrivacyCleanup(env);
  const rollup = await env.ANALYTICS_DB!.prepare(
    `SELECT *
     FROM daily_rollups
     WHERE day = ?
     LIMIT 1`
  )
    .bind(day)
    .first<Record<string, unknown>>();

  return json(
    {
      ok: true,
      mode: "manual-admin-maintenance",
      day,
      ranAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      rollup,
      cleanup,
      services: {
        d1: Boolean(env.ANALYTICS_DB),
        queue: Boolean(env.LEAD_JOBS),
        workflow: Boolean(env.DAILY_DIGEST_WORKFLOW)
      }
    },
    request,
    env
  );
}

async function handleAdminHealthCheck(request: Request, env: Env): Promise<Response> {
  const started = Date.now();
  const today = todayKey();
  const expectedTables = [
    "lead_sessions",
    "lead_profiles",
    "leads",
    "lead_diagnostics",
    "lead_briefs",
    "lead_audits",
    "lead_events",
    "lead_tasks",
    "daily_rollups",
    "consent_events",
    "data_retention_runs"
  ];
  const quotedTables = expectedTables.map((table) => `'${table}'`).join(",");

  const [tables, stats, latestRollup, latestCleanup] = await Promise.all([
    env.ANALYTICS_DB!.prepare(
      `SELECT name
       FROM sqlite_master
       WHERE type = 'table' AND name IN (${quotedTables})`
    ).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT
        (SELECT COUNT(*) FROM lead_sessions) AS sessions,
        (SELECT COUNT(*) FROM leads) AS leads,
        (SELECT COUNT(*) FROM lead_events WHERE datetime(created_at) >= datetime('now', '-24 hours')) AS recent_events,
        (SELECT COUNT(*) FROM lead_tasks WHERE status = 'open') AS open_tasks,
        (SELECT COUNT(*) FROM lead_tasks WHERE status = 'open' AND due_at IS NOT NULL AND datetime(due_at) <= datetime('now')) AS overdue_tasks,
        (SELECT COUNT(*) FROM daily_rollups WHERE day = ?) AS today_rollups`
    )
      .bind(today)
      .first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT day, chats, audits, briefs, leads, hot_leads, conversion_rate, updated_at
       FROM daily_rollups
       ORDER BY day DESC
       LIMIT 1`
    ).first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT *
       FROM data_retention_runs
       ORDER BY ran_at DESC
       LIMIT 1`
    ).first<Record<string, unknown>>()
  ]);

  const existingTables = new Set((tables.results || []).map((row) => rowString(row, "name")));
  const missingTables = expectedTables.filter((table) => !existingTables.has(table));
  const services = serviceStatus(env);
  const cleanupAgeHours = latestCleanup ? hoursSince(latestCleanup.ran_at) : null;
  const rollupAgeHours = latestRollup ? hoursSince(latestRollup.updated_at) : null;

  const checks = [
    {
      key: "d1-schema",
      label: "D1 schema",
      status: missingTables.length ? "fail" : "pass",
      weight: 18,
      detail: missingTables.length ? `Missing tables: ${missingTables.join(", ")}` : `${expectedTables.length} core tables present.`
    },
    {
      key: "d1-read",
      label: "D1 read path",
      status: stats ? "pass" : "fail",
      weight: 14,
      detail: `${rowNumber(stats || {}, "sessions")} sessions / ${rowNumber(stats || {}, "leads")} leads / ${rowNumber(stats || {}, "recent_events")} recent events.`
    },
    {
      key: "admin-auth",
      label: "Admin auth",
      status: services.adminAuth?.enabled ? "pass" : "fail",
      weight: 12,
      detail: services.adminAuth?.note || "Admin auth unavailable."
    },
    {
      key: "daily-rollup",
      label: "Daily rollup",
      status: rowNumber(stats || {}, "today_rollups") > 0 ? "pass" : latestRollup ? "watch" : "fail",
      weight: 12,
      detail: latestRollup ? `Latest rollup ${rowString(latestRollup, "day")} / ${rollupAgeHours === null ? "unknown age" : `${rollupAgeHours}h old`}.` : "No rollup found."
    },
    {
      key: "privacy-cleanup",
      label: "Privacy cleanup",
      status: cleanupAgeHours !== null && cleanupAgeHours <= 36 ? "pass" : latestCleanup ? "watch" : "fail",
      weight: 12,
      detail: latestCleanup ? `Latest cleanup ${cleanupAgeHours === null ? "unknown age" : `${cleanupAgeHours}h old`}.` : "No cleanup run found."
    },
    {
      key: "async-automation",
      label: "Queues and Workflows",
      status: services.queue?.enabled && services.workflows?.enabled ? "pass" : services.queue?.enabled || services.workflows?.enabled ? "watch" : "fail",
      weight: 10,
      detail: `${services.queue?.note || "Queue status unknown"} / ${services.workflows?.note || "Workflow status unknown"}`
    },
    {
      key: "sla-risk",
      label: "SLA risk",
      status: rowNumber(stats || {}, "overdue_tasks") > 0 ? "watch" : "pass",
      weight: 8,
      detail: `${rowNumber(stats || {}, "open_tasks")} open tasks / ${rowNumber(stats || {}, "overdue_tasks")} overdue.`
    },
    {
      key: "r2-artifacts",
      label: "R2 artifacts",
      status: services.r2?.enabled ? "pass" : "standby",
      weight: 6,
      detail: services.r2?.note || "R2 binding unavailable."
    },
    {
      key: "turnstile",
      label: "Turnstile",
      status: services.turnstile?.enabled ? "pass" : "standby",
      weight: 4,
      detail: services.turnstile?.note || "Turnstile unavailable."
    }
  ];

  const statusScore = { pass: 1, watch: 0.62, standby: 0.82, fail: 0 };
  const totalWeight = checks.reduce((total, check) => total + check.weight, 0);
  const weighted = checks.reduce((total, check) => total + check.weight * statusScore[check.status as keyof typeof statusScore], 0);
  const healthScore = totalWeight ? Math.round((weighted / totalWeight) * 100) : 0;

  return json(
    {
      ok: checks.every((check) => check.status !== "fail"),
      generatedAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      healthScore,
      posture: healthScore >= 90 ? "Operational" : healthScore >= 75 ? "Healthy with watch items" : "Needs operator review",
      summary: {
        pass: checks.filter((check) => check.status === "pass").length,
        watch: checks.filter((check) => check.status === "watch").length,
        standby: checks.filter((check) => check.status === "standby").length,
        fail: checks.filter((check) => check.status === "fail").length
      },
      stats,
      latestRollup,
      latestCleanup,
      checks
    },
    request,
    env
  );
}

async function handleAdminLeadDetail(request: Request, env: Env, leadId: string): Promise<Response> {
  const lead = await env.ANALYTICS_DB!.prepare(`SELECT * FROM leads WHERE id = ?`).bind(leadId).first<Record<string, unknown>>();
  if (!lead) return json({ error: "Lead not found" }, request, env, 404);

  const sessionHash = clean(lead.session_hash, 128);
  const [session, profile, diagnostic, briefs, audits, events, tasks, consents] = await Promise.all([
    env.ANALYTICS_DB!.prepare(`SELECT * FROM lead_sessions WHERE session_hash = ?`).bind(sessionHash).first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(`SELECT * FROM lead_profiles WHERE session_hash = ?`).bind(sessionHash).first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(`SELECT * FROM lead_diagnostics WHERE session_hash = ?`).bind(sessionHash).first<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(`SELECT * FROM lead_briefs WHERE session_hash = ? ORDER BY created_at DESC LIMIT 10`).bind(sessionHash).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(`SELECT * FROM lead_audits WHERE session_hash = ? ORDER BY created_at DESC LIMIT 10`).bind(sessionHash).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(`SELECT * FROM lead_events WHERE session_hash = ? ORDER BY created_at DESC LIMIT 60`).bind(sessionHash).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(`SELECT * FROM lead_tasks WHERE lead_id = ? ORDER BY created_at DESC LIMIT 20`).bind(leadId).all<Record<string, unknown>>(),
    env.ANALYTICS_DB!.prepare(
      `SELECT id, session_hash, lead_id, scope, copy_version, created_at
       FROM consent_events
       WHERE session_hash = ? OR lead_id = ?
       ORDER BY created_at DESC
       LIMIT 12`
    )
      .bind(sessionHash, leadId)
      .all<Record<string, unknown>>()
  ]);

  return json(
    {
      lead,
      session,
      profile,
      diagnostic,
      briefs: briefs.results || [],
      audits: audits.results || [],
      events: events.results || [],
      tasks: tasks.results || [],
      consents: consents.results || []
    },
    request,
    env
  );
}

async function insertAdminLeadEvent(
  env: Env,
  eventType: string,
  sessionHash: string,
  leadId: string,
  metadata: Record<string, unknown>
): Promise<void> {
  await env.ANALYTICS_DB!.prepare(
    `INSERT INTO lead_events
      (id, event_type, session_hash, lead_id, service_slug, score_band, page, metadata_json, created_at)
     VALUES (?, ?, ?, ?, NULL, NULL, 'admin-dashboard', ?, ?)`
  )
    .bind(
      crypto.randomUUID(),
      eventType,
      sessionHash,
      leadId,
      JSON.stringify(metadata),
      new Date().toISOString()
    )
    .run();
}

async function handleAdminLeadStatus(request: Request, env: Env, leadId: string): Promise<Response> {
  const body = await requestData(request);
  const status = clean(body.status, 40);
  const allowed = new Set(["new", "contacted", "qualified", "proposal", "won", "lost", "archived"]);
  if (!allowed.has(status)) return json({ error: "Invalid status" }, request, env, 400);

  const lead = await env.ANALYTICS_DB!.prepare(`SELECT id, session_hash, status FROM leads WHERE id = ?`)
    .bind(leadId)
    .first<Record<string, unknown>>();
  if (!lead) return json({ error: "Lead not found" }, request, env, 404);

  const previousStatus = clean(lead.status || "new", 40);
  const now = new Date().toISOString();
  await env.ANALYTICS_DB!.prepare(`UPDATE leads SET status = ?, updated_at = ? WHERE id = ?`)
    .bind(status, now, leadId)
    .run();

  if (previousStatus !== status) {
    await insertAdminLeadEvent(env, "admin-status-changed", clean(lead.session_hash, 128), leadId, {
      from: previousStatus,
      to: status
    });
  }
  return json({ ok: true, status }, request, env);
}

async function handleAdminTaskStatus(request: Request, env: Env, taskId: string): Promise<Response> {
  const body = await requestData(request);
  const status = clean(body.status, 40);
  const allowed = new Set(["open", "completed", "dismissed"]);
  if (!allowed.has(status)) return json({ error: "Invalid task status" }, request, env, 400);

  const now = new Date().toISOString();
  const task = await env.ANALYTICS_DB!.prepare(
    `SELECT id, lead_id, session_hash, task_type, status
     FROM lead_tasks
     WHERE id = ?`
  )
    .bind(taskId)
    .first<Record<string, unknown>>();
  if (!task) return json({ error: "Task not found" }, request, env, 404);

  const result = await env.ANALYTICS_DB!.prepare(
    `UPDATE lead_tasks
     SET status = ?, completed_at = CASE WHEN ? = 'completed' THEN ? ELSE NULL END
     WHERE id = ?`
  )
    .bind(status, status, now, taskId)
    .run();

  if (!result.meta.changes) return json({ error: "Task not found" }, request, env, 404);
  const leadId = clean(task.lead_id, 80);
  const sessionHash = clean(task.session_hash, 128);
  if (leadId && sessionHash && clean(task.status, 40) !== status) {
    await insertAdminLeadEvent(env, "admin-task-status", sessionHash, leadId, {
      taskId,
      taskType: clean(task.task_type, 80),
      from: clean(task.status, 40),
      to: status
    });
  }
  return json({ ok: true, status, completedAt: status === "completed" ? now : null }, request, env);
}

async function handleAdminLeadNote(request: Request, env: Env, leadId: string): Promise<Response> {
  const body = await requestData(request);
  const note = clean(body.note, 1200);
  if (!note) return json({ error: "Missing note" }, request, env, 400);

  const lead = await env.ANALYTICS_DB!.prepare(`SELECT id, session_hash FROM leads WHERE id = ?`)
    .bind(leadId)
    .first<Record<string, unknown>>();
  if (!lead) return json({ error: "Lead not found" }, request, env, 404);

  const stamped = `[${new Date().toISOString()}] ${note}`;
  await env.ANALYTICS_DB!.prepare(
    `UPDATE leads
     SET owner_notes = CASE WHEN owner_notes IS NULL OR owner_notes = '' THEN ? ELSE owner_notes || char(10) || char(10) || ? END,
         updated_at = ?
     WHERE id = ?`
  )
    .bind(stamped, stamped, new Date().toISOString(), leadId)
    .run();
  await insertAdminLeadEvent(env, "admin-note-added", clean(lead.session_hash, 128), leadId, {
    notePreview: redactPII(note).slice(0, 240)
  });
  return json({ ok: true }, request, env);
}

function adminTaskDueAt(value: string): string {
  const now = Date.now();
  const hours: Record<string, number> = {
    now: 0,
    today: 4,
    tomorrow: 24,
    "2-days": 48,
    "1-week": 168
  };
  const offset = Object.prototype.hasOwnProperty.call(hours, value) ? hours[value] : hours.tomorrow;
  return new Date(now + offset * 60 * 60 * 1000).toISOString();
}

async function handleAdminLeadTaskCreate(request: Request, env: Env, leadId: string): Promise<Response> {
  const body = await requestData(request);
  const taskType = clean(body.task_type || "follow_up", 60);
  const allowed = new Set(["follow_up", "review_ai_summary", "reply_to_email", "audit_review", "proposal_prep", "send_scope", "schedule_call"]);
  if (!allowed.has(taskType)) return json({ error: "Invalid task type" }, request, env, 400);

  const lead = await env.ANALYTICS_DB!.prepare(`SELECT id, session_hash FROM leads WHERE id = ?`)
    .bind(leadId)
    .first<Record<string, unknown>>();
  if (!lead) return json({ error: "Lead not found" }, request, env, 404);

  const note = clean(body.note || body.task_note || "Manual follow-up from dashboard.", 900);
  const dueAt = adminTaskDueAt(clean(body.due_in || "tomorrow", 40));
  const taskId = crypto.randomUUID();
  const now = new Date().toISOString();
  const sessionHash = clean(lead.session_hash, 128);
  const payload = {
    source: "admin-dashboard",
    note,
    createdBy: "admin",
    dueIn: clean(body.due_in || "tomorrow", 40)
  };

  await env.ANALYTICS_DB!.prepare(
    `INSERT INTO lead_tasks
      (id, lead_id, session_hash, task_type, status, due_at, payload_json, completed_at, created_at)
     VALUES (?, ?, ?, ?, 'open', ?, ?, NULL, ?)`
  )
    .bind(taskId, leadId, sessionHash, taskType, dueAt, JSON.stringify(payload), now)
    .run();

  await insertAdminLeadEvent(env, "admin-task-created", sessionHash, leadId, {
    taskId,
    taskType,
    dueAt,
    notePreview: redactPII(note).slice(0, 240)
  });

  return json({ ok: true, taskId, taskType, dueAt }, request, env, 201);
}

async function adminExportRows(env: Env): Promise<Record<string, unknown>[]> {
  const rows = await env.ANALYTICS_DB!.prepare(
    `SELECT
      l.id, l.name, l.email, l.phone, l.company, l.source, l.status, l.created_at,
      d.lead_score, d.primary_service, d.confidence,
      p.budget_slug, p.timeline_slug,
      (SELECT COUNT(*) FROM lead_tasks t WHERE t.lead_id = l.id AND t.status = 'open') AS open_tasks,
      (SELECT COUNT(*) FROM lead_audits a WHERE a.session_hash = l.session_hash) AS audits,
      (SELECT COUNT(*) FROM lead_briefs b WHERE b.session_hash = l.session_hash) AS briefs
     FROM leads l
     LEFT JOIN lead_diagnostics d ON d.session_hash = l.session_hash
     LEFT JOIN lead_profiles p ON p.session_hash = l.session_hash
     ORDER BY l.created_at DESC
     LIMIT 1000`
  ).all<Record<string, unknown>>();
  return rows.results || [];
}

function exportHeaders(): string[] {
  return [
    "id",
    "name",
    "email",
    "phone",
    "company",
    "source",
    "status",
    "created_at",
    "lead_score",
    "primary_service",
    "confidence",
    "budget_slug",
    "timeline_slug",
    "open_tasks",
    "audits",
    "briefs"
  ];
}

async function handleAdminExport(request: Request, env: Env): Promise<Response> {
  const rows = await adminExportRows(env);
  const headers = [
    ...exportHeaders()
  ];
  const csv = [
    headers.join(","),
    ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))
  ].join("\n");
  const responseHeaders = corsHeaders(request, env);
  responseHeaders.set("Content-Type", "text/csv; charset=utf-8");
  responseHeaders.set("Content-Disposition", `attachment; filename="creative-mk-leads-${todayKey()}.csv"`);
  responseHeaders.set("Cache-Control", "no-store");
  return new Response(csv, { headers: responseHeaders });
}

async function handleAdminExportJson(request: Request, env: Env): Promise<Response> {
  const rows = await adminExportRows(env);
  const metricsResponse = await handleAdminMetrics(request, env);
  const metricsSnapshot = (await metricsResponse.json()) as Record<string, unknown>;
  const generatedAt = new Date().toISOString();
  const snapshot = {
    generatedAt,
    snapshotVersion: 2,
    source: "creative-mk-cloudflare-d1-ops-snapshot",
    scope: "Cloudflare-only lead intelligence, operations readiness and CRM export",
    rowCount: rows.length,
    truncated: rows.length >= 1000,
    columns: exportHeaders(),
    rows,
    cloudflare: {
      services: metricsSnapshot.cloudflareServices || {},
      operations: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.cloudflareOperations || {},
      securityAbuseCenter: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.securityAbuseCenter || {},
      freeTierBudget: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.freeTierBudget || {},
      privacyDataQuality: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.privacyDataQuality || {}
    },
    commercial: {
      summary: metricsSnapshot.summary || {},
      services: metricsSnapshot.services || [],
      events: metricsSnapshot.events || [],
      executiveDigest: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.executiveDigest || {},
      pipeline: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.pipeline || {},
      revenueForecast: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.revenueForecast || {},
      slaMonitor: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.slaMonitor || {},
      growthCommandCenter: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.growthCommandCenter || {},
      auditLab: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.auditLab || {},
      conversionExperimentLab: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.conversionExperimentLab || {},
      knowledgeGapRadar: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.knowledgeGapRadar || {},
      salesPlaybook: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.salesPlaybook || {},
      contentLab: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.contentLab || {}
    },
    crmExport: {
      rowCount: rows.length,
      truncated: rows.length >= 1000,
      columns: exportHeaders(),
      rows
    },
    retention: (metricsSnapshot.intelligence as Record<string, unknown> | undefined)?.retention || {},
    privacyNote: "This admin-only export includes consented lead contact fields from the leads table. Analytics and operations sections remain aggregated."
  };
  const key = await storeArtifact(env, "export", await sha256(`admin-export-${generatedAt}`), snapshot);

  return json(
    {
      ...snapshot,
      r2: {
        enabled: Boolean(env.REPORTS_BUCKET),
        key
      }
    },
    request,
    env
  );
}

function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

async function runPrivacyCleanup(env: Env): Promise<Record<string, unknown> | null> {
  if (!env.ANALYTICS_DB) return null;

  const now = new Date().toISOString();
  const anonymousCutoff = daysAgoIso(RETENTION.anonymousSessionDays);
  const eventCutoff = daysAgoIso(RETENTION.anonymousEventDays);
  const taskCutoff = daysAgoIso(RETENTION.completedTaskDays);

  const orphanProfiles = await env.ANALYTICS_DB.prepare(
    `DELETE FROM lead_profiles
     WHERE session_hash NOT IN (SELECT session_hash FROM lead_sessions)
       AND session_hash NOT IN (SELECT session_hash FROM leads)`
  ).run();

  const orphanDiagnostics = await env.ANALYTICS_DB.prepare(
    `DELETE FROM lead_diagnostics
     WHERE session_hash NOT IN (SELECT session_hash FROM lead_sessions)
       AND session_hash NOT IN (SELECT session_hash FROM leads)`
  ).run();

  const anonymousEvents = await env.ANALYTICS_DB.prepare(
    `DELETE FROM lead_events
     WHERE lead_id IS NULL
       AND created_at < ?`
  )
    .bind(eventCutoff)
    .run();

  const oldProfiles = await env.ANALYTICS_DB.prepare(
    `DELETE FROM lead_profiles
     WHERE session_hash IN (
       SELECT s.session_hash
       FROM lead_sessions s
       LEFT JOIN leads l ON l.session_hash = s.session_hash
       WHERE s.consented = 0
         AND l.id IS NULL
         AND s.last_seen_at < ?
     )`
  )
    .bind(anonymousCutoff)
    .run();

  const oldDiagnostics = await env.ANALYTICS_DB.prepare(
    `DELETE FROM lead_diagnostics
     WHERE session_hash IN (
       SELECT s.session_hash
       FROM lead_sessions s
       LEFT JOIN leads l ON l.session_hash = s.session_hash
       WHERE s.consented = 0
         AND l.id IS NULL
         AND s.last_seen_at < ?
     )`
  )
    .bind(anonymousCutoff)
    .run();

  const oldSessions = await env.ANALYTICS_DB.prepare(
    `DELETE FROM lead_sessions
     WHERE consented = 0
       AND last_seen_at < ?
       AND session_hash NOT IN (SELECT session_hash FROM leads)`
  )
    .bind(anonymousCutoff)
    .run();

  const completedTasks = await env.ANALYTICS_DB.prepare(
    `DELETE FROM lead_tasks
     WHERE status IN ('completed', 'dismissed')
       AND COALESCE(completed_at, created_at) < ?`
  )
    .bind(taskCutoff)
    .run();

  const run = {
    id: crypto.randomUUID(),
    ranAt: now,
    anonymousCutoff,
    eventCutoff,
    taskCutoff,
    anonymousSessionsDeleted: Number(oldSessions.meta.changes || 0),
    orphanProfilesDeleted: Number(orphanProfiles.meta.changes || 0) + Number(oldProfiles.meta.changes || 0),
    orphanDiagnosticsDeleted: Number(orphanDiagnostics.meta.changes || 0) + Number(oldDiagnostics.meta.changes || 0),
    anonymousEventsDeleted: Number(anonymousEvents.meta.changes || 0),
    completedTasksDeleted: Number(completedTasks.meta.changes || 0),
    notes: "Kept consented leads, consent events, lead briefs, lead audits and captured-lead events."
  };

  await env.ANALYTICS_DB.prepare(
    `INSERT INTO data_retention_runs
      (id, ran_at, anonymous_cutoff, event_cutoff, task_cutoff, anonymous_sessions_deleted, orphan_profiles_deleted, orphan_diagnostics_deleted, anonymous_events_deleted, completed_tasks_deleted, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      run.id,
      run.ranAt,
      run.anonymousCutoff,
      run.eventCutoff,
      run.taskCutoff,
      run.anonymousSessionsDeleted,
      run.orphanProfilesDeleted,
      run.orphanDiagnosticsDeleted,
      run.anonymousEventsDeleted,
      run.completedTasksDeleted,
      run.notes
    )
    .run();

  return run;
}

async function generateDailyRollup(env: Env, day = todayKey()): Promise<void> {
  if (!env.ANALYTICS_DB) return;
  const start = `${day}T00:00:00.000Z`;
  const endDate = new Date(`${day}T00:00:00.000Z`);
  endDate.setUTCDate(endDate.getUTCDate() + 1);
  const end = endDate.toISOString();

  const [counts, services] = await Promise.all([
    env.ANALYTICS_DB.prepare(
      `SELECT
        SUM(CASE WHEN event_type = 'chat' THEN 1 ELSE 0 END) AS chats,
        SUM(CASE WHEN event_type = 'audit-url' THEN 1 ELSE 0 END) AS audits,
        SUM(CASE WHEN event_type = 'brief' THEN 1 ELSE 0 END) AS briefs,
        SUM(CASE WHEN event_type = 'lead-capture' THEN 1 ELSE 0 END) AS leads,
        SUM(CASE WHEN event_type = 'lead-capture' AND score_band >= 60 THEN 1 ELSE 0 END) AS hot_leads,
        COUNT(DISTINCT session_hash) AS sessions
       FROM lead_events
       WHERE created_at >= ? AND created_at < ?`
    )
      .bind(start, end)
      .first<Record<string, unknown>>(),
    env.ANALYTICS_DB.prepare(
      `SELECT COALESCE(service_slug, 'unknown') AS service, COUNT(*) AS count
       FROM lead_events
       WHERE created_at >= ? AND created_at < ? AND service_slug IS NOT NULL
       GROUP BY service_slug
       ORDER BY count DESC
       LIMIT 12`
    )
      .bind(start, end)
      .all<Record<string, unknown>>()
  ]);

  const chats = Number(counts?.chats || 0);
  const audits = Number(counts?.audits || 0);
  const briefs = Number(counts?.briefs || 0);
  const leads = Number(counts?.leads || 0);
  const hotLeads = Number(counts?.hot_leads || 0);
  const sessions = Number(counts?.sessions || 0);
  const conversionRate = sessions ? Math.round((leads / sessions) * 1000) / 10 : 0;
  const serviceDemand = Object.fromEntries((services.results || []).map((row) => [String(row.service), Number(row.count || 0)]));
  const now = new Date().toISOString();

  await env.ANALYTICS_DB.prepare(
    `INSERT INTO daily_rollups
      (day, chats, audits, briefs, leads, hot_leads, service_demand_json, conversion_rate, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(day) DO UPDATE SET
      chats = excluded.chats,
      audits = excluded.audits,
      briefs = excluded.briefs,
      leads = excluded.leads,
      hot_leads = excluded.hot_leads,
      service_demand_json = excluded.service_demand_json,
      conversion_rate = excluded.conversion_rate,
      updated_at = excluded.updated_at`
  )
    .bind(day, chats, audits, briefs, leads, hotLeads, JSON.stringify(serviceDemand), conversionRate, now, now)
    .run();

  await storeArtifact(env, "digest", await sha256(day), {
    day,
    chats,
    audits,
    briefs,
    leads,
    hotLeads,
    conversionRate,
    serviceDemand,
    generatedAt: now
  });
}

async function processLeadJob(env: Env, job: LeadJob): Promise<void> {
  if (job.type === "daily.rollup") {
    await generateDailyRollup(env, job.day || todayKey());
    await runPrivacyCleanup(env);
    return;
  }

  if (!env.ANALYTICS_DB || !job.leadId) return;

  if (job.type === "lead.created") {
    const existing = await env.ANALYTICS_DB.prepare(
      `SELECT id FROM lead_tasks WHERE lead_id = ? AND task_type = 'review_ai_summary' AND status = 'open' LIMIT 1`
    )
      .bind(job.leadId)
      .first<Record<string, unknown>>();
    if (existing) return;

    await env.ANALYTICS_DB.prepare(
      `INSERT INTO lead_tasks
        (id, lead_id, session_hash, task_type, status, due_at, payload_json, completed_at, created_at)
       VALUES (?, ?, ?, 'review_ai_summary', 'open', ?, ?, NULL, ?)`
    )
      .bind(
        crypto.randomUUID(),
        job.leadId,
        job.sessionHash || null,
        new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        JSON.stringify(job.payload || {}),
        new Date().toISOString()
      )
      .run();
  }
}

function emailNameFromHeaders(message: ForwardableEmailMessage): string {
  const fromHeader = message.headers.get("from") || message.from;
  const match = fromHeader.match(/^"?([^"<]+)"?\s*</);
  const name = clean(match?.[1], 120);
  if (name) return name;
  return clean(message.from.split("@")[0].replace(/[._-]+/g, " "), 120) || "Email lead";
}

async function handleInboundEmail(message: ForwardableEmailMessage, env: Env): Promise<void> {
  const from = validEmail(message.from);
  if (!from || !env.ANALYTICS_DB) return;

  const now = new Date().toISOString();
  const sessionHash = await sha256(`email:${from}`);
  const subject = redactPII(message.headers.get("subject") || "Inbound email").slice(0, 240);
  const source = clean(message.to || "email-routing", 120);
  let lead = await env.ANALYTICS_DB.prepare(`SELECT id, session_hash FROM leads WHERE email = ? ORDER BY created_at DESC LIMIT 1`)
    .bind(from)
    .first<Record<string, unknown>>();

  if (!lead) {
    const leadId = crypto.randomUUID();
    await env.ANALYTICS_DB.prepare(
      `INSERT INTO lead_sessions
        (session_hash, first_seen_at, last_seen_at, language, landing_page, utm_json, status, consented, conversation_summary)
       VALUES (?, ?, ?, 'en', 'email-routing', '{}', 'captured', 1, ?)
       ON CONFLICT(session_hash) DO UPDATE SET last_seen_at = excluded.last_seen_at, status = 'captured', consented = 1`
    )
      .bind(sessionHash, now, now, `Inbound email: ${subject}`)
      .run();

    await env.ANALYTICS_DB.prepare(
      `INSERT INTO leads
        (id, session_hash, name, email, phone, company, source, consent_at, status, owner_notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, NULL, NULL, ?, ?, 'new', ?, ?, ?)`
    )
      .bind(leadId, sessionHash, emailNameFromHeaders(message), from, "email-routing", now, `Inbound subject: ${subject}`, now, now)
      .run();
    lead = { id: leadId, session_hash: sessionHash };
  }

  const leadId = clean(lead.id, 80);
  const linkedSessionHash = clean(lead.session_hash || sessionHash, 128);
  await env.ANALYTICS_DB.prepare(
    `INSERT INTO lead_events
      (id, event_type, session_hash, lead_id, service_slug, score_band, page, metadata_json, created_at)
     VALUES (?, 'email.ingest', ?, ?, NULL, NULL, 'email-routing', ?, ?)`
  )
    .bind(
      crypto.randomUUID(),
      linkedSessionHash,
      leadId,
      JSON.stringify({ fromHash: await sha256(from), to: source, subject }),
      now
    )
    .run();

  await env.ANALYTICS_DB.prepare(
    `INSERT INTO lead_tasks
      (id, lead_id, session_hash, task_type, status, due_at, payload_json, completed_at, created_at)
     VALUES (?, ?, ?, 'reply_to_email', 'open', ?, ?, NULL, ?)`
  )
    .bind(
      crypto.randomUUID(),
      leadId,
      linkedSessionHash,
      new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
      JSON.stringify({ subject, source }),
      now
    )
    .run();

  await enqueueLeadJob(env, {
    type: "email.ingest",
    sessionHash: linkedSessionHash,
    leadId,
    payload: { fromHash: await sha256(from), subject },
    createdAt: now
  });

  if (env.EMAIL_FORWARD_TO) {
    await message.forward(env.EMAIL_FORWARD_TO);
  }
}

export class LeadEnrichmentWorkflow extends WorkflowEntrypoint<Env, LeadJob> {
  async run(event: WorkflowEvent<LeadJob>, step: WorkflowStep): Promise<{ ok: boolean; type: string }> {
    await step.do("process lead intelligence job", async () => {
      await processLeadJob(this.env, event.payload);
      return { processed: true };
    });

    return { ok: true, type: event.payload.type };
  }
}

export class DailyDigestWorkflow extends WorkflowEntrypoint<Env, LeadJob> {
  async run(event: WorkflowEvent<LeadJob>, step: WorkflowStep): Promise<{ ok: boolean; day: string }> {
    const day = event.payload.day || todayKey();
    await step.do("calculate daily rollup", async () => {
      await generateDailyRollup(this.env, day);
      await runPrivacyCleanup(this.env);
      return { day };
    });

    return { ok: true, day };
  }
}

export class AuditWorkflow extends WorkflowEntrypoint<Env, LeadJob> {
  async run(event: WorkflowEvent<LeadJob>, step: WorkflowStep): Promise<{ ok: boolean; auditId?: string }> {
    await step.do("mark audit workflow processed", async () => {
      await processLeadJob(this.env, event.payload);
      return { auditId: event.payload.auditId || null };
    });

    return { ok: true, auditId: event.payload.auditId };
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return json({ ok: true, service: "creative-mk-concierge", limits: LIMITS, services: serviceStatus(env) }, request, env);
    }

    const rateLimited = await enforceRouteLimit(request, env);
    if (rateLimited) return rateLimited;

    if (url.pathname.startsWith("/admin/api/")) {
      return handleAdminRequest(request, env);
    }

    const response = await routeAgentRequest(request, env);
    if (response) return withCors(response, request, env);

    return json({ error: "Not found" }, request, env, 404);
  },

  async queue(batch: MessageBatch<LeadJob>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      try {
        await processLeadJob(env, message.body);
        message.ack();
      } catch {
        message.retry({ delaySeconds: 60 });
      }
    }
  },

  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const job: LeadJob = { type: "daily.rollup", day: todayKey(), createdAt: new Date().toISOString() };
    if (env.LEAD_JOBS) {
      ctx.waitUntil(
        Promise.all([
          env.LEAD_JOBS.send(job, { contentType: "json" }).catch(() => runPrivacyCleanup(env).then(() => undefined)),
          generateDailyRollup(env, job.day)
        ]).then(() => undefined)
      );
      return;
    }
    ctx.waitUntil(Promise.all([generateDailyRollup(env, job.day), runPrivacyCleanup(env)]).then(() => undefined));
  },

  async email(message: ForwardableEmailMessage, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(handleInboundEmail(message, env));
  }
};
