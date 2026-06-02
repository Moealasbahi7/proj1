from flask import Flask, request, jsonify
from database import db
from models.genre import Genre
from models.film import Film
from models.avis import Avis
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes with proper configuration
cors = CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:5174", "http://localhost:5173", "http://127.0.0.1:5001", "http://192.168.1.85:5174"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True
    }
})

app.json.ensure_ascii = False

# Configuration SQLite (no PostgreSQL needed!)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///cinetheque.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Initialisation SQLAlchemy
db.init_app(app)

# Création des tables
with app.app_context():
    db.create_all()


# =====================================
# Route de test
# =====================================

@app.route("/")
def home():
    return {
        "message": "API Cinémathèque OK"
    }


# =====================================
# Liste des genres
# =====================================

@app.route("/genres")
def get_genres():
    genres = Genre.query.all()
    resultat = []
    for genre in genres:
        resultat.append({
            "id": genre.id,
            "nom": genre.nom
        })
    return jsonify(resultat)


# =====================================
# Ajouter un film
# =====================================

@app.route("/films", methods=["POST"])
def ajouter_film():
    data = request.get_json()

    # Validation des champs obligatoires
    required_fields = ["titre", "realisateur", "annee", "synopsis", "genre_id"]
    for field in required_fields:
        if field not in data or not data[field]:
            return {
                "message": f"Le champ '{field}' est obligatoire"
            }, 400

    # Validation du genre
    genre = Genre.query.get(data["genre_id"])
    if not genre:
        return {
            "message": "Genre inexistant"
        }, 404

    try:
        film = Film(
            titre=data["titre"],
            realisateur=data["realisateur"],
            annee=int(data["annee"]),
            synopsis=data["synopsis"],
            genre_id=int(data["genre_id"])
        )
        db.session.add(film)
        db.session.commit()
        return {
            "message": "Film ajouté avec succès",
            "id": film.id
        }, 201
    except Exception as e:
        db.session.rollback()
        return {
            "message": f"Erreur: {str(e)}"
        }, 400


# =====================================
# Liste des films
# =====================================

@app.route("/films")
def get_films():
    films = Film.query.all()
    resultat = []
    
    for film in films:
        resultat.append({
            "id": film.id,
            "titre": film.titre,
            "realisateur": film.realisateur,
            "annee": film.annee,
            "synopsis": film.synopsis,
            "genre_id": film.genre_id,
            "genre_nom": film.genre.nom,
            "note_moyenne": film.get_note_moyenne(),
            "avis": [
                {
                    "id": avis.id,
                    "auteur": avis.auteur,
                    "note": avis.note,
                    "commentaire": avis.commentaire,
                    "date": avis.date.isoformat()
                }
                for avis in film.avis
            ]
        })

    return jsonify(resultat)


# =====================================
# Détail d'un film
# =====================================

@app.route("/films/<int:id>")
def get_film(id):
    film = Film.query.get_or_404(id)

    return jsonify({
        "id": film.id,
        "titre": film.titre,
        "realisateur": film.realisateur,
        "annee": film.annee,
        "synopsis": film.synopsis,
        "genre_id": film.genre_id,
        "genre_nom": film.genre.nom,
        "note_moyenne": film.get_note_moyenne(),
        "avis": [
            {
                "id": avis.id,
                "auteur": avis.auteur,
                "note": avis.note,
                "commentaire": avis.commentaire,
                "date": avis.date.isoformat()
            }
            for avis in film.avis
        ]
    })


# =====================================
# Modifier un film
# =====================================

@app.route("/films/<int:id>", methods=["PUT"])
def modifier_film(id):
    film = Film.query.get_or_404(id)
    data = request.get_json()

    try:
        if "titre" in data and data["titre"]:
            film.titre = data["titre"]
        if "realisateur" in data and data["realisateur"]:
            film.realisateur = data["realisateur"]
        if "annee" in data and data["annee"]:
            film.annee = int(data["annee"])
        if "synopsis" in data and data["synopsis"]:
            film.synopsis = data["synopsis"]
        if "genre_id" in data and data["genre_id"]:
            genre = Genre.query.get(data["genre_id"])
            if not genre:
                return {"message": "Genre inexistant"}, 404
            film.genre_id = int(data["genre_id"])

        db.session.commit()
        return {
            "message": "Film modifié avec succès"
        }, 200
    except Exception as e:
        db.session.rollback()
        return {
            "message": f"Erreur: {str(e)}"
        }, 400


# =====================================
# Supprimer un film
# =====================================

@app.route("/films/<int:id>", methods=["DELETE"])
def supprimer_film(id):
    film = Film.query.get_or_404(id)

    try:
        avis = Avis.query.filter_by(film_id=id).all()
        for a in avis:
            db.session.delete(a)

        db.session.delete(film)
        db.session.commit()
        return {
            "message": "Film et avis supprimés avec succès"
        }, 200
    except Exception as e:
        db.session.rollback()
        return {
            "message": f"Erreur: {str(e)}"
        }, 400


# =====================================
# Ajouter un avis
# =====================================

@app.route("/avis", methods=["POST"])
def ajouter_avis():
    data = request.get_json()

    # Validation des champs obligatoires
    if not data.get("film_id") or not data.get("auteur") or "note" not in data:
        return {
            "message": "film_id, auteur et note sont obligatoires"
        }, 400

    # Validation de la note (1-5)
    try:
        note = int(data["note"])
        if note < 1 or note > 5:
            return {
                "message": "La note doit être entre 1 et 5"
            }, 400
    except ValueError:
        return {
            "message": "La note doit être un nombre"
        }, 400

    # Vérification du film
    film = Film.query.get(data["film_id"])
    if not film:
        return {
            "message": "Film introuvable"
        }, 404

    try:
        avis = Avis(
            auteur=data["auteur"],
            note=note,
            commentaire=data.get("commentaire", ""),
            film_id=int(data["film_id"])
        )
        db.session.add(avis)
        db.session.commit()
        return {
            "message": "Avis ajouté avec succès",
            "id": avis.id
        }, 201
    except Exception as e:
        db.session.rollback()
        return {
            "message": f"Erreur: {str(e)}"
        }, 400


# =====================================
# Liste des avis
# =====================================

@app.route("/avis")
def get_avis():
    avis_liste = Avis.query.all()
    resultat = []

    for avis in avis_liste:
        resultat.append({
            "id": avis.id,
            "auteur": avis.auteur,
            "note": avis.note,
            "commentaire": avis.commentaire,
            "date": avis.date.isoformat(),
            "film_id": avis.film_id
        })

    return jsonify(resultat)


# =====================================
# Avis d'un film spécifique
# =====================================

@app.route("/films/<int:id>/avis")
def get_avis_film(id):
    film = Film.query.get_or_404(id)
    avis_liste = Avis.query.filter_by(film_id=id).all()
    resultat = []

    for avis in avis_liste:
        resultat.append({
            "id": avis.id,
            "auteur": avis.auteur,
            "note": avis.note,
            "commentaire": avis.commentaire,
            "date": avis.date.isoformat()
        })

    return jsonify(resultat)


# =====================================
# Note moyenne d'un film
# =====================================

@app.route("/films/<int:id>/note-moyenne")
def get_note_moyenne(id):
    film = Film.query.get_or_404(id)
    note_moyenne = film.get_note_moyenne()

    return jsonify({
        "film_id": id,
        "note_moyenne": note_moyenne,
        "nombre_avis": len(film.avis)
    })


# =====================================
# Supprimer un avis
# =====================================

@app.route("/avis/<int:id>", methods=["DELETE"])
def supprimer_avis(id):
    avis = Avis.query.get_or_404(id)

    try:
        db.session.delete(avis)
        db.session.commit()
        return {
            "message": "Avis supprimé avec succès"
        }, 200
    except Exception as e:
        db.session.rollback()
        return {
            "message": f"Erreur: {str(e)}"
        }, 400


# =====================================
# Add some test genres if none exist
# =====================================

@app.route("/setup", methods=["POST"])
def setup():
    """Setup initial genres"""
    try:
        if Genre.query.count() == 0:
            genres = [
                Genre(nom="Action"),
                Genre(nom="Comédie"),
                Genre(nom="Drame"),
                Genre(nom="Science-Fiction"),
                Genre(nom="Horreur"),
                Genre(nom="Aventure"),
            ]
            for genre in genres:
                db.session.add(genre)
            db.session.commit()
            return {"message": "Genres créés avec succès"}
        return {"message": "Genres déjà existants"}
    except Exception as e:
        db.session.rollback()
        return {"message": f"Erreur: {str(e)}"}, 400


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )