import { useEffect, useState } from "react";
import api from "./services/api";
import "./App.css";

function App() {
  const [page, setPage] = useState("list"); // list or detail
  const [films, setFilms] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedFilm, setSelectedFilm] = useState(null);

  // Form states pour ajouter/modifier un film
  const [titre, setTitre] = useState("");
  const [realisateur, setRealisateur] = useState("");
  const [annee, setAnnee] = useState("");
  const [synopsis, setSynopsis] = useState("");
  const [genreId, setGenreId] = useState("");
  const [filmEnEdition, setFilmEnEdition] = useState(null);

  // Form states pour ajouter un avis
  const [auteur, setAuteur] = useState("");
  const [note, setNote] = useState("");
  const [commentaire, setCommentaire] = useState("");

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success");

  // Charger les genres
  const chargerGenres = () => {
    api
      .get("/genres")
      .then((response) => {
        setGenres(response.data);
      })
      .catch((error) => {
        console.error(error);
        afficherMessage("Erreur lors du chargement des genres", "error");
      });
  };

  // Charger les films
  const chargerFilms = () => {
    api
      .get("/films")
      .then((response) => {
        setFilms(response.data);
      })
      .catch((error) => {
        console.error(error);
        afficherMessage("Erreur lors du chargement des films", "error");
      });
  };

  useEffect(() => {
    chargerGenres();
    chargerFilms();
  }, []);

  const afficherMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 3000);
  };

  // Ajouter ou modifier un film
  const ajouterOuModifierFilm = async () => {
    if (!titre || !realisateur || !annee || !synopsis || !genreId) {
      afficherMessage("Tous les champs sont obligatoires", "error");
      return;
    }

    try {
      if (filmEnEdition) {
        await api.put(`/films/${filmEnEdition}`, {
          titre,
          realisateur,
          annee: Number(annee),
          synopsis,
          genre_id: Number(genreId),
        });
        afficherMessage("Film modifié avec succès");
      } else {
        await api.post("/films", {
          titre,
          realisateur,
          annee: Number(annee),
          synopsis,
          genre_id: Number(genreId),
        });
        afficherMessage("Film ajouté avec succès");
      }

      reinitialiserFormulaireFilm();
      chargerFilms();
    } catch (error) {
      afficherMessage(
        error.response?.data?.message || "Erreur lors de l'opération",
        "error"
      );
    }
  };

  const reinitialiserFormulaireFilm = () => {
    setTitre("");
    setRealisateur("");
    setAnnee("");
    setSynopsis("");
    setGenreId("");
    setFilmEnEdition(null);
  };

  const editerFilm = (film) => {
    setFilmEnEdition(film.id);
    setTitre(film.titre);
    setRealisateur(film.realisateur);
    setAnnee(film.annee);
    setSynopsis(film.synopsis);
    setGenreId(film.genre_id);
    setPage("list");
  };

  const supprimerFilm = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce film ?")) {
      try {
        await api.delete(`/films/${id}`);
        afficherMessage("Film supprimé avec succès");
        chargerFilms();
      } catch (error) {
        afficherMessage(
          error.response?.data?.message || "Erreur lors de la suppression",
          "error"
        );
      }
    }
  };

  // Ajouter un avis à un film
  const ajouterAvis = async () => {
    if (!auteur || !note || !selectedFilm) {
      afficherMessage("Remplissez tous les champs", "error");
      return;
    }

    if (note < 1 || note > 5) {
      afficherMessage("La note doit être entre 1 et 5", "error");
      return;
    }

    try {
      await api.post("/avis", {
        auteur,
        note: Number(note),
        commentaire,
        film_id: selectedFilm.id,
      });
      afficherMessage("Avis ajouté avec succès");
      reinitialiserFormulaireAvis();
      chargerFilms();
      // Rafraîchir le film sélectionné
      const filmMisAJour = films.find((f) => f.id === selectedFilm.id);
      if (filmMisAJour) {
        setSelectedFilm(filmMisAJour);
      }
    } catch (error) {
      afficherMessage(
        error.response?.data?.message || "Erreur lors de l'ajout de l'avis",
        "error"
      );
    }
  };

  const reinitialiserFormulaireAvis = () => {
    setAuteur("");
    setNote("");
    setCommentaire("");
  };

  const supprimerAvis = async (avisId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet avis ?")) {
      try {
        await api.delete(`/avis/${avisId}`);
        afficherMessage("Avis supprimé avec succès");
        chargerFilms();
        // Rafraîchir le film sélectionné
        const filmMisAJour = films.find((f) => f.id === selectedFilm.id);
        if (filmMisAJour) {
          setSelectedFilm(filmMisAJour);
        }
      } catch (error) {
        afficherMessage(
          error.response?.data?.message || "Erreur lors de la suppression",
          "error"
        );
      }
    }
  };

  const afficherDetailFilm = (film) => {
    setSelectedFilm(film);
    setPage("detail");
    reinitialiserFormulaireAvis();
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>🎬 Cinémathèque Collaborative</h1>
      </header>

      {message && <div className={`message message-${messageType}`}>{message}</div>}

      {page === "list" ? (
        <div className="list-page">
          {/* Formulaire d'ajout/modification */}
          <div className="form-section">
            <h2>{filmEnEdition ? "Modifier un film" : "Ajouter un film"}</h2>

            <div className="form-group">
              <input
                type="text"
                placeholder="Titre"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="text"
                placeholder="Réalisateur"
                value={realisateur}
                onChange={(e) => setRealisateur(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <input
                type="number"
                placeholder="Année"
                value={annee}
                onChange={(e) => setAnnee(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <textarea
                placeholder="Synopsis"
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className="form-input"
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <select
                value={genreId}
                onChange={(e) => setGenreId(e.target.value)}
                className="form-input"
              >
                <option value="">Sélectionnez un genre</option>
                {genres.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-buttons">
              <button onClick={ajouterOuModifierFilm} className="btn btn-primary">
                {filmEnEdition ? "Mettre à jour" : "Ajouter"}
              </button>
              {filmEnEdition && (
                <button
                  onClick={reinitialiserFormulaireFilm}
                  className="btn btn-secondary"
                >
                  Annuler
                </button>
              )}
            </div>
          </div>

          {/* Liste des films */}
          <div className="films-section">
            <h2>Films ({films.length})</h2>

            {films.length === 0 ? (
              <p className="no-films">Aucun film trouvé. Commencez par en ajouter un !</p>
            ) : (
              <div className="films-grid">
                {films.map((film) => (
                  <div key={film.id} className="film-card">
                    <h3>{film.titre}</h3>
                    <p>
                      <strong>Réalisateur :</strong> {film.realisateur}
                    </p>
                    <p>
                      <strong>Année :</strong> {film.annee}
                    </p>
                    <p>
                      <strong>Genre :</strong> {film.genre_nom}
                    </p>
                    {film.note_moyenne !== null && (
                      <p className="rating">
                        <strong>⭐ Note moyenne :</strong> {film.note_moyenne}/5 (
                        {film.avis.length} avis)
                      </p>
                    )}
                    <p className="synopsis">{film.synopsis}</p>

                    <div className="film-actions">
                      <button
                        onClick={() => afficherDetailFilm(film)}
                        className="btn btn-info"
                      >
                        Voir détails
                      </button>
                      <button
                        onClick={() => editerFilm(film)}
                        className="btn btn-warning"
                      >
                        Modifier
                      </button>
                      <button
                        onClick={() => supprimerFilm(film.id)}
                        className="btn btn-danger"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="detail-page">
          <button onClick={() => setPage("list")} className="btn btn-back">
            ← Retour à la liste
          </button>

          {selectedFilm && (
            <>
              <div className="film-detail">
                <h2>{selectedFilm.titre}</h2>
                <p>
                  <strong>Réalisateur :</strong> {selectedFilm.realisateur}
                </p>
                <p>
                  <strong>Année :</strong> {selectedFilm.annee}
                </p>
                <p>
                  <strong>Genre :</strong> {selectedFilm.genre_nom}
                </p>
                {selectedFilm.note_moyenne !== null && (
                  <p className="rating-large">
                    <strong>⭐ Note moyenne :</strong> {selectedFilm.note_moyenne}/5
                  </p>
                )}
                <p className="synopsis-detail">{selectedFilm.synopsis}</p>
              </div>

              {/* Formulaire d'ajout d'avis */}
              <div className="avis-form-section">
                <h3>Ajouter un avis</h3>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Votre nom"
                    value={auteur}
                    onChange={(e) => setAuteur(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <select
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="form-input"
                  >
                    <option value="">Note (1-5)</option>
                    <option value="1">1 - Mauvais</option>
                    <option value="2">2 - Moyen</option>
                    <option value="3">3 - Bon</option>
                    <option value="4">4 - Très bon</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                </div>

                <div className="form-group">
                  <textarea
                    placeholder="Votre commentaire (optionnel)"
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    className="form-input"
                    rows="3"
                  ></textarea>
                </div>

                <button onClick={ajouterAvis} className="btn btn-primary">
                  Ajouter l'avis
                </button>
              </div>

              {/* Liste des avis */}
              <div className="avis-section">
                <h3>Avis ({selectedFilm.avis.length})</h3>

                {selectedFilm.avis.length === 0 ? (
                  <p>Aucun avis pour le moment.</p>
                ) : (
                  <div className="avis-list">
                    {selectedFilm.avis.map((avis) => (
                      <div key={avis.id} className="avis-card">
                        <div className="avis-header">
                          <strong>{avis.auteur}</strong>
                          <span className="avis-note">⭐ {avis.note}/5</span>
                        </div>
                        <p className="avis-date">
                          {new Date(avis.date).toLocaleDateString("fr-FR")}
                        </p>
                        <p>{avis.commentaire}</p>
                        <button
                          onClick={() => supprimerAvis(avis.id)}
                          className="btn btn-danger-small"
                        >
                          Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
