from functools import wraps
from flask import request, g, abort
from models.project import Project


def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        project_id = request.headers.get('X-Project-Id')
        api_key = request.headers.get('X-API-Key')

        if not project_id or not api_key:
            abort(401, description="Missing X-Project-Id or X-API-Key header")

        project = Project.query.filter_by(id=project_id, api_key=api_key).first()
        if not project:
            abort(401, description="Invalid project ID or API key")

        g.project = project
        return f(*args, **kwargs)

    return decorated
