package validator

import (
	"github.com/go-playground/validator/v10"
)

var (
	Default *validator.Validate
)

func init() {
	Default = validator.New()
}
