import 'date-fns'
import 'typeface-roboto';
import React from "react";
import {render} from "react-dom";
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import state from './State';
import {observer} from "mobx-react"
import Paper from '@material-ui/core/Paper';
import InfoSnackbar from './InfoSnackbar';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {KeyboardDatePicker, KeyboardTimePicker, MuiPickersUtilsProvider,} from '@material-ui/pickers';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Button from '@material-ui/core/Button';

import ntw from 'number-to-words';

const statusMap = ['undecided', 'canceled', 'happening'];
const statusColorMap = ['yellow', 'red', 'green'];
const statusTextMap = ["Not decided yet. Check again later.",
    "Canceled because of clouds, hope to see you next time.",
    "Will happen. Hope you can make it."
];

const monthNames = [
    "January", "February", "March",
    "April", "May", "June", "July",
    "August", "September", "October",
    "November", "December"
];


function timeStr(hour, minute) {
    let m = 'am';
    if (hour >= 12) {
        m = 'pm';
    }
    if (hour > 12) {
        hour = hour - 12;
    }
    if (hour === 0) {
        hour = 12;
    }
    if (minute < 10) {
        minute = '0' + minute
    }
    return hour + ':' + minute + m;
}


function handleFetchError(response) {
    if (!response.ok) {
        console.error(response.statusText);
        const t = response.statusText;
        return response.text().then((t2) => {
            if (!t2) {
                throw Error(t);
            } else {
                throw Error(t2);
            }
        });
    }
    return response;
}


@observer
class App extends React.Component {

    handleStatusChange(e) {
        state.status = parseInt(e.target.value, 10);

    }

    handleHideChange(e) {
        state.hide_from_page = e.currentTarget.checked;
    }

    handleDateChange(date) {
        state.date = date;
    }

    handleSaveClicked() {
        if (!state.date) {
            state.date_error = true;
            return;
        }
        state.date_error = false;
        const req = {
            date: state.date.toISOString(),
            status: state.status,
            hide_from_page: state.hide_from_page
        };
        fetch('./update_announcement.php', {
            method: 'put',
            body: JSON.stringify(req),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(handleFetchError).then(() => {
            state.snack_bar = 'Announcement saved';
            state.snack_bar_error = false;
        }).catch((e) => {
            state.snack_bar = 'Error: Failed to save announcement';
            state.snack_bar_error = true;
        });
    }

    render() {

        let previewText = "";
        let phoneText = "";
        if (state.date && !state.hide_from_page) {
            const month = monthNames[state.date.getMonth()];
            const day = ntw.toOrdinal(state.date.getDate());
            if (state.status < 2) {
                previewText = `${month} ${day} Public Astronomy Night Status: ${statusTextMap[state.status]}`;
            } else {
                previewText = `${month} ${day} Public Astronomy Night Status: Will be held and starts at ${timeStr(state.date.getHours(), state.date.getMinutes())}. Hope you can make it.`;
            }
        }
        if (state.date) {
            const month = monthNames[state.date.getMonth()];
            const day = ntw.toOrdinal(state.date.getDate());
            phoneText = `The public astronomy night on ${month} ${ntw.toWordsOrdinal(state.date.getDate())} `;
            if (state.status === 0) {
                phoneText += `has not be decided on yet, please check again later.`;
            } else if (state.status === 1) {
                phoneText += 'has been canceled because of clouds.';
            } else {
                phoneText += `will be held and starts at ${timeStr(state.date.getHours(), state.date.getMinutes())}. Hope you can make it.`;
            }
        }
        let required = '';
        if (state.date_error) {
            required = ' required';
        }
        return <React.Fragment>
            <CssBaseline/>
            <Container>
                <Paper square style={{paddingLeft: '3ex', paddingRight: '3ex', height: '100%'}}>
                    <MuiPickersUtilsProvider utils={DateFnsUtils}>
                        <Grid container justify="space-around">
                            <Grid item xs={12}>
                                <h2>Public Night Date/Time</h2>
                            </Grid>
                            <Grid item xs={12}>
                                Select the date and time of the Public Astronomy Night.
                            </Grid>
                            <Grid item xs={4}>
                                <KeyboardDatePicker
                                    margin="normal"
                                    id="date-picker-dialog"
                                    label={"Date" + required}
                                    format="MM/dd/yyyy"
                                    value={state.date}
                                    error={state.date_error}
                                    onChange={this.handleDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change date',
                                    }}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <KeyboardTimePicker
                                    margin="normal"
                                    id="time-picker"
                                    label={"Time" + required}
                                    value={state.date}
                                    error={state.date_error}
                                    onChange={this.handleDateChange}
                                    KeyboardButtonProps={{
                                        'aria-label': 'change time',
                                    }}
                                />
                            </Grid>
                            <Grid item xs={4}/>
                            <Grid item xs={12}>
                                <h2>Public Night Status</h2>
                            </Grid>
                            <Grid item xs={4}>
                                <InputLabel htmlFor="status-select">Status</InputLabel>
                                <Select id={"status-select"} value={state.status}
                                        onChange={this.handleStatusChange} name="model">
                                    <MenuItem value="0">Undecided</MenuItem>
                                    <MenuItem value="1">Canceled</MenuItem>
                                    <MenuItem value="2">Happening</MenuItem>
                                </Select>
                            </Grid>
                            <Grid item xs={4}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            color="primary"
                                            onChange={this.handleHideChange}
                                            checked={state.hide_from_page}
                                        />
                                    }
                                    label="Hide from website"/>
                            </Grid>
                            <Grid item xs={4}/>
                            <Grid item xs={12}>
                                <h2>Website Preview</h2>
                            </Grid>
                            <Grid item xs={12}>
                                <div style={{fontSize: '200%', backgroundColor: statusColorMap[state.status]}}>
                                    {previewText}
                                </div>
                            </Grid>
                            <Grid item xs={12}>
                                <h2>Phone Message Preview</h2>
                            </Grid>
                            <Grid item xs={12}>
                                {phoneText}
                            </Grid>
                            <Grid item xs={12}>&nbsp;</Grid>
                            <Grid item xs={12} style={{textAlign: "center"}}>
                                <Button color="primary" variant="contained"
                                        onClick={this.handleSaveClicked}>Save</Button>
                            </Grid>
                            <Grid item xs={12}>&nbsp;</Grid>
                        </Grid>
                    </MuiPickersUtilsProvider>
                </Paper>
                <InfoSnackbar/>
            </Container>
        </React.Fragment>;
    }
}

render(
    <App/>,
    document.getElementById("root")
);

