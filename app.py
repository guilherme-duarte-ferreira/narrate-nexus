from flask import Flask, render_template, request, jsonify, Response
import json
import os
from datetime import datetime
import requests
from utils.text_processor import split_text
from utils.chat_storage import (
    create_new_conversation,
    add_message_to_conversation,
    get_conversation_by_id,
    get_conversation_history
)

app = Flask(__name__, static_folder='static')
app.secret_key = 'sua_chave_secreta_aqui'

API_URL = "http://localhost:11434/v1/chat/completions"
MODEL_NAME = "gemma2:2b"

@app.route('/')
def home():
    conversations = get_conversation_history()
    return render_template('index.html', conversations=conversations)

@app.route('/get_conversation_history')
def conversation_history():
    conversations = get_conversation_history()
    return jsonify(conversations)

@app.route('/get_conversation/<conversation_id>')
def get_conversation(conversation_id):
    conversation = get_conversation_by_id(conversation_id)
    if conversation:
        return jsonify(conversation)
    return jsonify({'error': 'Conversa não encontrada'}), 404

@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.json
    message = data.get('message', '')
    conversation_id = data.get('conversation_id')

    if not conversation_id:
        conversation_id = create_new_conversation()

    # Salvar mensagem do usuário
    add_message_to_conversation(conversation_id, message, "user")

    # Processar resposta da IA
    if len(message.split()) > 300:
        chunks = split_text(message)
        responses = []
        for chunk in chunks:
            response = process_with_ai(chunk)
            responses.append(response)
        final_response = " ".join(responses)
    else:
        final_response = None  # Streaming será usado

    def generate_streamed_response():
        for part in process_with_ai_stream(message):
            if part:
                # Salvar resposta da IA
                add_message_to_conversation(conversation_id, part, "assistant")
                yield f"data: {json.dumps({'content': part})}\n\n"

    response = Response(generate_streamed_response(), content_type="text/event-stream")
    response.headers['Cache-Control'] = 'no-cache'
    return response

def process_with_ai(text):
    try:
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": "Você é um assistente útil."},
                {"role": "user", "content": text}
            ],
            "stream": False
        }
        headers = {"Content-Type": "application/json"}
        response = requests.post(API_URL, json=payload, headers=headers)
        response.raise_for_status()

        response_data = response.json()
        if 'choices' in response_data and len(response_data['choices']) > 0:
            return response_data['choices'][0]['message']['content']
        return "Erro: Nenhuma resposta válida recebida da IA."
    except requests.exceptions.RequestException as e:
        print(f"[Debug] Erro na requisição HTTP: {str(e)}")
        return "Ocorreu um erro ao se conectar com a IA."
    except Exception as e:
        print(f"[Debug] Erro inesperado: {str(e)}")
        return "Ocorreu um erro inesperado ao processar sua mensagem."

def process_with_ai_stream(text):
    try:
        payload = {
            "model": MODEL_NAME,
            "messages": [
                {"role": "system", "content": "Você é um assistente útil."},
                {"role": "user", "content": text}
            ],
            "stream": True
        }
        headers = {"Content-Type": "application/json"}
        response = requests.post(API_URL, json=payload, headers=headers, stream=True)
        response.raise_for_status()

        for line in response.iter_lines(decode_unicode=True):
            if line.strip() and line.startswith("data: "):
                line = line[6:].strip()
                try:
                    response_data = json.loads(line)
                    if 'choices' in response_data and len(response_data['choices']) > 0:
                        delta = response_data['choices'][0]['delta']
                        if "content" in delta:
                            content = delta["content"].encode('latin1').decode('utf-8', errors='ignore')
                            yield content
                except json.JSONDecodeError:
                    print(f"[Debug] Erro ao decodificar JSON: {line}")
    except requests.exceptions.RequestException as e:
        print(f"[Debug] Erro na requisição HTTP: {str(e)}")
    except Exception as e:
        print(f"[Debug] Erro inesperado: {str(e)}")

if __name__ == '__main__':
    app.run(debug=True)