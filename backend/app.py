import os
from flask import Flask, jsonify, request, make_response
from flask_admin import Admin
from flask_admin.theme import Bootstrap4Theme
from flask_admin.contrib.sqla import ModelView
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, set_access_cookies
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
app.config["JWT_COOKIE_SECURE"] = True
app.config["JWT_COOKIE_CSRF_PROTECT"] = True

jwt = JWTManager(app)
bcrypt = Bcrypt(app)

cors_origin = os.environ.get("CORS_ORIGINS")
CORS(
    app,
    resources={r"/*": {"origins": [cors_origin, "http://localhost:8080"]}},
    supports_credentials=True,
)

# Admin
app.config["FLASK_ADMIN_SWATCH"] = "cerulean"

admin = Admin(app, name="Chess", theme=Bootstrap4Theme(swatch="cerulean"))

# Database
database_url = os.environ.get("DATABASE_URL")

if database_url is None:
    raise ValueError("CRITICAL ERROR: DATABASE_URL environment variable is missing!")

if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

app.config["SQLALCHEMY_DATABASE_URI"] = database_url
db = SQLAlchemy(app)


class UserCredentials(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, unique=False, nullable=False)

    def checkPassword(self, passwordAttempt):
        return self.password == passwordAttempt


class GameSession(db.model):
    id = db.Column(db.Integer, primary_key=True)

    # Foreign Keys
    white_player_id = db.Column(
        db.Integer, db.ForeignKey("user_credentials.id"), nullable=False
    )
    black_player_id = db.Column(
        db.Integer, db.ForeignKey("user_credentials.id"), nullable=False
    )

    # Chess Data
    current_fen = db.Column(db.String, default='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1')

    move_history = db.Column(db.Text, default='')
    
tatus = db.Column(db.String(20), default='active') # active, checkmate, draw
    winner_id = db.Column(db.Integer, db.ForeignKey('user_credentials.id'), nullable=True)


# Admin Model Views
admin.add_view(ModelView(UserCredentials, db.session))


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    usernameInput = data.get("username")
    passwordInput = data.get("password")

    user = UserCredentials.query.filter_by(username=usernameInput).first()

    if user and bcrypt.check_password_hash(user.password, passwordInput):
        access_token = create_access_token(identity=user.username)

        response = make_response(jsonify({"message": "Login successful!"}), 200)
        set_access_cookies(response, access_token)

        return response

    return jsonify({"error": "Invalid credentials! Or register a new account!/"}), 400


@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    existingUser = UserCredentials.query.filter_by(username=username).first()

    if existingUser is None:
        hashedPW = bcrypt.generate_password_hash(password).decode("utf-8")
        addUser = UserCredentials(username=username, password=hashedPW)  # type: ignore

        db.session.add(addUser)
        db.session.commit()
        return jsonify({"message": "Success!"}), 201

    return jsonify(({"error": "User already exist!"})), 400


# Initialization SQL
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5001)))
