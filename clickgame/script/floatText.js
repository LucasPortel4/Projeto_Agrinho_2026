/**
 * src/ui/floatText.js
 * Cria e anima textos flutuantes que aparecem onde o jogador clicou.
 * Funciona com mouse (desktop) e toque (iOS/Android).
 */

const FloatText = (() => {

  /**
   * Cria um elemento de texto flutuante na posição X/Y da tela.
   * O elemento é removido do DOM automaticamente ao fim da animação.
   * @param {number} x - Posição horizontal (clientX do evento).
   * @param {number} y - Posição vertical (clientY do evento).
   * @param {string} text - Texto a exibir (ex: "+5🥚").
   */
  function spawn(x, y, text) {
    // Não exibe se o usuário preferiu reduzir animações
    if (Device.prefersReducedMotion()) return;

    const el = document.createElement('div');
    el.className = 'float-text';
    el.textContent = text;

    // Leve aleatoriedade horizontal para não sobrepor textos
    const offsetX = (Math.random() * 40) - 20;
    el.style.left = `${x + offsetX - 16}px`;
    el.style.top  = `${y - 20}px`;

    document.body.appendChild(el);

    // Remove o elemento do DOM após a animação terminar (~0.9s)
    el.addEventListener('animationend', () => el.remove(), { once: true });

    // Fallback de segurança: remove após 1.2s mesmo se animationend não disparar
    setTimeout(() => el.remove(), 1200);
  }

  return { spawn };

})();
