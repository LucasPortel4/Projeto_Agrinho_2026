/**
 * src/ui/ui.js
 * Módulo principal de renderização da interface.
 *
 * ARQUITETURA (após correção de bugs):
 * ─────────────────────────────────────
 * • renderShop()  → chamado UMA VEZ no init (e no reset).
 *                   Constrói os botões e registra delegação de eventos no container.
 *
 * • update()      → chamado a cada clique e a cada tick do loop.
 *                   Atualiza APENAS textos/contadores e o estado disabled dos botões.
 *                   NÃO reconstrói o DOM — preserva os event listeners.
 *
 * Por que delegação de eventos?
 *   Registrar addEventListener em cada botão e depois limpar innerHTML
 *   destruía os listeners, impedindo compras múltiplas do mesmo upgrade.
 *   Com delegação, um único listener no container pai funciona para sempre.
 */

const UI = (() => {

  // ── Referências DOM cacheadas ─────────────────────────────────────────────
  const _els = {
    eggCount:    document.getElementById('egg-count'),
    headerEggs:  document.getElementById('header-eggs'),
    statTotal:   document.getElementById('stat-total'),
    statClicks:  document.getElementById('stat-clicks'),
    statEpc:     document.getElementById('stat-epc'),
    statEps:     document.getElementById('stat-eps'),
    statLevel:   document.getElementById('stat-level'),
    epcLabel:    document.getElementById('epc-label'),
    epsLabel:    document.getElementById('eps-label'),
    tabUpgrades: document.getElementById('tab-upgrades'),
    tabMilest:   document.getElementById('tab-milestones'),
  };

  /** Controla se a delegação de eventos da loja já foi registrada */
  let _delegationBound = false;

  // ── API pública ───────────────────────────────────────────────────────────

  /**
   * Constrói a loja do zero e (na primeira vez) registra a delegação de eventos.
   * Deve ser chamado apenas no init e após reset — não a cada tick.
   */
  function renderShop() {
    _buildUpgradeButtons();
    _buildMilestones();

    // Registra a delegação de clique no container UMA única vez.
    // Na segunda chamada (reset), os botões são recriados mas o listener
    // já existe no container e continua funcionando normalmente.
    if (!_delegationBound) {
      _bindShopDelegation();
      _delegationBound = true;
    }
  }

  /**
   * Atualiza contadores, stats e estado dos botões da loja.
   * Chamado a cada clique e a cada tick de produção automática.
   * NÃO reconstrói o DOM para não destruir event listeners.
   */
  function update() {
    const s = State.get();

    // Atualiza contadores de ovos e stats
    _els.eggCount.textContent   = Formatter.formatNumber(s.eggs);
    _els.headerEggs.textContent = Formatter.formatNumber(s.eggs);
    _els.statTotal.textContent  = Formatter.formatNumber(s.totalEggs);
    _els.statClicks.textContent = Formatter.formatNumber(s.clicks);
    _els.statEpc.textContent    = s.eggsPerClick;
    _els.statEps.textContent    = Formatter.formatEPS(s.eggsPerSecond);
    _els.epcLabel.textContent   = s.eggsPerClick;
    _els.epsLabel.textContent   = `${Formatter.formatEPS(s.eggsPerSecond)} ovos por segundo`;
    _els.statLevel.textContent  = Levels.getLevel(s.totalEggs);

    // Atualiza disabled/custo/owned dos botões sem recriar o DOM
    _refreshUpgradeButtons();

    // Verifica e notifica conquistas novas
    _checkMilestones(s);
  }

  /**
   * Troca a aba ativa entre "Melhorias" e "Conquistas".
   * @param {string} tabName    - 'upgrades' ou 'milestones'
   * @param {HTMLElement} clickedBtn - Botão de aba que foi clicado
   */
  function switchTab(tabName, clickedBtn) {
    document.querySelectorAll('.tab-content').forEach((t) =>
      t.classList.remove('tab-content--active')
    );
    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.remove('tab-btn--active');
      b.setAttribute('aria-selected', 'false');
    });

    document.getElementById(`tab-${tabName}`).classList.add('tab-content--active');
    clickedBtn.classList.add('tab-btn--active');
    clickedBtn.setAttribute('aria-selected', 'true');
  }

  // ── Funções privadas ──────────────────────────────────────────────────────

  /**
   * Cria todos os botões de upgrade no container da loja.
   * Cada botão recebe `data-index` para identificação pela delegação de eventos.
   * Sub-elementos com `data-cost` e `data-owned` são alvos de atualização incremental.
   */
  function _buildUpgradeButtons() {
    const s       = State.get();
    const catalog = Shop.getCatalog();

    _els.tabUpgrades.innerHTML = '';

    catalog.forEach((upgrade, index) => {
      const cost      = Shop.getCurrentCost(upgrade);
      const canAfford = s.eggs >= cost;

      const btn = document.createElement('button');
      btn.className = 'upgrade-btn';
      btn.disabled  = !canAfford;
      // data-index: lido pela delegação para saber qual upgrade comprar
      btn.dataset.index = String(index);
      btn.setAttribute(
        'aria-label',
        `Comprar ${upgrade.name} por ${Formatter.formatNumber(cost)} ovos`
      );

      btn.innerHTML = `
        <span class="upgrade-btn__icon" aria-hidden="true">${upgrade.icon}</span>
        <div class="upgrade-btn__info">
          <div class="upgrade-btn__name">${upgrade.name}</div>
          <div class="upgrade-btn__desc" title="${upgrade.desc}">${upgrade.desc}</div>
        </div>
        <span class="upgrade-btn__cost" data-cost>🥚 ${Formatter.formatNumber(cost)}</span>
        <span class="upgrade-btn__owned" data-owned
              style="display:${upgrade.owned > 0 ? 'inline-block' : 'none'}">
          x${upgrade.owned}
        </span>
      `;

      _els.tabUpgrades.appendChild(btn);
    });
  }

  /**
   * Registra um único listener de clique no container da loja (delegação de eventos).
   * O listener persiste mesmo quando os botões filhos são recriados.
   * Usa `e.target.closest('[data-index]')` para encontrar o botão correto
   * independente de qual elemento filho foi clicado (ícone, texto, etc.).
   */
  function _bindShopDelegation() {
    _els.tabUpgrades.addEventListener('click', (e) => {
      // Sobe na árvore DOM até encontrar um botão com data-index
      const btn = e.target.closest('[data-index]');
      if (!btn || btn.disabled) return;

      const index   = parseInt(btn.dataset.index, 10);
      const catalog = Shop.getCatalog();
      const upgrade = catalog[index];
      if (!upgrade) return;

      // Tenta efetuar a compra
      const ok = Shop.buy(index);
      if (ok) {
        Notification.show(`${upgrade.icon} ${upgrade.name} comprado!`);
        // Atualiza os botões e stats sem recriar o DOM
        _refreshUpgradeButtons();
        update();
      }
    });
  }

  /**
   * Percorre os botões já existentes na loja e atualiza apenas:
   *   - atributo `disabled` (pode ou não comprar)
   *   - texto do custo atual (sobe a cada compra)
   *   - badge de quantidade comprada
   * Não toca na estrutura do DOM — preserva todos os event listeners.
   */
  function _refreshUpgradeButtons() {
    const s       = State.get();
    const catalog = Shop.getCatalog();
    const buttons = _els.tabUpgrades.querySelectorAll('.upgrade-btn');

    buttons.forEach((btn) => {
      const index   = parseInt(btn.dataset.index, 10);
      const upgrade = catalog[index];
      if (!upgrade) return;

      const cost = Shop.getCurrentCost(upgrade);

      // Habilita/desabilita conforme saldo atual
      btn.disabled = s.eggs < cost;

      // Atualiza custo exibido
      const costEl = btn.querySelector('[data-cost]');
      if (costEl) costEl.textContent = `🥚 ${Formatter.formatNumber(cost)}`;

      // Atualiza badge de quantidade comprada
      const ownedEl = btn.querySelector('[data-owned]');
      if (ownedEl) {
        ownedEl.textContent    = `x${upgrade.owned}`;
        ownedEl.style.display  = upgrade.owned > 0 ? 'inline-block' : 'none';
      }
    });
  }

  /**
   * Cria os cards de conquistas na aba "Conquistas".
   * Cada card recebe `data-name` para atualização visual futura sem recriar o DOM.
   */
  function _buildMilestones() {
    const s   = State.get();
    const all = Milestones.getAll(s);

    _els.tabMilest.innerHTML = '';

    all.forEach(({ milestone, unlocked }) => {
      const div = document.createElement('div');
      div.className    = `milestone${unlocked ? '' : ' milestone--locked'}`;
      div.dataset.name = milestone.name;

      div.innerHTML = `
        <span class="milestone__icon" aria-hidden="true">${milestone.icon}</span>
        <div>
          <div class="milestone__name">${milestone.name}</div>
          <div class="milestone__desc">${milestone.desc}</div>
        </div>
      `;

      _els.tabMilest.appendChild(div);
    });
  }

  /**
   * Verifica conquistas recém-desbloqueadas, exibe notificação
   * e remove a classe `milestone--locked` do card correspondente.
   * @param {Object} state - Estado atual do jogo
   */
  function _checkMilestones(state) {
    const newOnes = Milestones.checkNew(state);
    newOnes.forEach((m) => {
      Notification.show(`🏆 Conquista: ${m.name}!`, 3000);

      // Atualiza visualmente o card sem recriar o DOM
      const el = _els.tabMilest.querySelector(`[data-name="${m.name}"]`);
      if (el) el.classList.remove('milestone--locked');
    });
  }

  return { renderShop, update, switchTab };

})();
