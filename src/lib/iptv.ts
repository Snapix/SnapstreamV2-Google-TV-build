export interface IPTVChannel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
}

export const HISTORY_TV_CHANNELS: IPTVChannel[] = [
  { 
    id: 'history-hd-multi', 
    name: 'History TV18 HD', 
    group: 'Documentaries', 
    logo: 'https://jiotvimages.cdn.jio.com/dare_images/images/History_HD.png', 
    url: 'http://66.102.120.18:8000/play/a01q/index.m3u8' 
  }
];

export async function getLiveTVChannels(): Promise<IPTVChannel[]> {
  return HISTORY_TV_CHANNELS;
}
