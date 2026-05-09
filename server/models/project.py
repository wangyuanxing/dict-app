from db import db
from datetime import datetime, timezone
import uuid
import secrets


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.String(12), primary_key=True, default=lambda: uuid.uuid4().hex[:12])
    name = db.Column(db.String(200), nullable=False)
    api_key = db.Column(db.String(64), unique=True, nullable=False, default=lambda: secrets.token_hex(16))
    created_at = db.Column(db.String(30), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = db.Column(db.String(30), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())

    source_entries = db.relationship('SourceEntry', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    translations = db.relationship('Translation', backref='project', lazy='dynamic', cascade='all, delete-orphan')
    tasks = db.relationship('TranslationTask', backref='project', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'api_key': self.api_key,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }
