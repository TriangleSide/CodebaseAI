package projects

import (
	"context"
	"database/sql"
	_ "embed"
	"fmt"
	"github.com/sirupsen/logrus"

	"github.com/TriangleSide/CodebaseAI/pkg/models"
	"github.com/TriangleSide/GoBase/pkg/utils/ptr"
)

var (
	//go:embed get.sql
	getSql string

	//go:embed list.sql
	listSql string

	//go:embed create.sql
	createSql string

	//go:embed delete.sql
	deleteSql string

	//go:embed update.sql
	updateSql string
)

type DAO interface {
	Get(context.Context, *models.Project) error
	List(context.Context) ([]*models.Project, error)
	Create(context.Context, *models.Project) error
	Delete(context.Context, *models.Project) (bool, error)
	Update(context.Context, *models.Project) (bool, error)
}

type dao struct {
	db *sql.DB
}

func NewDAO(db *sql.DB) DAO {
	return &dao{
		db: db,
	}
}

func (p *dao) Get(ctx context.Context, project *models.Project) error {
	statement, err := p.db.PrepareContext(ctx, getSql)
	if err != nil {
		return fmt.Errorf("error preparing SQL statement (%s)", err.Error())
	}
	defer func() {
		if err := statement.Close(); err != nil {
			logrus.WithError(err).Error("Failed to close statement.")
		}
	}()

	rows, err := statement.QueryContext(ctx, project.Id)
	if err != nil {
		return fmt.Errorf("error executing SQL statement (%s)", err.Error())
	}
	defer func() {
		if err := rows.Close(); err != nil {
			logrus.WithError(err).Error("Failed to close rows.")
		}
	}()

	if rows.Next() {
		if err := rows.Scan(&project.Id, &project.Path, &project.CreatedTime, &project.SelectedTime); err != nil {
			return err
		}
		return nil
	}

	return fmt.Errorf("project not found")
}

func (p *dao) List(ctx context.Context) ([]*models.Project, error) {
	rows, err := p.db.QueryContext(ctx, listSql)
	if err != nil {
		return nil, err
	}
	defer func() {
		if err := rows.Close(); err != nil {
			logrus.WithError(err).Error("Failed to close rows.")
		}
	}()

	projects := make([]*models.Project, 0)
	for rows.Next() {
		project := &models.Project{}
		if err := rows.Scan(&project.Id, &project.Path, &project.CreatedTime, &project.SelectedTime); err != nil {
			return nil, err
		}
		projects = append(projects, project)
	}

	return projects, nil
}

func (p *dao) Create(ctx context.Context, project *models.Project) error {
	statement, err := p.db.PrepareContext(ctx, createSql)
	if err != nil {
		return fmt.Errorf("error preparing SQL statement (%s)", err.Error())
	}
	defer func() {
		if err := statement.Close(); err != nil {
			logrus.WithError(err).Error("Failed to close statement.")
		}
	}()

	result, err := statement.ExecContext(ctx, project.Path)
	if err != nil {
		return fmt.Errorf("error executing SQL statement (%s)", err.Error())
	}

	id, err := result.LastInsertId()
	if err != nil {
		return fmt.Errorf("error fetching last insert ID (%s)", err.Error())
	}

	project.Id = ptr.Of(int(id))
	return nil
}

func (p *dao) Delete(ctx context.Context, project *models.Project) (bool, error) {
	statement, err := p.db.PrepareContext(ctx, deleteSql)
	if err != nil {
		return false, fmt.Errorf("error preparing SQL statement (%s)", err.Error())
	}
	defer func() {
		if err := statement.Close(); err != nil {
			logrus.WithError(err).Error("Failed to close statement.")
		}
	}()

	result, err := statement.ExecContext(ctx, project.Id)
	if err != nil {
		return false, fmt.Errorf("error executing SQL statement (%s)", err.Error())
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("error fetching rows affected (%s)", err.Error())
	}

	return rowsAffected > 0, nil
}

func (p *dao) Update(ctx context.Context, project *models.Project) (bool, error) {
	if project.Id == nil {
		return false, fmt.Errorf("project ID is nil")
	}

	statement, err := p.db.PrepareContext(ctx, updateSql)
	if err != nil {
		return false, fmt.Errorf("error preparing SQL statement (%s)", err.Error())
	}
	defer func() {
		if err := statement.Close(); err != nil {
			logrus.WithError(err).Error("Failed to close statement.")
		}
	}()

	result, err := statement.ExecContext(ctx, *project.Id)
	if err != nil {
		return false, fmt.Errorf("error executing SQL statement (%s)", err.Error())
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("error fetching rows affected (%s)", err.Error())
	}

	return rowsAffected > 0, nil
}
