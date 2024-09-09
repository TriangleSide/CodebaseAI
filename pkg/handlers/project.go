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

func (p *Project) Get(w http.ResponseWriter, r *http.Request) {
	responders.JSON(w, r, func(request *models.GetProjectRequest) (*models.Project, int, error) {
		project := &models.Project{
			Id: request.Id,
		}
		err := p.projectDAO.Get(r.Context(), project)
		if err != nil {
			return nil, 0, err
		}
		return project, http.StatusOK, nil
	})
}

func (p *Project) List(w http.ResponseWriter, r *http.Request) {
	responders.JSON(w, r, func(requestParameters *models.ListProjectsRequest) (*models.ListProjectsResponse, int, error) {
		projectList, err := p.projectDAO.List(r.Context(), &projects.ListParameters{
			Limit: requestParameters.Limit,
		})
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
		if err := p.projectDAO.Create(r.Context(), project); err != nil {
			return nil, 0, err
		}
		return project, http.StatusAccepted, nil
	})
}

func (p *Project) Delete(w http.ResponseWriter, r *http.Request) {
	responders.Status(w, r, func(requestParameters *models.DeleteProjectRequest) (int, error) {
		deleted, err := p.projectDAO.Delete(r.Context(), &models.Project{
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

func (p *Project) Update(w http.ResponseWriter, r *http.Request) {
	responders.Status(w, r, func(requestParameters *models.UpdateProjectRequest) (int, error) {
		updated, err := p.projectDAO.Update(r.Context(), &models.Project{
			Id: requestParameters.Id,
		})
		if err != nil {
			return 0, err
		}
		if updated {
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
	builder.MustRegister(api.PathProjectId, http.MethodGet, &baseapi.Handler{
		Middleware: nil,
		Handler:    p.Get,
	})
	builder.MustRegister(api.PathProjectId, http.MethodDelete, &baseapi.Handler{
		Middleware: nil,
		Handler:    p.Delete,
	})
	builder.MustRegister(api.PathProjectId, http.MethodPut, &baseapi.Handler{
		Middleware: nil,
		Handler:    p.Update,
	})
}
