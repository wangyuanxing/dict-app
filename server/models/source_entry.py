from db import db
from datetime import datetime, timezone


class SourceEntry(db.Model):
    __tablename__ = 'source_entries'
    __table_args__ = (
        db.UniqueConstraint('project_id', 'key', 'locale', name='uq_project_key_locale'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.String(12), db.ForeignKey('projects.id'), nullable=False)
    key = db.Column(db.String(500), nullable=False)
    locale = db.Column(db.String(20), nullable=False)
    value = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.String(30), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = db.Column(db.String(30), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'key': self.key,
            'locale': self.locale,
            'value': self.value,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }
