package handlers

import (
	"net/http"

	"github.com/TriangleSide/CodebaseAI/pkg/amalgam"
	"github.com/TriangleSide/CodebaseAI/pkg/api"
	"github.com/TriangleSide/CodebaseAI/pkg/db/daos/projects"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
	baseapi "github.com/TriangleSide/GoBase/pkg/http/api"
	"github.com/TriangleSide/GoBase/pkg/http/responders"
	"github.com/TriangleSide/GoBase/pkg/utils/ptr"
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
	responders.JSON(w, r, func(requestParameters *models.AmalgamRequest) (*models.AmalgamResponse, int, error) {
		project := &models.Project{
			Id: ptr.Of(requestParameters.ProjectId),
		}
		err := a.projectDAO.Get(r.Context(), project)
		if err != nil {
			return nil, 0, err
		}

		amalgamContent, tokenCount, err := amalgam.Get(*project.Path)
		if err != nil {
			return nil, 0, err
		}

		return &models.AmalgamResponse{
			Content:    amalgamContent,
			TokenCount: tokenCount,
		}, http.StatusOK, nil
	})
}

func (a *Amalgam) AcceptHTTPAPIBuilder(builder *baseapi.HTTPAPIBuilder) {
	builder.MustRegister(api.PathAmalgam, http.MethodOptions, nil)
	builder.MustRegister(api.PathAmalgam, http.MethodGet, &baseapi.Handler{
		Middleware: nil,
		Handler:    a.Get,
	})
}
