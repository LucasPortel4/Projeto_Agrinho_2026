/**
 * src/milestones/milestones.js
 * Define e verifica as conquistas (achievements) do jogo.
 * Cada conquista tem um ícone, nome, descrição e uma função de verificação.
 */

const Milestones = (() => {

  /**
   * Lista de todas as conquistas disponíveis no jogo.
   * Cada objeto representa uma conquista com:
   *   - icon: emoji exibido
   *   - name: título da conquista
   *   - desc: descrição do requisito
   *   - check: função que recebe o estado e retorna true se desbloqueada
   */
  const ALL = [
    {
      icon: '🥚',
      name: 'Primeiros Passos',
      desc: 'Colete 10 ovos.',
      check: (s) => s.totalEggs >= 10,
    },
    {
      icon: '🐣',
      name: 'Nascendo',
      desc: 'Colete 100 ovos.',
      check: (s) => s.totalEggs >= 100,
    },
    {
      icon: '🐥',
      name: 'Pintinho Crescendo',
      desc: 'Colete 1.000 ovos.',
      check: (s) => s.totalEggs >= 1_000,
    },
    {
      icon: '🐔',
      name: 'Galinha Rainha',
      desc: 'Colete 10.000 ovos.',
      check: (s) => s.totalEggs >= 10_000,
    },
    {
      icon: '🏆',
      name: 'Imperador da Granja',
      desc: 'Colete 100.000 ovos.',
      check: (s) => s.totalEggs >= 100_000,
    },
    {
      icon: '🌟',
      name: 'Lenda dos Ovos',
      desc: 'Colete 1.000.000 ovos.',
      check: (s) => s.totalEggs >= 1_000_000,
    },
    {
      icon: '💎',
      name: 'Clicador Raiz',
      desc: 'Clique 500 vezes.',
      check: (s) => s.clicks >= 500,
    },
    {
      icon: '🎯',
      name: 'Dedão de Ouro',
      desc: 'Clique 5.000 vezes.',
      check: (s) => s.clicks >= 5_000,
    },
    {
      icon: '⚡',
      name: 'Granja Automatizada',
      desc: 'Atinja 10 ovos por segundo.',
      check: (s) => s.eggsPerSecond >= 10,
    },
    {
      icon: '🚀',
      name: 'Hiperprodução',
      desc: 'Atinja 100 ovos por segundo.',
      check: (s) => s.eggsPerSecond >= 100,
    },
  ];

  /**
   * Conjunto de conquistas já notificadas nesta sessão.
   * Evita exibir a mesma notificação mais de uma vez por sessão.
   * @type {Set<string>}
   */
  const _notified = new Set();

  /**
   * Verifica quais conquistas foram recém-desbloqueadas (não notificadas ainda).
   * Retorna a lista para que a UI possa exibir notificações.
   * @param {Object} state - Estado atual do jogo.
   * @returns {Array} Lista de conquistas novas desbloqueadas.
   */
  function checkNew(state) {
    const newlyUnlocked = [];
    for (const m of ALL) {
      if (!_notified.has(m.name) && m.check(state)) {
        _notified.add(m.name);
        newlyUnlocked.push(m);
      }
    }
    return newlyUnlocked;
  }

  /**
   * Retorna todas as conquistas com seu status de desbloqueio.
   * Usado para renderizar a aba de conquistas na loja.
   * @param {Object} state - Estado atual do jogo.
   * @returns {Array<{ milestone: Object, unlocked: boolean }>}
   */
  function getAll(state) {
    return ALL.map((m) => ({ milestone: m, unlocked: m.check(state) }));
  }

  return { checkNew, getAll };

})();
