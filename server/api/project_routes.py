from flask import Blueprint, request, jsonify
from models.project import Project
from db import db
from datetime import datetime, timezone

project_bp = Blueprint('projects', __name__)


@project_bp.route('/projects', methods=['GET'])
def list_projects():
    projects = Project.query.order_by(Project.created_at.desc()).all()
    return jsonify([p.to_dict() for p in projects])


@project_bp.route('/projects', methods=['POST'])
def create_project():
    data = request.get_json(silent=True) or {}
    name = data.get('name', '').strip()
    if not name:
        return jsonify({'error': 'validation', 'message': 'Project name is required'}), 400

    project = Project(name=name)
    db.session.add(project)
    db.session.commit()
    return jsonify(project.to_dict()), 201


@project_bp.route('/projects/<project_id>', methods=['GET'])
def get_project(project_id):
    project = Project.query.get_or_404(project_id, description='Project not found')
    return jsonify(project.to_dict())


@project_bp.route('/projects/<project_id>', methods=['DELETE'])
def delete_project(project_id):
    project = Project.query.get_or_404(project_id, description='Project not found')
    db.session.delete(project)
    db.session.commit()
    return jsonify({'ok': True})
