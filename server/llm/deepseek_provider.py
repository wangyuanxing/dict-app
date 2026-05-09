from llm.openai_compatible_provider import OpenAICompatibleProvider


class DeepSeekProvider(OpenAICompatibleProvider):
    def __init__(self, api_key, model, base_url=None, extra_params=None):
        super().__init__(api_key, model, base_url or 'https://api.deepseek.com/v1', extra_params)
