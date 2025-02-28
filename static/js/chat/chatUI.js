
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
        console.log('[DEBUG] HTML gerado:', conteudoHtml);
    } else {
        // Para mensagens do usuário, apenas escape HTML e quebras de linha
        conteudoHtml = `<p>${escapeHTML(texto).replace(/\n/g, '<br>')}</p>`;
    }
    
    // Adicionar botão de copiar em blocos de código
    conteudoHtml = conteudoHtml.replace(
        /<pre class="code-block"([^>]*)><code>/g, 
        '<pre class="code-block"$1><button class="code-copy-btn" onclick="window.copiarCodigo(this)"><i class="fas fa-copy"></i></button><code>'
    );
    
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
    
    // Processar tabelas
    const linhas = formattedText.split('\n');
    let tabelaAtual = [];
    let emTabela = false;
    let resultado = [];
    
    for (let i = 0; i < linhas.length; i++) {
        if (linhas[i].trim().startsWith('|') && linhas[i].trim().endsWith('|')) {
            if (!emTabela) {
                emTabela = true;
            }
            tabelaAtual.push(linhas[i]);
        } else if (emTabela) {
            // Fim da tabela, processar
            if (tabelaAtual.length >= 2) {
                // Temos pelo menos um cabeçalho e uma linha de separação
                resultado.push(processarTabela(tabelaAtual));
            } else {
                // Não é uma tabela válida, adicionar linhas originais
                resultado = resultado.concat(tabelaAtual);
            }
            resultado.push(linhas[i]);
            tabelaAtual = [];
            emTabela = false;
        } else {
            resultado.push(linhas[i]);
        }
    }
    
    // Se a tabela terminou no final do texto
    if (emTabela && tabelaAtual.length >= 2) {
        resultado.push(processarTabela(tabelaAtual));
    } else if (emTabela) {
        resultado = resultado.concat(tabelaAtual);
    }
    
    formattedText = resultado.join('\n');
    
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
    
    // Melhorar o processamento de listas
    // Listas não ordenadas - agrupar itens em um único <ul>
    formattedText = formattedText.replace(/^((\*|-|\+) .*\n?)+/gm, function(match) {
        const items = match.trim().split('\n').map(line => {
            // Extrair o conteúdo após o marcador (* - +)
            const content = line.replace(/^(\*|-|\+)\s+/, '').trim();
            return `<li>${content}</li>`;
        }).join('');
        return `<ul>${items}</ul>`;
    });
    
    // Listas ordenadas - agrupar itens em um único <ol>
    formattedText = formattedText.replace(/^(\d+\. .*\n?)+/gm, function(match) {
        const items = match.trim().split('\n').map(line => {
            // Extrair o conteúdo após o número e ponto
            const content = line.replace(/^\d+\.\s+/, '').trim();
            return `<li>${content}</li>`;
        }).join('');
        return `<ol>${items}</ol>`;
    });
    
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

function processarTabela(linhas) {
    if (linhas.length < 2) return linhas.join('\n');
    
    // Extrair dados de cada linha
    const dados = linhas.map(linha => {
        return linha.trim()
            .replace(/^\||\|$/g, '') // Remove o primeiro e último |
            .split('|')
            .map(celula => celula.trim());
    });
    
    // Verificar se a segunda linha é uma linha de separação (contém apenas -, :, ou espaços)
    const ehSeparador = dados[1].every(celula => /^[-:\s]+$/.test(celula));
    
    if (!ehSeparador) return linhas.join('\n');
    
    // Construir tabela HTML
    let tabelaHtml = '<table class="markdown-table">\n';
    
    // Cabeçalho
    tabelaHtml += '<thead>\n<tr>\n';
    dados[0].forEach(celula => {
        tabelaHtml += `<th>${celula}</th>\n`;
    });
    tabelaHtml += '</tr>\n</thead>\n';
    
    // Corpo da tabela
    if (dados.length > 2) {
        tabelaHtml += '<tbody>\n';
        for (let i = 2; i < dados.length; i++) {
            tabelaHtml += '<tr>\n';
            dados[i].forEach(celula => {
                tabelaHtml += `<td>${celula}</td>\n`;
            });
            tabelaHtml += '</tr>\n';
        }
        tabelaHtml += '</tbody>\n';
    }
    
    tabelaHtml += '</table>';
    
    return tabelaHtml;
}

function realcarSintaxeCodigo(container) {
    // Função para adicionar classes aos elementos de código
    const codeBlocks = container.querySelectorAll('pre code');
    codeBlocks.forEach(block => {
        const language = block.parentElement.dataset.language || '';
        block.classList.add(`language-${language}`);
        
        // Lista extendida de palavras-chave comuns em várias linguagens
        const keywords = [
            // JavaScript/TypeScript
            'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 
            'export', 'const', 'let', 'var', 'async', 'await', 'try', 'catch', 
            'switch', 'case', 'break', 'default', 'continue', 'throw', 'throws',
            'extends', 'implements', 'interface', 'enum', 'this', 'new', 'true', 'false',
            'null', 'undefined', 'in', 'of', 'do', 'static', 'public', 'private', 'protected',
            
            // Python
            'def', 'print', 'from', 'import', 'as', 'class', 'if', 'elif', 'else', 'for',
            'while', 'try', 'except', 'finally', 'with', 'lambda', 'return', 'yield',
            'global', 'nonlocal', 'pass', 'raise', 'True', 'False', 'None', 'and', 'or', 'not',
            
            // C/C++
            'int', 'char', 'void', 'float', 'double', 'bool', 'struct', 'typedef',
            'sizeof', 'long', 'short', 'unsigned', 'signed', 'const', 'static', 'extern',
            'volatile', 'register', 'auto', 'goto', 'inline', 'virtual', 'enum', 'union',
            'include', 'define', 'ifdef', 'ifndef', 'endif', 'pragma', 'NULL', 'true', 'false',
            'main', 'printf', 'scanf', 'malloc', 'free',
            
            // Java
            'public', 'private', 'protected', 'static', 'final', 'abstract', 'class',
            'interface', 'enum', 'extends', 'implements', 'void', 'boolean', 'byte',
            'char', 'short', 'int', 'long', 'float', 'double', 'String', 'System',
            'out', 'in', 'println', 'print', 'new', 'this', 'super', 'instanceof'
        ];
        
        // Destacar palavras-chave
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            block.innerHTML = block.innerHTML.replace(
                regex, 
                `<span class="keyword">${keyword}</span>`
            );
        });
        
        // Strings (melhorar o regex para capturar as aspas corretamente)
        block.innerHTML = block.innerHTML.replace(
            /(["'])(.*?)\1/g, 
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
