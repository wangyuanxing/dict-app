from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def init_db(app):
    db.init_app(app)
    with app.app_context():
        from models.project import Project
        from models.source_entry import SourceEntry
        from models.translation import Translation
        from models.translation_task import TranslationTask
        from models.llm_config import LlmConfig
        db.create_all()

        # Mark stale processing tasks as failed
        TranslationTask.query.filter_by(status='processing').update(
            {'status': 'failed', 'error_message': 'Server restarted while task was running. Retry manually.'}
        )
        db.session.commit()
