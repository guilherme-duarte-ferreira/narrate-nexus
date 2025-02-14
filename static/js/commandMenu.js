
/**
 * Função para inicializar o menu de comandos
 * @param {HTMLElement} inputElement - Campo de entrada onde os comandos serão digitados
 * @param {HTMLElement} menuElement - Elemento do menu que será exibido
 * @param {string[]} commands - Lista de comandos disponíveis
 */
export function initCommandMenu(inputElement, menuElement, commands = ['/youtube', '/google', '/help', '/settings']) {
    if (!inputElement || !menuElement) {
        console.error('Elementos de input ou menu não foram fornecidos.');
        return;
    }

    let selectedIndex = -1;
    let items = [];

    // Posicionar menu no body para evitar problemas de z-index
    if (menuElement.parentNode !== document.body) {
        menuElement.parentNode.removeChild(menuElement);
        document.body.appendChild(menuElement);
    }

    function updateMenuPosition() {
        const rect = inputElement.getBoundingClientRect();
        menuElement.style.position = 'absolute';
        menuElement.style.top = `${rect.bottom + window.scrollY}px`;
        menuElement.style.left = `${rect.left + window.scrollX}px`;
        menuElement.style.minWidth = `${rect.width}px`;
    }

    function updateMenuContent(text) {
        const filtered = commands.filter(cmd => 
            cmd.toLowerCase().startsWith(text.toLowerCase())
        );

        menuElement.innerHTML = filtered.map(cmd => `
            <div class="command-item" data-command="${cmd}">
                <div class="command-content">
                    <div class="command-text">${cmd}</div>
                    <div class="command-description">Descrição para ${cmd}</div>
                </div>
            </div>
        `).join('');

        // Atualizar lista de itens
        items = Array.from(menuElement.querySelectorAll('.command-item'));
        selectedIndex = -1;
        updateSelectedItem();
    }

    function updateSelectedItem() {
        items.forEach((item, index) => {
            item.classList.toggle('selected', index === selectedIndex);
        });

        if (items[selectedIndex]) {
            items[selectedIndex].scrollIntoView({ 
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }

    function selectCommand(command) {
        inputElement.value = command + ' ';
        menuElement.classList.remove('visible');
        inputElement.focus();
    }

    // Event Listeners
    inputElement.addEventListener('input', function() {
        const text = this.value;
        
        if (text.startsWith('/')) {
            updateMenuContent(text);
            updateMenuPosition();
            menuElement.classList.add('visible');
        } else {
            menuElement.classList.remove('visible');
        }
    });

    inputElement.addEventListener('keydown', function(e) {
        if (!menuElement.classList.contains('visible')) return;

        switch(e.key) {
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

            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && items[selectedIndex]) {
                    const command = items[selectedIndex].dataset.command;
                    selectCommand(command);
                }
                break;

            case 'Escape':
                e.preventDefault();
                menuElement.classList.remove('visible');
                break;
        }
    });

    // Clicar em um comando
    menuElement.addEventListener('click', function(e) {
        const item = e.target.closest('.command-item');
        if (item) {
            const command = item.dataset.command;
            selectCommand(command);
        }
    });

    // Fechar menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (!inputElement.contains(e.target) && !menuElement.contains(e.target)) {
            menuElement.classList.remove('visible');
        }
    });

    // Atualizar posição do menu ao redimensionar/rolar
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition);
}

// Expor a função globalmente se necessário
window.initCommandMenu = initCommandMenu;
