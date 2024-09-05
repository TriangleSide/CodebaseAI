package projects

import (
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
)

type DAO interface {
	Get(*models.Project) error
	List() ([]*models.Project, error)
	Create(project *models.Project) error
	Delete(project *models.Project) (bool, error)
}

type dao struct {
	db *sql.DB
}

func NewDAO(db *sql.DB) DAO {
	return &dao{
		db: db,
	}
}

func (p *dao) Get(project *models.Project) error {
	statement, err := p.db.Prepare(getSql)
	if err != nil {
		return fmt.Errorf("error preparing SQL statement (%s)", err.Error())
	}
	defer func() {
		if err := statement.Close(); err != nil {
			logrus.WithError(err).Error("Failed to close statement.")
		}
	}()

	rows, err := statement.Query(project.Id, project.Path)
	if err != nil {
		return fmt.Errorf("error executing SQL statement (%s)", err.Error())
	}
	defer func() {
		if err := rows.Close(); err != nil {
			logrus.WithError(err).Error("Failed to close rows.")
		}
	}()

	if rows.Next() {
		if err := rows.Scan(&project.Id, &project.Path); err != nil {
			return err
		}
		return nil
	}

	return fmt.Errorf("project not found")
}

func (p *dao) List() ([]*models.Project, error) {
	rows, err := p.db.Query(listSql)
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
		if err := rows.Scan(&project.Id, &project.Path); err != nil {
			return nil, err
		}
		projects = append(projects, project)
	}

	return projects, nil
}

func (p *dao) Create(project *models.Project) error {
	statement, err := p.db.Prepare(createSql)
	if err != nil {
		return fmt.Errorf("error preparing SQL statement (%s)", err.Error())
	}
	defer func() {
		if err := statement.Close(); err != nil {
			logrus.WithError(err).Error("Failed to close statement.")
		}
	}()

	result, err := statement.Exec(project.Path)
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

func (p *dao) Delete(project *models.Project) (bool, error) {
	statement, err := p.db.Prepare(deleteSql)
	if err != nil {
		return false, fmt.Errorf("error preparing SQL statement (%s)", err.Error())
	}
	defer func() {
		if err := statement.Close(); err != nil {
			logrus.WithError(err).Error("Failed to close statement.")
		}
	}()

	result, err := statement.Exec(project.Id)
	if err != nil {
		return false, fmt.Errorf("error executing SQL statement (%s)", err.Error())
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, fmt.Errorf("error fetching rows affected (%s)", err.Error())
	}

	return rowsAffected > 0, nil
}
