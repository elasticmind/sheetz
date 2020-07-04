from flask import Flask, jsonify, request
from app import db, routes, models, app
from app.models import Table

@app.route("/table/", methods=["GET"])
def table():
    data = Table.query.all()
    result = [[d.position, d.content] for d in data]
    return jsonify(result)

@app.route("/table/", methods=["POST"])
def updateContent():
    try:
        position, content = [request.get_json()[k] for k in ('position', 'content')]
        cell = Table(position=position, content=content)
        db.session.merge(cell)
        db.session.commit()
        return jsonify(success=True)
    except:
        return jsonify(success=False)
