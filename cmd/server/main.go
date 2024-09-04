package main

import (
	"os"
	"strings"

	"github.com/sirupsen/logrus"

	"github.com/TriangleSide/CodebaseAI/pkg/ai/openai"
	"github.com/TriangleSide/CodebaseAI/pkg/config"
	"github.com/TriangleSide/CodebaseAI/pkg/handler"
	"github.com/TriangleSide/CodebaseAI/pkg/middleware"
	baseconfig "github.com/TriangleSide/GoBase/pkg/config"
	"github.com/TriangleSide/GoBase/pkg/config/envprocessor"
	"github.com/TriangleSide/GoBase/pkg/http/api"
	basemiddleware "github.com/TriangleSide/GoBase/pkg/http/middleware"
	baseserver "github.com/TriangleSide/GoBase/pkg/http/server"
	"github.com/TriangleSide/GoBase/pkg/logger"
)

func main() {
	logger.MustConfigure()
	logrus.Info("Starting the server.")
	logrus.Infof("Using the log level %s.", strings.ToUpper(logrus.GetLevel().String()))

	cfg, err := envprocessor.ProcessAndValidate[config.Config]()
	if err != nil {
		logrus.WithError(err).Fatal("Failed to process configuration")
	}
	logrus.Infof("Using project root '%s'.", cfg.ProjectRoot)
	logrus.Infof("Using model version '%s'.", cfg.ModelVersion)

	httpCommonMiddleware := []basemiddleware.Middleware{
		middleware.Cors,
	}

	aiChat := openai.NewOpenAIChat(cfg)
	httpEndpointHandlers := []api.HTTPEndpointHandler{
		handler.New(cfg, aiChat),
	}

	httpServer, err := baseserver.New(baseserver.WithConfigProvider(func() (*baseconfig.HTTPServer, error) {
		httpConfig, err := envprocessor.ProcessAndValidate[baseconfig.HTTPServer]()
		if err != nil {
			return nil, err
		}
		httpConfig.HTTPServerBindIP = "127.0.0.1"
		httpConfig.HTTPServerBindPort = 8080
		httpConfig.HTTPServerTLS = false
		return httpConfig, nil
	}))
	if err != nil {
		logrus.WithError(err).Fatal("Failed to create HTTP server")
	}

	if err := httpServer.Run(httpCommonMiddleware, httpEndpointHandlers, func() {
		logrus.Info("The HTTP server has started.")
	}); err != nil {
		logrus.WithError(err).Fatal("Encountered an error while running the HTTP server.")
	}

	os.Exit(0)
}
