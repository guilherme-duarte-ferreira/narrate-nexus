
import { 
    iniciarChat,
    mostrarTelaInicial,
    adicionarMensagem,
    mostrarCarregamento
} from './chat/chatUI.js';

import {
    enviarMensagem,
    interromperResposta
} from './chat/chatActions.js';

import {
    carregarConversa,
    atualizarListaConversas,
    criarNovaConversa,
    adicionarMensagemAoHistorico,
    renomearConversa,
    excluirConversa
} from './chat/chatStorage.js';

import {
    copiarCodigo,
    copiarMensagem,
    regenerarResposta
} from './chat/chatUtils.js';

// Expor funções globalmente
window.copiarCodigo = copiarCodigo;
window.copiarMensagem = copiarMensagem;
window.regenerarResposta = regenerarResposta;

export {
    iniciarChat,
    mostrarTelaInicial,
    adicionarMensagem,
    enviarMensagem,
    interromperResposta,
    carregarConversa,
    atualizarListaConversas,
    criarNovaConversa,
    adicionarMensagemAoHistorico,
    renomearConversa,
    excluirConversa
};
