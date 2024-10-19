package migration

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/TriangleSide/CodebaseAI/pkg/db"
	basemigration "github.com/TriangleSide/GoBase/pkg/database/migration"
	"github.com/TriangleSide/GoBase/pkg/logger"
)

const (
	lockExpiryDuration = 5 * time.Minute
)

type manager struct {
	db        *db.SQLiteDB
	machineID string
}

// NewManager creates a new migration manager with a unique machine ID.
func NewManager(db *db.SQLiteDB) basemigration.Manager {
	return &manager{
		db:        db,
		machineID: generateMachineID(),
	}
}

func generateMachineID() string {
	timestamp := time.Now().Format(time.RFC3339Nano)
	pid := os.Getpid()
	return fmt.Sprintf("machine_%s_%d", timestamp, pid)
}

func (m *manager) AcquireDBLock(context.Context) error {
	return nil
}

func (m *manager) EnsureDataStores(ctx context.Context) error {
	createLockTable := `
        CREATE TABLE IF NOT EXISTS migration_lock (
            id INTEGER PRIMARY KEY,
            machine_id TEXT NOT NULL,
            expiry DATETIME NOT NULL
        );
	`

	_, err := m.db.DB().ExecContext(ctx, createLockTable)
	if err != nil {
		return fmt.Errorf("failed to ensure lock table: %w", err)
	}

	createStatusTable := `
        CREATE TABLE IF NOT EXISTS migration_status (
            order_num INTEGER PRIMARY KEY,
            status TEXT NOT NULL
        );
	`

	_, err = m.db.DB().ExecContext(ctx, createStatusTable)
	if err != nil {
		return fmt.Errorf("failed to ensure status table: %w", err)
	}

	return nil
}

func (m *manager) ReleaseDBLock(context.Context) error {
	return nil
}

func (m *manager) AcquireMigrationLock(ctx context.Context) error {
	query := `
        INSERT INTO migration_lock (id, machine_id, expiry)
        VALUES (1, ?, ?)
        ON CONFLICT(id) DO UPDATE SET machine_id = ?, expiry = ?
        WHERE id = 1 AND expiry < ?;
    `
	now := time.Now()
	expiration := now.Add(lockExpiryDuration)

	result, err := m.db.DB().ExecContext(ctx, query, m.machineID, expiration, m.machineID, expiration, now)
	if err != nil {
		return fmt.Errorf("failed to acquire migration lock: %w", err)
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("failed to check migration lock status: %w", err)
	}
	if rowsAffected == 0 {
		return fmt.Errorf("migration lock is already held and not expired")
	}

	return nil
}

func (m *manager) MigrationLockHeartbeat(ctx context.Context) error {
	query := `
        UPDATE migration_lock
        SET expiry = ?
        WHERE id = 1 AND machine_id = ?;
    `

	expiration := time.Now().Add(lockExpiryDuration)
	_, err := m.db.DB().ExecContext(ctx, query, expiration, m.machineID)
	if err != nil {
		return fmt.Errorf("failed to update migration lock heartbeat: %w", err)
	}

	return nil
}

func (m *manager) ListStatuses(ctx context.Context) ([]basemigration.PersistedStatus, error) {
	query := `SELECT order_num, status FROM migration_status ORDER BY order_num;`
	rows, err := m.db.DB().QueryContext(ctx, query)
	if err != nil {
		return nil, fmt.Errorf("failed to list statuses: %w", err)
	}
	defer func() {
		if err := rows.Close(); err != nil {
			logger.Errorf(ctx, "failed to close rows: %v", err)
		}
	}()

	var statuses []basemigration.PersistedStatus
	for rows.Next() {
		var status basemigration.PersistedStatus
		if err := rows.Scan(&status.Order, &status.Status); err != nil {
			return nil, fmt.Errorf("failed to scan status row: %w", err)
		}
		statuses = append(statuses, status)
	}

	return statuses, nil
}

func (m *manager) PersistStatus(ctx context.Context, order basemigration.Order, status basemigration.Status) error {
	query := `
        INSERT INTO migration_status (order_num, status)
        VALUES (?, ?)
        ON CONFLICT(order_num) DO UPDATE SET status = ?;
    `
	_, err := m.db.DB().ExecContext(ctx, query, order, status, status)
	if err != nil {
		return fmt.Errorf("failed to persist status: %w", err)
	}
	return nil
}

func (m *manager) ReleaseMigrationLock(ctx context.Context) error {
	query := `DELETE FROM migration_lock WHERE machine_id = ?;`
	_, err := m.db.DB().ExecContext(ctx, query, m.machineID)
	if err != nil {
		return fmt.Errorf("failed to release migration lock: %w", err)
	}
	return nil
}
