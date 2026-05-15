/**
 * src/engine/loop.js
 * Loop principal do jogo: executa a produção automática de ovos por segundo.
 * Usa setInterval para compatibilidade universal (iOS, Android, desktop).
 *
 * CORREÇÃO: UI.update() agora só é chamado quando há produção real,
 * evitando rerenders desnecessários que antes causavam travamentos
 * e interferiam com os event listeners da loja.
 */

const Loop = (() => {

  /** ID do intervalo de produção automática */
  let _intervalId = null;

  /** ID do intervalo de auto-save */
  let _saveIntervalId = null;

  /**
   * Inicia o loop de produção automática de ovos.
   * Divide os ovos por segundo em frações de 50ms (20 ticks = 1 segundo).
   * Também inicia o auto-save a cada 5 segundos.
   */
  function start() {
    if (_intervalId) return; // Evita iniciar múltiplos loops acidentalmente

    // Tick de produção: roda 20x por segundo
    _intervalId = setInterval(() => {
      const eps = State.get().eggsPerSecond;

      // Só atualiza a UI se houver produção automática ativa
      // Isso evita rerenders desnecessários enquanto o jogador só clica
      if (eps > 0) {
        State.addEggs(eps / 20); // distribui 1 segundo em 20 frações
        UI.update();             // reflete os novos ovos na tela
      }
    }, 50);

    // Auto-save a cada 5 segundos (não sobrecarrega o localStorage)
    _saveIntervalId = setInterval(() => {
      _saveGame();
    }, 5000);
  }

  /**
   * Para completamente o loop de produção e o auto-save.
   * Usado ao resetar o jogo para evitar ticks durante o reset.
   */
  function stop() {
    clearInterval(_intervalId);
    clearInterval(_saveIntervalId);
    _intervalId    = null;
    _saveIntervalId = null;
  }

  /**
   * Serializa e persiste o estado atual do jogo no Storage.
   * Salva tanto o estado do jogador quanto os upgrades comprados.
   */
  function _saveGame() {
    const data = {
      ...State.serialize(),
      upgrades: Shop.serializeOwned(),
    };
    Storage.save(data);
  }

  return { start, stop };

})();
