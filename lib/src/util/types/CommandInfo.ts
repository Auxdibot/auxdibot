import HelpCommandInfo from "./HelpCommandInfo";

export default interface CommandInfo {
    help: HelpCommandInfo;
    permission?: string;
    allowedDefault?: boolean;
    dmableCommand?: boolean;
}
