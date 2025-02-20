
class SubtitleNotFoundError(Exception):
    """Exceção lançada quando não são encontradas legendas para o vídeo."""
    pass

class InvalidVideoError(Exception):
    """Exceção lançada quando há problemas com o vídeo (não existe, privado, etc)."""
    pass

class ProcessingError(Exception):
    """Exceção lançada quando ocorre um erro durante o processamento das legendas."""
    pass
