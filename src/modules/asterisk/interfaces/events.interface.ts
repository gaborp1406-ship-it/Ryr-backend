export interface CallEvent {
  type: string;

  extension?: string;

  channelId?: string;

  phone?: string;

  bridgeId?: string;

  idRegistroLlamada?: number;

  reason?: string;

  data?: any;

  timestamp?: string;
}

export interface AriEvent {
  type: string;

  application?: string;

  timestamp?: string;

  channel?: any;

  bridge?: any;

  playback?: any;

  endpoint?: any;

  dialplan?: any;

  args?: string[];

  peer?: any;

  dialstatus?: string;
}