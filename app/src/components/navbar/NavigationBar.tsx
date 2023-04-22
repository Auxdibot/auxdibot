import {Container, Nav, Navbar} from "react-bootstrap";
import {AiOutlineLink, BsDiscord, BsFillMoonStarsFill, BsSunFill, FiGithub} from "react-icons/all";
import {changeTheme, getTheme} from "../../main";
import React from "react";

export default function NavigationBar() {
    let [theme, setTheme] = React.useState(getTheme());

    function handleClick() {
        setTheme(getTheme() == "dark" ? "light" : "dark");
        changeTheme();
    }
    return (
        <Navbar expand={"lg"} sticky={"top"} className={"px-2 aux-navbar fs-5"}>
            <Container fluid={"xxl"}>
                <Navbar.Brand href="/" className={"m-0 p-0"}>
                    <img
                        src={'./logo.png'}
                        alt={'Auxdibot logo.'}
                        width={55}
                        height={55}
                        className={"d-inline-block align-top"}
                    />
                </Navbar.Brand>
                <Nav className={"mx-2"}>
                    <Nav.Link className={"fs-5"} onClick={() => handleClick()}>
                        { theme == "dark" ? <BsFillMoonStarsFill className={"d-inline-block align-middle mb-1"}/> : <BsSunFill className={"d-inline-block align-middle mb-1"}/> }
                    </Nav.Link>
                </Nav>
                <Navbar.Toggle className={"m-0 float-none"} />
                <Navbar.Collapse id={"nav"}>
                    <Nav className={"me-auto"}>
                        <Nav.Link active={true} href={"/"}>Home</Nav.Link>
                        <Nav.Link active={false} href={"/dashboard"}>Dashboard</Nav.Link>
                        <Nav.Link active={false} href={"/guide"}>Guide</Nav.Link>
                    </Nav>
                    <Nav>
                        <Nav.Link href={"https://discord.gg/tnsFW9CQEn"} ><BsDiscord className={"m-0 align-middle d-inline-block"}/> Discord</Nav.Link>
                        <Nav.Link href={"https://github.com/Auxdible/auxdibot"} ><FiGithub className={"m-0 align-middle d-inline-block"}/> GitHub</Nav.Link>
                        <Nav.Link href={"https://auxdible.me"}><AiOutlineLink className={"m-0 align-middle d-inline-block"} /> Portfolio</Nav.Link>
                    </Nav>
                </Navbar.Collapse>



            </Container>
        </Navbar>
    );
}