package models

type AmalgamRequest struct {
	ProjectId int `urlPath:"projectId" json:"-"`
}

type AmalgamResponse struct {
	Content    string `json:"content"`
	TokenCount int    `json:"tokenCount"`
}
