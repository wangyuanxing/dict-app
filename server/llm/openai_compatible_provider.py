from openai import OpenAI
from llm.base import BaseLLMProvider
from prompts.translation import build_prompt


class OpenAICompatibleProvider(BaseLLMProvider):
    def translate_batch(self, source_lang, target_lang, entries):
        client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        system_prompt, user_prompt = build_prompt(source_lang, target_lang, entries)

        params = {
            'model': self.model,
            'messages': [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt},
            ],
            'temperature': self.extra_params.get('temperature', 0.3),
        }

        if 'max_tokens' in self.extra_params:
            params['max_tokens'] = self.extra_params['max_tokens']

        try:
            params['response_format'] = {'type': 'json_object'}
        except Exception:
            pass

        resp = client.chat.completions.create(**params)
        text = resp.choices[0].message.content

        from llm.utils import parse_json_response
        return parse_json_response(text)
