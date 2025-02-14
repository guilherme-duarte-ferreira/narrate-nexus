
// Função para inicializar o menu de comandos
export function initCommandMenu(inputElement, menuElement, commands = ['/youtube', '/google', '/help', '/settings']) {
    let selectedIndex = -1;
    const items = [];

    // Remover o menu do contêiner atual e adicioná-lo ao body para evitar clipping
    if (menuElement.parentNode !== document.body) {
        menuElement.parentNode.removeChild(menuElement);
        document.body.appendChild(menuElement);
    }

    if (!inputElement || !menuElement) {
        console.error('Elementos de input ou menu não foram fornecidos.');
        return;
    }

    // Quando o usuário digitar, verifica se o texto começa com '/'
    inputElement.addEventListener('input', function() {
        const text = this.value;
        
        if (text.startsWith('/')) {
            const filtered = commands.filter(cmd => cmd.toLowerCase().startsWith(text.toLowerCase()));
            menuElement.innerHTML = filtered.map(cmd => `
                <div class="command-item" data-command="${cmd}">
                    <div>
                        <div class="command-text">${cmd}</div>
                        <div class="command-description">Descrição para ${cmd}</div>
                    </div>
                </div>
            `).join('');

            // Atualizar lista de itens após modificar o HTML
            items.length = 0;
            menuElement.querySelectorAll('.command-item').forEach(item => items.push(item));
            selectedIndex = -1;
            updateSelectedItem();

            menuElement.style.visibility = 'hidden';
            menuElement.classList.add('visible');

            // Posicionar menu corretamente
            const rect = inputElement.getBoundingClientRect();
            menuElement.style.top = `${rect.bottom + window.scrollY}px`;
            menuElement.style.left = `${rect.left + window.scrollX}px`;
            menuElement.style.visibility = 'visible';
        } else {
            menuElement.classList.remove('visible');
        }
    });

    // Atualizar item selecionado
    function updateSelectedItem() {
        items.forEach((item, index) => 
            item.classList.toggle('selected', index === selectedIndex)
        );
        
        if (items[selectedIndex]) {
            items[selectedIndex].scrollIntoView({
                block: 'nearest',
                behavior: 'auto'
            });
        }
    }

    // Tratar eventos de teclado
    function handleKeyDown(e) {
        if (!menuElement.classList.contains('visible')) return;

        switch(e.key) {
            case 'Escape':
                e.preventDefault();
                menuElement.classList.remove('visible');
                selectedIndex = -1;
                updateSelectedItem();
                break;
                
            case 'Enter':
                e.preventDefault(); // Impedir o envio do formulário
                if (selectedIndex > -1 && items[selectedIndex]) {
                    const command = items[selectedIndex].dataset.command;
                    inputElement.value = command + ' ';
                    menuElement.classList.remove('visible');
                    inputElement.focus();
                }
                break;

            case 'ArrowDown':
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, items.length - 1);
                updateSelectedItem();
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, -1);
                updateSelectedItem();
                break;
        }
    }

    inputElement.addEventListener('keydown', handleKeyDown);

    // Adicionar eventos de clique aos itens do menu
    menuElement.addEventListener('click', function(e) {
        const item = e.target.closest('.command-item');
        if (item) {
            const command = item.dataset.command;
            inputElement.value = command + ' ';
            menuElement.classList.remove('visible');
            inputElement.focus();
        }
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (!inputElement.contains(e.target) && !menuElement.contains(e.target)) {
            menuElement.classList.remove('visible');
        }
    });
}

// Expor a função globalmente
window.initCommandMenu = initCommandMenu;
