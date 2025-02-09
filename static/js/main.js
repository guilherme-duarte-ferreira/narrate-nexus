
import './init.js';
import { 
    iniciarChat,
    mostrarTelaInicial,
    adicionarMensagem,
    enviarMensagem,
    interromperResposta,
    carregarConversa,
    atualizarListaConversas,
    criarNovaConversa,
    adicionarMensagemAoHistorico,
    renomearConversa,
    excluirConversa
} from './chat.js';

// Estado global
window.currentModel = 'gemma2:2b';
window.conversas = [];
window.conversaAtual = null;

document.addEventListener('DOMContentLoaded', () => {
    const welcomeForm = document.getElementById('welcome-form');
    const chatForm = document.getElementById('chat-form');
    const chatContainer = document.querySelector('.chat-container');
    const welcomeInput = document.getElementById('welcome-input');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const stopBtn = document.getElementById('stop-btn');
    const newChatBtn = document.querySelector('.new-chat-btn');

    // Configurar menus de comando
    setupCommandMenu('welcome-input', 'command-menu');
    setupCommandMenu('chat-input', 'chat-command-menu');

    // Configurar botão de nova conversa
    newChatBtn?.addEventListener('click', () => {
        window.conversaAtual = null;
        mostrarTelaInicial(
            document.querySelector('.welcome-screen'),
            chatContainer,
            document.querySelector('.input-container'),
            welcomeInput,
            chatInput
        );
    });

    welcomeForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = welcomeInput.value.trim();
        if (!message) return;

        // Criar nova conversa se não existir
        if (!window.conversaAtual) {
            const novaConversa = {
                id: Date.now().toString(),
                titulo: 'Nova conversa',
                mensagens: []
            };
            window.conversas.unshift(novaConversa);
            window.conversaAtual = novaConversa;
            atualizarListaConversas();
        }

        iniciarChat(
            document.querySelector('.welcome-screen'),
            chatContainer,
            document.querySelector('.input-container')
        );

        adicionarMensagem(chatContainer, message, 'user');
        adicionarMensagemAoHistorico(message, 'user');
        
        await enviarMensagem(message, welcomeInput, chatContainer, sendBtn, stopBtn);
    });

    chatForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();
        if (!message) return;

        adicionarMensagem(chatContainer, message, 'user');
        adicionarMensagemAoHistorico(message, 'user');
        
        await enviarMensagem(message, chatInput, chatContainer, sendBtn, stopBtn);
    });

    // Configurar botão de parar resposta
    stopBtn?.addEventListener('click', () => {
        interromperResposta();
    });

    // Inicializar lista de conversas
    atualizarListaConversas();
});

function setupCommandMenu(inputId, menuId) {
    const input = document.getElementById(inputId);
    const menu = document.getElementById(menuId);

    if (!input || !menu) {
        console.error(`Erro: Elementos não encontrados para ${inputId} ou ${menuId}`);
        return;
    }

    const commandItems = menu.querySelectorAll('.command-item');

    input.addEventListener('input', function() {
        const text = this.value.trim();
        
        if (text.startsWith('/')) {
            const rect = input.getBoundingClientRect();
            const inputContainer = input.closest('.input-box');
            
            if (inputContainer) {
                menu.style.top = `${rect.bottom + window.scrollY}px`;
                menu.style.left = `${rect.left}px`;
                menu.classList.add('visible');
            }
        } else {
            menu.classList.remove('visible');
        }
    });

    commandItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation(); // Impede que o clique feche o menu imediatamente
            const command = this.dataset.command;
            input.value = command + ' ';
            menu.classList.remove('visible');
            input.focus();
        });
    });

    // Impede que cliques dentro do menu o fechem
    menu.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Fecha o menu ao clicar fora
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove('visible');
        }
    });
}

// Expor funções globalmente
window.carregarConversa = carregarConversa;
window.criarNovaConversa = criarNovaConversa;
window.adicionarMensagemAoHistorico = adicionarMensagemAoHistorico;
window.interromperResposta = interromperResposta;
window.renomearConversa = renomearConversa;
window.excluirConversa = excluirConversa;
