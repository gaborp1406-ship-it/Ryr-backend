"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CALL_STATUS = exports.CALL_EVENTS = exports.ARI_EVENTS = void 0;
exports.ARI_EVENTS = {
    STASIS_START: 'StasisStart',
    STASIS_END: 'StasisEnd',
    CHANNEL_CREATED: 'ChannelCreated',
    CHANNEL_DESTROYED: 'ChannelDestroyed',
    CHANNEL_STATE_CHANGE: 'ChannelStateChange',
    CHANNEL_HANGUP_REQUEST: 'ChannelHangupRequest',
    BRIDGE_CREATED: 'BridgeCreated',
    BRIDGE_DESTROYED: 'BridgeDestroyed',
    DIAL: 'Dial',
    PLAYBACK_STARTED: 'PlaybackStarted',
    PLAYBACK_FINISHED: 'PlaybackFinished',
};
exports.CALL_EVENTS = {
    RINGING_AGENT: 'ringing-agent',
    RINGING_OUTBOUND: 'ringing-outbound',
    CALL_CONNECTED: 'call-connected',
    CALL_ENDED: 'call-ended',
    NO_ANSWER: 'no-answer',
    QUEUE_EMPTY: 'queue-empty',
    MOTOR_CHANGED: 'motor-changed',
};
exports.CALL_STATUS = {
    DIALING: 'dialing',
    AGENT_ANSWERED: 'agent_answered',
    DIALING_CUSTOMER: 'dialing_customer',
    AMD_CHECKING: 'amd_checking',
    CONNECTED: 'connected',
    ENDING: 'ending',
    ENDED: 'ended',
};
//# sourceMappingURL=asterisk.constants.js.map