
import { adicionarMensagem } from './chatUI.js';

export function carregarConversa(id) {
    console.log('[DEBUG] Carregando conversa:', id);
    
    fetch(`/get_conversation/${id}`)
        .then(response => {
            if (!response.ok) throw new Error('HTTP error: ' + response.status);
            return response.json();
        })
        .then(conversa => {
            if (conversa.error) {
                console.error('Erro ao carregar conversa:', conversa.error);
                return;
            }
            
            console.log('[DEBUG] Conversa carregada:', conversa);
            
            if (!conversa.messages) {
                console.log('[CONVERSÃO] Convertendo mensagens antigas para novo formato');
                conversa.messages = conversa.mensagens || [];
                delete conversa.mensagens;
            }
            
            if (!Array.isArray(conversa.messages)) {
                console.error('[ERRO] Messages não é um array, corrigindo...');
                conversa.messages = [];
            }
            
            if (conversa.titulo) {
                conversa.title = conversa.titulo;
                delete conversa.titulo;
            }
            
            // Armazenar conversa atual e atualizar cache de conversas
            window.conversaAtual = conversa;
            if (!window.conversas) window.conversas = [];
            window.conversas = window.conversas.map(c => 
                c.id === conversa.id ? conversa : c
            );

            // Adicionar à estrutura de conversas global por ID
            if (!window.conversations) window.conversations = {};
            window.conversations[id] = {
                data: conversa,
                streaming: false,
                currentResponse: ''
            };

            const chatContainer = document.querySelector('.chat-container');
            const welcomeScreen = document.querySelector('.welcome-screen');
            const inputContainer = document.querySelector('.input-container');
            
            if (!chatContainer) {
                console.error('[ERRO] Chat container não encontrado');
                return;
            }
            
            welcomeScreen.style.display = 'none';
            chatContainer.style.display = 'block';
            inputContainer.style.display = 'block';
            chatContainer.innerHTML = '';
            
            // Renderizar mensagens da conversa carregada
            conversa.messages.forEach(msg => {
                adicionarMensagem(chatContainer, msg.content, msg.role === 'assistant' ? 'assistant' : 'user');
            });

            chatContainer.scrollTop = chatContainer.scrollHeight;
            
            window.dispatchEvent(new CustomEvent('conversaCarregada'));
            window.dispatchEvent(new CustomEvent('historicoAtualizado'));
        })
        .catch(error => {
            console.error('Erro ao carregar conversa:', error);
            alert('Erro ao carregar conversa');
        });
}

export function atualizarListaConversas() {
    console.log('[DEBUG] Atualizando lista de conversas');
    
    const chatList = document.querySelector('.chat-list');
    if (!chatList) {
        console.error('[ERRO] Chat list não encontrada');
        return;
    }

    // Limpar qualquer listener existente para evitar duplicação
    if (chatList._clickListener) {
        chatList.removeEventListener('click', chatList._clickListener);
    }

    fetch('/get_conversation_history')
        .then(response => response.json())
        .then(conversas => {
            chatList.innerHTML = '';
            conversas.forEach(conversa => {
                const conversaElement = document.createElement('div');
                conversaElement.className = 'chat-item';
                if (window.conversaAtual && window.conversaAtual.id === conversa.id) {
                    conversaElement.classList.add('active');
                }
                
                conversaElement.dataset.id = conversa.id;
                
                const titulo = conversa.title || conversa.titulo || 'Nova conversa';
                
                const spanTitulo = document.createElement('span');
                spanTitulo.className = 'chat-title';
                spanTitulo.textContent = titulo;
                conversaElement.appendChild(spanTitulo);
                
                const actionButtons = document.createElement('div');
                actionButtons.className = 'action-buttons';
                actionButtons.style.position = 'relative';
                actionButtons.style.zIndex = '100';
                
                // Botão Renomear com ícone
                const renameBtn = document.createElement('button');
                renameBtn.className = 'action-btn rename-btn';
                renameBtn.dataset.id = conversa.id;
                renameBtn.title = 'Renomear conversa';
                renameBtn.innerHTML = '<i class="fas fa-edit"></i>'; // Ícone de lápis para editar
                renameBtn.style.pointerEvents = 'auto';
                
                // Adicionar listener direto ao botão
                renameBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[DEBUG] Rename clicked diretamente para ID:', conversa.id);
                    renomearConversa(conversa.id);
                });
                
                // Botão Excluir com ícone
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'action-btn delete-btn';
                deleteBtn.dataset.id = conversa.id;
                deleteBtn.title = 'Excluir conversa';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>'; // Ícone de lixeira para excluir
                deleteBtn.style.pointerEvents = 'auto';
                
                // Adicionar listener direto ao botão
                deleteBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('[DEBUG] Delete clicked diretamente para ID:', conversa.id);
                    excluirConversa(conversa.id);
                });
                
                actionButtons.appendChild(renameBtn);
                actionButtons.appendChild(deleteBtn);
                conversaElement.appendChild(actionButtons);
                
                // Evitar que cliques nos botões disparem o carregamento da conversa
                actionButtons.addEventListener('click', function(e) {
                    e.stopPropagation();
                    console.log('[DEBUG] Clique capturado em action-buttons');
                });
                
                chatList.appendChild(conversaElement);
            });
            
            // Adicionar listener de delegação também como fallback
            const clickListener = function(e) {
                console.log('[DEBUG] Clique detectado em:', e.target);
                
                // Se clicar nos botões, não carrega a conversa
                if (e.target.closest('.action-buttons')) {
                    console.log('[DEBUG] Clique em botões, interrompendo propagação');
                    e.stopPropagation();
                    return;
                }
                
                // Verificar se clicou em um botão de renomear
                const renameBtn = e.target.closest('.rename-btn');
                if (renameBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = renameBtn.dataset.id;
                    console.log('[DEBUG] Botão renomear clicado para ID:', id);
                    renomearConversa(id);
                    return;
                }
                
                // Verificar se clicou em um botão de excluir
                const deleteBtn = e.target.closest('.delete-btn');
                if (deleteBtn) {
                    e.preventDefault();
                    e.stopPropagation();
                    const id = deleteBtn.dataset.id;
                    console.log('[DEBUG] Botão excluir clicado para ID:', id);
                    excluirConversa(id);
                    return;
                }
                
                // Se não clicou em nenhum botão, carrega a conversa
                const chatItem = e.target.closest('.chat-item');
                if (chatItem) {
                    const id = chatItem.dataset.id;
                    console.log('[DEBUG] Carregando conversa pelo clique:', id);
                    carregarConversa(id);
                }
            };
            
            chatList.addEventListener('click', clickListener);
            chatList._clickListener = clickListener; // Salva a referência para poder remover depois
            
            window.dispatchEvent(new CustomEvent('listaAtualizada'));
        })
        .catch(error => console.error('Erro ao atualizar lista de conversas:', error));
}

export function criarNovaConversa() {
    const novaConversa = {
        id: Date.now().toString(),
        title: "Nova Conversa",
        messages: []
    };
    
    window.conversas = window.conversas || [];
    window.conversas.unshift(novaConversa);
    window.conversaAtual = novaConversa;
    
    // Adicionar à estrutura de conversas global
    if (!window.conversations) window.conversations = {};
    window.conversations[novaConversa.id] = {
        data: novaConversa,
        streaming: false,
        currentResponse: ''
    };
    
    window.dispatchEvent(new CustomEvent('historicoAtualizado'));
    
    return novaConversa;
}

export function adicionarMensagemAoHistorico(mensagem, tipo, conversationId = null) {
    // Se não especificado, usa a conversa atual
    conversationId = conversationId || (window.conversaAtual ? window.conversaAtual.id : null);
    
    console.log(`[DEBUG] Adicionando mensagem à conversa ${conversationId}, tipo: ${tipo}`);
    
    if (!conversationId) {
        console.log('[CORREÇÃO] Não há conversa atual, criando uma nova');
        const novaConversa = criarNovaConversa();
        conversationId = novaConversa.id;
    }
    
    // Referência à conversa na estrutura global de conversas
    let conversation = window.conversations[conversationId];
    
    if (!conversation) {
        console.log(`[ERRO] Conversa ${conversationId} não encontrada na estrutura global`);
        return;
    }
    
    // Verificar se a estrutura da conversa no estado global está correta
    if (!window.conversaAtual || !Array.isArray(window.conversaAtual.messages)) {
        console.log('[CORREÇÃO] Estado da conversa atual inválido, corrigindo');
        window.conversaAtual = {
            id: conversationId,
            title: window.conversations[conversationId].data.title || "Nova conversa",
            messages: []
        };
        
        // Atualizar na estrutura global
        window.conversations[conversationId].data = window.conversaAtual;
    }
    
    try {
        // Adicionar mensagem ao histórico da conversa atual
        if (window.conversaAtual && window.conversaAtual.id === conversationId) {
            window.conversaAtual.messages.push({
                content: mensagem,
                role: tipo,
                timestamp: new Date().toISOString()
            });
        }
        
        // Adicionar também à estrutura de dados de conversas global
        if (!Array.isArray(window.conversations[conversationId].data.messages)) {
            window.conversations[conversationId].data.messages = [];
        }
        
        window.conversations[conversationId].data.messages.push({
            content: mensagem,
            role: tipo,
            timestamp: new Date().toISOString()
        });
        
        console.log(`[DEBUG] Mensagem adicionada com sucesso à conversa ${conversationId}`);
        
        window.dispatchEvent(new CustomEvent('historicoAtualizado'));
        window.dispatchEvent(new CustomEvent('mensagemAdicionada'));
        
    } catch (err) {
        console.error(`[ERRO CRÍTICO] Falha ao adicionar mensagem à conversa ${conversationId}:`, err);
    }
    
    // Salvar a conversa no servidor
    fetch('/save_message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            conversation_id: conversationId,
            content: mensagem,
            role: tipo
        })
    }).catch(err => {
        console.error('[ERRO] Falha ao salvar mensagem no servidor:', err);
    });
}

export function renomearConversa(id) {
    console.log('[DEBUG] Tentando renomear conversa:', id);
    
    const novoTitulo = prompt('Digite o novo título da conversa:');
    if (!novoTitulo || !novoTitulo.trim()) {
        console.log('[DEBUG] Operação cancelada pelo usuário');
        return;
    }

    fetch(`/rename_conversation/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: novoTitulo.trim() })
    })
    .then(response => {
        console.log('[DEBUG] Status da resposta:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('[DEBUG] Resposta do servidor:', data);
        
        if (data.success) {
            console.log('[DEBUG] Conversa renomeada com sucesso');
            
            // Atualizar na conversa atual se for a mesma
            if (window.conversaAtual && window.conversaAtual.id === id) {
                window.conversaAtual.title = novoTitulo.trim();
            }
            
            // Atualizar na estrutura global de conversas
            if (window.conversations && window.conversations[id]) {
                window.conversations[id].data.title = novoTitulo.trim();
            }
            
            // Atualizar na lista de conversas em memória
            if (window.conversas) {
                window.conversas = window.conversas.map(c => 
                    c.id === id ? {...c, title: novoTitulo.trim()} : c
                );
            }
            
            // Atualizar a lista de conversas na UI
            atualizarListaConversas();
            
            // Notificar sistema sobre alteração
            window.dispatchEvent(new CustomEvent('conversaAtualizada', { 
                detail: { id, newTitle: novoTitulo.trim() } 
            }));
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
    })
    .catch(error => {
        console.error('[ERRO] Falha ao renomear:', error);
        alert('Erro ao renomear conversa: ' + error.message);
    });
}

export function excluirConversa(id) {
    console.log('[DEBUG] Tentando excluir conversa:', id);
    
    if (!confirm('Tem certeza que deseja excluir esta conversa?')) {
        console.log('[DEBUG] Operação cancelada pelo usuário');
        return;
    }

    fetch(`/delete_conversation/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
    })
    .then(response => {
        console.log('[DEBUG] Status da resposta:', response.status);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('[DEBUG] Resposta do servidor:', data);
        
        if (data.success) {
            console.log('[DEBUG] Conversa excluída com sucesso');
            
            // Remover da memória
            if (window.conversas) {
                window.conversas = window.conversas.filter(c => c.id !== id);
            }
            
            // Remover da estrutura global de conversas
            if (window.conversations && window.conversations[id]) {
                delete window.conversations[id];
            }
            
            // Se a conversa atual foi excluída, voltar para a tela inicial
            if (window.conversaAtual && window.conversaAtual.id === id) {
                window.conversaAtual = null;
                const welcomeScreen = document.querySelector('.welcome-screen');
                const chatContainer = document.querySelector('.chat-container');
                const inputContainer = document.querySelector('.input-container');
                
                welcomeScreen.style.display = 'flex';
                chatContainer.style.display = 'none';
                inputContainer.style.display = 'none';
            }
            
            // Atualizar a lista de conversas
            atualizarListaConversas();
            
            // Notificar sistema sobre exclusão
            window.dispatchEvent(new CustomEvent('conversaExcluida', { 
                detail: { id } 
            }));
        } else {
            throw new Error(data.error || 'Erro desconhecido');
        }
    })
    .catch(error => {
        console.error('[ERRO] Falha na requisição:', error);
        alert('Erro ao excluir conversa: ' + error.message);
    });
}
