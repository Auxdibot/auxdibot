import {Badge, Button, Carousel, Col, Container, Image, Row} from "react-bootstrap";
import {
    AiOutlineQuestionCircle, AiOutlineStar,
    BiBook,
    BiCustomize,
    BsDiscord, BsEnvelopeCheck,
    BsPen, BsPersonDash,
    BsPersonGear, BsSend, BsShieldExclamation,
    CgWebsite,
    FaHammer, FiHelpCircle, GiHand,
    HiOutlineBan, IoMedalOutline, MdOutlineWavingHand,
    RiDiscordLine
} from "react-icons/all";
import '../scss/index.scss';
export default function Index() {
    return (
        <>
            <div className={"justify-content-center align-items-center d-flex vh-100 flex-column"}>
                <Image
                    src={'./icon.png'}
                    alt={'Auxdibot logo.'}
                    width={150}
                    fluid
                />
                <h1 className={"fw-normal m-2 text-center lh-1"}>Auxdibot <Badge className={"text-bg-danger bg-danger"}>Alpha</Badge></h1>
                <p className={"fs-3 fw-light m-0 text-center"}>A slash command only multipurpose Discord bot!</p>
                <Button className={"my-4"} href={import.meta.env['VITE_API_URL'] + "/api/auth/discord"} target="_blank"><BsDiscord className={"d-inline-block align-top mx-1 fs-4"}/> Login with Discord</Button>
            </div>
            <Container className={"text-bg-body"}>
                <Container fluid={"md"} className={"w-100 h-100 my-5 d-flex flex-column my-auto"}>
                    <span className={"mx-auto my-auto align-items-center d-flex flex-column"}>
                        <BsPersonGear fontSize={100} className={"p-2 rounded-3 img-thumbnail text-center bg-secondary bg-opacity-25"}/>
                        <h1 className={"fw-normal m-2 text-center"}>Customize your way.</h1>
                    </span>
                    <Row md={2} className={"m-5 gx-5"}>
                        <Col className={"border-end flex-column d-flex mb-5"}>

                            <h1 className={"h1 fs-3 d-block"}><CgWebsite className={"d-inline-block align-middle h1 fs-3"} /> Dashboard <Badge className={"text-bg-warning bg-warning"}>WIP</Badge></h1>
                            <p className={"fs-6"}>Customize every feature of Auxdibot using our robust and easy-to-use dashboard site! Auxdibot's dashboard is mobile-friendly and is accessible from anywhere with Discord! No password or signup is needed.</p>
                            <Button className={"mt-auto me-auto w-auto"} href={"/dashboard"}><BsSend className={"d-inline-block align-top mx-1 fs-4"}/> Dashboard</Button>
                        </Col>
                        <Col className={"border-start flex-column d-flex"}>

                            <h1 className={"h1 fs-3"}><RiDiscordLine className={"d-inline-block align-middle h1 fs-3"} /> Discord</h1>
                            <p className={"fs-6"}>Auxdibot uses the Discord Slash Command system, which allows for simple-to-understand and fast punishments, management, and customization! Just invite Auxdibot to your server and run the setup command and Auxdibot is ready for use!</p>
                            <Button className={"mt-auto me-auto w-auto mb-5"} href={"https://discord.com/oauth2/authorize?client_id=776496457867591711&scope=bot&permissions=8"}><GiHand className={"d-inline-block align-top mx-1 fs-4"}/> Invite bot</Button>
                        </Col>
                    </Row>
                </Container>
                <Container fluid={"md"} className={"w-100 h-100 my-5 d-flex flex-column"}>
                    <span className={"mx-auto my-auto align-items-center d-flex flex-column"}>
                        <BiCustomize fontSize={100} className={"p-2 rounded-3 img-thumbnail text-center bg-secondary bg-opacity-25"}/>
                        <h1 className={"fw-normal m-2 text-center"}>Variety of features.</h1>
                    </span>
                    <Carousel className={"feature-carousel my-4 p-4 justify-content-center align-items-center text-center"} role={"listbox"} variant={"dark"}>
                        <Carousel.Item className={"mh-100"}>
                            <h1 className={"h2"}><HiOutlineBan className={"h2"} /> Punishments</h1>
                            <p className={"w-50 mx-auto d-block"}>Auxdibot features a built-in punishment system. Moderators can warn, kick, mute, or ban members and check their punishment log accordingly with the /record slash command!</p>
                        </Carousel.Item>
                        <Carousel.Item className={"mh-100"}>

                            <h1 className={"h2"}><BiBook className={"h2"} /> Logging</h1>
                            <p className={"w-50 mx-auto d-block"}>Owners of their server can specify a log channel where all command traffic through Auxdibot and more are displayed!</p>
                        </Carousel.Item>
                        <Carousel.Item className={"mh-100"}>

                            <h1 className={"h2"}><IoMedalOutline className={"h2"} /> Levels <Badge className={"text-bg-warning bg-warning"}>WIP</Badge></h1>
                            <p className={"w-50 mx-auto d-block"}>Auxdibot has a completely custom leveling system with reward roles, custom XP rates, and more!</p>
                        </Carousel.Item>
                        <Carousel.Item className={"mh-100"}>

                            <h1 className={"h2"}><BsPen className={"h2"} /> Role Management <Badge className={"text-bg-warning bg-warning"}>WIP</Badge></h1>
                            <p className={"w-50 mx-auto d-block"}>With Auxdibot, everything from Reaction Roles to Sticky Roles and Join roles is possible! Make your roles feel like roles with Auxdibot.</p>
                        </Carousel.Item>
                        <Carousel.Item className={"mh-100"}>

                            <h1 className={"h2"}><AiOutlineQuestionCircle className={"h2"} /> Suggestions <Badge className={"text-bg-warning bg-warning"}>WIP</Badge></h1>
                            <p className={"w-50 mx-auto d-block"}>Want feedback from your members? Auxdibot features an easy to setup suggestions system, allowing users to upvote or downvote suggestions, or discuss a suggestion in a Discord thread!</p>
                        </Carousel.Item>
                        <Carousel.Item className={"mh-100"}>

                            <h1 className={"h2"}><MdOutlineWavingHand className={"h2"} /> Embed Tools <Badge className={"text-bg-success bg-success"}>NEW!</Badge></h1>
                            <p className={"w-50 mx-auto d-block"}>Make your server user-friendly and welcoming with Auxdibot's embed builder and welcome tools! You can automatically send an embed displaying essential information about your server to joining users!</p>
                        </Carousel.Item>
                        <Carousel.Item className={"mh-100"}>

                            <h1 className={"h2"}><AiOutlineStar className={"h2"} /> Starboard <Badge className={"text-bg-warning bg-warning"}>WIP</Badge></h1>
                            <p className={"w-50 mx-auto d-block"}>Want to highlight the funniest and best posts on your server? Auxdibot makes it easy! Auxdibot's starboard feature allows for users to react to a post enough times to have it show up in a channel of your choice!</p>
                        </Carousel.Item>
                        <Carousel.Item className={"mh-100"}>
                            <h1 className={"h2"}><BsShieldExclamation className={"h2"} /> Permissions <Badge className={"text-bg-success bg-success"}>NEW!</Badge></h1>
                            <p className={"w-50 mx-auto d-block"}>Allow and block certain users and roles from running Auxdibot's commands using Auxdibot's expansive permission system.</p>
                        </Carousel.Item>
                    </Carousel>

                </Container>
                <Container fluid={"md"} className={"w-100 h-100 my-5 d-flex flex-column"}>
                    <div className={"mx-auto my-auto align-items-center d-flex flex-column"}>
                        <FiHelpCircle fontSize={100} className={"p-2 rounded-3 img-thumbnail text-center bg-secondary bg-opacity-25"}/>
                        <h1 className={"fw-normal m-2 text-center"}>Start now.</h1>
                    </div>
                    <Row className={"d-flex flex-row my-5"}>
                        <BsEnvelopeCheck fontSize={80} className={"float-start align-middle d-inline-block w-50 my-auto"} />
                        <Container className={"float-end d-inline-block w-50"}>
                            <h1>Invite the bot.</h1>
                            <p className={"m-0"}>Invite Auxdibot to the discord server you want to configure it on.</p>
                        </Container>
                    </Row>
                    <Row className={"d-flex flex-row my-5"}>
                        <Container className={"float-start d-inline-block w-50 text-end my-auto"}>
                            <h1>Setup the bot.</h1>
                            <p className={"m-0"}>Change settings on the server with the /settings command to make it suit your server! Anything from the Log Channel to the Join and Leave Embeds can be changed!</p>
                        </Container>
                        <FaHammer fontSize={80} className={"float-end align-middle d-inline-block w-50 my-auto"} />
                    </Row>
                    <Row className={"d-flex flex-row my-5"}>
                        <BsPersonDash fontSize={80} className={"float-start align-middle d-inline-block w-50 my-auto"} />
                        <Container className={"float-end d-inline-block w-50"}>
                            <h1>Moderation made easy.</h1>
                            <p className={"m-0"}>Troublemaker on your server? Auxdibot has easy to use slash commands to ensure punishment is easy!</p>
                        </Container>
                    </Row>
                </Container>
            </Container>

        </>
    );
}