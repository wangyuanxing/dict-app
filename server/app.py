from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from db import init_db


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    CORS(app, supports_credentials=True)
    init_db(app)

    from api.project_routes import project_bp
    from api.cli_routes import cli_bp
    from api.locale_routes import locale_bp
    from api.task_routes import task_bp
    from api.llm_config_routes import llm_config_bp
    app.register_blueprint(project_bp, url_prefix='/api/v1')
    app.register_blueprint(cli_bp, url_prefix='/api/v1')
    app.register_blueprint(locale_bp, url_prefix='/api/v1')
    app.register_blueprint(task_bp, url_prefix='/api/v1')
    app.register_blueprint(llm_config_bp, url_prefix='/api/v1')

    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({'error': 'bad_request', 'message': str(e.description)}), 400

    @app.errorhandler(401)
    def unauthorized(e):
        return jsonify({'error': 'auth', 'message': str(e.description)}), 401

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({'error': 'not_found', 'message': str(e.description)}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({'error': 'internal', 'message': 'An unexpected error occurred'}), 500

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(debug=True, port=5000)
