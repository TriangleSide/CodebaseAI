package api

const (
	PATH_API_ROOT   = "/api/v1"
	PATH_PROJECTS   = PATH_API_ROOT + "/projects"
	PATH_PROJECT_ID = PATH_PROJECTS + "/{projectId}"
	PATH_AMALGAM    = PATH_PROJECT_ID + "/amalgam"
	PATH_CHAT       = PATH_API_ROOT + "/chat"
)
