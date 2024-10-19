package db

import (
	"database/sql"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

const (
	driverName   = "sqlite3"
	databaseFile = "sqlite.db"
)

type SQLiteDB struct {
	db *sql.DB
}

func NewSQLiteDB() (*SQLiteDB, error) {
	db, err := sql.Open(driverName, databaseFile)
	if err != nil {
		return nil, fmt.Errorf("failed to open the database (%s)", err.Error())
	}
	return &SQLiteDB{
		db: db,
	}, nil
}

func (s *SQLiteDB) Close() error {
	return s.db.Close()
}

func (s *SQLiteDB) DB() *sql.DB {
	return s.db
}
