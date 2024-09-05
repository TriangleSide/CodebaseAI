package handlers

import (
	"encoding/json"
	"github.com/TriangleSide/CodebaseAI/pkg/db/daos/projects"
	"github.com/TriangleSide/GoBase/pkg/utils/ptr"
	"github.com/sirupsen/logrus"
	"net/http"

	"github.com/TriangleSide/CodebaseAI/pkg/amalgam"
	"github.com/TriangleSide/CodebaseAI/pkg/api"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
	baseapi "github.com/TriangleSide/GoBase/pkg/http/api"
	"github.com/TriangleSide/GoBase/pkg/http/headers"
	"github.com/TriangleSide/GoBase/pkg/http/parameters"
)

type Amalgam struct {
	projectDAO projects.DAO
}

func NewAmalgam(projectDAO projects.DAO) *Amalgam {
	return &Amalgam{
		projectDAO: projectDAO,
	}
}

func (a *Amalgam) Get(w http.ResponseWriter, r *http.Request) {
	amalgamRequest, err := parameters.Decode[models.AmalgamRequest](r)
	if err != nil {
		logrus.WithError(err).Error("Failed to decode request.")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	project := &models.Project{
		Id: ptr.Of(amalgamRequest.ProjectId),
	}
	err = a.projectDAO.Get(project)
	if err != nil {
		logrus.WithError(err).Error("Failed to get the project.")
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	amalgamContent, tokenCount, err := amalgam.Get(*project.Path)
	if err != nil {
		logrus.WithError(err).Error("Failed to generate the amalgam.")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	amalgamResponse := models.AmalgamResponse{
		Content:    amalgamContent,
		TokenCount: tokenCount,
	}

	w.Header().Set(headers.ContentType, headers.ContentTypeApplicationJson)
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(amalgamResponse); err != nil {
		logrus.WithError(err).Error("Failed to encode the response.")
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Amalgam) AcceptHTTPAPIBuilder(builder *baseapi.HTTPAPIBuilder) {
	builder.MustRegister(api.PathAmalgam, http.MethodOptions, nil)
	builder.MustRegister(api.PathAmalgam, http.MethodGet, &baseapi.Handler{
		Middleware: nil,
		Handler:    a.Get,
	})
}
