import os
import chess
import eventlet

eventlet.monkey_patch()
from flask import Flask, jsonify, request
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

# --- CONFIGURATION ---
app.config["JWT_SECRET_KEY"] = os.environ.get(
    "JWT_SECRET_KEY", "super-secret-fallback-key"
)
app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["FLASK_ADMIN_SWATCH"] = "cerulean"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["BCRYPT_LOG_ROUNDS"] = 10

# Database Setup (Railway Postgres safe)
database_url = os.environ.get("DATABASE_URL", "sqlite:///local.db")
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)
app.config["SQLALCHEMY_DATABASE_URI"] = database_url

# --- INITIALIZATION ---
db = SQLAlchemy(app)
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# Dynamic CORS: Allows Railway URL + Local Mac URLs
cors_origin = os.environ.get("CORS_ORIGINS", "")
allowed_origins = [
    o for o in [cors_origin, "http://localhost:5173", "http://localhost:8080"] if o
]

CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins=allowed_origins)


# --- MODELS ---
class UserCredentials(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, nullable=False)

    def checkPassword(self, passwordAttempt):
        return bcrypt.check_password_hash(self.password, passwordAttempt)


class GameSession(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)
    white_player_id = db.Column(
        db.Integer, db.ForeignKey("user_credentials.id"), nullable=False
    )
    black_player_id = db.Column(
        db.Integer, db.ForeignKey("user_credentials.id"), nullable=True
    )
    status = db.Column(db.String(20), default="active")  # active, full, checkmate, draw


# --- ADMIN ---
admin = Admin(app, name="Chess Admin", theme=Bootstrap4Theme(swatch="cerulean"))
admin.add_view(ModelView(UserCredentials, db.session))
admin.add_view(ModelView(GameSession, db.session))

# --- MEMORY STORE (For active Socket.io engines) ---
games = {}


# --- REST ROUTES (Auth) ---
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
        addUser = UserCredentials(username=username, password=hashedPW)
        db.session.add(addUser)
        db.session.commit()
        return jsonify({"message": "Success!"}), 201

    return jsonify({"error": "User already exists!"}), 400


@app.route("/login", methods=["POST"])
def login():
    data = request.json
    user = UserCredentials.query.filter_by(username=data.get("username")).first()

    # Utilizing the custom checkPassword function from the model
    if user and user.checkPassword(data.get("password")):
        access_token = create_access_token(identity=str(user.id))
        return jsonify({"message": "Login successful!", "token": access_token}), 200

    return jsonify({"error": "Invalid credentials!"}), 400


# --- REST ROUTES (Protected App Logic) ---
@app.route("/me", methods=["GET"])
@jwt_required()
def fetchUser():
    user_id = get_jwt_identity()
    user = UserCredentials.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify({"id": user.id, "username": user.username}), 200


@app.route("/fetch", methods=["GET"])
@jwt_required()
def fetch():
    totalMatches = GameSession.query.all()
    gameList = [
        {
            "id": i.id,
            "name": i.name,
            "status": i.status,
        }
        for i in totalMatches
    ]
    return jsonify(gameList), 200


@app.route("/games", methods=["POST"])
@jwt_required()
def create_game():
    user_id = get_jwt_identity()
    data = request.json
    lobby_name = data.get("name")

    if not lobby_name or lobby_name.strip() == "":
        return jsonify({"error": "Please provide a name for your lobby!"}), 400

    new_session = GameSession(
        name=lobby_name,
        white_player_id=user_id,
    )
    db.session.add(new_session)
    db.session.commit()
    return jsonify({"Game_id": new_session.id, "message": "Game Created!"}), 201


@app.route("/join/<int:match_id>", methods=["POST"])
@jwt_required()
def join_match(match_id):
    user_id = get_jwt_identity()
    game = GameSession.query.get(match_id)

    if not game:
        return jsonify({"error": "Game not found"}), 404
    if game.status != "active":
        return jsonify({"error": "This match is no longer active"}), 400
    if str(game.white_player_id) == str(user_id):
        return jsonify({"error": "You are already the White player"}), 400
    if str(game.white_player_id) == str(user_id) or str(game.black_player_id) == str(
        user_id
    ):
        return jsonify({"message": "Welcome back!"}), 200

    if game.black_player_id is None:
        game.black_player_id = user_id
        game.status = "full"
        db.session.commit()
        return jsonify({"message": f"Successfully joined {game.name}!"}), 200

    return jsonify({"error": "Black player slot is already taken"}), 400


# --- SOCKET.IO REAL-TIME LOGIC ---
@socketio.on("join_game")
def handle_join(data):
    try:
        room = str(data["room"])
        join_room(room)

        if room not in games:
            games[room] = {"board": chess.Board(), "white": request.sid, "black": None}
            emit("assign_color", "w")
            emit("player_status", {"ready": False, "msg": "Waiting for opponent..."})

        elif games[room]["black"] is None and games[room]["white"] != request.sid:
            games[room]["black"] = request.sid
            emit("assign_color", "b")
            emit("game_ready", {"ready": True}, to=room)

        elif games[room]["white"] is not None and games[room]["black"] is not None:
            emit("game_ready", {"ready": True})

        emit("move_update", games[room]["board"].fen())
    except Exception as e:
        print(f"Socket Join Error: {e}")


@socketio.on("make_move")
def handle_move(data):
    try:
        room = str(data["room"])
        move_data = data["move"]
        game = games.get(room)

        if not game:
            return

        board = game["board"]
        player_id = request.sid
        current_turn = "w" if board.turn == chess.WHITE else "b"

        # Turn & Player Validation
        if (current_turn == "w" and player_id != game.get("white")) or (
            current_turn == "b" and player_id != game.get("black")
        ):
            emit("error", "Not your turn!")
            return

        # Move execution
        move = chess.Move.from_uci(move_data)
        if move in board.legal_moves:
            board.push(move)
            emit("move_update", board.fen(), to=room)
        else:
            emit("error", "Invalid move!")
    except (ValueError, chess.InvalidMoveError, chess.IllegalMoveError):
        emit("error", "Illegal move format!")
    except Exception as e:
        print(f"Socket Move Error: {e}")


@socketio.on("disconnect")
def handle_disconnect():
    player_id = request.sid

    for room, game in list(games.items()):
        if game["white"] == player_id or game["black"] == player_id:
            emit(
                "player_status",
                {"ready": False, "msg": "Opponent disconnected."},
                to=room,
            )

            if game["white"] == player_id:
                game["white"] = None
            else:
                game["black"] = None

            if game["white"] is None and game["black"] is None:
                del games[room]
                print(f"Room {room} deleted from server memory.")
                try:
                    db_game = GameSession.query.get(int(room))
                    if db_game:
                        db.session.delete(db_game)
                        db.session.commit()
                        print(f"Room {room} deleted from database.")
                except Exception as e:
                    print(f"Database cleanup error: {e}")
                finally:
                    db.session.remove()

            break


# --- STARTUP ---
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    print(f"Starting Railway-ready server on port {port}...")
    socketio.run(app, host="0.0.0.0", port=port, debug=True)
