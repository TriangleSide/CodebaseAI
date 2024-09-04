package models

type ChatMessage struct {
	Content string `json:"content"`
	Role    string `json:"role"`
}

type ChatRequest struct {
	Messages []ChatMessage `json:"messages"`
}

type ChatResponse struct {
	Content *string `json:"content,omitempty"`
	Success *bool   `json:"success,omitempty"`
}