
import { 
    iniciarChat,
    mostrarTelaInicial,
    adicionarMensagem,
    mostrarCarregamento
} from './chat/chatUI.js';

import {
    enviarMensagem,
    interromperResposta
} from './chat/chatActions.js';

import {
    carregarConversa,
    atualizarListaConversas,
    criarNovaConversa,
    adicionarMensagemAoHistorico,
    renomearConversa,
    excluirConversa
} from './chat/chatStorage.js';

import {
    copiarCodigo,
    copiarMensagem
} from './chat/chatUtils.js';

// Função para copiar código - melhorada para preservar indentação
window.copiarCodigo = function(button) {
    try {
        const codeContainer = button.closest('.code-container');
        if (!codeContainer) {
            console.error('Não foi possível encontrar o container de código');
            return;
        }
        
        const codeBlock = codeContainer.querySelector('.code-block code');
        if (!codeBlock) {
            console.error('Não foi possível encontrar o bloco de código');
            return;
        }
        
        const code = codeBlock.innerText; // Usa innerText para preservar indentação
        
        navigator.clipboard.writeText(code).then(() => {
            // Feedback visual
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.classList.add('copied');
            
            // Restaurar o ícone original após 2 segundos
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i>';
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Erro ao copiar código:', err);
            
            // Fallback para método antigo se a API Clipboard não estiver disponível
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = code;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            
            try {
                document.execCommand('copy');
                // Feedback visual
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.classList.add('copied');
                
                // Restaurar o ícone original após 2 segundos
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                    button.classList.remove('copied');
                }, 2000);
            } catch (err2) {
                console.error('Erro ao usar fallback para copiar:', err2);
                alert('Não foi possível copiar o código. Por favor, tente novamente.');
            } finally {
                document.body.removeChild(tempTextarea);
            }
        });
    } catch (error) {
        console.error('Erro ao executar função copiarCodigo:', error);
        alert('Ocorreu um erro ao tentar copiar o código.');
    }
};

// Função para copiar mensagem completa
window.copiarMensagem = function(button) {
    try {
        const messageDiv = button.closest('.message');
        if (!messageDiv) {
            console.error('Não foi possível encontrar o container da mensagem');
            return;
        }
        
        const content = messageDiv.querySelector('.message-content')?.innerText;
        if (!content) {
            console.error('Não foi possível encontrar o conteúdo da mensagem');
            return;
        }
        
        navigator.clipboard.writeText(content).then(() => {
            // Feedback visual
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.classList.add('copied');
            
            // Restaurar o ícone original após 2 segundos
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i>';
                button.classList.remove('copied');
            }, 2000);
        }).catch(err => {
            console.error('Erro ao copiar mensagem:', err);
            
            // Fallback para método antigo
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = content;
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            
            try {
                document.execCommand('copy');
                // Feedback visual
                button.innerHTML = '<i class="fas fa-check"></i>';
                button.classList.add('copied');
                
                // Restaurar o ícone original após 2 segundos
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                    button.classList.remove('copied');
                }, 2000);
            } catch (err2) {
                console.error('Erro ao usar fallback para copiar:', err2);
                alert('Não foi possível copiar a mensagem. Por favor, tente novamente.');
            } finally {
                document.body.removeChild(tempTextarea);
            }
        });
    } catch (error) {
        console.error('Erro ao executar função copiarMensagem:', error);
        alert('Ocorreu um erro ao tentar copiar a mensagem.');
    }
};

export {
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
};
