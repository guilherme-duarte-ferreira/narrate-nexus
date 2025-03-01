import { escapeHTML } from './chatUtils.js';
import { renderMessage } from '../messageRenderer.js';

export function iniciarChat(welcomeScreen, chatContainer, inputContainer) {
    welcomeScreen.style.display = 'none';
    chatContainer.style.display = 'block';
    inputContainer.style.display = 'block';
    chatContainer.innerHTML = '';
}

export function mostrarTelaInicial(welcomeScreen, chatContainer, inputContainer, welcomeInput, chatInput) {
    welcomeScreen.style.display = 'flex';
    chatContainer.style.display = 'none';
    inputContainer.style.display = 'none';
    welcomeInput.value = '';
    if (chatInput) chatInput.value = '';
}

export function adicionarMensagem(chatContainer, texto, tipo) {
    const mensagemDiv = document.createElement('div');
    mensagemDiv.className = `message ${tipo}`;
    
    // Processamento de Markdown para mensagens do assistente
    let conteudoHtml;
    if (tipo === 'assistant') {
        // Aplicar formatação Markdown apenas nas mensagens do assistente
        conteudoHtml = renderMessage(texto);
        console.log('[DEBUG] HTML renderizado:', conteudoHtml.substring(0, 150) + '...');
        
        // Adiciona a classe .code-block a todos os <pre>
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = conteudoHtml;
        tempDiv.querySelectorAll('pre').forEach(pre => {
            pre.classList.add('code-block');
        });
        conteudoHtml = tempDiv.innerHTML;
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
    
    // Aplicar realce de sintaxe nos blocos de código
    if (tipo === 'assistant') {
        realcarSintaxeCodigo(mensagemDiv);
    }
}

export function mostrarCarregamento(chatContainer) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading message assistant';
    loadingDiv.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;
    chatContainer.appendChild(loadingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
    return loadingDiv;
}

function realcarSintaxeCodigo(container) {
    // Encontrar todos os blocos de código
    const codeBlocks = container.querySelectorAll('pre.code-block code');
    codeBlocks.forEach(block => {
        const language = block.parentElement.dataset.language || '';
        
        // Adicionar formatação básica de sintaxe
        // Palavras-chave comuns em várias linguagens
        const keywords = [
            'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 
            'export', 'const', 'let', 'var', 'def', 'print', 'from', 'async', 'await',
            'try', 'catch', 'finally', 'switch', 'case', 'break', 'continue',
            'public', 'private', 'protected', 'static', 'new', 'this', 'super',
            'int', 'float', 'double', 'bool', 'string', 'void', 'null', 'True', 'False'
        ];
        
        // Aplicar estilo para keywords
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            block.innerHTML = block.innerHTML.replace(
                regex, 
                `<span class="keyword">${keyword}</span>`
            );
        });
        
        // Strings
        block.innerHTML = block.innerHTML.replace(
            /(["'])(.*?)\1/g, 
            '<span class="string">$&</span>'
        );
        
        // Números
        block.innerHTML = block.innerHTML.replace(
            /\b(\d+(\.\d+)?)\b/g, 
            '<span class="number">$&</span>'
        );
        
        // Comentários (simplificado)
        block.innerHTML = block.innerHTML.replace(
            /(\/\/.*|#.*)/g, 
            '<span class="comment">$&</span>'
        );
        
        // Comentários multilinhas (para C, Java, etc)
        block.innerHTML = block.innerHTML.replace(
            /(\/\*[\s\S]*?\*\/)/g,
            '<span class="comment">$&</span>'
        );
    });
}
