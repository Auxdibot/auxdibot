import {Container, Image} from "react-bootstrap";

export default function UnderConstruction() {
    return (<Container className={"vh-100 d-flex flex-column align-items-center justify-content-center"} fluid={"md"} id={"under-construction-message"}>
            <Image
                src={'./icon.png'}
                alt={'Auxdibot logo.'}
                width={150}
                fluid
                className={"rounded d-block mx-auto m-4"}
            />
            <h1 className={"text-center"}>You're here early.</h1>
            <p className={"text-center m-2"}>Auxdible is working hard on this feature! Be patient with me for a bit longer.</p>
            <p className={"text-center m-4 fst-italic text-secondary fs-3"}>Thank you for your interest! Feel free to check out our home site while you wait.</p>
            <a className={"d-block text-center fs-4"} href="/">Home</a>
        </Container>
    );
}