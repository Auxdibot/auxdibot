import {
    useRouteError
} from 'react-router-dom';
import {Container, Image} from "react-bootstrap";
import NavigationBar from "../navbar/NavigationBar";

export default function Error() {
    let error: any = useRouteError();

    return (<>
            <NavigationBar/>
            <Container className={"vh-100 d-flex flex-column align-items-center justify-content-center"} fluid={"md"} id={"error-message"}>
            <Image
                src={'./icon.png'}
                alt={'Auxdibot logo.'}
                width={150}
                fluid
                className={"rounded d-block mx-auto m-4"}
            />
            <h1 className={"text-center"}>Error!</h1>
            <p className={"text-center m-2"}>Something went wrong trying to do this.</p>
            <p className={"text-center m-4 fst-italic text-secondary fs-3"}>{error.statusText || error.message}</p>
            <a className={"d-block text-center fs-4"} href="/">Home</a>
        </Container></>
    )
}