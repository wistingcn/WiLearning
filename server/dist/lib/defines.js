"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomStatus = exports.ROLE = void 0;
var ROLE;
(function (ROLE) {
    ROLE[ROLE["SPEAKER"] = 1] = "SPEAKER";
    ROLE[ROLE["ATTENDEE"] = 2] = "ATTENDEE";
    ROLE[ROLE["AUDIENCE"] = 3] = "AUDIENCE";
    ROLE[ROLE["ASSISTANT"] = 4] = "ASSISTANT";
})(ROLE = exports.ROLE || (exports.ROLE = {}));
var RoomStatus;
(function (RoomStatus) {
    RoomStatus["started"] = "started";
    RoomStatus["paused"] = "paused";
    RoomStatus["stopped"] = "stopped";
})(RoomStatus = exports.RoomStatus || (exports.RoomStatus = {}));
