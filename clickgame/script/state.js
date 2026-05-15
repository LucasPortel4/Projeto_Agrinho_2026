/**
 * src/engine/state.js
 * Define e gerencia o estado central do jogo.
 * É a "fonte da verdade" — todos os módulos leem e escrevem aqui.
 */

const State = (() => {

  /**
   * Estado padrão de um jogo novo (sem save).
   * @type {Object}
   */
  const DEFAULT = {
    eggs:          0,   // Ovos disponíveis atualmente para gastar
    totalEggs:     0,   // Total de ovos coletados (nunca diminui)
    clicks:        0,   // Total de cliques feitos
    eggsPerClick:  1,   // Ovos ganhos por clique
    eggsPerSecond: 0,   // Ovos ganhos automaticamente por segundo
  };

  // Estado interno (mutável apenas via funções abaixo)
  let _state = { ...DEFAULT };

  /**
   * Retorna o estado atual do jogo.
   * @returns {Object}
   */
  function get() {
    return _state;
  }

  /**
   * Atualiza campos específicos do estado com um objeto parcial.
   * @param {Object} partial - Objeto com campos a atualizar.
   */
  function update(partial) {
    _state = { ..._state, ...partial };
  }

  /**
   * Incrementa os ovos ao clicar na galinha.
   * Adiciona tanto nos ovos disponíveis quanto no total histórico.
   * @param {number} amount - Quantidade de ovos a adicionar.
   */
  function addEggs(amount) {
    _state.eggs      += amount;
    _state.totalEggs += amount;
  }

  /**
   * Gasta ovos ao comprar um upgrade.
   * @param {number} cost - Custo em ovos.
   * @returns {boolean} true se havia ovos suficientes e a compra foi realizada.
   */
  function spendEggs(cost) {
    if (_state.eggs < cost) return false;
    _state.eggs -= cost;
    return true;
  }

  /**
   * Reseta o estado para os valores padrão (jogo novo).
   */
  function reset() {
    _state = { ...DEFAULT };
  }

  /**
   * Carrega um estado salvo previamente no lugar do padrão.
   * @param {Object} savedData - Dados vindos do módulo Storage.
   */
  function loadFrom(savedData) {
    if (!savedData) return;
    _state = { ...DEFAULT, ...savedData };
  }

  /**
   * Serializa o estado atual para salvar no Storage.
   * @returns {Object}
   */
  function serialize() {
    return { ..._state };
  }

  return { get, update, addEggs, spendEggs, reset, loadFrom, serialize };

})();
