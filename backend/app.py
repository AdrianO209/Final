from flask import Flask
from flask_admin import Admin
from flask_admin.theme import Bootstrap4Theme
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
# Admin
app.config["FLASK_ADMIN_SWATCH"] = "cerulean"

admin = Admin(app, name="microblog", theme=Bootstrap4Theme(swatch="cerulean"))

# Database
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///data.db"
db = SQLAlchemy(app)


class UserCreditials(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, unique=False, nullable=False)


if __name__ == "__main__":
    with app.app_context():
        db.create_all()
    app.run(port=5001)
