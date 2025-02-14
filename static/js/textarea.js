
export function configureTextarea(textarea) {
    if (!textarea) return;

    textarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });

    textarea.addEventListener('keydown', function(e) {
        // Verifica se há um menu de comandos visível
        const commandMenu = document.querySelector('.command-menu.visible');
        
        if (e.key === 'Enter' && !e.shiftKey) {
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
