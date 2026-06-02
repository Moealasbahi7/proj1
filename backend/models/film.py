from database import db

class Film(db.Model):
    __tablename__ = "films"

    id = db.Column(db.Integer, primary_key=True)
    titre = db.Column(db.String(255), nullable=False)
    realisateur = db.Column(db.String(255), nullable=False)
    annee = db.Column(db.Integer, nullable=False)
    synopsis = db.Column(db.Text)

    genre_id = db.Column(
        db.Integer,
        db.ForeignKey("genres.id"),
        nullable=False
    )

    avis = db.relationship(
        "Avis",
        backref="film",
        cascade="all, delete-orphan"
    )

    def get_note_moyenne(self):
        """Calculate average rating for this film"""
        if not self.avis:
            return None
        total = sum(avis.note for avis in self.avis)
        return round(total / len(self.avis), 2)

    def __repr__(self):
        return f"<Film {self.titre}>"
