import os
from flask import Flask, jsonify, request, make_response
from flask_socketio import SocketIO, emit, join_room
from flask_admin import Admin
from flask_admin.theme import Bootstrap4Theme
from flask_admin.contrib.sqla import ModelView
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")
app.config["JWT_TOKEN_LOCATION"] = ["headers"]

jwt = JWTManager(app)
bcrypt = Bcrypt(app)
socketio = SocketIO()

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


class GameSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Lobby Name
    name = db.Column(db.String(100), nullable=True)
    # Foreign Keys
    white_player_id = db.Column(
        db.Integer, db.ForeignKey("user_credentials.id"), nullable=False
    )
    black_player_id = db.Column(
        db.Integer, db.ForeignKey("user_credentials.id"), nullable=True
    )

    # Chess Data
    current_fen = db.Column(
        db.String, default="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
    )

    move_history = db.Column(db.Text, default="")

    status = db.Column(db.String(20), default="active")  # active, checkmate, draw
    winner_id = db.Column(
        db.Integer, db.ForeignKey("user_credentials.id"), nullable=True
    )
    increment_seconds = db.Column(db.Integer, default=0)

    def __init__(
        self, name, white_player_id, black_player_id=None, increment_seconds=0
    ):
        self.name = name
        self.white_player_id = white_player_id
        self.black_player_id = black_player_id
        self.increment_seconds = increment_seconds


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

        return jsonify({"message": "Login successful!", "token": access_token}), 200

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


@app.route("/fetch", methods=["GET"])
@jwt_required()
def fetch():
    totalMatches = GameSession.query.all()
    gameList = []

    for i in totalMatches:
        gameList.append(
            {
                "id": i.id,
                "name": i.name,
                "increment_seconds": i.increment_seconds,
                "status": i.status,
            }
        )

    return jsonify(gameList), 200


@app.route("/games", methods=["POST"])
@jwt_required()
def games():
    current_username = get_jwt_identity()
    user = UserCredentials.query.filter_by(username=current_username).first()

    if user is None:
        return jsonify(({"error": "Authentication failed!"})), 404

    data = request.json
    lobby_name = data.get("name")

    if not lobby_name or lobby_name.strip() == "":
        return jsonify({"error": "Please provide a name for your lobby!"}), 400

    new_session = GameSession(
        name=lobby_name,
        white_player_id=user.id,
        black_player_id=None,
        increment_seconds=data.get("increment"),
    )

    db.session.add(new_session)
    db.session.commit()

    return jsonify({"Game_id: ": new_session.id, "message": "Game Created!"}), 201


@app.route("/join/<int:match_id>", methods=["POST"])
@jwt_required()
def join_match(match_id):
    userId = get_jwt_identity()
    game = GameSession.query.get(match_id)

    if not game:
        return jsonify({"error": "Game not found"}), 401

    if game.status != "active":
        return {"error": "This match is no longer active"}, 400

    game.black_player_id = userId

    db.session.commit()

    return {"message": f"Successfully joined {game.name}!"}, 200


# Initialization SQL
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    socketio.init_app(app, cors_allowed_origins="*")
    port = int(os.environ.get("PORT", 5001))
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
