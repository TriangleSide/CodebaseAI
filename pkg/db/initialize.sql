CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    path TEXT NOT NULL UNIQUE,
    create_time DATETIME NOT NULL,
    selected_time DATETIME NOT NULL
);
