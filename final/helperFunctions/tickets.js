"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkResponses = exports.checkResponse = void 0;
function checkResponse(response) {
    let res = response.response.toLowerCase();
    if (res == "") {
        return false;
    }
    if (res.search('not service') != -1) {
        return true;
    }
    if (res.search('unmarked') != -1) {
        return false;
    }
    if (res.search('no conflict') != -1) {
        return true;
    }
    if (res.search('clear no') != -1) {
        return true;
    }
    if (res.search('marked') != -1) {
        return true;
    }
}
exports.checkResponse = checkResponse;
function checkResponses(responses) {
    if (responses.length == 0) {
        return [-1, -1];
    }
    let [clear, pending] = [0, 0];
    for (const response of responses) {
        if (checkResponse(response)) {
            clear++;
        }
        else {
            pending++;
        }
    }
    return [clear, pending];
}
exports.checkResponses = checkResponses;
