import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Allow requests from both local dev and the deployed Vercel frontend
    allowed_origins = [
        "http://localhost:5173",
        "http://localhost:3000",
        "https://ai-budgetiq.vercel.app",
        os.environ.get("FRONTEND_URL", ""),
    ]
    CORS(app, origins=[o for o in allowed_origins if o], supports_credentials=True)

    with app.app_context():
        from app.extensions import init_db
        init_db()

    # Register Blueprints
    try:
        from app.routes.auth_routes import auth_bp
        from app.routes.income_routes import income_bp
        from app.routes.expense_routes import expense_bp
        from app.routes.dashboard_routes import dashboard_bp
        
        app.register_blueprint(auth_bp, url_prefix='/api/auth')
        app.register_blueprint(income_bp, url_prefix='/api/income')
        app.register_blueprint(expense_bp, url_prefix='/api/expense')
        app.register_blueprint(dashboard_bp, url_prefix='/api/dashboard')
    except ImportError as e:
        print(f"Failed to load blueprints: {e}")

    @app.route('/health')
    def health_check():
        return jsonify({"status": "healthy", "service": "BudgetIQ API"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app
