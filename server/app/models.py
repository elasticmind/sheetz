from app import db

class Table(db.Model):
    position = db.Column(db.String(4), primary_key=True)
    content = db.Column(db.String(64))

    def __repr__(self):
        return '<Table {}>'.format(self.content)

    def serialize(self):
        return { self.position: self.content }