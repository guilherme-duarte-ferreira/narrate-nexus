
/**
 * Renderiza uma mensagem formatada com Markdown usando marked.js e highlight.js
 * @param {string} text - Texto em formato Markdown
 * @returns {string} HTML formatado
 */
export function renderMessage(text) {
    // Configurar marked.js com opções profissionais
    marked.setOptions({
        gfm: true,               // Suporte a GitHub Flavored Markdown
        breaks: false,           // Não converter \n em <br>
        pedantic: false,         // Não ser extremamente rígido
        sanitize: false,         // Não sanitizar (usaremos DOMPurify)
        smartLists: true,        // Listas inteligentes
        smartypants: false,      // Não usar tipografia avançada
        highlight: function(code, lang) {
            // Definir linguagem padrão se não for especificada
            const language = lang || 'plaintext';
            
            try {
                // Usar highlight.js para destacar sintaxe
                const highlightedCode = hljs.highlightAuto(code, lang ? [lang] : undefined).value;
                
                // Retornar o HTML com o container personalizado
                return `<div class="code-container">
                    <div class="code-header">
                        <span class="language-label">${language}</span>
                        <button class="code-copy-btn" onclick="window.copiarCodigo(this)" title="Copiar código"><i class="fas fa-copy"></i></button>
                    </div>
                    <pre class="code-block" data-language="${language}"><code class="hljs language-${language}">${highlightedCode}</code></pre>
                </div>`;
            } catch (error) {
                console.error(`Erro ao destacar código: ${error.message}`);
                // Fallback seguro em caso de erro
                return `<div class="code-container">
                    <div class="code-header">
                        <span class="language-label">${language}</span>
                        <button class="code-copy-btn" onclick="window.copiarCodigo(this)" title="Copiar código"><i class="fas fa-copy"></i></button>
                    </div>
                    <pre class="code-block" data-language="${language}"><code>${code}</code></pre>
                </div>`;
            }
        }
    });
    
    try {
        // Primeiro, sanitizar o texto para evitar XSS
        const sanitizedText = DOMPurify.sanitize(text);
        
        // Usar o marked para converter o Markdown em HTML
        const htmlContent = marked.parse(sanitizedText);
        
        return htmlContent;
    } catch (error) {
        console.error(`Erro ao renderizar markdown: ${error.message}`);
        // Fallback seguro em caso de erro
        return `<p>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>`;
    }
}
