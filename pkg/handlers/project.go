package handlers

import (
	"encoding/json"
	"net/http"
	"os"

	"github.com/sirupsen/logrus"

	"github.com/TriangleSide/CodebaseAI/pkg/api"
	"github.com/TriangleSide/CodebaseAI/pkg/db/daos/projects"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
	baseapi "github.com/TriangleSide/GoBase/pkg/http/api"
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
		logrus.WithError(err).Error("Failed to list the projects.")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	listProjectResponse := &models.ListProjectsResponse{
		Projects: projectList,
	}

	w.Header().Set(headers.ContentType, headers.ContentTypeApplicationJson)
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(listProjectResponse); err != nil {
		logrus.WithError(err).Error("Failed to encode the response.")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (p *Project) Create(w http.ResponseWriter, r *http.Request) {
	createProjectRequest, err := parameters.Decode[models.CreateProjectRequest](r)
	if err != nil {
		logrus.WithError(err).Error("Failed to decode the parameters.")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	project := &models.Project{
		Path: &createProjectRequest.Path,
	}

	if _, err := os.Stat(createProjectRequest.Path); os.IsNotExist(err) {
		logrus.WithError(err).Error("Failed to find the project on the local machine.")
		http.Error(w, "Provided path does not exist", http.StatusBadRequest)
		return
	}

	if err := p.projectDAO.Create(project); err != nil {
		logrus.WithError(err).Error("Failed to create the project.")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set(headers.ContentType, headers.ContentTypeApplicationJson)
	w.WriteHeader(http.StatusCreated)
	if err := json.NewEncoder(w).Encode(project); err != nil {
		logrus.WithError(err).Error("Failed to encode the response.")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (p *Project) Delete(w http.ResponseWriter, r *http.Request) {
	deleteProjectRequest, err := parameters.Decode[models.DeleteProjectRequest](r)
	if err != nil {
		logrus.WithError(err).Error("Failed to decode the parameters.")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	deleted, err := p.projectDAO.Delete(&models.Project{
		Id: deleteProjectRequest.Id,
	})
	if err != nil {
		logrus.WithError(err).Error("Failed to delete the project.")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	if deleted {
		w.WriteHeader(http.StatusOK)
	} else {
		w.WriteHeader(http.StatusNoContent)
	}
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
