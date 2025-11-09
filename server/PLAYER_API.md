# Player API Endpoints

## Base URL
`http://localhost:PORT/api`

## Endpoints

### 1. Get All Players for a Team
**GET** `/api/players/team/:teamName`

Fetch all players for a specific team, sorted by overall rating (highest first).

**Example:**
```
GET /api/players/team/Athletic Club
```

**Response:**
```json
{
  "team": "Athletic Club",
  "count": 25,
  "players": [
    {
      "_id": "...",
      "name": "Aymeric Laporte",
      "position": "DEF",
      "overall": 85,
      "age": 29,
      "nationality": "Spain",
      "club": "Athletic Club"
    },
    ...
  ]
}
```

---

### 2. Get Individual Player Stats by ID
**GET** `/api/players/:id`

Fetch detailed stats for a specific player by their MongoDB ID.

**Example:**
```
GET /api/players/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "player": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Unai Simon",
    "position": "GK",
    "overall": 81,
    "age": 26,
    "nationality": "Spain",
    "club": "Athletic Club",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. Get Player by Name
**GET** `/api/players/name/:name`

Fetch a player by their exact name.

**Example:**
```
GET /api/players/name/Nico Williams
```

**Response:**
```json
{
  "player": {
    "_id": "...",
    "name": "Nico Williams",
    "position": "FWD",
    "overall": 78,
    "age": 20,
    "nationality": "Spain",
    "club": "Athletic Club"
  }
}
```

---

### 4. Get All Players (with optional filters)
**GET** `/api/players?position=FWD&minOverall=80&nationality=Spain`

Fetch all players with optional query filters.

**Query Parameters:**
- `position` (optional): Filter by position (GK, DEF, MID, FWD)
- `minOverall` (optional): Minimum overall rating
- `nationality` (optional): Filter by nationality

**Examples:**
```
GET /api/players
GET /api/players?position=FWD
GET /api/players?minOverall=80
GET /api/players?position=MID&nationality=Spain
```

**Response:**
```json
{
  "count": 150,
  "players": [
    {
      "_id": "...",
      "name": "Aymeric Laporte",
      "position": "DEF",
      "overall": 85,
      "age": 29,
      "nationality": "Spain",
      "club": "Athletic Club"
    },
    ...
  ]
}
```

---

## Error Responses

**404 Not Found:**
```json
{
  "error": "No players found for team: InvalidTeam"
}
```

**400 Bad Request:**
```json
{
  "error": "Team name is required"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to fetch players: Database connection error"
}
```
