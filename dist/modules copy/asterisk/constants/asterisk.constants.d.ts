export declare const ARI_EVENTS: {
    readonly STASIS_START: "StasisStart";
    readonly STASIS_END: "StasisEnd";
    readonly CHANNEL_CREATED: "ChannelCreated";
    readonly CHANNEL_DESTROYED: "ChannelDestroyed";
    readonly CHANNEL_STATE_CHANGE: "ChannelStateChange";
    readonly CHANNEL_HANGUP_REQUEST: "ChannelHangupRequest";
    readonly BRIDGE_CREATED: "BridgeCreated";
    readonly BRIDGE_DESTROYED: "BridgeDestroyed";
    readonly DIAL: "Dial";
    readonly PLAYBACK_STARTED: "PlaybackStarted";
    readonly PLAYBACK_FINISHED: "PlaybackFinished";
};
export declare const CALL_EVENTS: {
    readonly RINGING_AGENT: "ringing-agent";
    readonly RINGING_OUTBOUND: "ringing-outbound";
    readonly CALL_CONNECTED: "call-connected";
    readonly CALL_ENDED: "call-ended";
    readonly NO_ANSWER: "no-answer";
    readonly QUEUE_EMPTY: "queue-empty";
    readonly MOTOR_CHANGED: "motor-changed";
};
export declare const CALL_STATUS: {
    readonly DIALING: "dialing";
    readonly AGENT_ANSWERED: "agent_answered";
    readonly DIALING_CUSTOMER: "dialing_customer";
    readonly AMD_CHECKING: "amd_checking";
    readonly CONNECTED: "connected";
    readonly ENDING: "ending";
    readonly ENDED: "ended";
};
export type CallStatus = (typeof CALL_STATUS)[keyof typeof CALL_STATUS];
