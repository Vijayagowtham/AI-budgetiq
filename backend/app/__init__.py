from flask import Flask, jsonify
from flask_cors import CORS
from config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)

    with app.app_context():
        import app.extensions as extensions
        try:
            if Config.SUPABASE_URL and Config.SUPABASE_KEY:
                extensions.supabase_client = extensions.init_supabase()
        except Exception as e:
            print(f"Failed to initialize Supabase: {e}")

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
