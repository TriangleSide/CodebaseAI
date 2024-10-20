import React from 'react';
import { useSelector } from 'react-redux';
import {JSX} from "react/jsx-runtime";
import { RootState } from "./Reducer";

export function connectToRootStore<OwnProps, StoreProps>(
    Component: React.ComponentType<OwnProps & StoreProps>,
    mapStateToProps: (state: RootState, ownProps: OwnProps) => StoreProps
): React.FC<JSX.IntrinsicAttributes & OwnProps> {
    return (props: JSX.IntrinsicAttributes & OwnProps)=> {
        const storeProps = useSelector((state: RootState) => mapStateToProps(state, props));
        return <Component {...props} {...storeProps} />;
    };
}
