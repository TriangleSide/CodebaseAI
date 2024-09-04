package ai

import (
	"context"

	"github.com/TriangleSide/CodebaseAI/pkg/models"
)

type Chat interface {
	Stream(context.Context, []models.ChatMessage) (<-chan string, <-chan error)
}
