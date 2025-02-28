
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
        let linha = linhas[i].trim(); // Remove espaços extras no início e fim
        
        if (linha.startsWith('|') && linha.endsWith('|')) {
            if (!iniciouTabela) {
                iniciouTabela = true;
            }
            linhasTabela.push(linha);
            continue;
        }
        
        if (iniciouTabela) {
            if (linhasTabela.length >= 3 && isSeparadorTabela(linhasTabela[1])) {
                resultado.push(criarTabelaHTML(linhasTabela));
            } else {
                resultado = resultado.concat(linhasTabela);
            }
            iniciouTabela = false;
            linhasTabela = [];
        }
        
        resultado.push(linhas[i]); // Mantém a linha original no resultado
    }
    
    if (iniciouTabela && linhasTabela.length >= 3 && isSeparadorTabela(linhasTabela[1])) {
        resultado.push(criarTabelaHTML(linhasTabela));
    } else if (linhasTabela.length > 0) {
        resultado = resultado.concat(linhasTabela);
    }
    
    return resultado.join('\n');
}

function isSeparadorTabela(linha) {
    const colunas = linha.split('|').slice(1, -1);
    return colunas.every(col => col.trim().match(/^[:-]+$/));
}


/**
 * Cria tabela HTML a partir de linhas de tabela Markdown
 * @param {string[]} linhas - Array de linhas da tabela em formato Markdown
 * @return {string} Tabela formatada em HTML
 */
function criarTabelaHTML(linhas) {
    let tabelaHTML = '<table class="markdown-table">\n';
    
    const cabecalho = linhas[0].trim().split('|').slice(1, -1).map(col => col.trim());
    tabelaHTML += '<thead>\n<tr>\n';
    cabecalho.forEach(col => {
        tabelaHTML += `<th>${col || '&nbsp;'}</th>\n`; // Usa &nbsp; para células vazias
    });
    tabelaHTML += '</tr>\n</thead>\n';
    
    if (linhas.length > 2) {
        tabelaHTML += '<tbody>\n';
        for (let i = 2; i < linhas.length; i++) {
            const colunas = linhas[i].trim().split('|').slice(1, -1).map(col => col.trim());
            tabelaHTML += '<tr>\n';
            colunas.forEach(col => {
                tabelaHTML += `<td>${col || '&nbsp;'}</td>\n`; // Usa &nbsp; para células vazias
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
