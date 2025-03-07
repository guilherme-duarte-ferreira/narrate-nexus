
/**
 * Renderiza uma mensagem formatada com Markdown usando marked.js e highlight.js
 * @param {string} text - Texto em formato Markdown
 * @returns {string} HTML formatado
 */
export function renderMessage(text) {
    // Verificar dependências
    if (typeof marked === 'undefined') {
        console.error('[ERRO] marked.js não está definido.');
        return `<p>${text}</p>`;
    }
    if (typeof hljs === 'undefined') {
        console.error('[ERRO] highlight.js não está definido.');
        return `<pre>${text}</pre>`;
    }

    // Configurar highlight.js
    hljs.configure({
        cssSelector: 'pre code',
        ignoreUnescapedHTML: true
    });

    // Configurar marked.js com destaque simples
    marked.setOptions({
        gfm: true,               // Suporte a GitHub Flavored Markdown
        breaks: false,           // Não converter \n em <br>
        pedantic: false,         // Não ser extremamente rígido
        sanitize: false,         // Não sanitizar (usaremos DOMPurify)
        smartLists: true,        // Listas inteligentes
        smartypants: false,      // Não usar tipografia avançada
        highlight: function(code, lang) {
            try {
                const language = lang || 'plaintext';
                return hljs.highlight(code, { language }).value;
            } catch (error) {
                console.error(`Erro ao destacar código: ${error.message}`);
                return code;
            }
        }
    });

    try {
        // Verificar DOMPurify
        if (typeof DOMPurify === 'undefined') {
            console.error('[ERRO] DOMPurify não está definido.');
            return marked.parse(text);
        }

        // Configurar sanitização para preservar a estrutura do código
        const allowedTags = ['pre', 'code', 'span', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
                            'ul', 'ol', 'li', 'blockquote', 'a', 'strong', 'em', 'del', 'table',
                            'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'br', 'img'];

        const allowedAttributes = {
            'code': ['class'],
            'span': ['class'],
            'a': ['href', 'target', 'rel'],
            'img': ['src', 'alt']
        };

        // Parsear o Markdown
        const htmlContent = marked.parse(text);

        // Sanitizar o HTML preservando a estrutura
        const finalHtml = DOMPurify.sanitize(htmlContent, {
            ALLOWED_TAGS: allowedTags,
            ALLOWED_ATTR: allowedAttributes,
            ADD_ATTR: ['target'],
        });

        return finalHtml;
    } catch (error) {
        console.error(`Erro ao renderizar markdown: ${error.message}`);
        return `<p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    }
}
