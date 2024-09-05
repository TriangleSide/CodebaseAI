package main

import (
	"context"
	"os"
	"os/signal"
	"strings"

	"github.com/sirupsen/logrus"

	"github.com/TriangleSide/CodebaseAI/pkg/ai/openai"
	"github.com/TriangleSide/CodebaseAI/pkg/config"
	"github.com/TriangleSide/CodebaseAI/pkg/db"
	"github.com/TriangleSide/CodebaseAI/pkg/db/daos/projects"
	"github.com/TriangleSide/CodebaseAI/pkg/handlers"
	"github.com/TriangleSide/CodebaseAI/pkg/middleware"
	baseconfig "github.com/TriangleSide/GoBase/pkg/config"
	"github.com/TriangleSide/GoBase/pkg/config/envprocessor"
	"github.com/TriangleSide/GoBase/pkg/http/api"
	basemiddleware "github.com/TriangleSide/GoBase/pkg/http/middleware"
	"github.com/TriangleSide/GoBase/pkg/http/server"
	"github.com/TriangleSide/GoBase/pkg/logger"
)

const (
	serverIp   = "127.0.0.1"
	serverPort = 8080
)

func main() {
	ctx := context.Background()

	logger.MustConfigure()
	logrus.Infof("Using the log level %s.", strings.ToUpper(logrus.GetLevel().String()))

	cfg, err := envprocessor.ProcessAndValidate[config.Config]()
	if err != nil {
		logrus.WithError(err).Fatal("Failed to process configuration.")
	}
	logrus.Infof("Using model version '%s'.", cfg.ModelVersion)

	logrus.Info("Connecting to the database.")
	database, err := db.NewSQLiteDB()
	if err != nil {
		logrus.WithError(err).Fatal("Failed to connect to the database.")
	}

	logrus.Info("Initializing the database.")
	if err := database.InitializeDB(); err != nil {
		logrus.WithError(err).Fatal("Failed to initialize the database.")
	}

	logrus.Info("Creating the DAOs.")
	projectDAO := projects.NewDAO(database.DB())

	logrus.Info("Creating the OpenAI chat handler.")
	aiChat := openai.NewOpenAIChat(cfg)

	logrus.Info("Configuring the common middleware.")
	httpCommonMiddleware := []basemiddleware.Middleware{
		middleware.Cors,
	}

	logrus.Info("Configuring the API handlers.")
	httpEndpointHandlers := []api.HTTPEndpointHandler{
		handlers.NewAmalgam(projectDAO),
		handlers.NewChat(aiChat),
		handlers.NewProject(projectDAO),
	}

	logrus.Info("Creating the HTTP server.")
	httpServer, err := server.New(server.WithConfigProvider(func() (*baseconfig.HTTPServer, error) {
		httpConfig, err := envprocessor.ProcessAndValidate[baseconfig.HTTPServer]()
		if err != nil {
			return nil, err
		}
		httpConfig.HTTPServerBindIP = serverIp
		httpConfig.HTTPServerBindPort = serverPort
		httpConfig.HTTPServerTLS = false
		return httpConfig, nil
	}))
	if err != nil {
		logrus.WithError(err).Fatal("Failed to create HTTP server.")
	}

	logrus.Info("Watching for a SIGINT signal.")
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, os.Kill)
	go func() {
		<-signalChan
		logrus.Info("Shutting down the HTTP server.")
		if err := httpServer.Shutdown(ctx); err != nil {
			logrus.WithError(err).Error("Error shutting down the HTTP server.")
		}
	}()

	logrus.Info("Starting the HTTP server.")
	if err := httpServer.Run(httpCommonMiddleware, httpEndpointHandlers, func() {
		logrus.Info("The HTTP server has started.")
	}); err != nil {
		logrus.WithError(err).Fatal("Encountered an error while running the HTTP server.")
	}

	logrus.Info("Closing the database connection.")
	if err := database.Close(); err != nil {
		logrus.WithError(err).Error("Error closing the database connection.")
	}

	logrus.Info("API exiting.")
	os.Exit(0)
}
