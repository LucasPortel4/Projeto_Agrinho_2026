/**
 * src/ui/ui.js
 * Módulo principal de renderização da interface.
 * Atualiza todos os elementos DOM com os valores atuais do estado.
 * Renderiza a loja de upgrades e a aba de conquistas.
 */

const UI = (() => {

  // Referências aos elementos DOM (cacheadas para performance)
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

  /**
   * Atualiza todos os contadores e textos de estatísticas na tela.
   * Deve ser chamado após qualquer mudança de estado.
   */
  function update() {
    const s = State.get();

    _els.eggCount.textContent   = Formatter.formatNumber(s.eggs);
    _els.headerEggs.textContent = Formatter.formatNumber(s.eggs);
    _els.statTotal.textContent  = Formatter.formatNumber(s.totalEggs);
    _els.statClicks.textContent = Formatter.formatNumber(s.clicks);
    _els.statEpc.textContent    = s.eggsPerClick;
    _els.statEps.textContent    = Formatter.formatEPS(s.eggsPerSecond);
    _els.epcLabel.textContent   = s.eggsPerClick;
    _els.epsLabel.textContent   = `${Formatter.formatEPS(s.eggsPerSecond)} ovos por segundo`;
    _els.statLevel.textContent  = Levels.getLevel(s.totalEggs);

    _renderUpgrades();
    _renderMilestones();
    _checkMilestones(s);
  }

  /**
   * Renderiza (ou re-renderiza) a lista de botões de upgrade na loja.
   * Desabilita botões cujo custo excede os ovos disponíveis.
   */
  function _renderUpgrades() {
    const s = State.get();
    const catalog = Shop.getCatalog();

    _els.tabUpgrades.innerHTML = '';

    catalog.forEach((upgrade, index) => {
      const cost = Shop.getCurrentCost(upgrade);
      const canAfford = s.eggs >= cost;

      const btn = document.createElement('button');
      btn.className = 'upgrade-btn';
      btn.disabled = !canAfford;
      btn.setAttribute('aria-label', `Comprar ${upgrade.name} por ${Formatter.formatNumber(cost)} ovos`);

      btn.innerHTML = `
        <span class="upgrade-btn__icon" aria-hidden="true">${upgrade.icon}</span>
        <div class="upgrade-btn__info">
          <div class="upgrade-btn__name">${upgrade.name}</div>
          <div class="upgrade-btn__desc" title="${upgrade.desc}">${upgrade.desc}</div>
        </div>
        <div class="upgrade-btn__cost">🥚 ${Formatter.formatNumber(cost)}</div>
        ${upgrade.owned > 0 ? `<div class="upgrade-btn__owned">x${upgrade.owned}</div>` : ''}
      `;

      // Ao clicar: tenta comprar e atualiza UI
      btn.addEventListener('click', () => {
        const ok = Shop.buy(index);
        if (ok) {
          Notification.show(`${upgrade.icon} ${upgrade.name} comprado!`);
          update();
        }
      });

      _els.tabUpgrades.appendChild(btn);
    });
  }

  /**
   * Renderiza a lista de conquistas na aba "Conquistas".
   * Conquistas desbloqueadas aparecem destacadas; bloqueadas ficam acinzentadas.
   */
  function _renderMilestones() {
    const s = State.get();
    const all = Milestones.getAll(s);

    _els.tabMilest.innerHTML = '';

    all.forEach(({ milestone, unlocked }) => {
      const div = document.createElement('div');
      div.className = `milestone${unlocked ? '' : ' milestone--locked'}`;
      div.setAttribute('aria-label', `${milestone.name}: ${unlocked ? 'desbloqueada' : 'bloqueada'}`);

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
   * Verifica conquistas recém-desbloqueadas e exibe notificações.
   * @param {Object} state - Estado atual do jogo.
   */
  function _checkMilestones(state) {
    const newOnes = Milestones.checkNew(state);
    newOnes.forEach((m) => {
      Notification.show(`🏆 Conquista: ${m.name}!`, 3000);
    });
  }

  /**
   * Troca a aba ativa entre "Melhorias" e "Conquistas".
   * @param {string} tabName - 'upgrades' ou 'milestones'.
   * @param {HTMLElement} clickedBtn - O botão de aba clicado.
   */
  function switchTab(tabName, clickedBtn) {
    // Remove estado ativo de todos os conteúdos e botões de aba
    document.querySelectorAll('.tab-content').forEach((t) => t.classList.remove('tab-content--active'));
    document.querySelectorAll('.tab-btn').forEach((b) => {
      b.classList.remove('tab-btn--active');
      b.setAttribute('aria-selected', 'false');
    });

    // Ativa o conteúdo e botão selecionados
    document.getElementById(`tab-${tabName}`).classList.add('tab-content--active');
    clickedBtn.classList.add('tab-btn--active');
    clickedBtn.setAttribute('aria-selected', 'true');
  }

  return { update, switchTab };

})();
