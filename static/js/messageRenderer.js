
/**
 * Renderiza uma mensagem formatada com Markdown usando marked.js e highlight.js
 * @param {string} text - Texto em formato Markdown
 * @returns {string} HTML formatado
 */
export function renderMessage(text) {
    // Passo 1: Verificar se as bibliotecas necessárias estão disponíveis
    if (typeof hljs === 'undefined') {
        console.error('[ERRO] highlight.js não está definido. Verifique se o script foi carregado corretamente.');
        return processMarkdownManual(text);
    }

    // Passo 2: Configurar highlight.js
    hljs.configure({
        cssSelector: 'pre code',
        ignoreUnescapedHTML: true
    });

    try {
        // Verificar se DOMPurify está disponível
        if (typeof DOMPurify === 'undefined') {
            console.error('[ERRO] DOMPurify não está definido. Usando abordagem manual.');
            return processMarkdownManual(text);
        }
        
        // Verificar se marked está disponível
        if (typeof marked === 'undefined') {
            console.error('[ERRO] marked não está definido. Usando abordagem manual.');
            return processMarkdownManual(text);
        }
        
        // Sanitizar o texto antes do processamento
        const sanitizedText = DOMPurify.sanitize(text, {
            ALLOWED_TAGS: [],
            ALLOWED_ATTR: []
        });
        
        // Configurar marked
        marked.setOptions({
            gfm: true,
            breaks: false,
            pedantic: false,
            sanitize: false,
            smartLists: true,
            smartypants: false,
            highlight: function(code, lang) {
                try {
                    // Usar linguagem específica ou detectar automaticamente
                    const language = lang || 'plaintext';
                    const highlightedCode = hljs.highlight(code, { language }).value;
                    
                    // Retornar o HTML com o container personalizado
                    return `<div class="code-container">
                        <div class="code-header">
                            <span class="language-label">${language}</span>
                            <button class="code-copy-btn" onclick="window.copiarCodigo(this)" title="Copiar código"><i class="fas fa-copy"></i></button>
                        </div>
                        <pre class="code-block"><code class="hljs language-${language}">${highlightedCode}</code></pre>
                    </div>`;
                } catch (error) {
                    console.error(`Erro ao destacar código: ${error.message}`);
                    // Fallback seguro em caso de erro
                    return `<div class="code-container">
                        <div class="code-header">
                            <span class="language-label">texto</span>
                            <button class="code-copy-btn" onclick="window.copiarCodigo(this)" title="Copiar código"><i class="fas fa-copy"></i></button>
                        </div>
                        <pre class="code-block"><code>${escapeHTML(code)}</code></pre>
                    </div>`;
                }
            }
        });
        
        // Usar o marked para converter o Markdown em HTML
        const htmlContent = marked.parse(sanitizedText);
        
        // Sanitizar o HTML final preservando formatação necessária
        const allowedTags = ['pre', 'code', 'span', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 
                            'ul', 'ol', 'li', 'blockquote', 'a', 'strong', 'em', 'del', 'table', 
                            'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'br', 'img', 'button', 'i'];
        
        const allowedAttributes = {
            'code': ['class'],
            'span': ['class'],
            'div': ['class'],
            'a': ['href', 'target', 'rel'],
            'img': ['src', 'alt'],
            'button': ['class', 'onclick', 'title'],
            'i': ['class']
        };
        
        const finalHtml = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: allowedTags,
            ALLOWED_ATTR: allowedAttributes,
            ADD_ATTR: ['target', 'onclick'],
            FORBID_TAGS: ['style', 'script'],
            FORBID_ATTR: ['style', 'onerror'],
        });
        
        // Ativar highlight.js após inserção no DOM
        setTimeout(() => {
            if (typeof hljs !== 'undefined') {
                document.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }
        }, 50);
        
        return finalHtml;
    } catch (error) {
        console.error(`Erro ao renderizar markdown: ${error.message}`);
        // Fallback para o parser manual em caso de falha
        return processMarkdownManual(text);
    }
}

/**
 * Função para escapar caracteres HTML
 */
function escapeHTML(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Implementação manual de parsing Markdown sem dependências externas
 * Usado como fallback quando as bibliotecas não estão disponíveis
 */
function processMarkdownManual(markdown) {
    const lines = markdown.split('\n');
    let html = '';
    let inCodeBlock = false;
    let codeBlock = '';
    let language = '';

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Detectar blocos de código
        if (line.trim().startsWith('```')) {
            if (!inCodeBlock) {
                // Início do bloco de código
                inCodeBlock = true;
                // Extrair a linguagem do código (se especificada)
                language = line.trim().slice(3).trim() || 'plaintext';
            } else {
                // Fim do bloco de código
                inCodeBlock = false;
                html += renderCodeBlock(codeBlock, language);
                codeBlock = '';
                language = '';
            }
            continue;
        }
        
        if (inCodeBlock) {
            // Acumular linhas dentro do bloco de código
            codeBlock += line + '\n';
        } else {
            // Processar linha normal (fora de blocos de código)
            html += parseLine(line) + '\n';
        }
    }
    
    // Finalizar qualquer bloco de código não fechado
    if (inCodeBlock && codeBlock) {
        html += renderCodeBlock(codeBlock, language);
    }
    
    return html;
}

/**
 * Renderiza um bloco de código formatado com cabeçalho e botão de copiar
 */
function renderCodeBlock(code, language) {
    const escapedCode = escapeHTML(code);
    
    return `<div class="code-container">
        <div class="code-header">
            <span class="language-label">${language}</span>
            <button class="code-copy-btn" onclick="window.copiarCodigo(this)" title="Copiar código"><i class="fas fa-copy"></i></button>
        </div>
        <pre class="code-block"><code class="language-${language}">${escapedCode}</code></pre>
    </div>`;
}

/**
 * Processa uma linha de texto com formatação Markdown básica
 */
function parseLine(line) {
    let parsed = line;
    
    // Cabeçalhos
    if (parsed.trim().startsWith('# ')) {
        return `<h1>${escapeHTML(parsed.trim().substring(2))}</h1>`;
    } else if (parsed.trim().startsWith('## ')) {
        return `<h2>${escapeHTML(parsed.trim().substring(3))}</h2>`;
    } else if (parsed.trim().startsWith('### ')) {
        return `<h3>${escapeHTML(parsed.trim().substring(4))}</h3>`;
    } else if (parsed.trim().startsWith('#### ')) {
        return `<h4>${escapeHTML(parsed.trim().substring(5))}</h4>`;
    } else if (parsed.trim().startsWith('##### ')) {
        return `<h5>${escapeHTML(parsed.trim().substring(6))}</h5>`;
    } else if (parsed.trim().startsWith('###### ')) {
        return `<h6>${escapeHTML(parsed.trim().substring(7))}</h6>`;
    }
    
    // Lista não ordenada
    if (parsed.trim().startsWith('- ')) {
        return `<ul><li>${escapeHTML(parsed.trim().substring(2))}</li></ul>`;
    }
    
    // Lista ordenada
    if (/^\d+\.\s/.test(parsed.trim())) {
        const matches = parsed.trim().match(/^(\d+)\.\s(.*)$/);
        if (matches) {
            return `<ol start="${matches[1]}"><li>${escapeHTML(matches[2])}</li></ol>`;
        }
    }
    
    // Texto em negrito
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Texto em itálico
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Linha horizontal
    if (parsed.trim() === '---') {
        return '<hr>';
    }
    
    // Linha em branco
    if (parsed.trim() === '') {
        return '';
    }
    
    // Parágrafo padrão
    return `<p>${parsed}</p>`;
}
