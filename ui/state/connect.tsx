import React from 'react';
import { JSX } from "react/jsx-runtime";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from "./store";
import { Dispatch } from "redux";

export function connectToStore<OwnProps, StoreProps, DispatchProps = {}>(
    Component: React.ComponentType<OwnProps & StoreProps & DispatchProps>,
    mapStateToProps: (state: RootState) => StoreProps,
    mapDispatchToProps?: (dispatch: Dispatch) => DispatchProps
): React.FC<JSX.IntrinsicAttributes & OwnProps> {
    return (props: JSX.IntrinsicAttributes & OwnProps)=> {
        const storeProps = useSelector((state: RootState) => mapStateToProps(state));
        const dispatch = useDispatch();
        const dispatchProps = mapDispatchToProps ? mapDispatchToProps(dispatch) : ({} as DispatchProps);
        return <Component {...props} {...storeProps} {...dispatchProps} />;
    };
}
