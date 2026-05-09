from flask import Blueprint, request, jsonify, g
from services.auth import require_auth
from models.llm_config import LlmConfig
from db import db
from datetime import datetime, timezone
import json

llm_config_bp = Blueprint('llm_config', __name__)


@llm_config_bp.route('/projects/<project_id>/llm-config', methods=['GET'])
@require_auth
def get_config(project_id):
    config = LlmConfig.query.filter_by(project_id=g.project.id).first()
    if not config:
        return jsonify({})
    return jsonify(config.to_dict())


@llm_config_bp.route('/projects/<project_id>/llm-config', methods=['PUT'])
@require_auth
def save_config(project_id):
    data = request.get_json(silent=True) or {}

    provider = data.get('provider', '').strip()
    model = data.get('model', '').strip()
    api_key = data.get('api_key', '').strip()

    if not provider or not model or not api_key:
        return jsonify({'error': 'validation', 'message': 'provider, model, and api_key are required'}), 400

    config = LlmConfig.query.filter_by(project_id=g.project.id).first()
    now = datetime.now(timezone.utc).isoformat()

    if not config:
        config = LlmConfig(project_id=g.project.id)
        config.created_at = now
        db.session.add(config)

    config.provider = provider
    config.model = model
    config.api_key = api_key
    config.base_url = data.get('base_url', '').strip() or None
    config.extra_params = data.get('extra_params', '').strip() or None
    config.updated_at = now

    db.session.commit()
    return jsonify(config.to_dict())


@llm_config_bp.route('/projects/<project_id>/llm-config/test', methods=['POST'])
@require_auth
def test_config(project_id):
    data = request.get_json(silent=True) or {}
    provider_name = data.get('provider', '').strip()
    model = data.get('model', '').strip()
    api_key = data.get('api_key', '').strip()
    base_url = data.get('base_url', '').strip() or None
    extra_params_str = data.get('extra_params', '').strip() or None

    if not provider_name or not model or not api_key:
        return jsonify({'error': 'validation', 'message': 'provider, model, and api_key are required'}), 400

    extra_params = None
    if extra_params_str:
        try:
            extra_params = json.loads(extra_params_str)
        except json.JSONDecodeError:
            return jsonify({'error': 'validation', 'message': 'extra_params must be valid JSON'}), 400

    try:
        from llm.factory import create_provider
        provider = create_provider(provider_name, api_key, model, base_url, extra_params)
        result = provider.translate_batch('en', 'zh', {'test.hello': 'Hello'})
        return jsonify({'ok': True, 'message': 'Connection successful', 'sample': result})
    except Exception as e:
        return jsonify({'error': 'test_failed', 'message': str(e)}), 400
