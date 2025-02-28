
import { escapeHTML, processLinks } from './chatUtils.js';

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
        conteudoHtml = formatarMensagemMarkdown(texto);
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
    
    // Tratar elementos de código para realçar sintaxe
    if (tipo === 'assistant') {
        realcarSintaxeCodigo(mensagemDiv);
    }
}

function formatarMensagemMarkdown(texto) {
    // Utilizar uma função de escape HTML para segurança
    let formattedText = escapeHTML(texto);
    
    // Processar blocos de código antes de outros elementos para evitar conflitos
    formattedText = formattedText.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, function(match, language, code) {
        return `<pre class="code-block" data-language="${language}"><code>${code}</code></pre>`;
    });
    
    // Headers
    formattedText = formattedText.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    formattedText = formattedText.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    formattedText = formattedText.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold - permitir ** e __ para negrito
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic - permitir * e _ para itálico
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formattedText = formattedText.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Blockquotes
    formattedText = formattedText.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Lists - melhorar o processamento de listas
    // Unordered lists
    formattedText = formattedText.replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>');
    formattedText = formattedText.replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>');
    formattedText = formattedText.replace(/^\+ (.*$)/gm, '<ul><li>$1</li></ul>');
    
    // Ordered lists
    formattedText = formattedText.replace(/^(\d+)\. (.*$)/gm, '<ol><li>$2</li></ol>');
    
    // Combinar listas contíguas
    formattedText = formattedText.replace(/<\/ul>\s*<ul>/g, '');
    formattedText = formattedText.replace(/<\/ol>\s*<ol>/g, '');
    
    // Links - usar função específica para processar links
    formattedText = processLinks(formattedText);
    
    // Horizontal rule
    formattedText = formattedText.replace(/^\s*---\s*$/gm, '<hr>');
    formattedText = formattedText.replace(/^\s*\*\*\*\s*$/gm, '<hr>');
    
    // Imagens - somente se aplicável ao seu projeto
    formattedText = formattedText.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="markdown-image">');
    
    // Line breaks finais - fazer tratamento cuidadoso de quebras de linha
    // Preservar quebras de linha em markdown (duas quebras = parágrafo)
    formattedText = formattedText.replace(/\n\n/g, '</p><p>');
    // Quebras de linha simples
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    // Envolver em parágrafo se não começar com uma tag HTML
    if (!formattedText.trim().startsWith('<')) {
        formattedText = `<p>${formattedText}</p>`;
    }
    
    // Normalizar parágrafos vazios
    formattedText = formattedText.replace(/<p>\s*<\/p>/g, '');
    
    return formattedText;
}

function realcarSintaxeCodigo(container) {
    // Função para adicionar classes aos elementos de código
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const language = block.parentElement.dataset.language || '';
        block.classList.add(`language-${language}`);
        
        // Adicionar formatação básica de sintaxe
        // Palavras-chave comuns
        const keywords = [
            'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 
            'export', 'const', 'let', 'var', 'def', 'print', 'from', 'async', 'await',
            'try', 'catch', 'switch', 'case', 'break', 'default', 'continue', 'throw',
            'extends', 'implements', 'interface', 'enum', 'this', 'new', 'true', 'false',
            'null', 'undefined', 'in', 'of', 'do', 'static', 'public', 'private', 'protected'
        ];
        
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            block.innerHTML = block.innerHTML.replace(
                regex, 
                `<span class="keyword">${keyword}</span>`
            );
        });
        
        // Strings (melhorar o regex para capturar as aspas corretamente)
        block.innerHTML = block.innerHTML.replace(
            /(['"])(.*?)\1/g, 
            '<span class="string">$&</span>'
        );
        
        // Números
        block.innerHTML = block.innerHTML.replace(
            /\b(\d+(\.\d+)?)\b/g, 
            '<span class="number">$&</span>'
        );
        
        // Comentários (melhorar para capturar comentários multilinhas)
        // Comentários de linha única
        block.innerHTML = block.innerHTML.replace(
            /(\/\/.*|#.*)/g, 
            '<span class="comment">$&</span>'
        );
        
        // Comentários multilinhas (básico, pode precisar de regex mais robusto)
        block.innerHTML = block.innerHTML.replace(
            /(\/\*[\s\S]*?\*\/)/g, 
            '<span class="comment">$&</span>'
        );
    });
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
