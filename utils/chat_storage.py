import json
import os
from datetime import datetime
from typing import Dict, List, Optional

# Configuração dos diretórios
DATA_DIR = "data"
CONVERSATIONS_DIR = os.path.join(DATA_DIR, "conversations")
INDEX_FILE = os.path.join(DATA_DIR, "index.json")

# Criar diretórios se não existirem
os.makedirs(CONVERSATIONS_DIR, exist_ok=True)

def load_index() -> List[Dict]:
    """Carrega o arquivo de índice das conversas"""
    if os.path.exists(INDEX_FILE):
        with open(INDEX_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    return []

def save_index(index_data: List[Dict]) -> None:
    """Salva o arquivo de índice das conversas"""
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)

def get_conversation_by_id(conversation_id: str) -> Optional[Dict]:
    """Carrega uma conversa específica pelo ID"""
    filename = os.path.join(CONVERSATIONS_DIR, f"{conversation_id}.json")
    if os.path.exists(filename):
        with open(filename, 'r', encoding='utf-8') as f:
            return json.load(f)
    return None

def save_conversation(conversation_id: str, conversation_data: Dict) -> None:
    """Salva uma conversa específica"""
    filename = os.path.join(CONVERSATIONS_DIR, f"{conversation_id}.json")
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(conversation_data, f, ensure_ascii=False, indent=2)

def create_new_conversation(title: str = "Nova conversa") -> str:
    """Cria uma nova conversa e retorna seu ID"""
    conversation_id = f"conversation_{int(datetime.now().timestamp())}"
    
    # Criar arquivo da conversa
    conversation_data = {
        "id": conversation_id,
        "messages": []
    }
    save_conversation(conversation_id, conversation_data)
    
    # Atualizar índice
    index = load_index()
    index.append({
        "id": conversation_id,
        "title": title,
        "timestamp": datetime.now().isoformat(),
        "filename": f"{conversation_id}.json"
    })
    save_index(index)
    
    return conversation_id

def add_message_to_conversation(conversation_id: str, content: str, role: str) -> None:
    """Adiciona uma mensagem a uma conversa existente"""
    conversation = get_conversation_by_id(conversation_id)
    if not conversation:
        conversation = {
            "id": conversation_id,
            "messages": []
        }
    
    conversation["messages"].append({
        "role": role,
        "content": content,
        "timestamp": datetime.now().isoformat()
    })
    
    save_conversation(conversation_id, conversation)

def get_conversation_history() -> List[Dict]:
    """Retorna todas as conversas do índice"""
    return load_index()