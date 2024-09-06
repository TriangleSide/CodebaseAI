package ai

import (
	"context"

	"github.com/TriangleSide/CodebaseAI/pkg/models"
)

type Chat interface {
	Stream(ctx context.Context, request *models.ChatRequest, cancel <-chan struct{}) (tokens <-chan *models.ChatResponse, err error)
}
