package db

import (
	"database/sql"
	_ "embed"
	"fmt"

	_ "github.com/mattn/go-sqlite3"
)

const (
	driverName   = "sqlite3"
	databaseFile = "sqlite.db"
)

var (
	//go:embed initialize.sql
	initializeSql string
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

func (s *SQLiteDB) InitializeDB() error {
	_, err := s.db.Exec(initializeSql)
	if err != nil {
		return fmt.Errorf("failed to execute query (%s)", err.Error())
	}
	return nil
}

func (s *SQLiteDB) Close() error {
	return s.db.Close()
}

func (s *SQLiteDB) DB() *sql.DB {
	return s.db
}
