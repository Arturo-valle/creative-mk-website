(function () {
  const TOKEN_KEY = 'creativeMkAdminToken';
  const API_BASE = '/admin/api';
  const state = {
    token: '',
    view: 'inbox',
    leads: [],
    selectedLeadId: null,
    lastMaintenance: null,
    lastHealth: null
  };

  const authForm = document.getElementById('auth-form');
  const tokenInput = document.getElementById('admin-token');
  const authState = document.getElementById('auth-state');
  const refreshButton = document.getElementById('refresh');
  const disconnectButton = document.getElementById('disconnect');
  const exportLink = document.getElementById('export-link');
  const snapshotLink = document.getElementById('snapshot-link');
  const leadRows = document.getElementById('lead-rows');
  const detailPanel = document.getElementById('detail-panel');
  const statusFilter = document.getElementById('status-filter');
  const serviceFilter = document.getElementById('service-filter');
  const viewTitle = document.getElementById('view-title');
  const viewSubtitle = document.getElementById('view-subtitle');
  const taskList = document.getElementById('task-list');
  const taskSummary = document.getElementById('task-summary');
  const dealBoard = document.getElementById('deal-board');
  const slaMonitor = document.getElementById('sla-monitor');
  const cloudflareOps = document.getElementById('cloudflare-ops');
  const activationChecklist = document.getElementById('activation-checklist');
  const maintenanceConsole = document.getElementById('maintenance-console');
  const systemHealth = document.getElementById('system-health');
  const DEAL_STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
  const NEXT_STAGE = {
    new: 'contacted',
    contacted: 'qualified',
    qualified: 'proposal',
    proposal: 'won'
  };

  function storedToken() {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || '';
    } catch {
      return '';
    }
  }

  function saveToken(token) {
    state.token = token.trim();
    try {
      if (state.token) sessionStorage.setItem(TOKEN_KEY, state.token);
    } catch {
      // Ignore storage failures.
    }
  }

  function clearToken() {
    state.token = '';
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore storage failures.
    }
  }

  function headers(extra) {
    const base = { Accept: 'application/json', ...(extra || {}) };
    if (state.token) base.Authorization = `Bearer ${state.token}`;
    return base;
  }

  async function api(path, options) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...(options || {}),
      headers: headers(options?.headers)
    });
    const contentType = response.headers.get('Content-Type') || '';
    const data = contentType.includes('application/json') ? await response.json().catch(() => ({})) : await response.text();
    if (!response.ok) {
      throw new Error(data.error || `Request failed ${response.status}`);
    }
    return data;
  }

  function setAuthState(message, ok) {
    authState.textContent = message;
    authState.classList.toggle('error-text', !ok);
    exportLink.href = '/admin/api/export.csv';
    snapshotLink.href = '/admin/api/export.json';
  }

  function formatDate(value) {
    if (!value) return '--';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }

  function formatDateTime(value) {
    if (!value) return '--';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return String(value).slice(0, 16);
    return date.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }

  function human(value) {
    return String(value || '--').replace(/-/g, ' ');
  }

  function money(value) {
    const amount = Number(value || 0);
    return amount.toLocaleString(undefined, {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[char]);
  }

  function safeHuman(value) {
    return escapeHtml(human(value));
  }

  function priorityClass(priority) {
    return ['high', 'medium', 'low'].includes(priority) ? `is-${priority}` : 'is-low';
  }

  function scoreCell(score) {
    const value = Number(score || 0);
    return `<span class="score-pill ${value >= 75 ? 'is-hot' : ''}">${value}</span>`;
  }

  function compactText(value, fallback) {
    const text = String(value || '').replace(/\s+/g, ' ').trim();
    return text || fallback || '';
  }

  function buildReplyDraft(data) {
    const lead = data.lead || {};
    const diagnostic = data.diagnostic || {};
    const profile = data.profile || {};
    const latestBrief = (data.briefs || [])[0] || {};
    const latestAudit = (data.audits || [])[0] || {};
    const firstName = compactText(lead.name, 'there').split(' ')[0];
    const service = human(diagnostic.primary_service || profile.service_slug || 'growth system');
    const budget = human(profile.budget_slug || latestBrief.budget || 'budget pending');
    const timeline = human(profile.timeline_slug || latestBrief.timeline || 'timeline pending');
    const goal = compactText(profile.goal || latestBrief.summary, 'clarify the next growth move');
    const nextAction = compactText(diagnostic.next_best_action, 'map the fastest path from diagnosis to launch');
    const auditLine = latestAudit.id
      ? `I also saw the website audit signal: clarity ${latestAudit.clarity_score || '--'}/100 and conversion ${latestAudit.conversion_score || '--'}/100.`
      : 'If helpful, we can also run a quick website clarity and conversion check before scoping.';
    const subject = `CREATIVE MK next step for ${service}`;
    const body = [
      `Hi ${firstName},`,
      '',
      `Thanks for sharing the diagnostic with CREATIVE MK. Based on what you sent, the strongest path looks like ${service}.`,
      '',
      `What stood out: ${goal}. Budget signal: ${budget}. Timeline: ${timeline}.`,
      auditLine,
      '',
      `Suggested next step: ${nextAction}.`,
      '',
      'If you want, we can reply with a simple first-sprint scope: what we would fix first, what assets we need, and what should be live within the first few weeks.',
      '',
      'CREATIVE MK'
    ].join('\n');

    return { subject, body };
  }

  async function copyText(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  }

  function renderMetric(id, value) {
    document.getElementById(id).textContent = String(value ?? 0);
  }

  function renderBars(targetId, rows, labelField, valueField) {
    const target = document.getElementById(targetId);
    const max = Math.max(1, ...rows.map((row) => Number(row[valueField] || 0)));
    if (!rows.length) {
      target.innerHTML = '<p class="detail-meta">No data yet.</p>';
      return;
    }
    target.innerHTML = rows
      .map((row) => {
        const value = Number(row[valueField] || 0);
        return `
          <div class="bar-row">
            <div class="bar-row__top">
              <span>${safeHuman(row[labelField])}</span>
              <strong>${value}</strong>
            </div>
            <div class="bar"><span style="width:${Math.max(6, Math.round((value / max) * 100))}%"></span></div>
          </div>
        `;
      })
      .join('');
  }

  function renderExecutiveDigest(digest) {
    const target = document.getElementById('executive-digest');
    const data = digest || {};
    const kpis = data.kpis || [];
    const risks = data.risks || [];
    const actions = data.actions || [];

    target.innerHTML = `
      <div class="digest-hero">
        <span>Generated ${formatDateTime(data.generatedAt)}</span>
        <strong>${escapeHtml(data.headline || 'Waiting for enough D1 signal to produce a daily digest.')}</strong>
      </div>
      <div class="digest-kpis">
        ${kpis.length ? kpis.map((item) => `
          <div>
            <span>${escapeHtml(item.label || 'Metric')}</span>
            <strong>${escapeHtml(item.value ?? 0)}</strong>
            <small>${escapeHtml(item.note || '')}</small>
          </div>
        `).join('') : '<p class="detail-meta">No KPI data yet.</p>'}
      </div>
      <div class="digest-columns">
        <section>
          <h3>Risks</h3>
          ${risks.length ? risks.map((item) => `
            <article class="digest-card">
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.title || 'Risk')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No risks yet.</p>'}
        </section>
        <section>
          <h3>Today Actions</h3>
          ${actions.length ? actions.map((item) => `
            <article class="digest-card">
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.action || 'Action')}</strong>
              <p>${escapeHtml(item.why || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No actions yet.</p>'}
        </section>
      </div>
    `;
  }

  function renderGrowthCommandCenter(commandCenter) {
    const target = document.getElementById('growth-command-center');
    if (!target) return;
    const data = commandCenter || {};
    const summary = data.summary || {};
    const commands = data.commandQueue || [];
    const cadence = data.operatingCadence || [];
    const automationMap = data.cloudflareAutomationMap || [];
    const rules = data.decisionRules || [];
    const counts = data.commandCounts || {};

    if (!Object.keys(data).length) {
      target.innerHTML = '<p class="detail-meta">Connect with an admin token to load the growth command center.</p>';
      return;
    }

    target.innerHTML = `
      <div class="command-hero">
        <div>
          <span>Posture</span>
          <strong>${escapeHtml(summary.posture || 'Waiting for signal')}</strong>
          <small>${Number(summary.highPriority || 0)} high-priority commands / ${Number(summary.totalCommands || 0)} total</small>
        </div>
        <div>
          <span>Top Focus</span>
          <strong>${escapeHtml(summary.topFocus || 'Collect qualified signal')}</strong>
          <small>${Number(summary.hotLeads || 0)} hot leads / ${Number(summary.overdueTasks || 0)} overdue tasks</small>
        </div>
        <div>
          <span>System Readiness</span>
          <strong>${Number(summary.cloudflareReadiness || 0)}%</strong>
          <small>${Number(summary.activeServices || 0)} Cloudflare services active / ${escapeHtml(summary.knowledgeTopGap || 'No knowledge gap')}</small>
        </div>
      </div>
      <div class="command-counts">
        ${Object.entries(counts).length ? Object.entries(counts).map(([type, value]) => `
          <span>${safeHuman(type)} <strong>${Number(value || 0)}</strong></span>
        `).join('') : '<span>No command mix yet</span>'}
      </div>
      <div class="command-grid">
        <section class="command-main">
          <h3>Priority Queue</h3>
          ${commands.length ? commands.map((item) => `
            <article class="command-card is-${escapeHtml(item.type || 'command')}">
              <div class="command-card__top">
                <div>
                  <span>${safeHuman(item.type || 'command')}</span>
                  <strong>${escapeHtml(item.title || 'Command')}</strong>
                </div>
                <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              </div>
              <p>${escapeHtml(item.detail || '')}</p>
              <small>${escapeHtml(item.meta || item.source || '')}</small>
              <div class="command-card__actions">
                ${item.leadId ? `<button type="button" data-command-lead="${escapeHtml(item.leadId)}">Open lead</button>` : ''}
                ${item.copy ? `<button type="button" data-command-copy="${escapeHtml(encodeURIComponent(item.copy))}">Copy command</button>` : ''}
              </div>
            </article>
          `).join('') : '<p class="detail-meta">No operating commands yet. More D1 signals will activate this queue.</p>'}
        </section>
        <section class="command-side">
          <h3>Operating Cadence</h3>
          ${cadence.length ? cadence.map((item) => `
            <article class="command-cadence">
              <span>${escapeHtml(item.step || '')}</span>
              <strong>${escapeHtml(item.title || 'Step')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No cadence yet.</p>'}
        </section>
      </div>
      <div class="command-bottom">
        <section>
          <h3>Cloudflare Automation Map</h3>
          ${automationMap.length ? automationMap.map((item) => `
            <article class="command-automation">
              <span>${escapeHtml(item.layer || 'Layer')}</span>
              <strong>${escapeHtml(item.stack || 'Cloudflare')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No automation map yet.</p>'}
        </section>
        <section>
          <h3>Decision Rules</h3>
          <div class="command-rules">
            ${rules.length ? rules.map((rule) => `<span>${escapeHtml(rule)}</span>`).join('') : '<span>Prioritize high-intent leads before optimization work.</span>'}
          </div>
        </section>
      </div>
      <p class="command-source">${escapeHtml(data.source || 'Cloudflare D1 operating signals')}</p>
    `;
  }

  function renderCloudflareStack(services) {
    const target = document.getElementById('cloudflare-stack');
    const entries = Object.entries(services || {});
    if (!entries.length) {
      target.innerHTML = '<p class="detail-meta">Service status unavailable.</p>';
      return;
    }

    target.innerHTML = entries
      .map(([name, status]) => {
        const enabled = Boolean(status.enabled);
        return `
          <div class="stack-item">
            <div class="stack-item__top">
              <strong>${safeHuman(name)}</strong>
              <span class="stack-pill ${enabled ? '' : 'is-fallback'}">${escapeHtml(enabled ? status.mode : 'fallback')}</span>
            </div>
            <p>${escapeHtml(status.note || '')}</p>
          </div>
        `;
      })
      .join('');
  }

  function renderCloudflareOperations(operations) {
    const target = document.getElementById('cloudflare-ops');
    if (!target) return;
    const ops = operations || {};
    const summary = ops.summary || {};
    const layers = ops.layers || [];
    const risks = ops.risks || [];
    const activations = ops.nextActivations || [];
    const guardrails = ops.guardrails || [];
    const actions = ops.actions || [];
    const budget = ops.budgetSentinel || {};
    const budgets = budget.budgets || [];
    const budgetRecommendations = budget.recommendations || [];
    const score = Math.max(0, Math.min(100, Number(ops.readinessScore || 0)));

    if (!Object.keys(ops).length) {
      target.innerHTML = '<p class="detail-meta">Connect with an admin token to load Cloudflare operations readiness.</p>';
      return;
    }

    target.innerHTML = `
      <div class="ops-hero">
        <div class="ops-score" style="--score:${score}%">
          <span>Readiness</span>
          <strong>${score}%</strong>
        </div>
        <div class="ops-hero__copy">
          <span>Cloudflare Free posture</span>
          <strong>${escapeHtml(ops.posture || 'Operational posture unavailable')}</strong>
          <p>${Number(summary.activeServices || 0)} of ${Number(summary.totalServices || 0)} services active / ${Number(summary.leads || 0)} leads / ${Number(summary.openTasks || 0)} open tasks / ${Number(summary.overdueTasks || 0)} overdue.</p>
        </div>
      </div>
      <div class="ops-budget">
        <div class="ops-budget__top">
          <div>
            <h3>Free Tier Budget Sentinel</h3>
            <p>${escapeHtml(budget.source || 'Tracked app usage from Cloudflare D1.')}</p>
          </div>
          <span>${escapeHtml(budget.window || 'today')}</span>
        </div>
        <div class="ops-budget__grid">
          ${budgets.length ? budgets.map((item) => `
            <article class="ops-budget-card is-${escapeHtml(item.level || 'ok')}">
              <div class="ops-budget-card__top">
                <strong>${escapeHtml(item.label || 'Budget')}</strong>
                <span>${escapeHtml(item.level || 'ok')}</span>
              </div>
              <div class="bar"><span style="width:${Math.max(3, Math.min(100, Number(item.percent || 0)))}%"></span></div>
              <div class="ops-budget-card__meta">
                <span>${Number(item.used || 0)} / ${Number(item.limit || 0)} ${escapeHtml(item.unit || '')}</span>
                <span>Projected ${Number(item.projected || 0)} (${Number(item.projectedPercent || 0)}%)</span>
              </div>
              <p>${escapeHtml(item.detail || '')}</p>
              <small>${escapeHtml(item.source || '')}</small>
            </article>
          `).join('') : '<p class="detail-meta">No budget signal yet.</p>'}
        </div>
        <div class="ops-budget__advice">
          ${budgetRecommendations.length ? budgetRecommendations.map((item) => `
            <article>
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.title || 'Budget advice')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No budget recommendations yet.</p>'}
        </div>
      </div>
      <div class="ops-action-strip">
        ${actions.length ? actions.map((item) => `
          <article class="ops-action">
            <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
            <strong>${escapeHtml(item.title || 'Next action')}</strong>
            <p>${escapeHtml(item.detail || '')}</p>
          </article>
        `).join('') : '<p class="detail-meta">No operations actions yet.</p>'}
      </div>
      <div class="ops-columns">
        <section class="ops-column">
          <h3>Stack Layers</h3>
          ${layers.length ? layers.map((item) => `
            <article class="ops-layer">
              <div class="ops-layer__top">
                <strong>${escapeHtml(item.layer || 'Layer')}</strong>
                <span class="stack-pill ${item.status === 'ready' ? '' : 'is-fallback'}">${escapeHtml(item.status || 'pending')}</span>
              </div>
              <div class="bar"><span style="width:${Math.max(4, Math.min(100, Number(item.readiness || 0)))}%"></span></div>
              <small>${Number(item.active || 0)}/${Number(item.total || 0)} services active / ${Number(item.readiness || 0)}% ready</small>
            </article>
          `).join('') : '<p class="detail-meta">No layer signal yet.</p>'}
        </section>
        <section class="ops-column">
          <h3>Risks</h3>
          ${risks.length ? risks.map((item) => `
            <article class="ops-risk">
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.title || 'Risk')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No risk signal yet.</p>'}
        </section>
        <section class="ops-column">
          <h3>Next Activations</h3>
          ${activations.length ? activations.map((item) => `
            <article class="ops-activation">
              <div class="ops-layer__top">
                <strong>${escapeHtml(item.label || 'Cloudflare service')}</strong>
                <span>${escapeHtml(item.layer || 'Stack')}</span>
              </div>
              <p>${escapeHtml(item.impact || '')}</p>
              <small>${escapeHtml(item.activation || '')}</small>
            </article>
          `).join('') : '<p class="detail-meta">All tracked activations are active.</p>'}
        </section>
      </div>
      <div class="ops-guardrails">
        ${guardrails.length ? guardrails.map((item) => `
          <div>
            <span>${escapeHtml(item.label || 'Guardrail')}</span>
            <strong>${escapeHtml(item.value || '--')}</strong>
            <small>${escapeHtml(item.detail || '')}</small>
          </div>
        `).join('') : '<p class="detail-meta">No guardrails reported.</p>'}
      </div>
    `;
  }

  function tagList(rows, labelField, valueField) {
    if (!rows || !rows.length) return '<span class="intel-tag">No data yet</span>';
    return rows
      .slice(0, 8)
      .map((row) => `<span class="intel-tag">${safeHuman(row[labelField])}: ${Number(row[valueField] || 0)}</span>`)
      .join('');
  }

  function renderSecurityCenter(securityCenter) {
    const target = document.getElementById('security-center');
    if (!target) return;
    const data = securityCenter || {};
    const summary = data.summary || {};
    const routes = data.routes || [];
    const threatSignals = data.threatSignals || [];
    const actions = data.actions || [];
    const guardrails = data.guardrails || [];

    if (!Object.keys(data).length) {
      target.innerHTML = '<p class="detail-meta">Connect with an admin token to load security posture.</p>';
      return;
    }

    target.innerHTML = `
      <div class="security-hero">
        <div>
          <span>Posture</span>
          <strong>${escapeHtml(summary.posture || 'Unknown')}</strong>
          <small>${escapeHtml(summary.rateLimitMode || 'rate-limit unknown')}</small>
        </div>
        <div>
          <span>Turnstile</span>
          <strong>${escapeHtml(summary.turnstileMode || 'session-limits')}</strong>
          <small>${escapeHtml(summary.adminMode || 'admin mode unknown')} admin</small>
        </div>
        <div>
          <span>Errors</span>
          <strong>${Number(summary.errorEvents || 0)}</strong>
          <small>${Number(summary.errorRate || 0)}% event error rate</small>
        </div>
        <div>
          <span>Protected Actions</span>
          <strong>${Number(summary.protectedActions || 0)}</strong>
          <small>${Number(summary.captureCompletion || 0)}% capture completion</small>
        </div>
      </div>
      <div class="security-grid">
        <section>
          <h3>Threat Signals</h3>
          ${threatSignals.length ? threatSignals.map((item) => `
            <article class="security-signal is-${escapeHtml(item.level || 'ok')}">
              <span>${escapeHtml(item.label || 'Signal')}</span>
              <strong>${Number(item.value || 0)}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No threat signals yet.</p>'}
        </section>
        <section>
          <h3>Hardening Actions</h3>
          ${actions.length ? actions.map((item) => `
            <article class="security-action">
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.title || 'Action')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
              <small>${escapeHtml(item.source || '')}</small>
            </article>
          `).join('') : '<p class="detail-meta">No hardening actions yet.</p>'}
        </section>
      </div>
      <div class="security-routes">
        <h3>Protected Routes</h3>
        <div>
          ${routes.length ? routes.map((route) => `
            <article class="security-route">
              <div class="security-route__top">
                <strong>${escapeHtml(route.label || route.route || 'Route')}</strong>
                <span>${Number(route.limit || 0)} / ${escapeHtml(route.window || '')}</span>
              </div>
              <p>${escapeHtml(route.protection || '')}</p>
              <small>${Number(route.events30d || 0)} events / Turnstile ${escapeHtml(route.turnstile || 'not-required')}</small>
            </article>
          `).join('') : '<p class="detail-meta">No route map available.</p>'}
        </div>
      </div>
      <div class="security-guardrails">
        ${guardrails.length ? guardrails.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>Keep route limits and admin auth active.</span>'}
      </div>
      <p class="security-source">${escapeHtml(data.source || 'Cloudflare security signals')}</p>
    `;
  }

  function renderConversationIntel(intelligence) {
    const target = document.getElementById('conversation-intel');
    const data = intelligence || {};
    const snapshot = data.leadSnapshot || {};
    const gaps = snapshot.funnelGaps || {};
    const completeness = snapshot.profileCompleteness || {};
    const advice = snapshot.advice || [];
    const recentInsights = snapshot.recentInsights || [];
    target.innerHTML = `
      <div class="ops-grid">
        <div><span>Hot anonymous</span><strong>${Number(gaps.hotAnonymous || 0)}</strong></div>
        <div><span>Audits no lead</span><strong>${Number(gaps.auditNoLead || 0)}</strong></div>
        <div><span>Briefs no lead</span><strong>${Number(gaps.briefNoLead || 0)}</strong></div>
        <div><span>Capture friction</span><strong>${Number(gaps.captureOpenNoSubmit || 0)}</strong></div>
      </div>
      <div class="intel-group intel-group--wide">
        <h3>Profile Completeness</h3>
        <div class="completeness-grid">
          ${[
            ['Goal', completeness.goal],
            ['Business', completeness.business],
            ['Offer', completeness.offer],
            ['Budget', completeness.budget],
            ['Timeline', completeness.timeline],
            ['Service', completeness.service]
          ].map(([label, value]) => `
            <div class="complete-row">
              <span>${escapeHtml(label)}</span>
              <strong>${Number(value || 0)}%</strong>
              <i style="width:${Math.max(4, Math.min(100, Number(value || 0)))}%"></i>
            </div>
          `).join('')}
        </div>
      </div>
      <div class="intel-group">
        <h3>Budget Signals</h3>
        <div class="intel-tags">${tagList(data.budgets || [], 'budget', 'count')}</div>
      </div>
      <div class="intel-group">
        <h3>Timeline Pressure</h3>
        <div class="intel-tags">${tagList(data.timelines || [], 'timeline', 'count')}</div>
      </div>
      <div class="intel-group">
        <h3>Repeated Blockers</h3>
        <div class="intel-tags">${tagList(data.blockers || [], 'item', 'count')}</div>
      </div>
      <div class="intel-group">
        <h3>Next Best Actions</h3>
        <div class="intel-tags">${tagList(data.nextActions || [], 'next_best_action', 'count')}</div>
      </div>
      <div class="intel-group intel-group--wide">
        <h3>Operator Advice</h3>
        <div class="advice-list">
          ${advice.length ? advice.map((item) => `
            <article class="advice-card">
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.title || 'Next action')}</strong>
              <p>${escapeHtml(item.action || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No advice yet.</p>'}
        </div>
      </div>
      <div class="intel-group intel-group--wide">
        <h3>Recent Visitor Signals</h3>
        <div class="signal-list">
          ${recentInsights.length ? recentInsights.map((item) => `
            <article class="signal-card">
              <div class="signal-card__top">
                <strong>${safeHuman(item.primaryService || 'unknown')}</strong>
                <span>${Number(item.leadScore || 0)}/100</span>
              </div>
              <p>${escapeHtml(item.summary || 'No summary available.')}</p>
              <small>${escapeHtml(item.captured ? 'captured' : 'anonymous')} / ${safeHuman(item.budget || 'unknown')} / ${safeHuman(item.timeline || 'unknown')} / ${formatDateTime(item.lastSeenAt)}</small>
            </article>
          `).join('') : '<p class="detail-meta">No redacted visitor insights yet.</p>'}
        </div>
      </div>
    `;
  }

  function renderRetention(retention) {
    const target = document.getElementById('data-retention');
    const data = retention || {};
    const policy = data.policy || {};
    const run = data.latestRun || null;

    if (!run) {
      target.innerHTML = `
        <div class="retention-card">
          <strong>Waiting for first cron run</strong>
          <p>Anonymous sessions older than ${Number(policy.anonymousSessionDays || 90)} days and anonymous events older than ${Number(policy.anonymousEventDays || 180)} days will be cleaned automatically.</p>
        </div>
      `;
      return;
    }

    target.innerHTML = `
      <div class="retention-card">
        <strong>Last cleanup: ${formatDateTime(run.ran_at)}</strong>
        <p>${escapeHtml(run.notes || 'Privacy cleanup completed.')}</p>
      </div>
      <div class="retention-grid">
        <div><span>Anonymous sessions</span><strong>${Number(run.anonymous_sessions_deleted || 0)}</strong></div>
        <div><span>Anonymous events</span><strong>${Number(run.anonymous_events_deleted || 0)}</strong></div>
        <div><span>Profiles</span><strong>${Number(run.orphan_profiles_deleted || 0)}</strong></div>
        <div><span>Diagnostics</span><strong>${Number(run.orphan_diagnostics_deleted || 0)}</strong></div>
        <div><span>Closed tasks</span><strong>${Number(run.completed_tasks_deleted || 0)}</strong></div>
      </div>
      <p class="detail-meta">Policy: ${Number(policy.anonymousSessionDays || 90)}d anonymous sessions, ${Number(policy.anonymousEventDays || 180)}d anonymous events, ${Number(policy.completedTaskDays || 180)}d closed tasks.</p>
    `;
  }

  function renderMaintenanceConsole(data, lastRun) {
    if (!maintenanceConsole) return;
    const rollup = (data?.rollups || [])[0] || null;
    const retention = data?.intelligence?.retention || {};
    const cleanup = retention.latestRun || null;
    const run = lastRun || null;

    maintenanceConsole.innerHTML = `
      <div class="maintenance-summary">
        <div>
          <span>Latest rollup</span>
          <strong>${escapeHtml(rollup?.day || 'none')}</strong>
          <small>${rollup ? `${Number(rollup.chats || 0)} chats / ${Number(rollup.leads || 0)} leads` : 'Waiting for first run'}</small>
        </div>
        <div>
          <span>Latest cleanup</span>
          <strong>${formatDate(cleanup?.ran_at)}</strong>
          <small>${cleanup ? `${Number(cleanup.anonymous_sessions_deleted || 0)} sessions / ${Number(cleanup.anonymous_events_deleted || 0)} events` : 'Waiting for first run'}</small>
        </div>
      </div>
      <button class="maintenance-run" type="button" data-maintenance-action="run">
        Run maintenance now
      </button>
      <p class="maintenance-note">Executes the same D1 rollup and privacy cleanup used by the scheduled Worker cron.</p>
      ${run ? `
        <div class="maintenance-result">
          <strong>${escapeHtml(run.ok ? 'Maintenance completed' : 'Maintenance failed')}</strong>
          <span>${escapeHtml(run.day || '')} / ${Number(run.durationMs || 0)} ms / ${formatDateTime(run.ranAt)}</span>
          <p>${escapeHtml(run.cleanup?.notes || 'Daily rollup refreshed.')}</p>
        </div>
      ` : ''}
    `;
  }

  function renderSystemHealth(health) {
    if (!systemHealth) return;
    const data = health || {};
    const summary = data.summary || {};
    const checks = data.checks || [];

    if (!Object.keys(data).length) {
      systemHealth.innerHTML = `
        <button class="health-run" type="button" data-health-action="run">Run self-test</button>
        <p class="detail-meta">Runs read-only checks against D1, Worker bindings, cron rollups and cleanup status.</p>
      `;
      return;
    }

    systemHealth.innerHTML = `
      <div class="health-hero">
        <div>
          <span>Health Score</span>
          <strong>${Number(data.healthScore || 0)}%</strong>
          <small>${escapeHtml(data.posture || 'Unknown posture')}</small>
        </div>
        <div>
          <span>Result</span>
          <strong>${escapeHtml(data.ok ? 'Pass' : 'Review')}</strong>
          <small>${Number(data.durationMs || 0)} ms / ${formatDateTime(data.generatedAt)}</small>
        </div>
        <button class="health-run" type="button" data-health-action="run">Run again</button>
      </div>
      <div class="health-summary">
        <div><span>Pass</span><strong>${Number(summary.pass || 0)}</strong></div>
        <div><span>Watch</span><strong>${Number(summary.watch || 0)}</strong></div>
        <div><span>Standby</span><strong>${Number(summary.standby || 0)}</strong></div>
        <div><span>Fail</span><strong>${Number(summary.fail || 0)}</strong></div>
      </div>
      <div class="health-checks">
        ${checks.length ? checks.map((check) => `
          <article class="health-check is-${escapeHtml(check.status || 'standby')}">
            <div>
              <strong>${escapeHtml(check.label || 'Check')}</strong>
              <span>${escapeHtml(check.status || 'standby')}</span>
            </div>
            <p>${escapeHtml(check.detail || '')}</p>
          </article>
        `).join('') : '<p class="detail-meta">No checks returned.</p>'}
      </div>
    `;
  }

  function renderPrivacyQuality(sentinel) {
    const target = document.getElementById('privacy-quality');
    if (!target) return;
    const data = sentinel || {};
    const scores = data.scores || {};
    const summary = data.summary || {};
    const risks = data.risks || [];
    const actions = data.actions || [];
    const gaps = data.qualityGaps || [];
    const policy = data.policy || {};

    if (!Object.keys(data).length) {
      target.innerHTML = '<p class="detail-meta">No privacy or data quality signal yet.</p>';
      return;
    }

    target.innerHTML = `
      <div class="privacy-quality__hero">
        <div class="privacy-score">
          <span>Privacy</span>
          <strong>${Number(scores.privacy || 0)}%</strong>
        </div>
        <div class="privacy-score">
          <span>Data Quality</span>
          <strong>${Number(scores.dataQuality || 0)}%</strong>
        </div>
        <div class="privacy-posture">
          <span>Posture</span>
          <strong>${escapeHtml(scores.posture || 'Waiting for D1 signal')}</strong>
          <p>PII allowed only in ${escapeHtml(policy.piiAllowedOnlyIn || 'consented lead records')}. Analytics mode: ${escapeHtml(policy.analyticsMode || 'redacted')}.</p>
        </div>
      </div>
      <div class="privacy-quality__metrics">
        <div><span>PII signals</span><strong>${Number(summary.possiblePiiSignals || 0)}</strong><small>aggregated possible matches</small></div>
        <div><span>Consent gaps</span><strong>${Number(summary.leadsWithoutConsent || 0)}</strong><small>captured leads without event</small></div>
        <div><span>Cleanup due</span><strong>${Number(summary.cleanupDue || 0)}</strong><small>anonymous/orphan records</small></div>
        <div><span>Incomplete profiles</span><strong>${Number(summary.incompleteProfiles || 0)}</strong><small>of ${Number(summary.totalProfiles || 0)} profiles</small></div>
      </div>
      <div class="privacy-quality__grid">
        <section>
          <h3>Quality Gaps</h3>
          ${gaps.length ? gaps.map((gap) => {
            const total = Math.max(1, Number(gap.total || 0));
            const missing = Number(gap.missing || 0);
            return `
              <article class="quality-gap">
                <div>
                  <strong>${escapeHtml(gap.label || 'Field')}</strong>
                  <span>${missing} missing</span>
                </div>
                <div class="bar"><span style="width:${Math.max(3, Math.min(100, Math.round((missing / total) * 100)))}%"></span></div>
              </article>
            `;
          }).join('') : '<p class="detail-meta">No quality gaps detected.</p>'}
        </section>
        <section>
          <h3>Risks</h3>
          ${risks.length ? risks.map((item) => `
            <article class="privacy-risk">
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.title || 'Risk')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No privacy risks detected.</p>'}
        </section>
        <section>
          <h3>Actions</h3>
          ${actions.length ? actions.map((item) => `
            <article class="privacy-action">
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.title || 'Action')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No actions yet.</p>'}
        </section>
      </div>
      <p class="privacy-quality__note">Retention policy: ${Number(policy.anonymousSessionRetentionDays || 90)}d anonymous sessions / ${Number(policy.anonymousEventRetentionDays || 180)}d anonymous events. This panel shows counts only, never raw PII.</p>
    `;
  }

  function renderPageFunnel(pages) {
    const target = document.getElementById('page-funnel');
    const rows = pages || [];
    if (!rows.length) {
      target.innerHTML = '<p class="detail-meta">No page events yet. The widget will begin collecting anonymous page views as visitors load the site.</p>';
      return;
    }

    const steps = [
      ['views', 'Views'],
      ['opens', 'Opens'],
      ['chats', 'Chats'],
      ['audits', 'Audits'],
      ['briefs', 'Briefs'],
      ['leads', 'Leads']
    ];

    target.innerHTML = rows
      .map((row) => `
        <div class="page-row">
          <div class="page-row__path" title="${escapeHtml(row.page || 'unknown')}">${escapeHtml(row.page || 'unknown')}</div>
          ${steps.map(([field, label]) => `
            <div class="page-step">
              <span>${label}</span>
              <strong>${Number(row[field] || 0)}</strong>
            </div>
          `).join('')}
        </div>
      `)
      .join('');
  }

  function renderConversionExperimentLab(experimentLab) {
    const target = document.getElementById('experiment-lab');
    if (!target) return;
    const data = experimentLab || {};
    const summary = data.summary || {};
    const rates = data.eventRates || [];
    const experiments = data.experiments || [];
    const pages = data.pageCandidates || [];
    const guardrails = data.guardrails || [];

    if (!Object.keys(data).length) {
      target.innerHTML = '<p class="detail-meta">No experiment signal yet. The lab activates from Cloudflare D1 event data.</p>';
      return;
    }

    target.innerHTML = `
      <div class="experiment-hero">
        <div>
          <span>Tracked views</span>
          <strong>${Number(summary.views || 0)}</strong>
          <small>${Number(summary.opens || 0)} opens / ${Number(summary.chats || 0)} chats / ${Number(summary.leads || 0)} leads</small>
        </div>
        <div>
          <span>Open rate</span>
          <strong>${Number(summary.openRate || 0)}%</strong>
          <small>Chat entry from page views</small>
        </div>
        <div>
          <span>Top page</span>
          <strong title="${escapeHtml(summary.topPage || '')}">${escapeHtml(summary.topPage || 'No page signal')}</strong>
          <small>${escapeHtml(summary.topService || 'No service signal')}</small>
        </div>
      </div>
      <div class="experiment-rates">
        ${rates.length ? rates.map((rate) => `
          <article>
            <div>
              <span>${escapeHtml(rate.label || 'Rate')}</span>
              <strong>${Number(rate.value || 0)}%</strong>
            </div>
            <div class="bar"><span style="width:${Math.max(3, Math.min(100, Number(rate.value || 0)))}%"></span></div>
            <p>${escapeHtml(rate.detail || '')}</p>
          </article>
        `).join('') : '<p class="detail-meta">No rate data yet.</p>'}
      </div>
      <div class="experiment-grid">
        <section>
          <h3>Recommended Experiments</h3>
          ${experiments.length ? experiments.map((item) => {
            const copy = [
              `Experiment: ${item.title || ''}`,
              `Hypothesis: ${item.hypothesis || ''}`,
              `Change: ${item.change || ''}`,
              `Metric: ${item.successMetric || ''}`,
              `Target: ${item.target || ''}`,
              `Guardrail: ${item.guardrail || ''}`
            ].join('\n');
            return `
              <article class="experiment-card">
                <div class="experiment-card__top">
                  <strong>${escapeHtml(item.title || 'Experiment')}</strong>
                  <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
                </div>
                <p>${escapeHtml(item.hypothesis || '')}</p>
                <dl>
                  <div><dt>Change</dt><dd>${escapeHtml(item.change || '')}</dd></div>
                  <div><dt>Metric</dt><dd>${escapeHtml(item.successMetric || '')}</dd></div>
                  <div><dt>Target</dt><dd>${escapeHtml(item.target || '')}</dd></div>
                </dl>
                <small>${escapeHtml(item.sourceSignal || '')}</small>
                <button type="button" data-experiment-copy="${escapeHtml(encodeURIComponent(copy))}">Copy experiment</button>
              </article>
            `;
          }).join('') : '<p class="detail-meta">No experiments yet.</p>'}
        </section>
        <section>
          <h3>Page Candidates</h3>
          ${pages.length ? pages.map((page) => `
            <article class="experiment-page">
              <div class="experiment-page__top">
                <strong title="${escapeHtml(page.page || 'unknown')}">${escapeHtml(page.page || 'unknown')}</strong>
                <span>${Number(page.actionRate || 0)}% action</span>
              </div>
              <div class="bar"><span style="width:${Math.max(3, Math.min(100, Number(page.actionRate || 0)))}%"></span></div>
              <small>${Number(page.views || 0)} views / ${Number(page.opens || 0)} opens / ${Number(page.chats || 0)} chats / ${Number(page.leads || 0)} leads</small>
            </article>
          `).join('') : '<p class="detail-meta">No page candidates yet.</p>'}
        </section>
      </div>
      <div class="experiment-guardrails">
        ${guardrails.length ? guardrails.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>Keep experiments privacy-first.</span>'}
      </div>
      <p class="experiment-source">${escapeHtml(data.source || 'Cloudflare D1 experiment signals')}</p>
    `;
  }

  function renderAuditLab(auditLab) {
    const target = document.getElementById('audit-lab');
    if (!target) return;
    const data = auditLab || {};
    const summary = data.summary || {};
    const serviceRows = data.serviceBreakdown || [];
    const patterns = data.findingPatterns || [];
    const recent = data.recentAudits || [];
    const actions = data.actions || [];

    if (!Object.keys(data).length || !Number(summary.totalAudits || 0)) {
      target.innerHTML = `
        <div class="audit-empty">
          <strong>No website audits yet</strong>
          <p>The lab activates after visitors run the mini-audit. It will show score patterns, leakage and service opportunities without exposing full URLs.</p>
        </div>
      `;
      return;
    }

    target.innerHTML = `
      <div class="audit-lab__hero">
        <div>
          <span>Audit posture</span>
          <strong>${escapeHtml(data.posture || 'Audit signal')}</strong>
          <small>${escapeHtml(data.window || 'All audits')}</small>
        </div>
        <div>
          <span>Capture rate</span>
          <strong>${Number(summary.captureRate || 0)}%</strong>
          <small>${Number(summary.capturedAudits || 0)} captured / ${Number(summary.totalAudits || 0)} audits</small>
        </div>
        <div>
          <span>Avg clarity</span>
          <strong>${Number(summary.avgClarity || 0)}</strong>
          <small>${Number(summary.lowScoreAudits || 0)} low-score audits</small>
        </div>
        <div>
          <span>Avg conversion</span>
          <strong>${Number(summary.avgConversion || 0)}</strong>
          <small>${escapeHtml(summary.browserRunMode || 'html-audit')} / ${escapeHtml(summary.r2Mode || 'd1-receipts')}</small>
        </div>
      </div>
      <div class="audit-lab__grid">
        <section>
          <h3>Recommended Actions</h3>
          ${actions.length ? actions.map((item) => `
            <article class="audit-action">
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.title || 'Action')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No audit actions yet.</p>'}
        </section>
        <section>
          <h3>Finding Patterns</h3>
          ${patterns.length ? patterns.slice(0, 6).map((item) => `
            <article class="audit-pattern">
              <strong>${escapeHtml(item.item || 'Finding')}</strong>
              <span>${Number(item.count || 0)}x</span>
            </article>
          `).join('') : '<p class="detail-meta">No repeated findings yet.</p>'}
        </section>
        <section>
          <h3>Service Pull</h3>
          ${serviceRows.length ? serviceRows.slice(0, 6).map((row) => `
            <article class="audit-service">
              <div class="audit-service__top">
                <strong>${escapeHtml(row.label || 'Service')}</strong>
                <span>${Number(row.audits || 0)} audits</span>
              </div>
              <div class="bar"><span style="width:${Math.max(5, Math.min(100, Number(row.avgConversion || 0)))}%"></span></div>
              <small>${Number(row.leads || 0)} leads / clarity ${Number(row.avgClarity || 0)} / conversion ${Number(row.avgConversion || 0)}</small>
            </article>
          `).join('') : '<p class="detail-meta">No service pull yet.</p>'}
        </section>
      </div>
      <div class="audit-recent">
        <div class="audit-recent__top">
          <h3>Recent Audits</h3>
          <span>${Number(summary.recent7d || 0)} in the last 7 days / ${Number(summary.archivedReports || 0)} archived reports</span>
        </div>
        <div class="audit-recent__list">
          ${recent.length ? recent.map((audit) => `
            <article class="audit-card is-${escapeHtml(audit.priority || 'low')}" data-lead-id="${escapeHtml(audit.leadId || '')}">
              <div class="audit-card__top">
                <div>
                  <strong>${escapeHtml(audit.title || 'Untitled audit')}</strong>
                  <span>${escapeHtml(audit.captured ? audit.leadName || 'Captured lead' : 'Anonymous audit')} / ${safeHuman(audit.service || 'unknown')} / ${formatDateTime(audit.createdAt)}</span>
                </div>
                <span class="priority-pill ${priorityClass(audit.priority)}">${escapeHtml(audit.priority || 'low')}</span>
              </div>
              <div class="audit-card__scores">
                <div><span>Clarity</span><strong>${Number(audit.clarityScore || 0)}</strong></div>
                <div><span>Conversion</span><strong>${Number(audit.conversionScore || 0)}</strong></div>
                <div><span>Lead score</span><strong>${Number(audit.leadScore || 0)}</strong></div>
                <div><span>Status</span><strong>${escapeHtml(audit.captured ? 'Captured' : 'Anonymous')}</strong></div>
              </div>
              ${audit.h1 ? `<p>${escapeHtml(audit.h1)}</p>` : ''}
              <div class="audit-card__findings">
                ${(audit.findings || []).length ? audit.findings.map((finding) => `<span>${escapeHtml(finding)}</span>`).join('') : '<span>No finding text saved</span>'}
              </div>
              ${audit.leadId ? '<button type="button" data-audit-action="open">Open lead</button>' : ''}
            </article>
          `).join('') : '<p class="detail-meta">No recent audits yet.</p>'}
        </div>
      </div>
    `;
  }

  function attributionColumn(title, rows, labelField) {
    if (!rows || !rows.length) {
      return `
        <section class="attribution-column">
          <h3>${escapeHtml(title)}</h3>
          <p class="detail-meta">No signal yet.</p>
        </section>
      `;
    }

    const max = Math.max(1, ...rows.map((row) => Number(row.sessions || 0)));
    return `
      <section class="attribution-column">
        <h3>${escapeHtml(title)}</h3>
        ${rows.slice(0, 6).map((row) => {
          const sessions = Number(row.sessions || 0);
          const leads = Number(row.leads || 0);
          const avgScore = Number(row.avg_score || 0);
          return `
            <article class="attribution-card">
              <div class="attribution-card__top">
                <strong title="${escapeHtml(row[labelField] || 'unknown')}">${safeHuman(row[labelField] || 'unknown')}</strong>
                <span>${leads} leads</span>
              </div>
              <div class="bar"><span style="width:${Math.max(8, Math.round((sessions / max) * 100))}%"></span></div>
              <small>${sessions} sessions / avg score ${avgScore}</small>
            </article>
          `;
        }).join('')}
      </section>
    `;
  }

  function renderAttributionPerformance(attribution) {
    const target = document.getElementById('attribution-performance');
    const data = attribution || {};
    target.innerHTML = `
      ${attributionColumn('Sources', data.sources || [], 'source')}
      ${attributionColumn('Campaigns', data.campaigns || [], 'campaign')}
      ${attributionColumn('Referrers', data.referrers || [], 'referrer')}
    `;
  }

  function renderPipelineBoard(pipeline) {
    const target = document.getElementById('pipeline-board');
    const data = pipeline || {};
    const stages = data.stages || [];
    const actions = data.actions || [];
    const biggestDrop = data.leakage?.biggestDrop || {};

    if (!stages.length) {
      target.innerHTML = '<p class="detail-meta">No pipeline signal yet.</p>';
      return;
    }

    target.innerHTML = `
      <div class="pipeline-summary">
        <div>
          <span>${escapeHtml(data.window || 'Last 30 days')}</span>
          <strong>${Number(data.overallConversion || 0)}%</strong>
          <small>session to captured lead</small>
        </div>
        <div>
          <span>Largest drop</span>
          <strong>${escapeHtml(biggestDrop.from || 'Sessions')} -> ${escapeHtml(biggestDrop.to || 'Engaged')}</strong>
          <small>${Number(biggestDrop.drop || 0)} lost / ${Number(biggestDrop.rate || 0)}% carry-through</small>
        </div>
      </div>
      <div class="pipeline-stages">
        ${stages.map((stage, index) => `
          <article class="pipeline-stage">
            <div class="pipeline-stage__top">
              <span>${String(index + 1).padStart(2, '0')}</span>
              <strong>${escapeHtml(stage.label || 'Stage')}</strong>
            </div>
            <b>${Number(stage.count || 0)}</b>
            <div class="pipeline-meter" aria-hidden="true">
              <i style="width:${Math.max(4, Math.min(100, Number(stage.fromStart || 0)))}%"></i>
            </div>
            <small>${Number(stage.fromPrevious || 0)}% from previous</small>
            <p>${escapeHtml(stage.note || '')}</p>
          </article>
        `).join('')}
      </div>
      <div class="pipeline-actions">
        ${actions.map((item) => `
          <article class="pipeline-action">
            <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
            <strong>${escapeHtml(item.title || 'Next move')}</strong>
            <p>${escapeHtml(item.detail || '')}</p>
          </article>
        `).join('')}
      </div>
    `;
  }

  function renderRevenueForecast(forecast) {
    const target = document.getElementById('forecast-board');
    const data = forecast || {};
    const summary = data.summary || {};
    const stages = data.stages || [];
    const services = data.services || [];
    const actions = data.actions || [];
    const stageMax = Math.max(1, ...stages.map((row) => Number(row.weighted || 0)));
    const serviceMax = Math.max(1, ...services.map((row) => Number(row.weighted || 0)));

    if (!data.summary) {
      target.innerHTML = '<p class="detail-meta">No revenue signal yet. Capture a lead with budget to activate the forecast.</p>';
      return;
    }

    target.innerHTML = `
      <div class="forecast-summary">
        <div><span>Open weighted</span><strong>${money(summary.openWeighted)}</strong><small>stage and score adjusted</small></div>
        <div><span>Open gross</span><strong>${money(summary.openGross)}</strong><small>known budget midpoint</small></div>
        <div><span>Closed won</span><strong>${money(summary.closedWon)}</strong><small>last 90 days</small></div>
        <div><span>Budget gaps</span><strong>${Number(summary.missingBudgetLeads || 0)}</strong><small>${Number(summary.knownBudgetLeads || 0)} known budget leads</small></div>
      </div>
      <div class="forecast-grid">
        <section>
          <h3>By Stage</h3>
          ${stages.length ? stages.map((row) => `
            <article class="forecast-row">
              <div class="forecast-row__top">
                <strong>${escapeHtml(row.label || 'Stage')}</strong>
                <span>${money(row.weighted)}</span>
              </div>
              <div class="bar"><span style="width:${Math.max(5, Math.round((Number(row.weighted || 0) / stageMax) * 100))}%"></span></div>
              <small>${Number(row.count || 0)} leads / ${money(row.gross)} gross / avg score ${Number(row.avgScore || 0)}</small>
            </article>
          `).join('') : '<p class="detail-meta">No stage signal yet.</p>'}
        </section>
        <section>
          <h3>By Service</h3>
          ${services.length ? services.map((row) => `
            <article class="forecast-row">
              <div class="forecast-row__top">
                <strong>${escapeHtml(row.label || 'Service')}</strong>
                <span>${money(row.weighted)}</span>
              </div>
              <div class="bar"><span style="width:${Math.max(5, Math.round((Number(row.weighted || 0) / serviceMax) * 100))}%"></span></div>
              <small>${Number(row.count || 0)} leads / ${money(row.gross)} gross / avg score ${Number(row.avgScore || 0)}</small>
            </article>
          `).join('') : '<p class="detail-meta">No service signal yet.</p>'}
        </section>
      </div>
      <div class="forecast-actions">
        ${actions.length ? actions.map((item) => `
          <article class="forecast-action">
            <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
            <strong>${escapeHtml(item.title || 'Next move')}</strong>
            <p>${escapeHtml(item.detail || '')}</p>
          </article>
        `).join('') : '<p class="detail-meta">No forecast actions yet.</p>'}
      </div>
      <p class="forecast-method">${escapeHtml(data.methodology || 'Budget-weighted D1 forecast.')}</p>
    `;
  }

  function renderSalesPlaybook(playbook) {
    const target = document.getElementById('sales-playbook');
    if (!target) return;
    const data = playbook || {};
    const summary = data.summary || {};
    const plays = data.plays || [];
    const priorityLeads = data.priorityLeads || [];
    const cadence = data.cadence || [];
    const templates = data.templates || [];
    const serviceAngles = data.serviceAngles || [];

    if (!Object.keys(data).length) {
      target.innerHTML = '<p class="detail-meta">No playbook signal yet. Capture a lead to activate sales guidance.</p>';
      return;
    }

    target.innerHTML = `
      <div class="playbook-hero">
        <div>
          <span>Active leads</span>
          <strong>${Number(summary.activeLeads || 0)}</strong>
          <small>${Number(summary.hotLeads || 0)} hot / ${Number(summary.staleLeads || 0)} need next action</small>
        </div>
        <div>
          <span>Top service</span>
          <strong>${escapeHtml(summary.topService || 'Growth System')}</strong>
          <small>${Number(summary.auditLed || 0)} audit-led / ${Number(summary.proposalReady || 0)} proposal-ready</small>
        </div>
        <div>
          <span>Open weighted</span>
          <strong>${money(summary.openWeighted)}</strong>
          <small>${Number(summary.budgetGaps || 0)} budget gaps / ${Number(summary.overdueTasks || 0)} overdue tasks</small>
        </div>
      </div>
      <div class="playbook-grid">
        <section>
          <h3>Next-Touch Plays</h3>
          ${plays.length ? plays.map((item) => `
            <article class="playbook-card">
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.title || 'Play')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
              <small>${safeHuman(item.taskType || 'follow up')} / ${escapeHtml(item.timing || 'next')}</small>
            </article>
          `).join('') : '<p class="detail-meta">No plays yet.</p>'}
        </section>
        <section>
          <h3>Priority Leads</h3>
          ${priorityLeads.length ? priorityLeads.map((lead) => `
            <article class="playbook-lead" data-lead-id="${escapeHtml(lead.id || '')}">
              <div class="playbook-lead__top">
                <strong>${escapeHtml(lead.name || 'Unnamed lead')}</strong>
                <span class="priority-pill ${priorityClass(lead.priority)}">${escapeHtml(lead.priority || 'low')}</span>
              </div>
              <p>${escapeHtml(lead.recommendedMove || '')}</p>
              <small>${safeHuman(lead.status)} / ${safeHuman(lead.service)} / score ${Number(lead.score || 0)} / ${safeHuman(lead.budget)}</small>
              ${lead.id ? '<button type="button" data-playbook-action="open">Open lead</button>' : ''}
            </article>
          `).join('') : '<p class="detail-meta">No active leads yet.</p>'}
        </section>
        <section>
          <h3>Cadence</h3>
          ${cadence.length ? cadence.map((item) => `
            <article class="cadence-card">
              <span>${escapeHtml(item.step || '')}</span>
              <strong>${escapeHtml(item.title || 'Step')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No cadence yet.</p>'}
        </section>
      </div>
      <div class="playbook-bottom">
        <section>
          <h3>Reply Templates</h3>
          ${templates.length ? templates.map((template) => {
            const text = `Subject: ${template.subject || ''}\n\n${template.body || ''}`;
            return `
              <article class="template-card">
                <div>
                  <strong>${escapeHtml(template.title || 'Template')}</strong>
                  <span>${escapeHtml(template.subject || '')}</span>
                </div>
                <p>${escapeHtml(template.body || '')}</p>
                <button type="button" data-playbook-copy="${escapeHtml(encodeURIComponent(text))}">Copy</button>
              </article>
            `;
          }).join('') : '<p class="detail-meta">No templates yet.</p>'}
        </section>
        <section>
          <h3>Service Angles</h3>
          ${serviceAngles.length ? serviceAngles.map((item) => `
            <article class="angle-card">
              <div>
                <strong>${escapeHtml(item.label || 'Service')}</strong>
                <span>${Number(item.count || 0)} leads / avg score ${Number(item.avgScore || 0)}</span>
              </div>
              <p>${escapeHtml(item.proofPoint || '')}</p>
            </article>
          `).join('') : '<p class="detail-meta">No service angles yet.</p>'}
        </section>
      </div>
      <p class="playbook-source">${escapeHtml(data.source || 'Cloudflare D1 sales signals')}</p>
    `;
  }

  function activationItems(services) {
    return [
      {
        key: 'r2',
        title: 'R2 reports',
        link: 'https://dash.cloudflare.com/2a432f7e8d56266c9dd713199ecf5b47/r2/overview',
        action: 'Create creative-mk-lead-artifacts and uncomment r2_buckets; JSON snapshots will archive there automatically.'
      },
      {
        key: 'analyticsEngine',
        title: 'Analytics Engine',
        link: 'https://dash.cloudflare.com/2a432f7e8d56266c9dd713199ecf5b47/workers/analytics-engine',
        action: 'Enable Analytics Engine and uncomment analytics_engine_datasets.'
      },
      {
        key: 'aiSearch',
        title: 'AI Search',
        link: 'https://dash.cloudflare.com/2a432f7e8d56266c9dd713199ecf5b47/ai/ai-search/tokens',
        action: 'Create AI Search token, create crawler, then uncomment ai_search.'
      },
      {
        key: 'turnstile',
        title: 'Turnstile',
        link: 'https://dash.cloudflare.com/2a432f7e8d56266c9dd713199ecf5b47/turnstile',
        action: 'Create widget, set PUBLIC_TURNSTILE_SITE_KEY and TURNSTILE_SECRET_KEY, then require after testing.'
      },
      {
        key: 'browserRun',
        title: 'Browser Run',
        link: 'https://dash.cloudflare.com/2a432f7e8d56266c9dd713199ecf5b47/workers/browser-rendering',
        action: 'Confirm free quota, uncomment browser binding for rendered audits.'
      },
      {
        key: 'emailRouting',
        title: 'Email Routing',
        link: 'https://dash.cloudflare.com/2a432f7e8d56266c9dd713199ecf5b47/creativemk.net/email/routing',
        action: 'Route leads@creativemk.net to this Worker.'
      }
    ].map((item) => ({ ...item, status: services?.[item.key] || { enabled: false, mode: 'pending', note: '' } }));
  }

  function renderActivationChecklist(runbook, services) {
    const target = activationChecklist || document.getElementById('activation-checklist');
    const data = runbook || {};
    const summary = data.summary || {};
    const steps = data.steps || [];
    const completed = data.completed || [];
    const safetyNotes = data.safetyNotes || [];

    if (!steps.length && !completed.length) {
      target.innerHTML = activationItems(services)
        .map((item) => `
            <div class="check-item">
              <div class="check-item__top">
              <h3>${escapeHtml(item.title)}</h3>
              <span class="stack-pill ${item.status.enabled ? '' : 'is-fallback'}">${escapeHtml(item.status.enabled ? 'active' : item.status.mode)}</span>
            </div>
            <p>${escapeHtml(item.status.note || item.action)}</p>
            <a href="${escapeHtml(item.link)}" target="_blank" rel="noreferrer">${escapeHtml(item.action)}</a>
          </div>
        `)
        .join('');
      return;
    }

    target.innerHTML = `
      <div class="runbook-summary">
        <div><span>Pending</span><strong>${Number(summary.pending || steps.length)}</strong></div>
        <div><span>Active</span><strong>${Number(summary.active || completed.length)}</strong></div>
        <div><span>Next</span><strong>${escapeHtml(summary.next || 'All tracked services active')}</strong></div>
      </div>
      <div class="runbook-list">
        ${steps.length ? steps.map((item, index) => `
          <article class="runbook-card is-${escapeHtml(item.priority || 'low')}">
            <div class="runbook-card__top">
              <div>
                <span>${String(index + 1).padStart(2, '0')} / ${escapeHtml(item.layer || 'Cloudflare')}</span>
                <h3>${escapeHtml(item.label || 'Activation')}</h3>
              </div>
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
            </div>
            <p>${escapeHtml(item.why || '')}</p>
            <small>${escapeHtml(item.currentState || '')}</small>
            <ol class="runbook-steps">
              ${(item.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
            </ol>
            <div class="runbook-commands">
              ${(item.commands || []).map((command) => `
                <div>
                  <code>${escapeHtml(command)}</code>
                  <button type="button" data-copy-command="${escapeHtml(command)}">Copy</button>
                </div>
              `).join('')}
            </div>
            <div class="runbook-verify">
              <strong>Verify</strong>
              ${(item.verify || []).map((check) => `<span>${escapeHtml(check)}</span>`).join('')}
            </div>
            <div class="runbook-card__footer">
              <span>${escapeHtml(item.freeGuardrail || '')}</span>
              <a href="${escapeHtml(item.dashboardUrl || '#')}" target="_blank" rel="noreferrer">Open Cloudflare</a>
            </div>
          </article>
        `).join('') : '<p class="detail-meta">All tracked Cloudflare activations are active.</p>'}
      </div>
      <div class="runbook-safety">
        ${safetyNotes.length ? safetyNotes.map((note) => `<span>${escapeHtml(note)}</span>`).join('') : '<span>Verify every binding from /admin/api/metrics after deploy.</span>'}
      </div>
    `;
  }

  function labCards(items, emptyText) {
    if (!items || !items.length) {
      return `<p class="detail-meta">${escapeHtml(emptyText)}</p>`;
    }

    return items
      .map((item) => `
        <article class="lab-card">
          <div class="lab-card__top">
            <h3>${escapeHtml(item.title || item.question || 'Untitled')}</h3>
            <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
          </div>
          <p>${escapeHtml(item.angle || item.offer || item.sourceSignal || '')}</p>
          ${item.signal || item.trigger ? `<small>${escapeHtml(item.signal || item.trigger)}</small>` : ''}
        </article>
      `)
      .join('');
  }

  function renderContentLab(contentLab) {
    const target = document.getElementById('content-offer-lab');
    const lab = contentLab || {};
    const summary = lab.summary || {};

    target.innerHTML = `
      <div class="lab-summary">
        <div><span>Top Service</span><strong>${escapeHtml(summary.topService || 'No signal yet')}</strong></div>
        <div><span>Budget Signal</span><strong>${safeHuman(summary.topBudget || 'unknown')}</strong></div>
        <div><span>Timeline</span><strong>${safeHuman(summary.topTimeline || 'unknown')}</strong></div>
        <div><span>Main Blocker</span><strong>${escapeHtml(summary.topBlocker || 'No blocker yet')}</strong></div>
      </div>
      <div class="lab-columns">
        <section class="lab-column">
          <h3>Content Plays</h3>
          ${labCards(lab.contentIdeas || [], 'No content ideas yet.')}
        </section>
        <section class="lab-column">
          <h3>Offer Plays</h3>
          ${labCards(lab.offerOpportunities || [], 'No offer plays yet.')}
        </section>
        <section class="lab-column">
          <h3>FAQ Plays</h3>
          ${labCards(lab.faqIdeas || [], 'No FAQ plays yet.')}
        </section>
      </div>
      <p class="lab-source">${escapeHtml(summary.source || 'D1 lead intelligence')}</p>
    `;
  }

  function renderKnowledgeRadar(radar) {
    const target = document.getElementById('knowledge-radar');
    if (!target) return;
    const data = radar || {};
    const summary = data.summary || {};
    const gaps = data.gaps || [];
    const coverage = data.serviceCoverage || [];
    const actions = data.actions || [];
    const docs = data.suggestedAiSearchDocs || [];
    const guardrails = data.guardrails || [];

    if (!Object.keys(data).length) {
      target.innerHTML = '<p class="detail-meta">No knowledge radar signal yet. Redacted D1 conversations will activate this panel.</p>';
      return;
    }

    target.innerHTML = `
      <div class="knowledge-hero">
        <div>
          <span>Knowledge version</span>
          <strong>${escapeHtml(summary.knowledgeVersion || 'unknown')}</strong>
          <small>${Number(summary.localDocs || 0)} local docs / ${Number(summary.signalRows || 0)} D1 signal rows</small>
        </div>
        <div>
          <span>Top gap</span>
          <strong>${escapeHtml(summary.topGap || 'No gap detected')}</strong>
          <small>${Number(summary.detectedGaps || 0)} detected gaps / ${escapeHtml(summary.aiSearchMode || 'local-corpus')}</small>
        </div>
        <div>
          <span>Demand anchor</span>
          <strong>${escapeHtml(summary.topService || 'No service demand')}</strong>
          <small>${escapeHtml(data.source || 'Cloudflare D1 knowledge signals')}</small>
        </div>
      </div>
      <div class="knowledge-grid">
        <section>
          <h3>Priority Gaps</h3>
          ${gaps.length ? gaps.map((gap) => `
            <article class="knowledge-gap knowledge-gap-card">
              <div class="knowledge-gap__top">
                <strong>${escapeHtml(gap.label || 'Gap')}</strong>
                <span class="priority-pill ${priorityClass(gap.priority)}">${escapeHtml(gap.priority || 'low')}</span>
              </div>
              <div class="knowledge-gap__metrics">
                <div><span>Signals</span><strong>${Number(gap.signalCount || 0)}</strong></div>
                <div><span>Coverage</span><strong>${Number(gap.coverageScore || 0)}%</strong></div>
              </div>
              <p>${escapeHtml(gap.action || '')}</p>
              <small>${(gap.coveredBy || []).length ? `Covered by: ${(gap.coveredBy || []).map(escapeHtml).join(', ')}` : 'No strong local coverage yet.'}</small>
            </article>
          `).join('') : '<p class="detail-meta">No knowledge gaps detected yet.</p>'}
        </section>
        <section>
          <h3>Service Coverage</h3>
          ${coverage.length ? coverage.map((item) => `
            <article class="knowledge-service">
              <div class="knowledge-service__top">
                <strong>${escapeHtml(item.label || 'Service')}</strong>
                <span>${Number(item.docs || 0)} docs</span>
              </div>
              <div class="bar"><span style="width:${Math.max(6, Math.min(100, Number(item.docs || 0) * 34))}%"></span></div>
              <small>${Number(item.activeDemand || 0)} demand signals</small>
            </article>
          `).join('') : '<p class="detail-meta">No service coverage data yet.</p>'}
        </section>
      </div>
      <div class="knowledge-bottom">
        <section>
          <h3>Next Knowledge Actions</h3>
          ${actions.length ? actions.map((item) => `
            <article class="knowledge-action">
              <span class="priority-pill ${priorityClass(item.priority)}">${escapeHtml(item.priority || 'low')}</span>
              <strong>${escapeHtml(item.title || 'Action')}</strong>
              <p>${escapeHtml(item.detail || '')}</p>
              <small>${escapeHtml(item.sourceSignal || '')}</small>
            </article>
          `).join('') : '<p class="detail-meta">No actions yet.</p>'}
        </section>
        <section>
          <h3>AI Search Prep Docs</h3>
          ${docs.length ? docs.map((doc) => {
            const outline = `${doc.title || 'Knowledge doc'}\n\n${(doc.outline || []).map((line, index) => `${index + 1}. ${line}`).join('\n')}`;
            return `
              <article class="knowledge-doc">
                <div class="knowledge-gap__top">
                  <strong>${escapeHtml(doc.title || 'Knowledge doc')}</strong>
                  <span class="priority-pill ${priorityClass(doc.priority)}">${escapeHtml(doc.priority || 'low')}</span>
                </div>
                <ol>
                  ${(doc.outline || []).map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
                </ol>
                <button type="button" data-knowledge-copy="${escapeHtml(encodeURIComponent(outline))}">Copy outline</button>
              </article>
            `;
          }).join('') : '<p class="detail-meta">No AI Search prep docs yet.</p>'}
        </section>
      </div>
      <div class="knowledge-guardrails">
        ${guardrails.length ? guardrails.map((item) => `<span>${escapeHtml(item)}</span>`).join('') : '<span>Keep knowledge updates privacy-first.</span>'}
      </div>
    `;
  }

  function currentFilter() {
    if (state.view === 'hot') return 'hot';
    if (state.view === 'audits') return 'audit';
    if (state.view === 'tasks') return 'tasks';
    return '';
  }

  function renderViewLabels() {
    const labels = {
      inbox: ['Lead Inbox', 'Captured leads, scored by fit and urgency.'],
      hot: ['Hot Leads', 'High-fit leads that should be reviewed first.'],
      audits: ['Website Audits', 'Leads and sessions with site diagnostics attached.'],
      tasks: ['Follow-ups', 'Leads with open tasks generated by the concierge and email routing.'],
      funnel: ['Funnel Metrics', 'Operational view of conversion events and service demand.']
    };
    const [title, subtitle] = labels[state.view] || labels.inbox;
    viewTitle.textContent = title;
    viewSubtitle.textContent = subtitle;
  }

  function renderLeads(leads) {
    if (!leads.length) {
      leadRows.innerHTML = '<tr><td colspan="7">No leads match this view yet.</td></tr>';
      return;
    }
    leadRows.innerHTML = leads
      .map((lead) => `
        <tr data-lead-id="${lead.id}">
          <td>
            <div class="lead-name">
              <strong>${escapeHtml(lead.name || 'Unnamed lead')}</strong>
              <span>${escapeHtml(lead.email || '')}${lead.company ? ` / ${escapeHtml(lead.company)}` : ''}</span>
            </div>
          </td>
          <td>${scoreCell(lead.lead_score)}</td>
          <td>${safeHuman(lead.primary_service)}</td>
          <td>${safeHuman(lead.budget_slug)}</td>
          <td>${safeHuman(lead.timeline_slug)}</td>
          <td><span class="status-pill">${safeHuman(lead.status)}</span></td>
          <td>${formatDate(lead.created_at)}</td>
        </tr>
      `)
      .join('');
  }

  function renderDealBoard(leads) {
    const rows = leads || [];
    if (!rows.length) {
      dealBoard.innerHTML = '<p class="detail-meta">No captured leads yet. The board will populate from Cloudflare D1 after the first consented lead.</p>';
      return;
    }

    const grouped = DEAL_STAGES.map((status) => {
      const items = rows.filter((lead) => String(lead.status || 'new') === status);
      const avgScore = items.length
        ? Math.round(items.reduce((total, lead) => total + Number(lead.lead_score || 0), 0) / items.length)
        : 0;
      return { status, items, avgScore };
    });

    dealBoard.innerHTML = `
      <div class="deal-columns">
        ${grouped.map((column) => `
          <section class="deal-column" data-stage="${escapeHtml(column.status)}">
            <div class="deal-column__top">
              <strong>${safeHuman(column.status)}</strong>
              <span>${column.items.length}</span>
            </div>
            <small>Avg score ${column.avgScore}</small>
            <div class="deal-column__cards">
              ${column.items.length ? column.items.slice(0, 8).map((lead) => {
                const next = NEXT_STAGE[lead.status];
                return `
                  <article class="deal-card" data-lead-id="${escapeHtml(lead.id)}">
                    <div class="deal-card__top">
                      <strong>${escapeHtml(lead.name || 'Unnamed lead')}</strong>
                      ${scoreCell(lead.lead_score)}
                    </div>
                    <p>${safeHuman(lead.primary_service)} / ${safeHuman(lead.budget_slug)} / ${safeHuman(lead.timeline_slug)}</p>
                    <div class="deal-card__actions">
                      <button type="button" data-deal-action="open">Open</button>
                      ${next ? `<button type="button" data-deal-action="stage" data-next-status="${next}">Move to ${safeHuman(next)}</button>` : ''}
                    </div>
                  </article>
                `;
              }).join('') : '<p class="detail-meta">No leads in this stage.</p>'}
            </div>
          </section>
        `).join('')}
      </div>
    `;
  }

  function hoursLabel(value) {
    const hours = Number(value || 0);
    if (hours < 1) return '<1h';
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  }

  function renderSlaMonitor(sla) {
    const data = sla || {};
    const summary = data.summary || {};
    const leads = data.leads || [];

    if (!summary.monitored) {
      slaMonitor.innerHTML = '<p class="detail-meta">No open leads to monitor yet.</p>';
      return;
    }

    slaMonitor.innerHTML = `
      <div class="sla-summary">
        <div><span>Monitored</span><strong>${Number(summary.monitored || 0)}</strong></div>
        <div><span>At risk</span><strong>${Number(summary.atRisk || 0)}</strong></div>
        <div><span>High risk</span><strong>${Number(summary.highRisk || 0)}</strong></div>
        <div><span>Overdue tasks</span><strong>${Number(summary.overdueTasks || 0)}</strong></div>
      </div>
      <div class="sla-list">
        ${leads.length ? leads.map((lead) => `
          <article class="sla-card is-${escapeHtml(lead.priority || 'low')}" data-lead-id="${escapeHtml(lead.id)}">
            <div class="sla-card__top">
              <div>
                <strong>${escapeHtml(lead.name || 'Unnamed lead')}</strong>
                <span>${safeHuman(lead.status)} / ${safeHuman(lead.primaryService)} / score ${Number(lead.score || 0)}</span>
              </div>
              <span class="priority-pill ${priorityClass(lead.priority)}">${escapeHtml(lead.priority || 'low')}</span>
            </div>
            <p>${escapeHtml(lead.reason || 'Within SLA')}</p>
            <div class="sla-card__meta">
              <span>Age ${hoursLabel(lead.leadAgeHours)}</span>
              <span>Human touch ${lead.hoursSinceHuman === null || lead.hoursSinceHuman === undefined ? 'none' : hoursLabel(lead.hoursSinceHuman)}</span>
              <span>${Number(lead.openTasks || 0)} open tasks</span>
              ${lead.nextTaskDue ? `<span>Next ${formatDateTime(lead.nextTaskDue)}</span>` : ''}
            </div>
            <div class="sla-card__actions">
              <small>${escapeHtml(lead.action || '')}</small>
              <button type="button" data-sla-action="open">Open lead</button>
            </div>
          </article>
        `).join('') : '<p class="detail-meta">No SLA alerts yet.</p>'}
      </div>
    `;
  }

  function parseJsonField(value, fallback) {
    try {
      return value ? JSON.parse(value) : fallback;
    } catch {
      return fallback;
    }
  }

  function attributionItems(session, lead) {
    const attribution = parseJsonField(session?.utm_json, {});
    return [
      ['Lead source', lead.source],
      ['Landing page', session?.landing_page || attribution.landing_page],
      ['Referrer', attribution.referrer],
      ['UTM source', attribution.utm_source],
      ['UTM medium', attribution.utm_medium],
      ['UTM campaign', attribution.utm_campaign],
      ['UTM content', attribution.utm_content],
      ['UTM term', attribution.utm_term]
    ].filter(([, value]) => String(value || '').trim());
  }

  function renderAttribution(session, lead) {
    const items = attributionItems(session, lead);
    if (!items.length) {
      return '<p class="detail-meta">No attribution captured yet.</p>';
    }
    return `
      <div class="attribution-grid">
        ${items.map(([label, value]) => `
          <div>
            <span>${escapeHtml(label)}</span>
            <strong title="${escapeHtml(value)}">${escapeHtml(value)}</strong>
          </div>
        `).join('')}
      </div>
    `;
  }

  function taskTypeLabel(value) {
    const labels = {
      follow_up: 'Follow up',
      review_ai_summary: 'Review AI summary',
      reply_to_email: 'Reply to email',
      audit_review: 'Review audit',
      proposal_prep: 'Prepare proposal',
      send_scope: 'Send scope',
      schedule_call: 'Schedule call'
    };
    return labels[value] || human(value);
  }

  function taskNote(task) {
    const payload = parseJsonField(task?.payload_json, {});
    return compactText(payload.note || payload.subject || payload.nextBestAction || '', '');
  }

  function eventSummary(event) {
    const metadata = parseJsonField(event?.metadata_json, {});
    const type = String(event?.event_type || '');
    const labels = {
      'admin-status-changed': 'Status changed',
      'admin-note-added': 'Internal note',
      'admin-task-created': 'Task created',
      'admin-task-status': 'Task updated',
      'lead-capture': 'Lead captured',
      'capture-submit': 'Capture submitted',
      'capture-open': 'Capture opened',
      'audit-url': 'Website audit',
      brief: 'Brief generated',
      chat: 'Chat message',
      open: 'Chat opened',
      'email.ingest': 'Email ingested'
    };
    let detail = safeHuman(event?.service_slug || metadata.taskType || '');
    if (type === 'admin-status-changed') {
      detail = `${safeHuman(metadata.from)} -> ${safeHuman(metadata.to)}`;
    } else if (type === 'admin-note-added') {
      detail = escapeHtml(metadata.notePreview || 'Private admin note saved.');
    } else if (type === 'admin-task-created') {
      detail = `${safeHuman(metadata.taskType)} due ${formatDateTime(metadata.dueAt)}${metadata.notePreview ? ` / ${escapeHtml(metadata.notePreview)}` : ''}`;
    } else if (type === 'admin-task-status') {
      detail = `${safeHuman(metadata.taskType)}: ${safeHuman(metadata.from)} -> ${safeHuman(metadata.to)}`;
    } else if (type === 'email.ingest') {
      detail = escapeHtml(metadata.subject || 'Inbound email linked to this lead.');
    }
    return {
      title: labels[type] || human(type || 'event'),
      detail: detail || 'No extra detail.',
      kind: type.startsWith('admin-') ? 'admin' : 'visitor'
    };
  }

  function renderTimeline(events) {
    const rows = (events || []).slice(0, 12);
    if (!rows.length) return '<p class="detail-meta">No events yet.</p>';
    return `
      <div class="timeline-list">
        ${rows.map((event) => {
          const summary = eventSummary(event);
          return `
            <article class="timeline-item is-${escapeHtml(summary.kind)}">
              <div>
                <strong>${escapeHtml(summary.title)}</strong>
                <span>${formatDateTime(event.created_at)}</span>
              </div>
              <p>${summary.detail}</p>
            </article>
          `;
        }).join('')}
      </div>
    `;
  }

  function renderConsentLedger(lead, session, consents) {
    const rows = consents || [];
    const sessionConsented = Number(session?.consented || 0) > 0 || Boolean(lead?.consent_at);
    const fallback = !rows.length && lead?.consent_at
      ? [{
        scope: 'lead-capture',
        copy_version: 'lead-consent-at',
        created_at: lead.consent_at
      }]
      : [];
    const displayRows = rows.length ? rows : fallback;

    return `
      <div class="privacy-ledger">
        <div class="privacy-ledger__status ${sessionConsented ? 'is-ok' : 'is-pending'}">
          <strong>${sessionConsented ? 'Consent on file' : 'Consent missing'}</strong>
          <span>${sessionConsented ? 'PII stored in leads table only' : 'Review before outreach'}</span>
        </div>
        ${displayRows.length ? displayRows.slice(0, 5).map((item) => `
          <article class="privacy-ledger__event">
            <div>
              <strong>${safeHuman(item.scope || 'consent')}</strong>
              <span>${formatDateTime(item.created_at)}</span>
            </div>
            <p>Copy version: ${escapeHtml(item.copy_version || 'unknown')}</p>
          </article>
        `).join('') : '<p class="detail-meta">No consent event recorded for this session.</p>'}
        <p class="privacy-ledger__note">Operational data stays in Cloudflare D1. Analytics events avoid name, email, phone and full transcript.</p>
      </div>
    `;
  }

  function taskStateClass(task) {
    if (task.status !== 'open') return 'is-done';
    if (!task.due_at) return '';
    const due = new Date(String(task.due_at));
    if (!Number.isNaN(due.getTime()) && due.getTime() <= Date.now()) return 'is-overdue';
    return '';
  }

  function renderTasks(data) {
    const tasks = data?.tasks || [];
    const summary = data?.summary || {};
    taskSummary.innerHTML = `
      <span>Open: ${Number(summary.open || 0)}</span>
      <span>Overdue: ${Number(summary.overdue || 0)}</span>
      <span>Done: ${Number(summary.completed || 0)}</span>
    `;

    if (!tasks.length) {
      taskList.innerHTML = '<p class="detail-meta">No open follow-ups yet. New captured leads will create tasks automatically.</p>';
      return;
    }

    taskList.innerHTML = tasks
      .map((task) => {
        const payload = parseJsonField(task.payload_json, {});
        const next = task.next_best_action || payload.nextBestAction || payload.subject || 'Review lead context and decide next step.';
        const note = compactText(payload.note, '');
        const completeLabel = task.status === 'open' ? 'Complete' : 'Reopen';
        const nextStatus = task.status === 'open' ? 'completed' : 'open';
        return `
          <article class="task-card ${taskStateClass(task)}" data-task-id="${escapeHtml(task.id)}" data-lead-id="${escapeHtml(task.lead_id || '')}">
            <div class="task-card__main">
              <div class="task-card__top">
                <strong>${escapeHtml(taskTypeLabel(task.task_type))}</strong>
                <span class="status-pill">${safeHuman(task.status)}</span>
              </div>
              <p>${escapeHtml(next)}</p>
              ${note ? `<p class="task-card__note">${escapeHtml(note)}</p>` : ''}
              <div class="task-card__meta">
                <span>${escapeHtml(task.name || 'Unassigned lead')}</span>
                <span>${safeHuman(task.primary_service)}</span>
                <span>Score ${Number(task.lead_score || 0)}</span>
                <span>Due ${formatDateTime(task.due_at)}</span>
              </div>
            </div>
            <div class="task-card__actions">
              ${task.lead_id ? `<button type="button" data-task-action="lead">Open lead</button>` : ''}
              <button type="button" data-task-action="status" data-next-status="${nextStatus}">${completeLabel}</button>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function renderDetail(data) {
    const lead = data.lead || {};
    const session = data.session || {};
    const diagnostic = data.diagnostic || {};
    const profile = data.profile || {};
    const support = parseJsonField(diagnostic.support_services_json, []);
    const blockers = parseJsonField(diagnostic.blockers_json, []);
    const latestBrief = (data.briefs || [])[0];
    const latestAudit = (data.audits || [])[0];
    const tasks = data.tasks || [];
    const replyDraft = buildReplyDraft(data);

    detailPanel.innerHTML = `
      <div class="detail-body">
        <div class="detail-title">
          <div>
            <h3>${escapeHtml(lead.name || 'Lead')}</h3>
            <p class="detail-meta">${escapeHtml(lead.email || '')}${lead.company ? ` / ${escapeHtml(lead.company)}` : ''}</p>
          </div>
          ${scoreCell(diagnostic.lead_score)}
        </div>

        <section class="detail-section">
          <span class="detail-label">Recommended path</span>
          <p><strong>${safeHuman(diagnostic.primary_service)}</strong>${support.length ? ` with ${support.map(safeHuman).join(' + ')}` : ''}</p>
          <p>${escapeHtml(diagnostic.next_best_action || 'No next action yet.')}</p>
        </section>

        <section class="detail-section">
          <span class="detail-label">Profile</span>
          <ul class="detail-list">
            <li>Goal: ${escapeHtml(profile.goal || 'Unknown')}</li>
            <li>Business: ${escapeHtml(profile.business_type || 'Unknown')}</li>
            <li>Budget: ${safeHuman(profile.budget_slug)}</li>
            <li>Timeline: ${safeHuman(profile.timeline_slug)}</li>
            <li>Blockers: ${blockers.length ? blockers.map(escapeHtml).join(', ') : 'None detected'}</li>
          </ul>
        </section>

        <section class="detail-section">
          <span class="detail-label">Attribution</span>
          ${renderAttribution(session, lead)}
        </section>

        <section class="detail-section">
          <span class="detail-label">Consent & Privacy</span>
          ${renderConsentLedger(lead, session, data.consents || [])}
        </section>

        <section class="detail-section">
          <span class="detail-label">Latest brief</span>
          <p>${escapeHtml(latestBrief ? latestBrief.summary || latestBrief.notes || 'Brief saved.' : 'No brief yet.')}</p>
        </section>

        <section class="detail-section">
          <span class="detail-label">Latest audit</span>
          <p>${escapeHtml(latestAudit ? `${latestAudit.title || 'Untitled'} / clarity ${latestAudit.clarity_score || '--'}/10 / conversion ${latestAudit.conversion_score || '--'}/10` : 'No audit yet.')}</p>
        </section>

        <section class="detail-section">
          <span class="detail-label">Open tasks</span>
          <ul class="detail-list">
            ${tasks.length ? tasks.slice(0, 6).map((task) => {
              const note = taskNote(task);
              return `<li>${escapeHtml(taskTypeLabel(task.task_type))}: ${safeHuman(task.status)} / due ${formatDateTime(task.due_at)}${note ? ` / ${escapeHtml(note)}` : ''}</li>`;
            }).join('') : '<li>No tasks yet.</li>'}
          </ul>
        </section>

        <section class="detail-section">
          <span class="detail-label">Timeline</span>
          ${renderTimeline(data.events || [])}
        </section>

        <section class="detail-section reply-draft">
          <span class="detail-label">Client reply draft</span>
          <div class="reply-draft__top">
            <strong>${escapeHtml(replyDraft.subject)}</strong>
            <button type="button" data-action="copy-draft">Copy email</button>
          </div>
          <pre>${escapeHtml(replyDraft.body)}</pre>
        </section>

        <form class="task-create" data-lead-id="${lead.id}">
          <span class="detail-label">Create follow-up task</span>
          <div class="task-create__row">
            <select name="task_type" aria-label="Task type">
              ${[
                ['follow_up', 'Follow up'],
                ['schedule_call', 'Schedule call'],
                ['send_scope', 'Send scope'],
                ['proposal_prep', 'Prepare proposal'],
                ['audit_review', 'Review audit'],
                ['review_ai_summary', 'Review AI summary']
              ].map(([value, label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join('')}
            </select>
            <select name="due_in" aria-label="Task due date">
              <option value="today">Today</option>
              <option value="tomorrow" selected>Tomorrow</option>
              <option value="2-days">In 2 days</option>
              <option value="1-week">In 1 week</option>
            </select>
          </div>
          <textarea name="task_note" placeholder="Specific next step for this lead">${escapeHtml(diagnostic.next_best_action || '')}</textarea>
          <button type="button" data-action="task">Create task</button>
        </form>

        <form class="detail-actions" data-lead-id="${lead.id}">
          <select name="status" aria-label="Lead status">
            ${['new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'archived'].map((status) => `<option value="${status}" ${lead.status === status ? 'selected' : ''}>${human(status)}</option>`).join('')}
          </select>
          <button type="button" data-action="status">Update status</button>
          <textarea name="note" placeholder="Add internal note">${escapeHtml(lead.owner_notes || '')}</textarea>
          <button type="button" data-action="note">Add note</button>
        </form>
      </div>
    `;
  }

  async function loadMetrics() {
    const data = await api('/metrics');
    renderMetric('metric-sessions', data.summary.sessions);
    renderMetric('metric-leads', data.summary.leads);
    renderMetric('metric-hot', data.summary.hotLeads);
    renderMetric('metric-audits', data.summary.audits);
    renderMetric('metric-tasks', data.summary.openTasks);
    renderMetric('metric-conversion', `${data.summary.conversionRate}%`);
    renderExecutiveDigest(data.intelligence?.executiveDigest);
    renderGrowthCommandCenter(data.intelligence?.growthCommandCenter);
    renderCloudflareStack(data.cloudflareServices);
    renderCloudflareOperations(data.intelligence?.cloudflareOperations);
    renderSecurityCenter(data.intelligence?.securityAbuseCenter);
    renderConversationIntel(data.intelligence);
    renderRetention(data.intelligence?.retention);
    renderMaintenanceConsole(data, state.lastMaintenance);
    renderSystemHealth(state.lastHealth);
    renderPrivacyQuality(data.intelligence?.privacyDataQuality);
    renderPageFunnel(data.intelligence?.pages || []);
    renderConversionExperimentLab(data.intelligence?.conversionExperimentLab);
    renderAuditLab(data.intelligence?.auditLab);
    renderAttributionPerformance(data.intelligence?.attribution);
    renderPipelineBoard(data.intelligence?.pipeline);
    renderRevenueForecast(data.intelligence?.revenueForecast);
    renderSalesPlaybook(data.intelligence?.salesPlaybook);
    renderSlaMonitor(data.intelligence?.slaMonitor);
    renderContentLab(data.intelligence?.contentLab);
    renderKnowledgeRadar(data.intelligence?.knowledgeGapRadar);
    renderActivationChecklist(data.intelligence?.cloudflareOperations?.activationRunbook, data.cloudflareServices);
    renderBars('service-demand', data.services || [], 'service', 'count');
    renderBars('event-demand', data.events || [], 'event_type', 'count');
  }

  async function loadLeads() {
    const params = new URLSearchParams();
    if (statusFilter.value) params.set('status', statusFilter.value);
    if (serviceFilter.value) params.set('service', serviceFilter.value);
    if (currentFilter()) params.set('filter', currentFilter());
    const data = await api(`/leads?${params.toString()}`);
    state.leads = data.leads || [];
    renderLeads(state.leads);
  }

  async function loadDealBoard() {
    const params = new URLSearchParams();
    params.set('limit', '50');
    if (serviceFilter.value) params.set('service', serviceFilter.value);
    const data = await api(`/leads?${params.toString()}`);
    renderDealBoard(data.leads || []);
  }

  async function loadTasks() {
    const params = new URLSearchParams();
    params.set('status', 'open');
    if (serviceFilter.value) params.set('service', serviceFilter.value);
    const data = await api(`/tasks?${params.toString()}`);
    renderTasks(data);
  }

  async function refreshAll() {
    renderViewLabels();
    try {
      await Promise.all([loadMetrics(), loadLeads(), loadTasks(), loadDealBoard()]);
      setAuthState('Connected', true);
    } catch (error) {
      setAuthState(error.message || 'Not connected', false);
      leadRows.innerHTML = `<tr><td colspan="7" class="error-text">${error.message || 'Could not load leads.'}</td></tr>`;
      taskList.innerHTML = `<p class="detail-meta error-text">${error.message || 'Could not load tasks.'}</p>`;
      dealBoard.innerHTML = `<p class="detail-meta error-text">${error.message || 'Could not load deal board.'}</p>`;
    }
  }

  async function selectLead(leadId) {
    state.selectedLeadId = leadId;
    detailPanel.innerHTML = '<div class="detail-empty"><span>Loading lead...</span></div>';
    try {
      const data = await api(`/leads/${encodeURIComponent(leadId)}`);
      renderDetail(data);
    } catch (error) {
      detailPanel.innerHTML = `<div class="detail-empty"><span class="error-text">${error.message}</span></div>`;
    }
  }

  authForm.addEventListener('submit', (event) => {
    event.preventDefault();
    saveToken(tokenInput.value);
    refreshAll();
  });

  refreshButton.addEventListener('click', refreshAll);
  disconnectButton.addEventListener('click', () => {
    clearToken();
    tokenInput.value = '';
    setAuthState('Not connected', false);
    leadRows.innerHTML = '<tr><td colspan="7">Connect with an admin token to load leads.</td></tr>';
    detailPanel.innerHTML = '<div class="detail-empty"><span>Select a lead</span><p>Briefs, audits, objections and next actions will appear here.</p></div>';
    taskList.innerHTML = '<p class="detail-meta">Connect with an admin token to load follow-ups.</p>';
    slaMonitor.innerHTML = '<p class="detail-meta">Connect with an admin token to load SLA risk.</p>';
    dealBoard.innerHTML = '<p class="detail-meta">Connect with an admin token to load the deal board.</p>';
    if (cloudflareOps) cloudflareOps.innerHTML = '<p class="detail-meta">Connect with an admin token to load Cloudflare operations readiness.</p>';
    const securityCenter = document.getElementById('security-center');
    if (securityCenter) securityCenter.innerHTML = '<p class="detail-meta">Connect with an admin token to load security posture.</p>';
    if (maintenanceConsole) maintenanceConsole.innerHTML = '<p class="detail-meta">Connect with an admin token to run maintenance.</p>';
    if (systemHealth) systemHealth.innerHTML = '<p class="detail-meta">Connect with an admin token to run health checks.</p>';
    const auditLab = document.getElementById('audit-lab');
    if (auditLab) auditLab.innerHTML = '<p class="detail-meta">Connect with an admin token to load audit intelligence.</p>';
    const experimentLab = document.getElementById('experiment-lab');
    if (experimentLab) experimentLab.innerHTML = '<p class="detail-meta">Connect with an admin token to load conversion experiments.</p>';
    const growthCommand = document.getElementById('growth-command-center');
    if (growthCommand) growthCommand.innerHTML = '<p class="detail-meta">Connect with an admin token to load the growth command center.</p>';
    const knowledgeRadar = document.getElementById('knowledge-radar');
    if (knowledgeRadar) knowledgeRadar.innerHTML = '<p class="detail-meta">Connect with an admin token to load knowledge gap intelligence.</p>';
    const salesPlaybook = document.getElementById('sales-playbook');
    if (salesPlaybook) salesPlaybook.innerHTML = '<p class="detail-meta">Connect with an admin token to load sales playbook.</p>';
    taskSummary.innerHTML = '<span>Open: 0</span><span>Overdue: 0</span>';
  });
  exportLink.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/admin/api/export.csv', { headers: headers() });
      if (!response.ok) throw new Error(`Export failed ${response.status}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `creative-mk-leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setAuthState(error.message, false);
    }
  });
  snapshotLink.addEventListener('click', async (event) => {
    event.preventDefault();
    try {
      const response = await fetch('/admin/api/export.json', { headers: headers() });
      if (!response.ok) throw new Error(`Snapshot failed ${response.status}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `creative-mk-ops-snapshot-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      setAuthState(error.message, false);
    }
  });
  statusFilter.addEventListener('change', loadLeads);
  serviceFilter.addEventListener('change', loadLeads);
  serviceFilter.addEventListener('change', loadTasks);
  serviceFilter.addEventListener('change', loadDealBoard);

  document.querySelectorAll('.admin-nav__item').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.admin-nav__item').forEach((item) => item.classList.remove('is-active'));
      button.classList.add('is-active');
      state.view = button.dataset.view || 'inbox';
      refreshAll();
    });
  });

  leadRows.addEventListener('click', (event) => {
    const row = event.target.closest('tr[data-lead-id]');
    if (row) selectLead(row.dataset.leadId);
  });

  dealBoard.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-deal-action]');
    const card = event.target.closest('.deal-card');
    if (!button || !card) return;
    const leadId = card.dataset.leadId;
    if (!leadId) return;

    if (button.dataset.dealAction === 'open') {
      await selectLead(leadId);
      return;
    }

    if (button.dataset.dealAction === 'stage') {
      button.disabled = true;
      try {
        await api(`/leads/${encodeURIComponent(leadId)}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: button.dataset.nextStatus })
        });
        await Promise.all([loadDealBoard(), loadLeads(), loadMetrics()]);
        if (state.selectedLeadId === leadId) await selectLead(leadId);
      } catch (error) {
        setAuthState(error.message, false);
      } finally {
        button.disabled = false;
      }
    }
  });

  slaMonitor.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-sla-action]');
    const card = event.target.closest('.sla-card');
    if (!button || !card) return;
    const leadId = card.dataset.leadId;
    if (leadId) await selectLead(leadId);
  });

  document.getElementById('audit-lab')?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-audit-action]');
    const card = event.target.closest('.audit-card');
    if (!button || !card) return;
    const leadId = card.dataset.leadId;
    if (leadId) await selectLead(leadId);
  });

  document.getElementById('experiment-lab')?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-experiment-copy]');
    if (!button) return;
    button.disabled = true;
    try {
      await copyText(decodeURIComponent(button.dataset.experimentCopy || ''));
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = 'Copy experiment';
        button.disabled = false;
      }, 1400);
    } catch {
      setAuthState('Could not copy experiment', false);
      button.disabled = false;
    }
  });

  document.getElementById('growth-command-center')?.addEventListener('click', async (event) => {
    const leadButton = event.target.closest('button[data-command-lead]');
    if (leadButton) {
      const leadId = leadButton.dataset.commandLead;
      if (leadId) await selectLead(leadId);
      return;
    }

    const copyButton = event.target.closest('button[data-command-copy]');
    if (!copyButton) return;
    const originalText = copyButton.textContent || 'Copy command';
    copyButton.disabled = true;
    try {
      await copyText(decodeURIComponent(copyButton.dataset.commandCopy || ''));
      copyButton.textContent = 'Copied';
      setTimeout(() => {
        copyButton.textContent = originalText;
        copyButton.disabled = false;
      }, 1400);
    } catch {
      setAuthState('Could not copy command', false);
      copyButton.disabled = false;
    }
  });

  document.getElementById('knowledge-radar')?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-knowledge-copy]');
    if (!button) return;
    const originalText = button.textContent || 'Copy outline';
    button.disabled = true;
    try {
      await copyText(decodeURIComponent(button.dataset.knowledgeCopy || ''));
      button.textContent = 'Copied';
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
      }, 1400);
    } catch {
      setAuthState('Could not copy knowledge outline', false);
      button.disabled = false;
    }
  });

  document.getElementById('sales-playbook')?.addEventListener('click', async (event) => {
    const copyButton = event.target.closest('button[data-playbook-copy]');
    if (copyButton) {
      copyButton.disabled = true;
      try {
        await copyText(decodeURIComponent(copyButton.dataset.playbookCopy || ''));
        copyButton.textContent = 'Copied';
        setTimeout(() => {
          copyButton.textContent = 'Copy';
          copyButton.disabled = false;
        }, 1400);
      } catch {
        setAuthState('Could not copy playbook template', false);
        copyButton.disabled = false;
      }
      return;
    }

    const openButton = event.target.closest('button[data-playbook-action="open"]');
    const card = event.target.closest('.playbook-lead');
    if (!openButton || !card) return;
    const leadId = card.dataset.leadId;
    if (leadId) await selectLead(leadId);
  });

  activationChecklist?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-copy-command]');
    if (!button) return;
    const copied = await copyText(button.dataset.copyCommand || '');
    button.textContent = copied ? 'Copied' : 'Copy failed';
    setTimeout(() => {
      button.textContent = 'Copy';
    }, 1400);
  });

  maintenanceConsole?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-maintenance-action]');
    if (!button) return;
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Running...';
    try {
      const day = new Date().toISOString().slice(0, 10);
      state.lastMaintenance = await api('/ops/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ day })
      });
      await loadMetrics();
      setAuthState('Maintenance completed', true);
    } catch (error) {
      setAuthState(error.message || 'Maintenance failed', false);
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });

  systemHealth?.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-health-action]');
    if (!button) return;
    button.disabled = true;
    const originalText = button.textContent;
    button.textContent = 'Checking...';
    try {
      state.lastHealth = await api('/ops/health-check');
      renderSystemHealth(state.lastHealth);
      setAuthState(state.lastHealth.ok ? 'Health check passed' : 'Health check needs review', Boolean(state.lastHealth.ok));
    } catch (error) {
      setAuthState(error.message || 'Health check failed', false);
    } finally {
      button.disabled = false;
      button.textContent = originalText;
    }
  });

  taskList.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-task-action]');
    const card = event.target.closest('.task-card');
    if (!button || !card) return;
    const leadId = card.dataset.leadId;
    const taskId = card.dataset.taskId;

    if (button.dataset.taskAction === 'lead' && leadId) {
      await selectLead(leadId);
      return;
    }

    if (button.dataset.taskAction === 'status' && taskId) {
      button.disabled = true;
      try {
        await api(`/tasks/${encodeURIComponent(taskId)}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: button.dataset.nextStatus || 'completed' })
        });
        await Promise.all([loadTasks(), loadMetrics(), loadLeads()]);
        if (state.selectedLeadId) await selectLead(state.selectedLeadId);
      } catch (error) {
        setAuthState(error.message, false);
      } finally {
        button.disabled = false;
      }
    }
  });

  detailPanel.addEventListener('click', async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    if (button.dataset.action === 'copy-draft') {
      const draft = button.closest('.reply-draft');
      const subject = draft?.querySelector('.reply-draft__top strong')?.textContent || '';
      const body = draft?.querySelector('pre')?.textContent || '';
      button.disabled = true;
      try {
        await copyText(`Subject: ${subject}\n\n${body}`);
        button.textContent = 'Copied';
        window.setTimeout(() => {
          button.textContent = 'Copy email';
          button.disabled = false;
        }, 1400);
      } catch {
        setAuthState('Could not copy draft', false);
        button.disabled = false;
      }
      return;
    }

    if (button.dataset.action === 'task') {
      const taskForm = button.closest('.task-create');
      const leadId = taskForm?.dataset.leadId;
      if (!leadId) return;

      button.disabled = true;
      try {
        await api(`/leads/${encodeURIComponent(leadId)}/task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            task_type: taskForm.elements.task_type.value,
            due_in: taskForm.elements.due_in.value,
            note: taskForm.elements.task_note.value
          })
        });
        taskForm.elements.task_note.value = '';
        await Promise.all([loadTasks(), loadMetrics(), loadLeads(), loadDealBoard(), selectLead(leadId)]);
      } catch (error) {
        setAuthState(error.message, false);
      } finally {
        button.disabled = false;
      }
      return;
    }

    const form = button.closest('.detail-actions');
    const leadId = form?.dataset.leadId;
    if (!leadId) return;

    button.disabled = true;
    try {
      if (button.dataset.action === 'status') {
        await api(`/leads/${encodeURIComponent(leadId)}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: form.status.value })
        });
      } else {
        await api(`/leads/${encodeURIComponent(leadId)}/note`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ note: form.note.value })
        });
      }
      await Promise.all([loadLeads(), loadDealBoard(), loadMetrics(), selectLead(leadId)]);
    } catch (error) {
      setAuthState(error.message, false);
    } finally {
      button.disabled = false;
    }
  });

  state.token = storedToken();
  tokenInput.value = state.token;
  if (state.token) refreshAll();
})();
