/**
 * src/ui/notification.js
 * Gerencia o sistema de notificações em toast (banner flutuante).
 * Exibe mensagens temporárias ao jogador (conquistas, compras, etc.).
 */

const Notification = (() => {

  /** Referência ao elemento DOM da notificação */
  const _el = document.getElementById('notif');

  /** Timer para esconder a notificação automaticamente */
  let _timer = null;

  /**
   * Exibe uma mensagem de notificação por alguns segundos.
   * Se uma notificação já estiver visível, ela é substituída imediatamente.
   * @param {string} message - Texto a exibir na notificação.
   * @param {number} [duration=2400] - Duração em milissegundos antes de esconder.
   */
  function show(message, duration = 2400) {
    // Cancela qualquer temporizador anterior
    clearTimeout(_timer);

    _el.textContent = message;
    _el.classList.add('notif--show');

    // Esconde automaticamente após a duração especificada
    _timer = setTimeout(() => {
      _el.classList.remove('notif--show');
    }, duration);
  }

  return { show };

})();
