package handlers

import (
	"net/http"

	"github.com/TriangleSide/CodebaseAI/pkg/ai"
	"github.com/TriangleSide/CodebaseAI/pkg/api"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
	baseapi "github.com/TriangleSide/GoTools/pkg/http/api"
	"github.com/TriangleSide/GoTools/pkg/http/responders"
	"github.com/TriangleSide/GoTools/pkg/logger"
)

type Chat struct {
	aiChat ai.Chat
}

func NewChat(aiChat ai.Chat) *Chat {
	return &Chat{
		aiChat: aiChat,
	}
}

func (c *Chat) Stream(w http.ResponseWriter, r *http.Request) {
	responders.JSONStream(w, r, func(requestParameters *models.ChatRequest) (<-chan *models.ChatResponse, int, error) {
		tokenStream, err := c.aiChat.Stream(r.Context(), requestParameters)
		if err != nil {
			return nil, 0, err
		}
		return tokenStream, http.StatusOK, nil
	}, responders.WithErrorCallback(func(err error) {
		logger.Errorf(r.Context(), "Error while handling request (%s).", err.Error())
	}))
}

func (c *Chat) AcceptHTTPAPIBuilder(builder *baseapi.HTTPAPIBuilder) {
	builder.MustRegister(api.PathChat, http.MethodOptions, nil)
	builder.MustRegister(api.PathChat, http.MethodPost, &baseapi.Handler{
		Middleware: nil,
		Handler:    c.Stream,
	})
}
