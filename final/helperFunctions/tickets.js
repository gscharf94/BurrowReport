"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkResponses = exports.checkResponse = void 0;
function checkResponse(response) {
    let res = response.response.toLowerCase();
    if (res == "") {
        return false;
    }
    if (res.search('unmarked') != -1) {
        return false;
    }
    if (res.search('clear - no conflict') != -1) {
        return true;
    }
    if (res.search('marked - ') != -1) {
        return true;
    }
}
exports.checkResponse = checkResponse;
function checkResponses(responses) {
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
