package main

import (
	"context"
	"net"
	"os"
	"os/signal"
	"strings"

	"github.com/TriangleSide/CodebaseAI/pkg/ai/openai"
	"github.com/TriangleSide/CodebaseAI/pkg/config"
	"github.com/TriangleSide/CodebaseAI/pkg/db"
	"github.com/TriangleSide/CodebaseAI/pkg/db/daos/projects"
	"github.com/TriangleSide/CodebaseAI/pkg/db/migrations"
	"github.com/TriangleSide/CodebaseAI/pkg/handlers"
	"github.com/TriangleSide/CodebaseAI/pkg/middleware"
	baseconfig "github.com/TriangleSide/GoTools/pkg/config"
	"github.com/TriangleSide/GoTools/pkg/database/migration"
	"github.com/TriangleSide/GoTools/pkg/http/api"
	basemiddleware "github.com/TriangleSide/GoTools/pkg/http/middleware"
	"github.com/TriangleSide/GoTools/pkg/http/server"
	"github.com/TriangleSide/GoTools/pkg/logger"
	"github.com/TriangleSide/GoTools/pkg/validation"
)

const (
	serverIp   = "127.0.0.1"
	serverPort = 8080
)

func main() {
	ctx := context.Background()

	logger.MustConfigure()
	logger.Infof("Using the log level %s.", strings.ToUpper(logger.GetLevel().String()))

	cfg, err := baseconfig.ProcessAndValidate[config.Config]()
	if err != nil {
		logger.Fatalf("Failed to process configuration (%s).", err)
	}
	logger.Infof("Using model version '%s'.", cfg.ModelVersion)

	logger.Info("Connecting to the database.")
	database, err := db.NewSQLiteDB()
	if err != nil {
		logger.Fatalf("Failed to connect to the database (%s).", err)
	}

	logger.Info("Performing DB migrations.")
	migrationManager := migrations.NewManager(database)
	if err = migration.Migrate(migrationManager); err != nil {
		logger.Fatalf("Failed to perform migration (%s).", err)
	}

	logger.Info("Creating the DAOs.")
	projectDAO := projects.NewDAO(database.DB())

	logger.Info("Creating the OpenAI chat handler.")
	aiChat := openai.NewOpenAIChat(cfg)

	logger.Info("Configuring the common middleware.")
	httpCommonMiddleware := []basemiddleware.Middleware{
		middleware.Cors,
	}

	logger.Info("Configuring the API handlers.")
	httpEndpointHandlers := []api.HTTPEndpointHandler{
		handlers.NewAmalgam(projectDAO),
		handlers.NewChat(aiChat),
		handlers.NewProject(projectDAO),
	}

	logger.Info("Creating the HTTP server.")
	httpServer, err := server.New(
		server.WithConfigProvider(func() (*server.Config, error) {
			httpConfig, err := baseconfig.Process[server.Config](baseconfig.WithPrefix(server.ConfigPrefix))
			if err != nil {
				return nil, err
			}
			httpConfig.BindIP = serverIp
			httpConfig.BindPort = serverPort
			httpConfig.TLSMode = server.TLSModeOff
			err = validation.Struct(httpConfig)
			if err != nil {
				return nil, err
			}
			return httpConfig, nil
		}),
		server.WithCommonMiddleware(httpCommonMiddleware...),
		server.WithEndpointHandlers(httpEndpointHandlers...),
		server.WithBoundCallback(func(tcpAddr *net.TCPAddr) {
			logger.Infof("The HTTP server has started on %s.", tcpAddr.String())
		}),
	)
	if err != nil {
		logger.Fatalf("Failed to create HTTP server (%s).", err)
	}

	logger.Info("Starting the HTTP server.")
	serverClosed := make(chan struct{})
	go func() {
		if err := httpServer.Run(); err != nil {
			logger.Fatalf("Encountered an error while running the HTTP server (%s).", err)
		}
		close(serverClosed)
	}()

	logger.Info("Watching for a SIGINT signal.")
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, os.Kill)
	select {
	case <-signalChan:
		logger.Info("Received SIGINT signal.")
	case <-serverClosed:
		logger.Info("HTTP Server Closed.")
	}

	logger.Info("Shutting down the HTTP server.")
	if err := httpServer.Shutdown(ctx); err != nil {
		logger.Errorf("Error shutting down the HTTP server (%s).", err)
	}

	logger.Info("Closing the database connection.")
	if err := database.Close(); err != nil {
		logger.Errorf("Error closing the database connection (%s).", err)
	}

	logger.Info("API exiting.")
	os.Exit(0)
}
