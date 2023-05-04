enum SuggestionState {
    WAITING,
    APPROVED,
    DENIED,
    CONSIDERED,
    ADDED

}
export const SuggestionStateName = {
    0: "Waiting",
    1: "Approved",
    2: "Denied",
    3: "Considered",
    4: "Added"
}
export default SuggestionState;