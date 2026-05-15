/**
 * src/storage/save.js
 * Gerencia o salvamento e carregamento do progresso do jogo.
 * Usa localStorage com fallback gracioso para ambientes que não o suportam
 * (ex: Safari em modo privado no iOS, algumas WebViews no Android).
 */

const Storage = (() => {

  /** Chave usada no localStorage para identificar o save do jogo */
  const SAVE_KEY = 'galinhaclicker_v2';

  /**
   * Salva o estado atual do jogo no localStorage.
   * Serializa o objeto como JSON.
   * @param {Object} data - Objeto com todos os dados do jogo a serem salvos.
   */
  function save(data) {
    if (!Device.supportsStorage()) return; // dispositivo não suporta storage
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch (err) {
      // localStorage pode estar cheio (ex: cotas em iOS)
      console.warn('[Galinha Clicker] Não foi possível salvar:', err);
    }
  }

  /**
   * Carrega e retorna os dados salvos do localStorage.
   * Retorna null se não houver save ou se ocorrer erro de parsing.
   * @returns {Object|null} Dados do jogo ou null.
   */
  function load() {
    if (!Device.supportsStorage()) return null;
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (err) {
      console.warn('[Galinha Clicker] Erro ao carregar save:', err);
      return null;
    }
  }

  /**
   * Apaga completamente o save do jogo do localStorage.
   * Usado ao clicar no botão "Resetar".
   */
  function clear() {
    if (!Device.supportsStorage()) return;
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch (err) {
      console.warn('[Galinha Clicker] Erro ao apagar save:', err);
    }
  }

  return { save, load, clear };

})();
