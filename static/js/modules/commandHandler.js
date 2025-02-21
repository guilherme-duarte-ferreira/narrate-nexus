
import { processYoutubeVideo } from './youtube/api.js';
import { adicionarMensagem } from '../chat.js';

export async function handleYoutubeCommand(url, chatContainer) {
    try {
        console.log("[FRONTEND] Comando /youtube detectado. URL:", url);
        
        // Exibe mensagem de carregamento com spinner
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'yt-processing-indicator';
        loadingDiv.innerHTML = `
            <div class="yt-spinner"></div>
            <span>Processando vídeo...</span>
        `;
        chatContainer.appendChild(loadingDiv);


        
        // Processar vídeo
        const result = await processYoutubeVideo(url);
        
        if (result.status === 'success') {
            // Remove o indicador de carregamento
            chatContainer.removeChild(loadingDiv);
            
            // Exibe cada chunk no chat
            result.chunks.forEach((chunk, index) => {
                adicionarMensagem(chatContainer, `📝 Parte ${index + 1}:\n${chunk}`, 'assistant');
            });
        } else {
            throw new Error(result.error || 'Erro desconhecido');
        }
    } catch (error) {
        console.error("[FRONTEND] Erro completo:", error);
        adicionarMensagem(chatContainer, `❌ Erro: ${error.message}`, 'assistant');


    }
}
