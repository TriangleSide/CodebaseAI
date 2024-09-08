package models

import "time"

type Project struct {
	Id           *int       `json:"id"`
	Path         *string    `json:"path"`
	CreatedTime  *time.Time `json:"createdTime"`
	SelectedTime *time.Time `json:"selectedTime"`
}

type CreateProjectRequest struct {
	Path string `json:"path" validate:"required"`
}

type DeleteProjectRequest struct {
	Id *int `urlPath:"projectId" json:"-" validate:"required"`
}

type ListProjectsRequest struct{}

type ListProjectsResponse struct {
	Projects []*Project `json:"projects"`
}
