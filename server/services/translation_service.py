import threading
import json
from models.translation_task import TranslationTask
from models.translation import Translation
from models.source_entry import SourceEntry
from models.llm_config import LlmConfig
from db import db
from datetime import datetime, timezone


def create_translation_task(project_id, source_locale, target_locales):
    """Create a translation task and start processing in a background thread."""
    task = TranslationTask(
        project_id=project_id,
        source_locale=source_locale,
    )
    task.target_locales_list = target_locales

    source_entries = SourceEntry.query.filter_by(project_id=project_id, locale=source_locale).all()
    task.total_keys = len(source_entries) * len(target_locales)
    task.status = 'processing'

    db.session.add(task)
    db.session.commit()

    thread = threading.Thread(target=_process_task, args=(task.id,), daemon=True)
    thread.start()

    return task


def retry_failed_task(task):
    """Retry failed translations for a task."""
    failed = Translation.query.filter_by(task_id=task.id, status='failed').all()
    for t in failed:
        t.status = 'pending'
        t.updated_at = datetime.now(timezone.utc).isoformat()
    task.status = 'processing'
    task.error_message = None
    task.completed_keys = Translation.query.filter_by(task_id=task.id, status='completed').count()
    db.session.commit()

    source_entries = SourceEntry.query.filter_by(project_id=task.project_id, locale=task.source_locale).all()
    pending = Translation.query.filter_by(task_id=task.id, status='pending').all()
    if pending:
        from app import create_app
        app = create_app()
        with app.app_context():
            config = LlmConfig.query.filter_by(project_id=task.project_id).first()
            if not config:
                task.status = 'failed'
                task.error_message = 'LLM config not found'
                db.session.commit()
                return
            from llm.factory import create_provider
            provider = create_provider(config.provider, config.api_key, config.model, config.base_url, _parse_extra_params(config.extra_params))
            entries_dict = {e.key: e.value for e in source_entries}
            for target_locale in task.target_locales_list:
                _translate_single_locale(task, provider, entries_dict, target_locale)

            pending_check = Translation.query.filter_by(task_id=task.id, status='pending').count()
            failed_check = Translation.query.filter_by(task_id=task.id, status='failed').count()
            if pending_check == 0 and failed_check == 0:
                task.status = 'completed'
            elif failed_check > 0:
                task.status = 'failed'
            else:
                task.status = 'processing'
            db.session.commit()


def _process_task(task_id):
    """Background task processing."""
    from app import create_app
    app = create_app()
    with app.app_context():
        task = TranslationTask.query.get(task_id)
        if not task:
            return

        config = LlmConfig.query.filter_by(project_id=task.project_id).first()
        if not config:
            task.status = 'failed'
            task.error_message = 'LLM config not found. Please configure an LLM provider first.'
            db.session.commit()
            return

        source_entries = SourceEntry.query.filter_by(project_id=task.project_id, locale=task.source_locale).all()
        entries_dict = {e.key: e.value for e in source_entries}

        from llm.factory import create_provider
        provider = create_provider(config.provider, config.api_key, config.model, config.base_url, _parse_extra_params(config.extra_params))

        for target_locale in task.target_locales_list:
            try:
                _translate_single_locale(task, provider, entries_dict, target_locale)
            except Exception as e:
                task.status = 'failed'
                task.error_message = str(e)
                db.session.commit()
                return

        task.status = 'completed'
        task.updated_at = datetime.now(timezone.utc).isoformat()
        db.session.commit()


def _translate_single_locale(task, provider, entries_dict, target_locale):
    """Translate all entries for one target locale, batching as needed."""
    now = datetime.now(timezone.utc).isoformat()

    for key in entries_dict:
        source_entry = SourceEntry.query.filter_by(
            project_id=task.project_id, key=key, locale=task.source_locale
        ).first()
        if not source_entry:
            continue

        existing = Translation.query.filter_by(
            source_entry_id=source_entry.id, target_locale=target_locale
        ).first()
        if existing:
            if existing.status != 'pending':
                continue
        else:
            tr = Translation(
                project_id=task.project_id,
                source_entry_id=source_entry.id,
                target_locale=target_locale,
                status='pending',
                task_id=task.id,
            )
            db.session.add(tr)
    db.session.commit()

    pending = Translation.query.filter_by(task_id=task.id, target_locale=target_locale, status='pending').all()
    if not pending:
        return

    entries_to_translate = {}
    for tr in pending:
        entries_to_translate[tr.source_entry.key] = tr.source_entry.value

    batch = dict(list(entries_to_translate.items()))
    try:
        result = provider.translate_batch(task.source_locale, target_locale, batch)
        for tr in pending:
            key = tr.source_entry.key
            if key in result and result[key]:
                tr.translated_value = result[key]
                tr.status = 'completed'
            else:
                tr.status = 'failed'
            tr.updated_at = now
            task.completed_keys = Translation.query.filter_by(task_id=task.id, status='completed').count()
    except Exception as e:
        for tr in pending:
            if tr.status == 'pending':
                tr.status = 'failed'
                tr.updated_at = now
        raise e

    task.updated_at = now
    db.session.commit()


def _parse_extra_params(extra_params_str):
    if not extra_params_str:
        return None
    try:
        return json.loads(extra_params_str)
    except (json.JSONDecodeError, TypeError):
        return None
