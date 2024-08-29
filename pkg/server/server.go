package server

import (
	"errors"
	"net/http"

	"github.com/gorilla/mux"

	"github.com/TriangleSide/CodebaseAI/pkg/handler"
	"github.com/TriangleSide/CodebaseAI/pkg/middleware"
)

func Run(requestHandler *handler.Handler) error {
	baseRouter := mux.NewRouter()
	baseRouter.Use(middleware.Cors)

	apiRouter := baseRouter.PathPrefix("/api").Subrouter()
	apiRouter.Path("/amalgam").Methods(http.MethodOptions)
	apiRouter.Path("/amalgam").Methods(http.MethodGet).HandlerFunc(requestHandler.GetAmalgam)
	apiRouter.Path("/chat").Methods(http.MethodOptions)
	apiRouter.Path("/chat").Methods(http.MethodPost).HandlerFunc(requestHandler.Chat)

	http.Handle("/", baseRouter)
	if err := http.ListenAndServe("127.0.0.1:8080", nil); err != nil {
		if !errors.Is(err, http.ErrServerClosed) {
			return err
		}
	}

	return nil
}
