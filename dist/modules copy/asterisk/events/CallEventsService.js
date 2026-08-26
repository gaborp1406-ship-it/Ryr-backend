"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CallEventsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallEventsService = void 0;
const common_1 = require("@nestjs/common");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const asterisk_constants_1 = require("../constants/asterisk.constants");
let CallEventsService = CallEventsService_1 = class CallEventsService {
    logger = new common_1.Logger(CallEventsService_1.name);
    events$ = new rxjs_1.Subject();
    emit(event) {
        this.events$.next({
            ...event,
            timestamp: new Date().toISOString(),
        });
    }
    subscribe(extension) {
        return this.events$
            .asObservable()
            .pipe((0, operators_1.filter)((event) => event.extension === extension));
    }
    ringingAgent(data) {
        this.emit({
            type: asterisk_constants_1.CALL_EVENTS.RINGING_AGENT,
            ...data,
        });
    }
    ringingOutbound(data) {
        this.emit({
            type: asterisk_constants_1.CALL_EVENTS.RINGING_OUTBOUND,
            ...data,
        });
    }
    callConnected(data) {
        this.emit({
            type: asterisk_constants_1.CALL_EVENTS.CALL_CONNECTED,
            ...data,
        });
    }
    callEnded(data) {
        this.emit({
            type: asterisk_constants_1.CALL_EVENTS.CALL_ENDED,
            ...data,
        });
    }
    noAnswer(data) {
        this.emit({
            type: asterisk_constants_1.CALL_EVENTS.NO_ANSWER,
            ...data,
        });
    }
};
exports.CallEventsService = CallEventsService;
exports.CallEventsService = CallEventsService = CallEventsService_1 = __decorate([
    (0, common_1.Injectable)()
], CallEventsService);
//# sourceMappingURL=CallEventsService.js.map