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
            state.selectedProject = action.payload;
        },
    },
});

export const { setSelectedProject } = projectSlice.actions;

export default projectSlice.reducer;