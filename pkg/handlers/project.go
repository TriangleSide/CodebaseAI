package handlers

import (
	"net/http"
	"os"

	"github.com/TriangleSide/CodebaseAI/pkg/api"
	"github.com/TriangleSide/CodebaseAI/pkg/db/daos/projects"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
	baseapi "github.com/TriangleSide/GoBase/pkg/http/api"
	"github.com/TriangleSide/GoBase/pkg/http/errors"
	"github.com/TriangleSide/GoBase/pkg/http/responders"
)

type Project struct {
	projectDAO projects.DAO
}

func NewProject(projectDAO projects.DAO) *Project {
	return &Project{
		projectDAO: projectDAO,
	}
}

func (p *Project) List(w http.ResponseWriter, r *http.Request) {
	responders.JSON(w, r, func(*models.ListProjectsRequest) (*models.ListProjectsResponse, int, error) {
		projectList, err := p.projectDAO.List()
		if err != nil {
			return nil, 0, err
		}
		return &models.ListProjectsResponse{
			Projects: projectList,
		}, http.StatusOK, nil
	})
}

func (p *Project) Create(w http.ResponseWriter, r *http.Request) {
	responders.JSON(w, r, func(requestParameters *models.CreateProjectRequest) (*models.Project, int, error) {
		if _, err := os.Stat(requestParameters.Path); os.IsNotExist(err) {
			return nil, 0, &errors.BadRequest{Err: err}
		}
		project := &models.Project{
			Path: &requestParameters.Path,
		}
		if err := p.projectDAO.Create(project); err != nil {
			return nil, 0, err
		}
		return project, http.StatusAccepted, nil
	})
}

func (p *Project) Delete(w http.ResponseWriter, r *http.Request) {
	responders.Status(w, r, func(requestParameters *models.DeleteProjectRequest) (int, error) {
		deleted, err := p.projectDAO.Delete(&models.Project{
			Id: requestParameters.Id,
		})
		if err != nil {
			return 0, err
		}
		if deleted {
			return http.StatusOK, nil
		} else {
			return http.StatusNoContent, nil
		}
	})
}

func (p *Project) AcceptHTTPAPIBuilder(builder *baseapi.HTTPAPIBuilder) {
	builder.MustRegister(api.PathProjects, http.MethodOptions, nil)
	builder.MustRegister(api.PathProjects, http.MethodGet, &baseapi.Handler{
		Middleware: nil,
		Handler:    p.List,
	})
	builder.MustRegister(api.PathProjects, http.MethodPost, &baseapi.Handler{
		Middleware: nil,
		Handler:    p.Create,
	})

	builder.MustRegister(api.PathProjectId, http.MethodOptions, nil)
	builder.MustRegister(api.PathProjectId, http.MethodDelete, &baseapi.Handler{
		Middleware: nil,
		Handler:    p.Delete,
	})
}
