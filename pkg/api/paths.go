package api

const (
	PathApiRoot   = "/api/v1"
	PathProjects  = PathApiRoot + "/projects"
	PathProjectId = PathProjects + "/{projectId}"
	PathAmalgam   = PathProjectId + "/amalgam"
	PathChat      = PathApiRoot + "/chat"
)
