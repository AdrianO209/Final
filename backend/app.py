import os
from flask import Flask
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


class UserCreditials(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique=True, nullable=False)
    password = db.Column(db.String, unique=False, nullable=False)


# Admin Model Views
admin.add_view(ModelView(UserCreditials, db.session))

# Initialization SQL
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    app.run(port=5001)
