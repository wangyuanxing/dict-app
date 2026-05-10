from models.source_entry import SourceEntry
from models.translation import Translation
from db import db
from datetime import datetime, timezone


def upload_entries(project_id, locale, entries):
    """Upsert source entries for a given locale. entries is a flat dict {key: value}."""
    now = datetime.now(timezone.utc).isoformat()
    count = 0
    for key, value in entries.items():
        if not isinstance(value, str):
            continue
        existing = SourceEntry.query.filter_by(project_id=project_id, key=key, locale=locale).first()
        if existing:
            existing.value = value
            existing.updated_at = now
        else:
            entry = SourceEntry(project_id=project_id, key=key, locale=locale, value=value)
            db.session.add(entry)
        count += 1
    db.session.commit()
    return count


def download_translations(project_id):
    """Get all locale data: source entries + completed translations, grouped by locale."""
    result = {}

    # 1. Collect all uploaded source entries (baseline)
    source_entries = (
        SourceEntry.query
        .filter_by(project_id=project_id)
        .order_by(SourceEntry.locale, SourceEntry.key)
        .all()
    )
    for se in source_entries:
        if se.locale not in result:
            result[se.locale] = {}
        result[se.locale][se.key] = se.value

    # 2. Overlay completed translations (override if exists, add if new)
    translations = (
        Translation.query
        .filter_by(project_id=project_id, status='completed')
        .order_by(Translation.target_locale, Translation.id)
        .all()
    )
    for t in translations:
        locale = t.target_locale
        if locale not in result:
            result[locale] = {}
        result[locale][t.source_entry.key] = t.translated_value

    return result
