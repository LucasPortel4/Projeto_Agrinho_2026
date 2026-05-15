/**
 * src/utils/device.js
 * Detecta características do dispositivo para garantir portabilidade.
 * Permite que outros módulos adaptem comportamento conforme o ambiente.
 */

const Device = (() => {

  /**
   * Retorna true se o dispositivo usa tela touchscreen.
   * Funciona em iOS, Android e tablets com Windows.
   * @returns {boolean}
   */
  function isTouchDevice() {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      // Fallback para Windows Touch (IE/Edge legado)
      navigator.msMaxTouchPoints > 0
    );
  }

  /**
   * Retorna true se o dispositivo está em modo paisagem (landscape).
   * @returns {boolean}
   */
  function isLandscape() {
    if (window.screen && window.screen.orientation) {
      return window.screen.orientation.type.startsWith('landscape');
    }
    // Fallback para Safari iOS legado
    return window.innerWidth > window.innerHeight;
  }

  /**
   * Retorna true se o navegador suporta localStorage.
   * Alguns browsers em modo privado no iOS bloqueiam localStorage.
   * @returns {boolean}
   */
  function supportsStorage() {
    try {
      const key = '__storage_test__';
      localStorage.setItem(key, '1');
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retorna true se o usuário preferiu reduzir animações no SO.
   * Respeita configurações de acessibilidade em iOS, macOS, Windows e Android.
   * @returns {boolean}
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Retorna o tipo de ponteiro primário: 'touch', 'mouse' ou 'unknown'.
   * Útil para ajustar tamanhos de área clicável.
   * @returns {string}
   */
  function getPointerType() {
    if (window.matchMedia('(pointer: coarse)').matches) return 'touch';
    if (window.matchMedia('(pointer: fine)').matches)   return 'mouse';
    return 'unknown';
  }

  return { isTouchDevice, isLandscape, supportsStorage, prefersReducedMotion, getPointerType };

})();
