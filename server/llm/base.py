from abc import ABC, abstractmethod


class BaseLLMProvider(ABC):
    def __init__(self, api_key, model, base_url=None, extra_params=None):
        self.api_key = api_key
        self.model = model
        self.base_url = base_url
        self.extra_params = extra_params or {}

    @abstractmethod
    def translate_batch(self, source_lang, target_lang, entries):
        """
        Translate a batch of key-value pairs.
        entries: dict {key: source_value}
        Returns: dict {key: translated_value}
        """
        pass
