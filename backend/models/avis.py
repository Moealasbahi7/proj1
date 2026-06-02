from database import db
from datetime import datetime

class Avis(db.Model):
    __tablename__ = "avis"

    id = db.Column(db.Integer, primary_key=True)
    auteur = db.Column(db.String(100), nullable=False)
    note = db.Column(db.Integer, nullable=False)
    commentaire = db.Column(db.Text)
    date = db.Column(db.DateTime, default=datetime.utcnow)

    film_id = db.Column(
        db.Integer,
        db.ForeignKey("films.id"),
        nullable=False
    )

    def __repr__(self):
        return f"<Avis {self.auteur} - {self.note}/5>"
