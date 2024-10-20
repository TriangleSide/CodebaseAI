import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import {renderPage} from "../page";
import SelectedProject from "../projects/SelectedProject";
import Amalgam from "./Amalgam";

renderPage(
    <SelectedProject>
        <Amalgam />
    </SelectedProject>
)
