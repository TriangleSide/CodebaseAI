package model

type Message struct {
	Content string `json:"content"`
	Role    string `json:"role"`
}

type ChatRequest struct {
	Messages []Message `json:"messages"`
}

type ChatResponse struct {
	Content *string `json:"content,omitempty"`
	Success *bool   `json:"success,omitempty"`
}
