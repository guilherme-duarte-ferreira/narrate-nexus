
/**
 * Configura um textarea para autoexpandir e gerenciar eventos de teclado
 * @param {HTMLTextAreaElement} textarea - O elemento textarea a ser configurado
 */
export function configureTextarea(textarea) {
    if (!textarea) return;

    // Auto-expand do textarea
    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    // Gerenciamento do Enter
    textarea.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            // Verifica se há um menu de comandos visível
            const commandMenu = document.querySelector('.command-menu.visible');
            
            // Se o menu estiver visível, não envia o formulário
            if (commandMenu) {
                e.preventDefault();
                return;
            }
            
            // Caso contrário, envia o formulário
            e.preventDefault();
            const form = this.closest('form');
            if (form) {
                const event = new Event('submit', {
                    'bubbles': true,
                    'cancelable': true
                });
                form.dispatchEvent(event);
            }
        }
    });
}
