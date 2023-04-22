import {Container, Nav, Navbar} from "react-bootstrap";
import {AiOutlineLink, BsDiscord, BsFillMoonStarsFill, BsSunFill, FiGithub} from "react-icons/all";
import {changeTheme, getTheme} from "../../main";
import React from "react";
import axios, {AxiosResponse} from "axios";
import { useQuery } from 'react-query';

export default function NavigationBar() {
    let [theme, setTheme] = React.useState(getTheme());
    let { isLoading, isError, data, error } = useQuery({ queryKey: ['profile'], queryFn: ()=> axios.get(import.meta.env['VITE_API_URL'] + '/api/session', { withCredentials: true}).then((res) => res).catch((err) => ({ error: err })) });
    function handleClick() {
        setTheme(getTheme() == "dark" ? "light" : "dark");
        changeTheme();
    }
    async function logout() {
        axios.get(import.meta.env['VITE_API_URL'] + '/api/session/logout', { withCredentials: true }).then(() => {
            window.location.reload(false);
        });

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
                    <Nav className={"me-4"}>
                        <Nav.Link href={"https://discord.gg/tnsFW9CQEn"} ><BsDiscord className={"m-0 align-middle d-inline-block"}/> Discord</Nav.Link>
                        <Nav.Link href={"https://github.com/Auxdible/auxdibot"} ><FiGithub className={"m-0 align-middle d-inline-block"}/> GitHub</Nav.Link>
                        <Nav.Link href={"https://auxdible.me"}><AiOutlineLink className={"m-0 align-middle d-inline-block"} /> Portfolio</Nav.Link>
                    </Nav>
                    { isLoading ? <Nav>Loading...</Nav> : isError ? <Nav>Error: {error as any}</Nav> : data && data.hasOwnProperty("data") ? <Nav className={"flex-row"}>
                        <img src={`https://cdn.discordapp.com/avatars/${(data as AxiosResponse<any, any>).data['discord_id']}/${(data as AxiosResponse<any, any>).data['discord_icon']}.png`}
                             width={25} height={25} className={"rounded-5 my-auto "} alt={"Discord Icon"}/>
                        <span className={"ms-2 fs-5 mt-auto text-body me-3"}>{(data as AxiosResponse<any, any>).data['discord_tag']}</span>
                        <a className={"fw-normal text-body"} href={"/"} onClick={async () => await logout()}>Logout</a>
                    </Nav> : <Nav>Please log in.</Nav > }

                </Navbar.Collapse>



            </Container>
        </Navbar>
    );
}