# API JSON entre deux conteneurs

Le projet contient deux applications Spring Boot. Sous Linux, Compose utilise le réseau hôte afin que les deux conteneurs puissent communiquer via `127.0.0.1`.

- `receiver` expose `POST /api/messages` et sauvegarde le JSON reçu dans `/app/data/received-message.json`.
- `sender` expose `POST /api/send`, lit `/app/data/message.json`, puis l'envoie à `receiver`.

## Démarrer

```bash
docker compose up --build
```

Dans un autre terminal :

```bash
curl -X POST http://localhost:8081/api/send
```

Le message reçu est visible dans le volume Docker `receiver-data` et la réponse du sender confirme le transfert.
