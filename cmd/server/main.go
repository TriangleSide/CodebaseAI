package main

import (
	"os"

	"github.com/sirupsen/logrus"

	"github.com/TriangleSide/CodebaseAI/pkg/config"
	"github.com/TriangleSide/CodebaseAI/pkg/handler"
	"github.com/TriangleSide/CodebaseAI/pkg/server"
)

func main() {
	logrus.SetFormatter(&logrus.TextFormatter{})
	logrus.SetOutput(os.Stdout)
	logrus.SetLevel(logrus.InfoLevel)
	logrus.Info("Starting server.")

	cfg := config.MustProcessConfig()
	logLevel, _ := logrus.ParseLevel(cfg.LogLevel)
	logrus.SetLevel(logLevel)

	serverHandler := handler.New(cfg)
	if err := server.Run(serverHandler); err != nil {
		logrus.WithError(err).Fatal("Encountered an error while running the server.")
	}

	os.Exit(0)
}
