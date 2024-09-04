package handlers

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/TriangleSide/CodebaseAI/pkg/db/daos/projects"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
	"github.com/TriangleSide/GoBase/pkg/http/api"
	"github.com/TriangleSide/GoBase/pkg/http/headers"
	"github.com/TriangleSide/GoBase/pkg/http/parameters"
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
	projectList, err := p.projectDAO.List()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	listProjectResponse := &models.ListProjectsResponse{
		Projects: projectList,
	}

	w.Header().Set(headers.ContentType, headers.ContentTypeApplicationJson)
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(listProjectResponse); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (p *Project) Create(w http.ResponseWriter, r *http.Request) {
	createProjectRequest, err := parameters.Decode[models.CreateProjectRequest](r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	project := &models.Project{
		Path: createProjectRequest.Path,
	}

	if _, err := os.Stat(createProjectRequest.Path); os.IsNotExist(err) {
		http.Error(w, "Provided path does not exist", http.StatusBadRequest)
		return
	}

	if err := p.projectDAO.Create(project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set(headers.ContentType, headers.ContentTypeApplicationJson)
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(project); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (p *Project) Delete(w http.ResponseWriter, r *http.Request) {
	deleteProjectRequest, err := parameters.Decode[models.DeleteProjectRequest](r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	deleted, err := p.projectDAO.Delete(&models.Project{
		Id: deleteProjectRequest.Id,
	})
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if deleted {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusNoContent)
	}
}

func (p *Project) AcceptHTTPAPIBuilder(builder *api.HTTPAPIBuilder) {
	const projectsPath = "/api/projects"
	builder.MustRegister(projectsPath, http.MethodOptions, nil)
	builder.MustRegister(projectsPath, http.MethodGet, &api.Handler{
		Middleware: nil,
		Handler:    p.List,
	})
	builder.MustRegister(projectsPath, http.MethodPost, &api.Handler{
		Middleware: nil,
		Handler:    p.Create,
	})

	const projectIdPath = "/api/projects/{id}"
	builder.MustRegister(projectIdPath, http.MethodOptions, nil)
	builder.MustRegister(projectIdPath, http.MethodDelete, &api.Handler{
		Middleware: nil,
		Handler:    p.Delete,
	})
}
