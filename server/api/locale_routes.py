from flask import Blueprint, request, jsonify, g
from services.auth import require_auth
from models.source_entry import SourceEntry
from db import db
from datetime import datetime, timezone

locale_bp = Blueprint('locales', __name__)


@locale_bp.route('/projects/<project_id>/locales', methods=['GET'])
@require_auth
def list_locales(project_id):
    rows = (
        db.session.query(SourceEntry.locale)
        .filter_by(project_id=g.project.id)
        .distinct()
        .order_by(SourceEntry.locale)
        .all()
    )
    return jsonify([r[0] for r in rows])


@locale_bp.route('/projects/<project_id>/entries', methods=['GET'])
@require_auth
def list_entries(project_id):
    locale = request.args.get('locale', '')
    search = request.args.get('search', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    query = SourceEntry.query.filter_by(project_id=g.project.id)
    if locale:
        query = query.filter_by(locale=locale)
    if search:
        query = query.filter(
            db.or_(
                SourceEntry.key.contains(search),
                SourceEntry.value.contains(search),
            )
        )
    query = query.order_by(SourceEntry.key)

    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    return jsonify({
        'entries': [e.to_dict() for e in pagination.items],
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
    })


@locale_bp.route('/projects/<project_id>/entries/<int:entry_id>', methods=['PUT'])
@require_auth
def update_entry(project_id, entry_id):
    entry = SourceEntry.query.filter_by(id=entry_id, project_id=g.project.id).first_or_404()
    data = request.get_json(silent=True) or {}
    if 'value' in data:
        entry.value = data['value']
        entry.updated_at = datetime.now(timezone.utc).isoformat()
        db.session.commit()
    return jsonify(entry.to_dict())


@locale_bp.route('/projects/<project_id>/entries/<int:entry_id>', methods=['DELETE'])
@require_auth
def delete_entry(project_id, entry_id):
    entry = SourceEntry.query.filter_by(id=entry_id, project_id=g.project.id).first_or_404()
    db.session.delete(entry)
    db.session.commit()
    return jsonify({'ok': True})
