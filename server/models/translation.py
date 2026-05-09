from db import db
from datetime import datetime, timezone


class Translation(db.Model):
    __tablename__ = 'translations'
    __table_args__ = (
        db.UniqueConstraint('source_entry_id', 'target_locale', name='uq_source_target'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.String(12), db.ForeignKey('projects.id'), nullable=False)
    source_entry_id = db.Column(db.Integer, db.ForeignKey('source_entries.id'), nullable=False)
    target_locale = db.Column(db.String(20), nullable=False)
    translated_value = db.Column(db.Text)
    status = db.Column(db.String(20), nullable=False, default='pending')
    task_id = db.Column(db.String(36), db.ForeignKey('translation_tasks.id'), nullable=True)
    created_at = db.Column(db.String(30), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())
    updated_at = db.Column(db.String(30), nullable=False, default=lambda: datetime.now(timezone.utc).isoformat())

    source_entry = db.relationship('SourceEntry', backref='translations')

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'source_entry_id': self.source_entry_id,
            'key': self.source_entry.key if self.source_entry else None,
            'source_value': self.source_entry.value if self.source_entry else None,
            'target_locale': self.target_locale,
            'translated_value': self.translated_value,
            'status': self.status,
            'task_id': self.task_id,
            'created_at': self.created_at,
            'updated_at': self.updated_at,
        }
