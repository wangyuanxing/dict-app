from flask import Blueprint, request, jsonify, g
from services.auth import require_auth
from services.translation_service import create_translation_task, retry_failed_task
from models.translation_task import TranslationTask
from models.translation import Translation
from db import db
from datetime import datetime, timezone

task_bp = Blueprint('tasks', __name__)


@task_bp.route('/projects/<project_id>/tasks', methods=['GET'])
@require_auth
def list_tasks(project_id):
    tasks = TranslationTask.query.filter_by(project_id=g.project.id).order_by(TranslationTask.created_at.desc()).all()
    return jsonify({'tasks': [t.to_dict() for t in tasks]})


@task_bp.route('/projects/<project_id>/tasks', methods=['POST'])
@require_auth
def create_task(project_id):
    data = request.get_json(silent=True) or {}
    source_locale = data.get('source_locale', '').strip()
    target_locales = data.get('target_locales', [])

    if not source_locale:
        return jsonify({'error': 'validation', 'message': 'source_locale is required'}), 400
    if not isinstance(target_locales, list) or len(target_locales) == 0:
        return jsonify({'error': 'validation', 'message': 'target_locales must be a non-empty list'}), 400

    task = create_translation_task(g.project.id, source_locale, target_locales)
    return jsonify(task.to_dict()), 201


@task_bp.route('/projects/<project_id>/tasks/<task_id>', methods=['GET'])
@require_auth
def get_task(project_id, task_id):
    task = TranslationTask.query.filter_by(id=task_id, project_id=g.project.id).first_or_404()
    return jsonify(task.to_dict())


@task_bp.route('/projects/<project_id>/tasks/<task_id>/retry', methods=['POST'])
@require_auth
def retry_task(project_id, task_id):
    task = TranslationTask.query.filter_by(id=task_id, project_id=g.project.id).first_or_404()
    retry_failed_task(task)
    return jsonify({'ok': True})


@task_bp.route('/projects/<project_id>/translations', methods=['GET'])
@require_auth
def list_translations(project_id):
    target_locale = request.args.get('target_locale', '')
    task_id = request.args.get('task_id', '')

    query = Translation.query.filter_by(project_id=g.project.id)
    if target_locale:
        query = query.filter_by(target_locale=target_locale)
    if task_id:
        query = query.filter_by(task_id=task_id)

    translations = query.order_by(Translation.id).all()
    return jsonify({'translations': [t.to_dict() for t in translations]})


@task_bp.route('/projects/<project_id>/translations/<int:translation_id>', methods=['PUT'])
@require_auth
def update_translation(project_id, translation_id):
    tr = Translation.query.filter_by(id=translation_id, project_id=g.project.id).first_or_404()
    data = request.get_json(silent=True) or {}
    if 'translated_value' in data:
        tr.translated_value = data['translated_value']
        if tr.status == 'pending':
            tr.status = 'completed'
        tr.updated_at = datetime.now(timezone.utc).isoformat()
        db.session.commit()
    return jsonify(tr.to_dict())
