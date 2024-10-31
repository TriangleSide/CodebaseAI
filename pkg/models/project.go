package models

import "time"

type Project struct {
	Id          *int       `json:"id"`
	Path        *string    `json:"path"`
	CreatedTime *time.Time `json:"createdTime"`
	UpdateTime  *time.Time `json:"updateTime"`
}

type GetProjectRequest struct {
	Id *int `urlPath:"projectId" json:"-" validate:"required"`
}

type ListProjectsRequest struct {
	Limit *int `urlQuery:"limit" json:"-"`
}

type ListProjectsResponse struct {
	Projects []*Project `json:"projects"`
}

type CreateProjectRequest struct {
	Path string `json:"path" validate:"required,filepath"`
}

type DeleteProjectRequest struct {
	Id *int `urlPath:"projectId" json:"-" validate:"required"`
}

type UpdateProjectRequest struct {
	Id *int `urlPath:"projectId" json:"-" validate:"required"`
}
