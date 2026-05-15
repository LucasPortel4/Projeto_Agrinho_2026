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
   *   3. Renderiza a UI inicial
   *   4. Inicializa os eventos de clique
   *   5. Inicia o loop de produção automática
   *   6. Vincula o botão de reset
   */
  function start() {
    // 1. Tenta carregar um save existente
    const saved = Storage.load();

    if (saved) {
      // 2a. Restaura o estado do jogador a partir do save
      State.loadFrom({
        eggs:         saved.eggs         || 0,
        totalEggs:    saved.totalEggs    || 0,
        clicks:       saved.clicks       || 0,
        // eps e epc serão recalculados pelo Shop.restoreOwned abaixo
        eggsPerClick:  1,
        eggsPerSecond: 0,
      });

      // 2b. Restaura upgrades comprados (recalcula eps/epc automaticamente)
      Shop.restoreOwned(saved.upgrades || []);
    }

    // 3. Renderiza a UI com os dados carregados (ou padrão)
    UI.update();

    // 4. Vincula os eventos de clique na galinha
    Click.init();

    // 5. Inicia o loop de produção automática e auto-save
    Loop.start();

    // 6. Vincula o botão de reset
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

      // Atualiza a UI para o estado zerado
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
