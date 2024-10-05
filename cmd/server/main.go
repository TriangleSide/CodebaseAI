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
	logger.Infof(ctx, "Using the log level %s.", strings.ToUpper(logger.GetLevel().String()))

	cfg, err := envprocessor.ProcessAndValidate[config.Config]()
	if err != nil {
		logger.Fatalf(ctx, "Failed to process configuration (%s).", err)
	}
	logger.Infof(ctx, "Using model version '%s'.", cfg.ModelVersion)

	logger.Info(ctx, "Connecting to the database.")
	database, err := db.NewSQLiteDB()
	if err != nil {
		logger.Fatalf(ctx, "Failed to connect to the database (%s).", err)
	}

	logger.Info(ctx, "Initializing the database.")
	if err := database.InitializeDB(); err != nil {
		logger.Fatal(ctx, "Failed to initialize the database.")
	}

	logger.Info(ctx, "Creating the DAOs.")
	projectDAO := projects.NewDAO(database.DB())

	logger.Info(ctx, "Creating the OpenAI chat handler.")
	aiChat := openai.NewOpenAIChat(cfg)

	logger.Info(ctx, "Configuring the common middleware.")
	httpCommonMiddleware := []basemiddleware.Middleware{
		middleware.Cors,
	}

	logger.Info(ctx, "Configuring the API handlers.")
	httpEndpointHandlers := []api.HTTPEndpointHandler{
		handlers.NewAmalgam(projectDAO),
		handlers.NewChat(aiChat),
		handlers.NewProject(projectDAO),
	}

	logger.Info(ctx, "Creating the HTTP server.")
	httpServer, err := server.New(
		server.WithConfigProvider(func() (*baseconfig.HTTPServer, error) {
			httpConfig, err := envprocessor.ProcessAndValidate[baseconfig.HTTPServer]()
			if err != nil {
				return nil, err
			}
			httpConfig.HTTPServerBindIP = serverIp
			httpConfig.HTTPServerBindPort = serverPort
			httpConfig.HTTPServerTLSMode = baseconfig.HTTPServerTLSModeOff
			return httpConfig, nil
		}),
		server.WithCommonMiddleware(httpCommonMiddleware...),
		server.WithEndpointHandlers(httpEndpointHandlers...),
		server.WithBoundCallback(func(tcpAddr *net.TCPAddr) {
			logger.Infof(ctx, "The HTTP server has started on %s.", tcpAddr.String())
		}),
	)
	if err != nil {
		logger.Fatalf(ctx, "Failed to create HTTP server (%s).", err)
	}

	logger.Info(ctx, "Starting the HTTP server.")
	serverClosed := make(chan struct{})
	go func() {
		if err := httpServer.Run(); err != nil {
			logger.Fatalf(ctx, "Encountered an error while running the HTTP server (%s).", err)
		}
		close(serverClosed)
	}()

	logger.Info(ctx, "Watching for a SIGINT signal.")
	signalChan := make(chan os.Signal, 1)
	signal.Notify(signalChan, os.Interrupt, os.Kill)
	select {
	case <-signalChan:
		logger.Info(ctx, "Received SIGINT signal.")
	case <-serverClosed:
		logger.Info(ctx, "HTTP Server Closed.")
	}

	logger.Info(ctx, "Shutting down the HTTP server.")
	if err := httpServer.Shutdown(ctx); err != nil {
		logger.Errorf(ctx, "Error shutting down the HTTP server (%s).", err)
	}

	logger.Info(ctx, "Closing the database connection.")
	if err := database.Close(); err != nil {
		logger.Errorf(ctx, "Error closing the database connection (%s).", err)
	}

	logger.Info(ctx, "API exiting.")
	os.Exit(0)
}
