export const ARI_EVENTS = {
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
} as const;

export const CALL_EVENTS = {
  RINGING_AGENT: 'ringing-agent',
  RINGING_OUTBOUND: 'ringing-outbound',
  CALL_CONNECTED: 'call-connected',
  CALL_ENDED: 'call-ended',
  NO_ANSWER: 'no-answer',
  QUEUE_EMPTY: 'queue-empty',
  MOTOR_CHANGED: 'motor-changed',
} as const;

// Estados posibles del ciclo de vida de una llamada.
// Sirven para evitar procesar dos veces el mismo evento (colgar 2 veces,
// crear el bridge 2 veces, etc.)
export const CALL_STATUS = {
  DIALING: 'dialing',
  AGENT_ANSWERED: 'agent_answered',
  DIALING_CUSTOMER: 'dialing_customer',
  AMD_CHECKING: 'amd_checking',
  CONNECTED: 'connected',
  ENDING: 'ending',
  ENDED: 'ended',
} as const;

export type CallStatus = (typeof CALL_STATUS)[keyof typeof CALL_STATUS];
