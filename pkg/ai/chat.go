package ai

import (
	"context"

	"github.com/TriangleSide/CodebaseAI/pkg/model"
)

type Chat interface {
	Stream(context.Context, []model.Message) (<-chan string, <-chan error)
}
