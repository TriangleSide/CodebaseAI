package config

type Config struct {
	ApiKey       string `config_format:"snake" validate:"required"`
	ModelVersion string `config_format:"snake" config_default:"gpt-4o" validate:"required"`
}
