
import { mostrarCarregamento } from './chatUI.js';
import { adicionarMensagem } from './chatUI.js';
import { adicionarMensagemAoHistorico, criarNovaConversa } from './chatStorage.js';

let abortController = null;

export async function enviarMensagem(mensagem, input, chatContainer, sendBtn, stopBtn) {
    if (!mensagem.trim()) return;

    // Verificar se é comando do YouTube
    if (mensagem.startsWith('/youtube ')) {
        const videoUrl = mensagem.split(' ')[1];
        if (!videoUrl) {
            adicionarMensagem(chatContainer, "Por favor, forneça uma URL do YouTube válida", 'assistant');
            return;
        }

        if (!window.conversaAtual) {
            criarNovaConversa();
        }

        // Adicionar comando do usuário no chat
        adicionarMensagem(chatContainer, mensagem, 'user');
        adicionarMensagemAoHistorico(mensagem, 'user');

        const loadingDiv = mostrarCarregamento(chatContainer);
        try {
            const response = await fetch('/process_youtube', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    video_url: videoUrl,
                    conversation_id: window.conversaAtual.id,
                    comando: mensagem
                })
            });

            const data = await response.json();
            loadingDiv.remove();

            if (data.error) {
                adicionarMensagem(chatContainer, `Erro: ${data.error}`, 'assistant');
                adicionarMensagemAoHistorico(`Erro: ${data.error}`, 'assistant');
            } else {
                adicionarMensagem(chatContainer, data.text, 'assistant');
                adicionarMensagemAoHistorico(data.text, 'assistant');
            }
            
            // Forçar atualização da UI
            window.dispatchEvent(new CustomEvent('historicoAtualizado'));
            
        } catch (error) {
            loadingDiv.remove();
            const errorMsg = "Erro ao processar o vídeo";
            adicionarMensagem(chatContainer, errorMsg, 'assistant');
            adicionarMensagemAoHistorico(errorMsg, 'assistant');
        }
        return;
    }

    // Para mensagens normais
    if (!window.conversaAtual) {
        console.log("Criando nova conversa...");
        criarNovaConversa();
    }

    // Associar mensagem à conversa atual pelo ID
    const conversationId = window.conversaAtual.id;
    console.log(`[DEBUG] Enviando mensagem para conversa: ${conversationId}`);

    // Adicionar mensagem do usuário imediatamente
    adicionarMensagem(chatContainer, mensagem, 'user');
    adicionarMensagemAoHistorico(mensagem, 'user');

    input.value = '';
    input.style.height = 'auto';
    
    const loadingDiv = mostrarCarregamento(chatContainer);

    sendBtn.style.display = 'none';
    stopBtn.style.display = 'flex';

    abortController = new AbortController();

    try {
        const response = await fetch('/send_message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: mensagem,
                conversation_id: conversationId
            }),
            signal: abortController.signal
        });

        if (!response.ok) {
            throw new Error('Erro na resposta do servidor');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let accumulatedMessage = '';

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');

            for (const line of lines) {
                if (line.startsWith('data: ')) {
                    try {
                        const jsonData = JSON.parse(line.slice(6));
                        if (jsonData.content) {
                            accumulatedMessage += jsonData.content;
                            
                            // Verificar se ainda estamos na mesma conversa
                            if (window.conversaAtual && window.conversaAtual.id === conversationId) {
                                loadingDiv.innerHTML = `<p>${accumulatedMessage.replace(/\n/g, '<br>')}</p>`;
                                chatContainer.scrollTop = chatContainer.scrollHeight;
                            }
                        }
                    } catch (e) {
                        console.error('Erro ao processar chunk:', e);
                    }
                }
            }
        }

        loadingDiv.remove();
        
        // Verificar novamente se ainda estamos na mesma conversa antes de adicionar a resposta
        if (window.conversaAtual && window.conversaAtual.id === conversationId) {
            // Adicionar resposta da IA
            adicionarMensagem(chatContainer, accumulatedMessage, 'assistant');
            adicionarMensagemAoHistorico(accumulatedMessage, 'assistant');
            
            // Forçar atualização da UI
            window.dispatchEvent(new CustomEvent('historicoAtualizado'));
            window.dispatchEvent(new CustomEvent('mensagemEnviada'));
        } else {
            console.log(`[DEBUG] Conversa mudou durante streaming. Não atualizando UI.`);
            // Salvar a mensagem no histórico mesmo que a conversa tenha mudado
            adicionarMensagemAoHistorico(accumulatedMessage, 'assistant', conversationId);
        }
        
    } catch (erro) {
        if (erro.name === 'AbortError') {
            console.log('Geração de resposta interrompida pelo usuário');
            loadingDiv.remove();
        } else {
            console.error('Erro:', erro);
            loadingDiv.remove();
            const errorMsg = 'Erro ao conectar com o servidor. Por favor, tente novamente.';
            
            // Verificar se ainda estamos na mesma conversa
            if (window.conversaAtual && window.conversaAtual.id === conversationId) {
                adicionarMensagem(chatContainer, errorMsg, 'assistant');
            }
            
            adicionarMensagemAoHistorico(errorMsg, 'assistant', conversationId);
        }
    } finally {
        sendBtn.style.display = 'flex';
        stopBtn.style.display = 'none';
        abortController = null;
    }
}

export function interromperResposta() {
    if (abortController) {
        abortController.abort();
    }
}
