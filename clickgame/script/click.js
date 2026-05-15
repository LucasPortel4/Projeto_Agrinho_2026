/**
 * src/engine/click.js
 * Gerencia os eventos de clique na galinha.
 * Suporta mouse (desktop), toque (iOS/Android) e teclado (acessibilidade).
 * Aplica animações e spawna texto flutuante na posição do evento.
 */

const Click = (() => {

  /** Referências aos elementos da galinha e do anel de pulso */
  const _btn   = document.getElementById('chicken-btn');
  const _pulse = document.getElementById('pulse');

  /**
   * Processa um clique/toque na galinha:
   * - Adiciona ovos ao estado
   * - Incrementa contador de cliques
   * - Dispara animações visuais
   * - Spawna texto flutuante
   * - Atualiza a UI
   * @param {number} x - Posição X na tela (para o texto flutuante).
   * @param {number} y - Posição Y na tela (para o texto flutuante).
   */
  function _handleClick(x, y) {
    const gained = State.get().eggsPerClick;

    // Atualiza o estado do jogo
    State.addEggs(gained);
    State.update({ clicks: State.get().clicks + 1 });

    // Dispara animação de squawk na galinha
    _btn.classList.remove('chicken-btn--squawk');
    // Força reflow para reiniciar a animação (funciona em todos os browsers)
    void _btn.offsetWidth;
    _btn.classList.add('chicken-btn--squawk');

    // Dispara animação do anel de pulso
    _pulse.classList.remove('pulse-ring--go');
    void _pulse.offsetWidth;
    _pulse.classList.add('pulse-ring--go');

    // Texto flutuante na posição do clique/toque
    FloatText.spawn(x, y, `+${gained}🥚`);

    // Atualiza a interface
    UI.update();
  }

  /**
   * Registra o evento de clique com mouse (desktop: Windows, macOS, Linux).
   */
  function _bindMouseClick() {
    _btn.addEventListener('click', (e) => {
      _handleClick(e.clientX, e.clientY);
    });
  }

  /**
   * Registra o evento de toque (iOS, Android).
   * Usa `touchend` para evitar o delay de 300ms que o iOS adiciona ao `click`.
   * Chama `preventDefault` para evitar que o evento dispare também como `click`.
   */
  function _bindTouchClick() {
    _btn.addEventListener('touchend', (e) => {
      e.preventDefault(); // evita double-fire (touch + click no iOS)
      const touch = e.changedTouches[0];
      _handleClick(touch.clientX, touch.clientY);
    }, { passive: false });
  }

  /**
   * Registra o evento de teclado para acessibilidade.
   * Permite que usuários sem mouse ou touch ativem a galinha com Enter ou Espaço.
   */
  function _bindKeyboard() {
    _btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const rect = _btn.getBoundingClientRect();
        _handleClick(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    });
  }

  /**
   * Inicializa todos os listeners de interação com a galinha.
   * Chamado uma única vez durante o init do jogo.
   */
  function init() {
    _bindMouseClick();
    _bindTouchClick();
    _bindKeyboard();
  }

  return { init };

})();
