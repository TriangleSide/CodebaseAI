package migrations

import (
	"context"

	"github.com/TriangleSide/CodebaseAI/pkg/db"
	basemigration "github.com/TriangleSide/GoBase/pkg/database/migration"
	"github.com/TriangleSide/GoBase/pkg/logger"
)

func init() {
	basemigration.MustRegister(&basemigration.Registration{
		Order:   1,
		Enabled: true,
		Migrate: func(ctx context.Context) error {
			database, err := db.NewSQLiteDB()
			if err != nil {
				return err
			}
			defer func() {
				if err = database.Close(); err != nil {
					logger.Errorf(ctx, "Failed to close database connection: %s", err.Error())
				}
			}()
			_, err = database.DB().ExecContext(ctx, `
				CREATE TABLE IF NOT EXISTS projects (
					id INTEGER PRIMARY KEY AUTOINCREMENT,
					path TEXT NOT NULL UNIQUE,
					create_time DATETIME NOT NULL,
					update_time DATETIME NOT NULL
				);
			`)
			return err
		},
	})
}
