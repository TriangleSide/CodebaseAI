export class Paths {
    public static readonly BASE_API_URL = "http://127.0.0.1:8080/api/v1";
    public static readonly PROJECTS = `${Paths.BASE_API_URL}/projects`;
    public static readonly CHAT = `${Paths.BASE_API_URL}/chat`;

    public static projectId(projectId: number) {
        return `${Paths.PROJECTS}/${projectId}`;
    }

    public static amalgam(projectId: number) {
        return `${Paths.PROJECTS}/${projectId}/amalgam`;
    }
}