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
        // debugger; // Descomente para depuração
        const text = this.value.trim();
        if (text.startsWith('/')) {
            // Atualiza os itens do menu filtrando os comandos fornecidos
            const filtered = commands.filter(cmd => cmd.toLowerCase().startsWith(text.toLowerCase()));
            menuElement.innerHTML = filtered
                .map(cmd => `
                    <div class="command-item" data-command="${cmd}">
                        <i class="fas fa-${cmd.slice(1)} command-icon"></i>
                        <div>
                            <div class="command-text">${cmd}</div>
                            <div class="command-description">Descrição para ${cmd}</div>
                        </div>
                    </div>
                `)
                .join('');

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

            // Calcula a posição do menu com base no input e posiciona o menu
            const rect = inputElement.getBoundingClientRect();
            menuElement.style.top = `${rect.top - menuElement.offsetHeight + window.scrollY}px`;

            menuElement.style.left = `${rect.left + window.scrollX}px`;
            menuElement.classList.add('visible');

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
