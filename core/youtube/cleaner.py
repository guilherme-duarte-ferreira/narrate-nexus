
import re
import chardet
import html

class SubtitleCleaner:
    def __init__(self):
        self._timestamp_regex = re.compile(
            r'\d{2}:\d{2}:\d{2}[\.,]\d{3} --> \d{2}:\d{2}:\d{2}[\.,]\d{3}'
        )
        self._html_regex = re.compile(r'<[^>]+>')
        self._formatting_regex = re.compile(r'{\\[^}]+}')
        
    def sanitize(self, file_path: str) -> str:
        print(f"[DEBUG] Iniciando limpeza do arquivo: {file_path}")
        raw_data = self._read_file(file_path)
        return self._process_content(raw_data)

    def _read_file(self, path: str) -> str:
        print(f"[DEBUG] Lendo arquivo: {path}")
        with open(path, 'rb') as f:
            raw = f.read()
            result = chardet.detect(raw)
            encoding = result['encoding'] or 'utf-8'
            print(f"[DEBUG] Encoding detectado: {encoding}")
            return raw.decode(encoding, errors='replace')

    def _process_content(self, content: str) -> str:
        # Remove timestamps
        cleaned = self._timestamp_regex.sub('', content)
        # Remove HTML tags
        cleaned = self._html_regex.sub('', cleaned)
        # Remove formatações especiais
        cleaned = self._formatting_regex.sub('', cleaned)
        # Decodifica entidades HTML
        cleaned = html.unescape(cleaned)
        # Remove linhas vazias e espaços extras
        cleaned = '\n'.join(line.strip() for line in cleaned.splitlines() if line.strip())
        print(f"[DEBUG] Texto processado (primeiros 100 caracteres): {cleaned[:100]}")
        return cleaned
