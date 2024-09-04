export class Paths {
    public static readonly BASE_API_URL = "http://127.0.0.1:8080/api";
    public static readonly PROJECTS = `${Paths.BASE_API_URL}/projects`;
    public static readonly CHAT = `${Paths.BASE_API_URL}/chat`;
    public static readonly AMALGAM = `${Paths.BASE_API_URL}/amalgam`;

    public static projectId(projectId: number) {
        return `${Paths.PROJECTS}/${projectId}`;
    }
}