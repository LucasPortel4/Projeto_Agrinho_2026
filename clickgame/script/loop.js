/**
 * src/engine/loop.js
 * Loop principal do jogo: executa a produção automática de ovos por segundo.
 * Usa setInterval para compatibilidade universal (iOS, Android, desktop).
 * O intervalo de 50ms (20x por segundo) garante animação suave sem sobrecarregar.
 */

const Loop = (() => {

  /** ID do intervalo, usado para pausar o loop se necessário */
  let _intervalId = null;

  /** ID do intervalo de auto-save */
  let _saveIntervalId = null;

  /**
   * Inicia o loop de produção automática de ovos.
   * Divide os ovos por segundo em frações (50ms) para movimento suave.
   * Também inicia o auto-save a cada 5 segundos.
   */
  function start() {
    if (_intervalId) return; // Evita iniciar múltiplos loops

    // Produção automática a cada 50ms (= 1/20 de segundo)
    _intervalId = setInterval(() => {
      const eps = State.get().eggsPerSecond;
      if (eps > 0) {
        State.addEggs(eps / 20); // 1/20 por tick para totalizar 1s em 20 ticks
        UI.update();
      }
    }, 50);

    // Auto-save a cada 5 segundos
    _saveIntervalId = setInterval(() => {
      _saveGame();
    }, 5000);
  }

  /**
   * Para o loop de produção (usado ao resetar o jogo).
   */
  function stop() {
    clearInterval(_intervalId);
    clearInterval(_saveIntervalId);
    _intervalId = null;
    _saveIntervalId = null;
  }

  /**
   * Serializa e salva o estado atual do jogo no Storage.
   * Inclui o estado do jogador e os upgrades comprados.
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
