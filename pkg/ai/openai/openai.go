package openai

import (
	"context"
	_ "embed"
	"io"

	"github.com/sashabaranov/go-openai"

	"github.com/TriangleSide/CodebaseAI/pkg/ai"
	"github.com/TriangleSide/CodebaseAI/pkg/config"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
)

//go:embed instructions.txt
var instructions string

type openaiChat struct {
	client *openai.Client
	model  string
}

func NewOpenAIChat(cfg *config.Config) ai.Chat {
	client := openai.NewClient(cfg.ApiKey)
	return &openaiChat{
		client: client,
		model:  cfg.ModelVersion,
	}
}

func (model *openaiChat) Stream(ctx context.Context, messages []models.ChatMessage) (<-chan string, <-chan error) {
	openaiMsgs := make([]openai.ChatCompletionMessage, 0)

	openaiMsgs = append(openaiMsgs, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleSystem,
		Content: instructions,
	})

	for _, msg := range messages {
		openaiMsgs = append(openaiMsgs, openai.ChatCompletionMessage{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	req := openai.ChatCompletionRequest{
		Model:    model.model,
		Messages: openaiMsgs,
		Stream:   true,
	}

	tokenStream := make(chan string)
	errorStream := make(chan error)

	go func() {
		defer close(tokenStream)
		defer close(errorStream)

		stream, err := model.client.CreateChatCompletionStream(ctx, req)
		if err != nil {
			errorStream <- err
			return
		}
		defer stream.Close()

		for {
			response, err := stream.Recv()
			if err != nil {
				if err == io.EOF {
					break
				}
				errorStream <- err
				return
			}
			tokenStream <- response.Choices[0].Delta.Content
		}
	}()

	return tokenStream, errorStream
}
