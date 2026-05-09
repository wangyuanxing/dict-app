from db import db
from datetime import datetime, timezone
import uuid
import json


class TranslationTask(db.Model):
    __tablename__ = 'translation_tasks'

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = db.Column(db.String(12), db.ForeignKey('projects.id'), nullable=False)
    source_locale = db.Column(db.String(20), nullable=False)
    target_locales = db.Column(db.Text, nullable=False)  # JSON array
    status = db.Column(db.String(20), nullable=False, default='pending')
    total_keys = db.Column(db.Integer, default=0)
    completed_keys = db.Column(db.Integer, default=0)
    error_message = db.Column(db.Text)
    created_at = db.Column(db.String(30), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = db.Column(db.String(30), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())

    translations = db.relationship('Translation', backref='task', lazy='dynamic')

    @property
    def target_locales_list(self):
        return json.loads(self.target_locales) if self.target_locales else []

    @target_locales_list.setter
    def target_locales_list(self, value):
        self.target_locales = json.dumps(value, ensure_ascii=False)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'source_locale': self.source_locale,
            'target_locales': self.target_locales_list,
            'status': self.status,
            'total_keys': self.total_keys,
            'completed_keys': self.completed_keys,
            'error_message': self.error_message,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }
