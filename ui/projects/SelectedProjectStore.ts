import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Project} from "./ProjectAPIClient";

export interface ProjectReduxState {
    selectedProject: Project | null;
}

export const projectSlice = createSlice({
    name: 'project',
    initialState: {
        selectedProject: null,
    },
    reducers: {
        setSelectedProject: (state: ProjectReduxState, action: PayloadAction<Project | null>): void => {
            console.log("set")
            state.selectedProject = action.payload;
        },
        clearSelectedProject: (state: ProjectReduxState): void => {
            console.log("clear")
            state.selectedProject = null;
        },
    },
});

export const { clearSelectedProject, setSelectedProject } = projectSlice.actions;

export default projectSlice.reducer;