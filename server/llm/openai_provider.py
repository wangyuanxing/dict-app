import httpx
from openai import OpenAI
from llm.base import BaseLLMProvider
from llm.utils import parse_json_response
from prompts.translation import build_prompt


class OpenAIProvider(BaseLLMProvider):
    def translate_batch(self, source_lang, target_lang, entries):
        client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url or None,
            http_client=httpx.Client(proxy=None),
        )
        system_prompt, user_prompt = build_prompt(source_lang, target_lang, entries)

        params = {
            'model': self.model,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
            'temperature': self.extra_params.get('temperature', 0.3),
            'response_format': {'type': 'json_object'},
        }

        if 'max_tokens' in self.extra_params:
            params['max_tokens'] = self.extra_params['max_tokens']

        resp = client.chat.completions.create(**params)
        text = resp.choices[0].message.content
        return parse_json_response(text)
