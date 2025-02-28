
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
    
    // Processa o texto usando Marked.js
    return marked.parse(text);
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
