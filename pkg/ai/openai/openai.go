package openai

import (
	"context"
	_ "embed"
	"io"

	"github.com/TriangleSide/CodebaseAI/pkg/ai"
	"github.com/TriangleSide/CodebaseAI/pkg/config"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
	"github.com/TriangleSide/GoBase/pkg/logger"
	"github.com/TriangleSide/GoBase/pkg/utils/ptr"
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

func (model *openaiChat) Stream(ctx context.Context, request *models.ChatRequest, cancel <-chan struct{}) (tokens <-chan *models.ChatResponse, err error) {
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
			logger.Errorf(ctx, "Error connecting to OpenAI (%s).", err)
			tokenStream <- &models.ChatResponse{
				Error: ptr.Of("Error connecting to OpenAI."),
			}
			return
		}
		defer func() {
			if err := openaiStream.Close(); err != nil {
				logger.Errorf(ctx, "Failed to close OpenAI stream (%s).", err)
			}
		}()

		for {
			select {
			case <-ctx.Done():
				return
			case <-cancel:
				return
			default:
				response, err := openaiStream.Recv()
				if err != nil {
					if err == io.EOF {
						tokenStream <- &models.ChatResponse{
							Done: ptr.Of(true),
						}
					} else {
						logger.Errorf(ctx, "Error during OpenAI content stream (%s).", err)
						tokenStream <- &models.ChatResponse{
							Error: ptr.Of("Error during OpenAI content stream."),
						}
					}
					return
				}
				tokenStream <- &models.ChatResponse{
					Content: ptr.Of(response.Choices[0].Delta.Content),
				}
			}
		}
	}()

	return tokenStream, nil
}
