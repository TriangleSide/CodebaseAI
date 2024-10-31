package openai

import (
	"context"
	_ "embed"
	"fmt"
	"io"

	"github.com/TriangleSide/CodebaseAI/pkg/ai"
	"github.com/TriangleSide/CodebaseAI/pkg/config"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
	"github.com/TriangleSide/GoBase/pkg/logger"
	"github.com/TriangleSide/GoBase/pkg/ptr"
	"github.com/sashabaranov/go-openai"
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

func (model *openaiChat) Stream(ctx context.Context, request *models.ChatRequest) (tokens <-chan *models.ChatResponse, err error) {
	openaiMessages := make([]openai.ChatCompletionMessage, 0)

	openaiMessages = append(openaiMessages, openai.ChatCompletionMessage{
		Role:    openai.ChatMessageRoleSystem,
		Content: instructions,
	})

	for _, msg := range request.Messages {
		openaiMessages = append(openaiMessages, openai.ChatCompletionMessage{
			Role:    msg.Role,
			Content: msg.Content,
		})
	}

	req := openai.ChatCompletionRequest{
		Model:    model.model,
		Messages: openaiMessages,
		Stream:   true,
	}

	tokenStream := make(chan *models.ChatResponse)

	go func() {
		defer close(tokenStream)

		openaiStream, err := model.client.CreateChatCompletionStream(ctx, req)
		if err != nil {
			_ = sendOverChannel(ctx, tokenStream, &models.ChatResponse{Done: ptr.Of(true), Error: ptr.Of(fmt.Sprintf("Error connecting to OpenAI (%s).", err.Error()))})
			return
		}
		defer func() {
			if err := openaiStream.Close(); err != nil {
				logger.Errorf(ctx, "Failed to close OpenAI stream (%s).", err)
			}
		}()

		for {
			response, err := openaiStream.Recv()
			if err != nil {
				msg := &models.ChatResponse{Done: ptr.Of(true)}
				if err == io.EOF {
					_ = sendOverChannel(ctx, tokenStream, msg)
				} else {
					msg.Error = ptr.Of(err.Error())
					_ = sendOverChannel(ctx, tokenStream, msg)
				}
				return
			}
			if !sendOverChannel(ctx, tokenStream, &models.ChatResponse{Content: ptr.Of(response.Choices[0].Delta.Content)}) {
				return
			}
		}
	}()

	return tokenStream, nil
}

func sendOverChannel(ctx context.Context, stream chan<- *models.ChatResponse, msg *models.ChatResponse) bool {
	select {
	case <-ctx.Done():
		return false
	case stream <- msg:
		return true
	}
}
