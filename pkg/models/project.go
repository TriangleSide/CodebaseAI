package models

type Project struct {
	Id   *int   `json:"id"`
	Path string `json:"path"`
}

type CreateProjectRequest struct {
	Path string `json:"path" validate:"required"`
}

type DeleteProjectRequest struct {
	Id *int `urlPath:"id" json:"-" validate:"required"`
}

type ListProjectsResponse struct {
	Projects []*Project `json:"projects"`
}
