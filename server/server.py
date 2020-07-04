import flask
import app.routes
app = flask.Flask(__name__)

# @app.route("/")
# def index():
#     rows = [i+1 for i in range(10)]
#     columns = [chr(i+ord('A')) for i in range(10)]
#     return flask.render_template('index.html', rows=rows, columns=columns)



# from flask import Flask
# from config import Config
# from flask_sqlalchemy import SQLAlchemy

# app = Flask(__name__)
# app.config.from_object(Config)
# db = SQLAlchemy(app)

from app import routes, models, db
from app.models import Table

# class Table(db.Model):
#     position = db.Column(db.String(4))
#     content = db.Column(db.String(64))

#     def __repr__(self):
#         return '<User {}>'.format(self.content)

from app import app
