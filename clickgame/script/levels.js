/**
 * src/engine/levels.js
 * Define os níveis (ranks) do jogador baseados no total de ovos coletados.
 * Retorna o título do nível atual conforme o progresso.
 */

const Levels = (() => {

  /**
   * Tabela de níveis: [ovos necessários, nome do nível].
   * Os níveis são verificados em ordem crescente.
   */
  const LEVEL_TABLE = [
    [0,        'Pintinho 🐣'],
    [100,      'Galinha Jovem 🐥'],
    [1_000,    'Galinha Produtiva 🐔'],
    [10_000,   'Galinha Rainha 👑'],
    [100_000,  'Imperatriz da Granja 🌾'],
    [1_000_000,'Lenda dos Ovos 🌟'],
    [10_000_000,'Deusa Galinhesca ✨'],
  ];

  /**
   * Retorna o nome do nível correspondente ao total de ovos coletados.
   * Percorre a tabela e retorna o maior nível que o jogador já atingiu.
   * @param {number} totalEggs - Total histórico de ovos coletados.
   * @returns {string} Nome do nível atual.
   */
  function getLevel(totalEggs) {
    let current = LEVEL_TABLE[0][1];
    for (const [req, name] of LEVEL_TABLE) {
      if (totalEggs >= req) current = name;
    }
    return current;
  }

  /**
   * Retorna o próximo nível e quantos ovos faltam para atingi-lo.
   * Útil para exibir progresso ao jogador.
   * @param {number} totalEggs
   * @returns {{ name: string, remaining: number } | null} null se já é o nível máximo.
   */
  function getNextLevel(totalEggs) {
    for (const [req, name] of LEVEL_TABLE) {
      if (totalEggs < req) {
        return { name, remaining: req - totalEggs };
      }
    }
    return null; // nível máximo atingido
  }

  return { getLevel, getNextLevel };

})();
