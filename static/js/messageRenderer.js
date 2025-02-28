
/**
 * Módulo para renderização de mensagens com Markdown
 * Processa texto bruto em HTML formatado
 */

// Função para escapar HTML
function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Renderiza texto com formatação Markdown para HTML
 * @param {string} text - Texto em formato Markdown
 * @return {string} HTML formatado
 */
export function renderMessage(text) {
    if (!text) return '';
    
    // Escapar o HTML para segurança
    let formattedText = escapeHTML(text);
    
    // Processar blocos de código com linguagem
    formattedText = formattedText.replace(/```([a-z]*)\n([\s\S]*?)\n```/g, function(match, language, code) {
        return `<pre class="code-block" data-language="${language}"><button class="code-copy-btn" onclick="window.copiarCodigo(this)"><i class="fas fa-copy"></i></button><code>${code}</code></pre>`;
    });
    
    // Processar tabelas
    formattedText = processarTabelas(formattedText);
    
    // Headers
    formattedText = formattedText.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    formattedText = formattedText.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    formattedText = formattedText.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold
    formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formattedText = formattedText.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Inline code
    formattedText = formattedText.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Blockquotes
    formattedText = formattedText.replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>');
    
    // Lists
    formattedText = processarListas(formattedText);
    
    // Links
    formattedText = formattedText.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    
    // Line breaks
    formattedText = formattedText.replace(/\n/g, '<br>');
    
    return formattedText;
}

/**
 * Processa tabelas Markdown e converte para HTML
 * @param {string} text - Texto contendo tabelas em formato Markdown
 * @return {string} Texto com tabelas convertidas para HTML
 */
function processarTabelas(text) {
    const linhas = text.split('\n');
    let resultado = [];
    let iniciouTabela = false;
    let linhasTabela = [];
    
    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        
        // Verifica se é uma linha de tabela
        if (linha.match(/^\|(.+)\|$/)) {
            if (!iniciouTabela) {
                iniciouTabela = true;
            }
            linhasTabela.push(linha);
            continue;
        }
        
        // Se não é linha de tabela mas estávamos em uma tabela
        if (iniciouTabela) {
            // Finaliza e processa a tabela
            if (linhasTabela.length >= 2) {
                resultado.push(criarTabelaHTML(linhasTabela));
            } else {
                // Se não tem linhas suficientes, adiciona as linhas normalmente
                resultado = resultado.concat(linhasTabela);
            }
            
            // Reset
            iniciouTabela = false;
            linhasTabela = [];
        }
        
        // Adiciona linha normal
        resultado.push(linha);
    }
    
    // Processa tabela no final do texto, se houver
    if (iniciouTabela && linhasTabela.length >= 2) {
        resultado.push(criarTabelaHTML(linhasTabela));
    } else if (linhasTabela.length > 0) {
        resultado = resultado.concat(linhasTabela);
    }
    
    return resultado.join('\n');
}

/**
 * Cria tabela HTML a partir de linhas de tabela Markdown
 * @param {string[]} linhas - Array de linhas da tabela em formato Markdown
 * @return {string} Tabela formatada em HTML
 */
function criarTabelaHTML(linhas) {
    let tabelaHTML = '<table class="markdown-table">\n';
    
    // Processa cabeçalho
    const cabecalho = linhas[0];
    const colunas = cabecalho.split('|').slice(1, -1).map(col => col.trim());
    
    tabelaHTML += '<thead>\n<tr>\n';
    colunas.forEach(col => {
        tabelaHTML += `<th>${col}</th>\n`;
    });
    tabelaHTML += '</tr>\n</thead>\n';
    
    // Ignora a linha de separação (segunda linha)
    
    // Processa linhas de dados (a partir da terceira linha)
    if (linhas.length > 2) {
        tabelaHTML += '<tbody>\n';
        for (let i = 2; i < linhas.length; i++) {
            const colunas = linhas[i].split('|').slice(1, -1).map(col => col.trim());
            
            tabelaHTML += '<tr>\n';
            colunas.forEach(col => {
                tabelaHTML += `<td>${col}</td>\n`;
            });
            tabelaHTML += '</tr>\n';
        }
        tabelaHTML += '</tbody>\n';
    }
    
    tabelaHTML += '</table>';
    return tabelaHTML;
}

/**
 * Processa listas Markdown e converte para HTML
 * @param {string} text - Texto contendo listas em formato Markdown
 * @return {string} Texto com listas convertidas para HTML
 */
function processarListas(text) {
    // Listas não ordenadas
    text = text.replace(/^(\*|-|\+) (.+)$/gm, '<li>$2</li>');
    text = text.replace(/(<li>.+<\/li>\n)+/g, '<ul>$&</ul>');
    
    // Listas ordenadas
    text = text.replace(/^(\d+)\. (.+)$/gm, '<li>$2</li>');
    text = text.replace(/(<li>.+<\/li>\n)+/g, match => {
        // Evita substituir listas não ordenadas já processadas
        if (match.includes('<ul>')) return match;
        return '<ol>' + match + '</ol>';
    });
    
    return text;
}
