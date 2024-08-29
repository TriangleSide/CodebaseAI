package ai

import (
	"context"

	"github.com/TriangleSide/CodebaseAI/pkg/model"
)

type Chat interface {
	Stream(context.Context, []model.ChatMessage) (<-chan string, <-chan error)
}
