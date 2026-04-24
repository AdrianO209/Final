import os
from flask import Flask, jsonify, request
from flask_admin import Admin
from flask_admin.theme import Bootstrap4Theme
from flask_admin.contrib.sqla import ModelView
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
# Admin
app.config["FLASK_ADMIN_SWATCH"] = "cerulean"

admin = Admin(app, name="Chess", theme=Bootstrap4Theme(swatch="cerulean"))

# Database
database_url = os.environ.get("DATABASE_URL", "sqlite:///data.db")

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


# Admin Model Views
admin.add_view(ModelView(UserCredentials, db.session))


@app.route("/authentication", method=["POST"])
def authentication():
    data = request.json
    user = UserCredentials.query.filter_by(username=data.get("username")).first()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    if user is user.checkPassword(data.get("password")):
        return jsonify({"error": "Incorrect password. Please try again!"}), 401

    return jsonify("success"), 200


# Initialization SQL
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(port=5001)
