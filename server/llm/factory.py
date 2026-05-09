from llm.openai_provider import OpenAIProvider
from llm.anthropic_provider import AnthropicProvider
from llm.deepseek_provider import DeepSeekProvider
from llm.openai_compatible_provider import OpenAICompatibleProvider

PROVIDER_MAP = {
    'openai': OpenAIProvider,
    'anthropic': AnthropicProvider,
    'deepseek': DeepSeekProvider,
    'openai_compatible': OpenAICompatibleProvider,
}


def create_provider(provider_name, api_key, model, base_url=None, extra_params=None):
    provider_class = PROVIDER_MAP.get(provider_name)
    if not provider_class:
        raise ValueError(f"Unsupported provider: {provider_name}. Supported: {list(PROVIDER_MAP.keys())}")
    return provider_class(api_key=api_key, model=model, base_url=base_url, extra_params=extra_params)
