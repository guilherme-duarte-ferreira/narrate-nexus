// static/js/commandMenu.js
export function initCommandMenu(inputElement, menuElement, commands = ['/youtube', '/google', '/help', '/settings']) {
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
        console.log('Input disparado:', this.value);
        const text = this.value.trim();
        if (text.startsWith('/')) {
            // Atualiza os itens do menu filtrando os comandos fornecidos
            const filtered = commands.filter(cmd => cmd.toLowerCase().startsWith(text.toLowerCase()));
            menuElement.innerHTML = filtered.map(cmd => `
                <div class="command-item" data-command="${cmd}">
                    <!-- Ícone removido -->
                    <div>
                        <div class="command-text">${cmd}</div>
                        <div class="command-description">Descrição para ${cmd}</div>
                    </div>
                </div>
            `).join('');

            // Adiciona os listeners de clique para os novos itens
            menuElement.querySelectorAll('.command-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const command = this.dataset.command;
                    inputElement.value = command + ' ';
                    menuElement.classList.remove('visible');
                    inputElement.focus();
                });
            });

            // Torna o menu visível mas invisível para que ele seja renderizado
            menuElement.style.visibility = 'hidden';
            menuElement.classList.add('visible');

            // Usa requestAnimationFrame para aguardar a renderização e medir a altura
            requestAnimationFrame(() => {
                const menuHeight = menuElement.offsetHeight;
                const rect = inputElement.getBoundingClientRect();
                menuElement.style.top = `${rect.top - menuHeight + window.scrollY}px`;
                menuElement.style.left = `${rect.left + window.scrollX}px`;
                // Restaura a visibilidade normal
                menuElement.style.visibility = 'visible';
            });
        } else {
            menuElement.classList.remove('visible');
        }
    });

    // Impede que cliques dentro do menu o fechem
    menuElement.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Fecha o menu ao clicar fora do input e do menu
    document.addEventListener('click', function(e) {
        if (!inputElement.contains(e.target) && !menuElement.contains(e.target)) {
            menuElement.classList.remove('visible');
        }
    });
}

// Expor a função globalmente (fora da definição da função)
window.initCommandMenu = initCommandMenu;