/**
 * src/engine/init.js
 * Ponto de entrada do jogo: inicializa todos os módulos na ordem correta.
 * Carrega o save, restaura o estado, inicia o loop e vincula eventos globais.
 */

const Init = (() => {

  /**
   * Inicializa o jogo completo.
   * Ordem de inicialização:
   *   1. Carrega save do Storage
   *   2. Restaura estado e upgrades
   *   3. Renderiza a loja (cria botões + delegação de eventos) — apenas uma vez
   *   4. Atualiza os contadores de stats
   *   5. Inicializa os eventos de clique na galinha
   *   6. Inicia o loop de produção automática
   *   7. Vincula o botão de reset
   */
  function start() {
    // 1. Tenta carregar um save existente
    const saved = Storage.load();

    if (saved) {
      // 2a. Restaura o estado do jogador a partir do save
      State.loadFrom({
        eggs:          saved.eggs      || 0,
        totalEggs:     saved.totalEggs || 0,
        clicks:        saved.clicks    || 0,
        // eps e epc serão recalculados pelo Shop.restoreOwned abaixo
        eggsPerClick:  1,
        eggsPerSecond: 0,
      });

      // 2b. Restaura upgrades comprados (recalcula eps/epc automaticamente)
      Shop.restoreOwned(saved.upgrades || []);
    }

    // 3. Constrói a loja e registra delegação de eventos (UMA VEZ só)
    // Separado do update() para não recriar listeners a cada tick do loop
    UI.renderShop();

    // 4. Atualiza os contadores de stats na tela
    UI.update();

    // 5. Vincula os eventos de clique na galinha (mouse + touch + teclado)
    Click.init();

    // 6. Inicia o loop de produção automática e auto-save
    Loop.start();

    // 7. Vincula o botão de reset
    _bindResetButton();

    console.info('[Galinha Clicker] Jogo iniciado com sucesso! 🐔');
  }

  /**
   * Vincula o botão de reset para apagar o progresso e reiniciar o jogo.
   * Solicita confirmação do usuário antes de resetar.
   */
  function _bindResetButton() {
    const btn = document.getElementById('btn-reset');
    if (!btn) return;

    btn.addEventListener('click', () => {
      // Confirmação nativa — funciona em todos os SOs e browsers
      const confirmed = window.confirm('Tem certeza? Todo o progresso será perdido! 🥚');
      if (!confirmed) return;

      // Para o loop para evitar produção durante o reset
      Loop.stop();

      // Apaga o save e reseta o estado
      Storage.clear();
      State.reset();

      // Reseta quantidades dos upgrades no catálogo
      Shop.getCatalog().forEach((u) => { u.owned = 0; });

      // Reconstrói a loja zerada e atualiza stats
      UI.renderShop();
      UI.update();

      // Reinicia o loop
      Loop.start();

      Notification.show('🗑️ Progresso resetado!');
    });
  }

  return { start };

})();

// Inicia o jogo quando o DOM estiver completamente carregado
// DOMContentLoaded é suportado em todos os browsers modernos (e IE9+)
document.addEventListener('DOMContentLoaded', () => {
  Init.start();
});
