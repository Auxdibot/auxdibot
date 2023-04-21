import React from 'react'
import ReactDOM from 'react-dom/client'
import './scss/styles.scss'
import {createBrowserRouter, createRoutesFromElements, RouterProvider} from 'react-router-dom'
import Root from "./components/root/Root";
import Error from "./components/error/Error";
import Index from "./components";
import {Route} from "react-router";
import UnderConstruction from "./components/underconstruction/UnderConstruction";

const router = createBrowserRouter(createRoutesFromElements(
    <Route
        path={"/"}
        element={<Root />}
        errorElement={<Error />}
    >
        <Route errorElement={<Error />}>
            <Route index element={<Index />} />
            <Route
                path="/dashboard"
                element={<UnderConstruction />}
            />
            <Route
                path="/guide"
                element={<UnderConstruction />}
            />
        </Route>

    </Route>
))
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
export const changeTheme = (theme?: "dark" | "light") => {
    let html = document.getElementsByTagName("html")[0];
    let themeAttr = theme || html.getAttribute("data-bs-theme") == "dark" ? "light" : "dark";
    html.setAttribute("data-bs-theme", themeAttr);
}
export const getTheme = (): "dark" | "light" => {
    let html = document.getElementsByTagName("html")[0];
    return html.getAttribute("data-bs-theme") || "light";
}
