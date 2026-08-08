export type KnowledgeDoc = {
  id: string;
  title: string;
  serviceSlug: string;
  keywords: string[];
  content: string;
};

export const KNOWLEDGE_VERSION = "2026-06-clay-inspired-v2";

export const KNOWLEDGE_DOCS: KnowledgeDoc[] = [
  {
    id: "service-web-conversion",
    title: "Website Conversion System",
    serviceSlug: "web-design",
    keywords: ["website", "web", "redesign", "seo", "conversion", "homepage", "site", "pagina", "sitio"],
    content:
      "Use Websites when the business needs a clearer digital home, stronger positioning, better trust signals, and a path from visit to inquiry. Best fit: service businesses, local brands, premium offers, and teams whose current site does not explain what they sell in under ten seconds. Typical stack: messaging clarity, information architecture, conversion-focused pages, CTA architecture, analytics basics, and a follow-up path."
  },
  {
    id: "service-landing-offer",
    title: "Landing Page And Offer Capture",
    serviceSlug: "landing-pages",
    keywords: ["landing", "campaign", "offer", "launch", "leads", "captura", "oferta", "campana"],
    content:
      "Use the Growth & Marketing path when the client has one clear offer, campaign, launch, event, lead magnet, or traffic destination. Best fit: businesses with a defined audience and a single conversion goal. Typical stack: offer sharpening, headline, proof, objections, CTA, lead form, thank-you path, and tracking."
  },
  {
    id: "service-funnel-automation",
    title: "Sales Funnel And Follow-Up",
    serviceSlug: "sales-funnels",
    keywords: ["funnel", "embudo", "sales", "ventas", "crm", "email", "whatsapp", "follow-up", "nurture"],
    content:
      "Use Growth & Marketing when the client gets attention but loses leads after the first touch. Best fit: consulting, real estate, wellness, education, high-ticket services, and businesses with multi-step decisions. Typical stack: lead capture, qualification, email or WhatsApp follow-up, objection handling, appointment CTA, and simple CRM handoff."
  },
  {
    id: "service-paid-growth",
    title: "Growth And Marketing Traffic Loop",
    serviceSlug: "meta-ads",
    keywords: ["ads", "meta", "facebook", "instagram", "paid", "pauta", "trafico", "traffic", "acquisition"],
    content:
      "Use Growth & Marketing when the offer and landing path are clear enough to test traffic. Best fit: brands that already know the audience, have creative assets or can produce them, and can handle inquiries. Typical stack: creative angles, campaign structure, audience testing, landing page alignment, tracking, and weekly learning loop. Do not promise guaranteed revenue or ROAS."
  },
  {
    id: "service-brand-foundation",
    title: "Brand Foundation",
    serviceSlug: "branding",
    keywords: ["brand", "branding", "logo", "identity", "identidad", "manual", "visual", "marca", "positioning"],
    content:
      "Use Branding when the business looks inconsistent, is repositioning, launching a premium offer, or needs trust before scaling traffic. Best fit: founders, boutique services, product launches, and companies moving upmarket. Typical stack: positioning, visual identity, logo system, voice direction, brand manual, and a launch-ready digital expression."
  },
  {
    id: "service-social-demand",
    title: "Growth And Marketing Content Rhythm",
    serviceSlug: "social-media",
    keywords: ["social", "content", "contenido", "instagram", "reels", "tiktok", "community", "redes"],
    content:
      "Use Growth & Marketing when the client needs consistent demand creation, authority, and proof before conversion. Best fit: personal brands, service businesses, creators, venues, and lifestyle products. Typical stack: content pillars, short-form direction, editorial rhythm, offers, proof posts, and campaign tie-ins."
  },
  {
    id: "service-ai-automation",
    title: "AI Automation Assistant",
    serviceSlug: "ai-automation",
    keywords: ["ai", "ia", "automation", "automatizacion", "chatbot", "agent", "agente", "workflow", "ops"],
    content:
      "Use AI Automation when the business has repetitive intake, follow-up, routing, FAQs, reporting, or internal operations that slow the team. Best fit: agencies, clinics, consultants, real estate, education, and service teams. Typical stack: process audit, form or chat intake, knowledge base, routing rules, human handoff, analytics, and measurable iteration. Keep privacy clear and avoid collecting sensitive data in public chat."
  },
  {
    id: "service-app-product",
    title: "App Or Product Build",
    serviceSlug: "app-development",
    keywords: ["app", "software", "portal", "dashboard", "saas", "platform", "producto", "product"],
    content:
      "Use Development when the client needs a custom workflow, portal, product, dashboard, booking flow, or internal tool that a website cannot solve. Best fit: teams with a repeated process and a clear business case. Typical stack: discovery, UX prototype, MVP scope, build, analytics, and iteration."
  },
  {
    id: "service-ux-ui",
    title: "UX UI Product Clarity",
    serviceSlug: "ux-ui-design",
    keywords: ["ux", "ui", "prototype", "prototipo", "flow", "wireframe", "experience", "experiencia"],
    content:
      "Use Digital Product UX/UI when the client already has an app, portal, web product, or complex flow that needs clarity before build. Best fit: SaaS, dashboards, client portals, marketplaces, and service workflows. Typical stack: user flows, wireframes, prototype, UI system, and handoff."
  },
  {
    id: "pricing-scope-free-tier",
    title: "Budget And Scope Guidance",
    serviceSlug: "strategy",
    keywords: ["budget", "presupuesto", "price", "pricing", "cost", "scope", "timeline", "tiempo"],
    content:
      "Use budget as a scope signal, not a pressure tactic. Under 1000 usually fits focused audits, small fixes, or a lean page. 1000 to 3000 fits a compact website, campaign asset, or starter brand layer. 3000 to 7500 fits stronger website, branding, UX, growth, or automation scope. 7500 plus fits full systems, custom development, or multi-channel launches. If budget is unknown, recommend a diagnostic first."
  },
  {
    id: "objections-trust",
    title: "Common Objections And Trust Signals",
    serviceSlug: "strategy",
    keywords: ["objection", "objecion", "trust", "confianza", "proof", "duda", "risk"],
    content:
      "Common objections: unclear price, fear of slow delivery, uncertainty about ROI, too many services, and not knowing where to start. The concierge should reduce friction by recommending one primary path, naming why, explaining the first milestone, and moving only ready visitors to the form. Never create pressure or ask for personal data inside chat."
  },
  {
    id: "brand-voice",
    title: "CREATIVE MK Voice",
    serviceSlug: "strategy",
    keywords: ["voice", "tone", "tono", "brand", "creative mk", "style", "copy"],
    content:
      "Voice: premium, direct, useful, calm, and studio-like. Avoid hype, exaggerated promises, copied Clay language, and generic agency claims. Speak as a strategist: diagnose, simplify, and recommend the next best action. Keep answers short, bilingual, and grounded in the current visitor context."
  }
];
