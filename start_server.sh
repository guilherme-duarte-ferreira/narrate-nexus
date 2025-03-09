
#!/bin/bash
# Script para iniciar o servidor com Eventlet

echo "Iniciando o servidor NarrateNexus com Eventlet e suporte a WebSockets..."
echo "Certifique-se de ter instalado as dependências necessárias:"
echo "pip install flask flask-socketio eventlet"

# Configuração de variáveis de ambiente (opcional)
# export FLASK_ENV=development
# export FLASK_DEBUG=1

# Inicia o servidor usando Eventlet
python -c "import eventlet; import eventlet.wsgi; from wsgi import application; eventlet.wsgi.server(eventlet.listen(('0.0.0.0', 5000)), application)"
