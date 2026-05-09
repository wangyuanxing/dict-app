from db import db
from datetime import datetime, timezone


class LlmConfig(db.Model):
    __tablename__ = 'llm_configs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.String(12), db.ForeignKey('projects.id'), unique=True, nullable=False)
    provider = db.Column(db.String(30), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    api_key = db.Column(db.String(512), nullable=False)
    base_url = db.Column(db.String(500))
    extra_params = db.Column(db.Text)
    created_at = db.Column(db.String(30), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = db.Column(db.String(30), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'provider': self.provider,
            'model': self.model,
            'api_key': self.api_key[:8] + '***' if self.api_key else None,
            'base_url': self.base_url,
            'extra_params': self.extra_params,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }
