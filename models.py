from app import db

class Leaderboard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    rank = db.Column(db.Integer, nullable=True)

    def __repr__(self):
        return '<Leaderboard %r>' % self.username