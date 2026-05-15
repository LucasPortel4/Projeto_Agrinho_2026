/**
 * src/shop/upgrades.js
 * Define todos os upgrades disponíveis na loja e a lógica de compra.
 * Cada upgrade tem custo crescente (multiplicador), ovos por segundo (eps)
 * e ovos por clique (epc) que adiciona ao estado do jogo.
 */

const Shop = (() => {

  /**
   * Catálogo completo de upgrades.
   * Campos:
   *   - id: identificador único
   *   - icon: emoji de exibição
   *   - name: nome exibido
   *   - desc: descrição do efeito
   *   - baseCost: custo da primeira compra
   *   - multi: multiplicador de custo a cada compra (preço escala)
   *   - eps: ovos por segundo que este upgrade adiciona por unidade
   *   - epc: ovos por clique que este upgrade adiciona por unidade
   *   - owned: quantidade comprada pelo jogador (atualizado em runtime)
   */
  const CATALOG = [
    {
      id: 'hen',
      icon: '🐓',
      name: 'Galinha Extra',
      desc: 'Produz 0.1 ovo/s automaticamente.',
      baseCost: 15,
      multi: 1.15,
      eps: 0.1,
      epc: 0,
      owned: 0,
    },
    {
      id: 'nest',
      icon: '🪺',
      name: 'Ninho Duplo',
      desc: '+1 ovo por clique.',
      baseCost: 50,
      multi: 1.2,
      eps: 0,
      epc: 1,
      owned: 0,
    },
    {
      id: 'farm',
      icon: '🌾',
      name: 'Granja Pequena',
      desc: '+0.5 ovo/s e +1 por clique.',
      baseCost: 120,
      multi: 1.25,
      eps: 0.5,
      epc: 1,
      owned: 0,
    },
    {
      id: 'tractor',
      icon: '🚜',
      name: 'Trator de Ovos',
      desc: '+2 ovos/s automático.',
      baseCost: 400,
      multi: 1.3,
      eps: 2,
      epc: 0,
      owned: 0,
    },
    {
      id: 'robot',
      icon: '🤖',
      name: 'Robogalinha',
      desc: '+5 ovos/s + 3 por clique.',
      baseCost: 1_200,
      multi: 1.35,
      eps: 5,
      epc: 3,
      owned: 0,
    },
    {
      id: 'factory',
      icon: '🏭',
      name: 'Fábrica de Ovos',
      desc: '+15 ovos/s automático.',
      baseCost: 4_000,
      multi: 1.4,
      eps: 15,
      epc: 0,
      owned: 0,
    },
    {
      id: 'magic',
      icon: '✨',
      name: 'Galinha Mágica',
      desc: '+50 ovos/s + 10 por clique.',
      baseCost: 15_000,
      multi: 1.45,
      eps: 50,
      epc: 10,
      owned: 0,
    },
    {
      id: 'golden',
      icon: '🥇',
      name: 'Ovo de Ouro',
      desc: '+200 ovos/s + 50 por clique.',
      baseCost: 60_000,
      multi: 1.5,
      eps: 200,
      epc: 50,
      owned: 0,
    },
  ];

  /**
   * Calcula o custo atual de um upgrade baseado em quantos já foram comprados.
   * Fórmula: baseCost × (multi ^ owned), arredondado para baixo.
   * @param {Object} upgrade - O upgrade do catálogo.
   * @returns {number} Custo atual em ovos.
   */
  function getCurrentCost(upgrade) {
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.multi, upgrade.owned));
  }

  /**
   * Tenta comprar um upgrade pelo seu índice no catálogo.
   * Desconta os ovos do estado, incrementa o contador de posse
   * e aumenta os valores de eps/epc no estado global.
   * @param {number} index - Índice do upgrade em CATALOG.
   * @returns {boolean} true se a compra foi bem-sucedida.
   */
  function buy(index) {
    const upgrade = CATALOG[index];
    const cost = getCurrentCost(upgrade);

    // Tenta gastar os ovos; retorna false se não tiver saldo
    if (!State.spendEggs(cost)) return false;

    // Registra a compra
    upgrade.owned++;

    // Aplica os efeitos ao estado
    const s = State.get();
    State.update({
      eggsPerClick:  s.eggsPerClick  + upgrade.epc,
      eggsPerSecond: s.eggsPerSecond + upgrade.eps,
    });

    return true;
  }

  /**
   * Retorna o catálogo completo (útil para renderização da UI).
   * @returns {Array}
   */
  function getCatalog() {
    return CATALOG;
  }

  /**
   * Serializa apenas os campos `owned` de cada upgrade para salvar no Storage.
   * @returns {number[]} Array de quantidades compradas, na ordem do catálogo.
   */
  function serializeOwned() {
    return CATALOG.map((u) => u.owned);
  }

  /**
   * Restaura os valores de `owned` de cada upgrade a partir de um save.
   * Recalcula eps e epc totais no estado com base nas posses restauradas.
   * @param {number[]} ownedArray - Array salvo de quantidades.
   */
  function restoreOwned(ownedArray) {
    if (!Array.isArray(ownedArray)) return;
    let totalEps = 0;
    let totalEpc = 1; // valor base de clique

    ownedArray.forEach((owned, i) => {
      if (CATALOG[i]) {
        CATALOG[i].owned = owned;
        totalEps += CATALOG[i].eps * owned;
        totalEpc += CATALOG[i].epc * owned;
      }
    });

    // Sincroniza estado com os totais recalculados
    State.update({ eggsPerSecond: totalEps, eggsPerClick: totalEpc });
  }

  return { getCatalog, getCurrentCost, buy, serializeOwned, restoreOwned };

})();
