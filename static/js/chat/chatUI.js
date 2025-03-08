
import { escapeHTML } from './chatUtils.js';
import { renderMessage } from '../messageRenderer.js';
import { melhorarBlocosCodigo } from './chatUtils.js';

export function iniciarChat(welcomeScreen, chatContainer, inputContainer) {
    welcomeScreen.style.display = 'none';
    chatContainer.style.display = 'block';
    inputContainer.style.display = 'block';
    chatContainer.innerHTML = '';
    
    // Verificar se há uma conversa carregada na estrutura global
    const conversationId = window.conversaAtual?.id;
    if (conversationId && window.conversations && window.conversations[conversationId]) {
        console.log(`[DEBUG] Iniciando chat para conversa: ${conversationId}`);
    } else {
        console.log('[DEBUG] Iniciando chat sem conversa ativa');
    }
}

export function mostrarTelaInicial(welcomeScreen, chatContainer, inputContainer, welcomeInput, chatInput) {
    welcomeScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
    inputContainer.style.display = 'none';
    welcomeInput.value = '';
    if (chatInput) chatInput.value = '';
    
    // Limpar referência da conversa atual para evitar mistura de contextos
    window.conversaAtual = null;
    console.log('[DEBUG] Retornando para tela inicial, conversa atual limpa');
}

export function adicionarMensagem(chatContainer, texto, tipo) {
    // Verificar se o contêiner de chat existe
    if (!chatContainer) {
        console.error('[ERRO] Contêiner de chat não encontrado ao adicionar mensagem');
        return;
    }
    
    // Verificar se há uma conversa ativa
    const conversationId = window.conversaAtual?.id;
    if (!conversationId) {
        console.warn('[AVISO] Tentando adicionar mensagem sem conversa ativa');
    } else {
        console.log(`[DEBUG] Adicionando mensagem à conversa ${conversationId}, tipo: ${tipo}`);
    }
    
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = `message ${tipo}`;
    
    // Associar ID da conversa para garantir isolamento
    if (conversationId) {
        mensagemDiv.dataset.conversationId = conversationId;
    }
    
    // Processamento de Markdown para mensagens do assistente
    let conteudoHtml;
    if (tipo === 'assistant') {
        // Aplicar formatação Markdown apenas nas mensagens do assistente
        conteudoHtml = renderMessage(texto);
        console.log('[DEBUG] HTML renderizado (primeiros 150 caracteres):', conteudoHtml.substring(0, 150) + '...');
    } else {
        // Para mensagens do usuário, apenas escape HTML e quebras de linha
        conteudoHtml = `<p>${escapeHTML(texto).replace(/\n/g, '<br>')}</p>`;
    }
    
    const conteudo = `
        <div class="message-content">${conteudoHtml}</div>
        <div class="message-actions">
            <button class="action-btn copy-btn" onclick="window.copiarMensagem(this)" title="Copiar mensagem">
                <i class="fas fa-copy"></i>
            </button>
            ${tipo === 'assistant' ? `
                <button class="action-btn regenerate-btn" onclick="window.regenerarResposta(this)" title="Regenerar resposta">
                    <i class="fas fa-redo"></i>
                </button>
            ` : ''}
        </div>
    `;
    
    mensagemDiv.innerHTML = conteudo;
    chatContainer.appendChild(mensagemDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    
    // Melhorar os blocos de código imediatamente após adicionar a mensagem
    if (tipo === 'assistant') {
        setTimeout(() => {
            console.log('[DEBUG] Aplicando melhorias aos blocos de código...');
            melhorarBlocosCodigo();
        }, 0);
    }
}

export function mostrarCarregamento(chatContainer) {
    // Verificar se o contêiner de chat existe
    if (!chatContainer) {
        console.error('[ERRO] Contêiner de chat não encontrado ao mostrar carregamento');
        return document.createElement('div'); // Retorna um div vazio como fallback
    }
    
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading message assistant';
    
    // Associar ID da conversa para garantir isolamento
    const conversationId = window.conversaAtual?.id;
    if (conversationId) {
        loadingDiv.dataset.conversationId = conversationId;
        console.log(`[DEBUG] Mostrando carregamento para conversa: ${conversationId}`);
    } else {
        console.warn('[AVISO] Mostrando carregamento sem conversa ativa');
    }
    
    loadingDiv.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return loadingDiv;
}
