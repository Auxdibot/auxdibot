import NavigationBar from "../navbar/NavigationBar";
import {
    Outlet
} from 'react-router';
export default function Root() {
    return (
        <>
            <NavigationBar/>
            <Outlet/>
        </>
    );
}