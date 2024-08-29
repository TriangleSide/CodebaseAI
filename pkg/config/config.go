package config

import (
	"github.com/kelseyhightower/envconfig"
	"github.com/sirupsen/logrus"

	"github.com/TriangleSide/CodebaseAI/pkg/validator"
)

type Config struct {
	ApiKey       string `split_words:"true" validate:"required"`
	LogLevel     string `split_words:"true" default:"INFO" validate:"required,oneof=TRACE DEBUG INFO WARN ERROR FATAL"`
	ProjectRoot  string `split_words:"true" validate:"required"`
	ModelVersion string `split_words:"true" default:"gpt-4o" validate:"required,oneof=gpt-4o"`
}

func MustProcessConfig() *Config {
	cfg := &Config{}
	if err := envconfig.Process("", cfg); err != nil {
		logrus.WithError(err).Fatal("Failed to process env vars.")
	}
	if err := validator.Default.Struct(cfg); err != nil {
		logrus.WithError(err).Fatal("Failed to validate env vars.")
	}
	return cfg
}
