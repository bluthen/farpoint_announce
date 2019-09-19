import {observable, toJS} from "mobx";


const state = observable({
    date: null,
    date_error: false,
    status: 0,
    hide_from_page: false,
    snack_bar: null,
    snack_bar_error: false
});


window.debugState = state;
window.debugStateJS = function () {
    return toJS(state);
};

export default state;