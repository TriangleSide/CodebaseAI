package handlers

import (
	"encoding/json"
	"net/http"

	"github.com/sirupsen/logrus"

	"github.com/TriangleSide/CodebaseAI/pkg/ai"
	"github.com/TriangleSide/CodebaseAI/pkg/models"
	"github.com/TriangleSide/GoBase/pkg/http/api"
	"github.com/TriangleSide/GoBase/pkg/http/headers"
	"github.com/TriangleSide/GoBase/pkg/http/parameters"
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
	chatRequest, err := parameters.Decode[models.ChatRequest](r)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	w.Header().Set(headers.ContentType, "application/json-seq")
	w.WriteHeader(http.StatusOK)

	flusher, writerIsFlusher := w.(http.Flusher)
	if !writerIsFlusher {
		panic("Writer is not a Flusher.")
	}
	defer flusher.Flush()

	tokenStream, errorStream := c.aiChat.Stream(r.Context(), chatRequest.Messages)
	encoder := json.NewEncoder(w)
	success := true

	for {
		select {
		case token, ok := <-tokenStream:
			if ok {
				if err := encoder.Encode(models.ChatResponse{Content: &token, Success: nil}); err != nil {
					logrus.WithError(err).Error("Failed to encode chat content.")
					return
				}
			} else {
				if err := encoder.Encode(models.ChatResponse{Content: nil, Success: &success}); err != nil {
					logrus.WithError(err).Error("Failed to encode chat success.")
				}
				return
			}
		case err, ok := <-errorStream:
			if ok {
				logrus.WithError(err).Error("Error during chat streaming.")
				success = false
				if err := encoder.Encode(models.ChatResponse{Content: nil, Success: &success}); err != nil {
					logrus.WithError(err).Error("Failed to encode chat error.")
				}
				return
			} else {
				// Success returned in token case.
			}
		}
		flusher.Flush()
	}
}

func (c *Chat) AcceptHTTPAPIBuilder(builder *api.HTTPAPIBuilder) {
	const chatPath = "/api/chat"
	builder.MustRegister(chatPath, http.MethodOptions, nil)
	builder.MustRegister(chatPath, http.MethodPost, &api.Handler{
		Middleware: nil,
		Handler:    c.Stream,
	})
}
