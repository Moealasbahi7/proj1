from database import db

class Genre(db.Model):
    __tablename__ = "genres"

    id = db.Column(db.Integer, primary_key=True)
    nom = db.Column(db.String(100), nullable=False, unique=True)

    films = db.relationship("Film", backref="genre", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Genre {self.nom}>"
