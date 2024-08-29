package handler

import (
	"encoding/json"
	"net/http"

	"github.com/sirupsen/logrus"

	"github.com/TriangleSide/CodebaseAI/pkg/ai"
	"github.com/TriangleSide/CodebaseAI/pkg/amalgam"
	"github.com/TriangleSide/CodebaseAI/pkg/config"
	"github.com/TriangleSide/CodebaseAI/pkg/model"
)

type Handler struct {
	cfg    *config.Config
	aiChat ai.Chat
}

func New(cfg *config.Config, aiChat ai.Chat) *Handler {
	return &Handler{
		cfg:    cfg,
		aiChat: aiChat,
	}
}

func (h *Handler) GetAmalgam(w http.ResponseWriter, r *http.Request) {
	amalgamContent, tokenCount, err := amalgam.Get(h.cfg.ProjectRoot)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	amalgamResponse := model.AmalgamResponse{
		Content:    amalgamContent,
		TokenCount: tokenCount,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	if err := json.NewEncoder(w).Encode(amalgamResponse); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
}

func (h *Handler) Chat(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json-seq")
	w.Header().Set("X-Content-Type-Options", "nosniff")

	var chatRequest model.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&chatRequest); err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	_ = r.Body.Close()

	flusher, writerIsFlusher := w.(http.Flusher)
	if !writerIsFlusher {
		panic("Writer is not a Flusher.")
	}
	defer flusher.Flush()

	tokenStream, errorStream := h.aiChat.Stream(r.Context(), chatRequest.Messages)
	encoder := json.NewEncoder(w)
	success := true

	w.WriteHeader(http.StatusOK)

	for {
		select {
		case token, ok := <-tokenStream:
			if ok {
				if err := encoder.Encode(model.ChatResponse{Content: &token, Success: nil}); err != nil {
					logrus.WithError(err).Error("Failed to encode chat content.")
					return
				}
			} else {
				if err := encoder.Encode(model.ChatResponse{Content: nil, Success: &success}); err != nil {
					logrus.WithError(err).Error("Failed to encode chat success.")
				}
				return
			}
		case err, ok := <-errorStream:
			if ok {
				logrus.WithError(err).Error("Error during chat streaming.")
				success = false
				if err := encoder.Encode(model.ChatResponse{Content: nil, Success: &success}); err != nil {
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
