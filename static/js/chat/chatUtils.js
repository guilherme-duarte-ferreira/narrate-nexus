
export function escapeHTML(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.innerText = text;
    return div.innerHTML;
}

export function processLinks(text) {
    // Processar links markdown [texto](url)
    return text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
        // Verificar se é uma URL válida e sanitizar
        let safeUrl = url.trim();
        
        // Verificar se começa com http:// ou https://
        if (!safeUrl.match(/^https?:\/\//i)) {
            safeUrl = 'https://' + safeUrl; // Adicionar https:// se não existir
        }
        
        // Retornar o link HTML com atributos de segurança
        return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${text}</a>`;
    });
}

export function copiarMensagem(button) {
    console.log('[DEBUG] Copiando mensagem...');
    const mensagem = button.closest('.message').querySelector('.message-content').textContent;
    navigator.clipboard.writeText(mensagem)
        .then(() => {
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.classList.add('copied');
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i>';
                button.classList.remove('copied');
            }, 2000);
        })
        .catch(err => {
            console.error('Erro ao copiar:', err);
            alert('Não foi possível copiar a mensagem');
        });
}

export function copiarCodigo(button) {
    console.log('[DEBUG] Copiando código...');
    const pre = button.closest('pre');
    const code = pre.querySelector('code').textContent;
    
    navigator.clipboard.writeText(code)
        .then(() => {
            button.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        })
        .catch(err => {
            console.error('Erro ao copiar código:', err);
            alert('Não foi possível copiar o código');
        });
}

export function regenerarResposta(button) {
    console.log('[DEBUG] Regenerando resposta...');
    const mensagemOriginal = button.closest('.message').previousElementSibling;
    if (!mensagemOriginal) {
        console.error('Mensagem original não encontrada');
        return;
    }

    const texto = mensagemOriginal.querySelector('.message-content').textContent;
    const chatInput = document.getElementById('chat-input');
    const chatForm = document.getElementById('chat-form');

    if (chatInput && chatForm) {
        chatInput.value = texto;
        chatForm.dispatchEvent(new Event('submit'));
    } else {
        console.error('Elementos do formulário não encontrados');
    }
}
