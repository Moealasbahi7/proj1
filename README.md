# 🎬 Cinéthèque Collaborative

Application web permettant à une communauté de cinéphiles de gérer un catalogue de films, de les classer par genre et de déposer des avis notés.

## Stack technique

- **Backend** : Python 3.11 + Flask + SQLAlchemy
- **Base de données** : PostgreSQL 15
- **Frontend** : React 18 + Vite
- **Conteneur** : Docker + Docker Compose

## Lancement du projet

### Prérequis
- Docker Desktop installé et lancé

### Démarrer l'application

```bash
git clone https://github.com/Moealasbahi7/proj1.git
cd proj1
docker-compose up --build
```

L'application est ensuite accessible sur :
- **Frontend** → http://localhost:5173
- **API Backend** → http://localhost:5001

## Fonctionnalités

- Gestion complète des films (ajout, modification, suppression)
- Classement par genre
- Dépôt d'avis notés (1 à 5)
- Note moyenne calculée automatiquement
- Suppression en cascade des avis lors de la suppression d'un film

## Équipe

- Moe Alasbahi
- Sana Zouaoui
- Mia Teixeira
- Lucas BRUNSCHWIG