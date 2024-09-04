package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/TriangleSide/CodebaseAI/pkg/amalgam"
	"github.com/TriangleSide/CodebaseAI/pkg/config"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
	"github.com/TriangleSide/GoBase/pkg/http/api"
	"github.com/TriangleSide/GoBase/pkg/http/headers"
)

type Amalgam struct {
	cfg *config.Config
}

func NewAmalgam(cfg *config.Config) *Amalgam {
	return &Amalgam{
		cfg: cfg,
	}
}

func (a *Amalgam) Get(w http.ResponseWriter, r *http.Request) {
	amalgamContent, tokenCount, err := amalgam.Get(a.cfg.ProjectRoot)
	if err != nil {
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
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (a *Amalgam) AcceptHTTPAPIBuilder(builder *api.HTTPAPIBuilder) {
	const amalgamPath = "/api/amalgam"
	builder.MustRegister(amalgamPath, http.MethodOptions, nil)
	builder.MustRegister(amalgamPath, http.MethodGet, &api.Handler{
		Middleware: nil,
		Handler:    a.Get,
	})
}
