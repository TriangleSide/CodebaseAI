import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {Project} from "@/api/ProjectAPIClient";
import {createSelector} from "reselect";

export interface ProjectState {
    selectedProject: Project | null;
}

const initialState: ProjectState = {
    selectedProject: null,
}

const slice = createSlice({
    name: 'projects',
    initialState: initialState,
    reducers: {
        setSelectedProject: (state: ProjectState, action: PayloadAction<Project>): void => {
            state.selectedProject = action.payload;
        },
        clearSelectedProject: (state: ProjectState): void => {
            state.selectedProject = null;
        },
    },
});

export const selectSelectedProject = createSelector(
    (state: { projects: ProjectState }) => state.projects,
    (projectState) => projectState.selectedProject
);

export const { clearSelectedProject, setSelectedProject } = slice.actions;
export default slice.reducer;