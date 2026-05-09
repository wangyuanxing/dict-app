import json


def build_prompt(source_lang, target_lang, entries):
    entries_json = json.dumps(entries, ensure_ascii=False, indent=2)

    common_rules = """RULES:
1. Translate ONLY the values, never the keys.
2. Return ONLY a valid JSON object -- no markdown, no code blocks, no explanations.
3. Preserve ALL placeholders exactly as they appear. Common placeholders include:
   - {variable}, {name}, {count}, {0}, {1}
   - {{escaped_braces}}, {{variable}}
   - %s, %d, %f, %@ (printf-style)
   - %(variable)s, %(name)d
   - ${variable}, $variable, {{variable}}
   - HTML/XML tags: <strong>, <a>, <span>, <br>
   - ICU message format: {count, plural, =0{...} other{...}}
   - Do NOT add or remove spaces inside placeholders.
4. Do NOT translate proper nouns, brand names, product names, or code identifiers.
5. Maintain the original tone (formal/informal) and keep approximately the same length.
6. If a value appears to already be in the target language, keep it as-is.
7. For empty strings, return empty strings."""

    system_prompt = f"""You are a precise JSON translator. Your task is to translate the values of JSON key-value pairs from {source_lang} to {target_lang}.

{common_rules}"""

    user_prompt = f"""Translate these values from {source_lang} to {target_lang}.

Input JSON:
{entries_json}

Output ONLY the translated JSON object:"""

    return system_prompt, user_prompt
