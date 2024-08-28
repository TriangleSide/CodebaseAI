package handler

import (
	"net/http"
	"strconv"

	"github.com/sirupsen/logrus"

	"github.com/TriangleSide/CodebaseAI/pkg/amalgam"
	"github.com/TriangleSide/CodebaseAI/pkg/config"
)

type Handler struct {
	cfg *config.Config
}

func New(cfg *config.Config) *Handler {
	return &Handler{
		cfg: cfg,
	}
}

func (h *Handler) GetAmalgam(w http.ResponseWriter, r *http.Request) {
	allSrcFiles, err := amalgam.Get(h.cfg.ProjectRoot)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Header().Set("Content-Size", strconv.Itoa(len(allSrcFiles)))
	w.WriteHeader(http.StatusOK)

	if _, err := w.Write([]byte(allSrcFiles)); err != nil {
		logrus.WithError(err).Error("Failed to write response.")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}
