import json
from flask import Blueprint, request, jsonify, g
from services.auth import require_auth
from models.source_entry import SourceEntry
from models.translation_task import TranslationTask
from models.translation import Translation
from db import db

locale_bp = Blueprint('locales', __name__)

# Common locale codes — always available as options in the UI
COMMON_LOCALES = [
    ('zh_CN', '简体中文'),
    ('zh_TW', '繁體中文'),
    ('en_US', 'English (US)'),
    ('en_GB', 'English (UK)'),
    ('ja_JP', '日本語'),
    ('ko_KR', '한국어'),
    ('fr_FR', 'Français'),
    ('de_DE', 'Deutsch'),
    ('es_ES', 'Español'),
    ('pt_BR', 'Português (BR)'),
    ('ru_RU', 'Русский'),
    ('ar_SA', 'العربية'),
    ('th_TH', 'ไทย'),
    ('vi_VN', 'Tiếng Việt'),
    ('id_ID', 'Bahasa Indonesia'),
    ('tr_TR', 'Türkçe'),
    ('it_IT', 'Italiano'),
    ('nl_NL', 'Nederlands'),
    ('pl_PL', 'Polski'),
    ('sv_SE', 'Svenska'),
]


@locale_bp.route('/projects/<project_id>/locales', methods=['GET'])
@require_auth
def list_locales(project_id):
    locales = []

    # Always include common locales first
    for code, label in COMMON_LOCALES:
        locales.append({'code': code, 'label': label})

    # Mark which ones the project already has data for
    existing = set()
    rows = (
        db.session.query(SourceEntry.locale)
        .filter_by(project_id=g.project.id)
        .distinct()
        .all()
    )
    existing.update(r[0] for r in rows)

    # Also check task targets
    tasks = TranslationTask.query.filter_by(project_id=g.project.id).all()
    for t in tasks:
        for tl in (json.loads(t.target_locales) if t.target_locales else []):
            existing.add(tl)
        if t.source_locale:
            existing.add(t.source_locale)

    # And completed translations
    tr_rows = (
        db.session.query(Translation.target_locale)
        .filter_by(project_id=g.project.id)
        .distinct()
        .all()
    )
    existing.update(r[0] for r in tr_rows)

    return jsonify({
        'locales': locales,
        'existing': sorted(existing),
    })


@locale_bp.route('/projects/<project_id>/entries', methods=['GET'])
@require_auth
def list_entries(project_id):
    locale = request.args.get('locale', '')
    search = request.args.get('search', '')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)

    # Check if this locale has any uploaded source entries
    source_count = SourceEntry.query.filter_by(project_id=g.project.id, locale=locale).count() if locale else 0

    if source_count > 0:
        # Has uploaded data — return source entries
        query = SourceEntry.query.filter_by(project_id=g.project.id, locale=locale)
        if search:
            query = query.filter(
                db.or_(
                    SourceEntry.key.contains(search),
                    SourceEntry.value.contains(search),
                )
            )
        query = query.order_by(SourceEntry.key)
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        entries = [e.to_dict() for e in pagination.items]
        total = pagination.total
    else:
        # No uploaded data — return completed translations for this target locale
        query = (
            db.session.query(Translation, SourceEntry)
            .join(SourceEntry, Translation.source_entry_id == SourceEntry.id)
            .filter(
                Translation.project_id == g.project.id,
                Translation.target_locale == locale,
                Translation.status == 'completed',
            )
        )
        if search:
            query = query.filter(
                db.or_(
                    SourceEntry.key.contains(search),
                    Translation.translated_value.contains(search),
                )
            )
        query = query.order_by(SourceEntry.key)

        total = query.count()
        offset = (page - 1) * per_page
        rows = query.offset(offset).limit(per_page).all()

        entries = []
        for tr, se in rows:
            entries.append({
                'id': tr.id,
                'project_id': tr.project_id,
                'key': se.key,
                'locale': tr.target_locale,
                'value': tr.translated_value or '',
                'source_value': se.value,
                'status': tr.status,
                'is_translation': True,
                'created_at': tr.created_at,
                'updated_at': tr.updated_at,
            })

    return jsonify({
        'entries': entries,
        'total': total,
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
