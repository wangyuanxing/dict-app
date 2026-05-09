from anthropic import Anthropic
from llm.base import BaseLLMProvider
from llm.utils import parse_json_response
from prompts.translation import build_prompt


class AnthropicProvider(BaseLLMProvider):
    def translate_batch(self, source_lang, target_lang, entries):
        client = Anthropic(api_key=self.api_key)
        system_prompt, user_prompt = build_prompt(source_lang, target_lang, entries)

        params = {
            'model': self.model,
            'max_tokens': self.extra_params.get('max_tokens', 4096),
            'system': system_prompt,
            'messages': [
                {'role': 'user', 'content': user_prompt + '\n\nReturn ONLY valid JSON. Do not wrap in markdown code blocks.'},
            ],
            'temperature': self.extra_params.get('temperature', 0.3),
        }

        resp = client.messages.create(**params)
        text = resp.content[0].text
        return parse_json_response(text)
