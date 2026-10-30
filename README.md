# SENTINEL-X

## Run with Docker

Requirements: Docker Desktop with Docker Compose enabled.

From the project root, build and start the frontend and backend:

```powershell
docker compose up --build
```

Open the app at <http://localhost:3000>. The API is available through the
frontend proxy at <http://localhost:3000/api/health>, and the API docs at
<http://localhost:3000/docs>.

The UI connects to the API and its WebSocket through the same host, so this
setup also works when Docker is running on a separate host. Stop the services
with:

```powershell
docker compose down
```

The application includes demo accounts for local evaluation:

| Username | Password |
| --- | --- |
| `admin` | `sentinel123` |
| `analyst` | `analyst123` |
| `forensics` | `forensics123` |
