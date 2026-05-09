from flask import Blueprint, request, jsonify, g
from services.auth import require_auth
from services.locale_service import upload_entries, download_translations

cli_bp = Blueprint('cli', __name__)


@cli_bp.route('/upload', methods=['POST'])
@require_auth
def upload():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'validation', 'message': 'Request body is required'}), 400

    locale = data.get('locale', '').strip()
    entries = data.get('entries')

    if not locale:
        return jsonify({'error': 'validation', 'message': 'locale is required'}), 400
    if not isinstance(entries, dict):
        return jsonify({'error': 'validation', 'message': 'entries must be a JSON object'}), 400
    if not entries:
        return jsonify({'error': 'validation', 'message': 'entries must not be empty'}), 400

    count = upload_entries(g.project.id, locale, entries)
    return jsonify({'ok': True, 'count': count})


@cli_bp.route('/download', methods=['GET'])
@require_auth
def download():
    result = download_translations(g.project.id)
    return jsonify(result)
