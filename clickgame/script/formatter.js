/**
 * src/utils/formatter.js
 * Utilitários de formatação de números.
 * Usados para exibir valores grandes de forma legível (ex: 1.2K, 3.5M).
 */

const Formatter = (() => {

  /**
   * Formata um número grande em string abreviada.
   * Ex: 1200 → "1.2K", 5000000 → "5.0M", 2000000000 → "2.0B"
   * @param {number} n - O número a formatar.
   * @returns {string} Número formatado.
   */
  function formatNumber(n) {
    if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
    if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return Math.floor(n).toString();
  }

  /**
   * Formata um número de ovos por segundo com 1 casa decimal.
   * @param {number} n - Valor de EPS.
   * @returns {string} Ex: "3.5"
   */
  function formatEPS(n) {
    return n.toFixed(1);
  }

  // Expõe apenas os métodos públicos
  return { formatNumber, formatEPS };

})();
