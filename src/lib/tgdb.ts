const TGDB_API_KEY = '3bc2a21adc9a78da09d725ed6f1dffd14144f719f2396748a6138eddc721910b';
const BASE_URL = 'https://api.thegamesdb.net/v1';

export const tgdb = {
  getGamesByTrending: async () => {
    try {
      const url = new URL(`${BASE_URL}/Games/ByGameName`);
      url.searchParams.append('apikey', TGDB_API_KEY);
      url.searchParams.append('name', 'Plants vs Zombies');
      url.searchParams.append('fields', 'overview,rating,release_date');
      
      const response = await fetch(url.toString());
      return await response.json();
    } catch (error) {
      console.error('TGDB API Error:', error);
      return { data: { games: [] } };
    }
  },

  getGameDetails: async (id: string) => {
    try {
      const url = new URL(`${BASE_URL}/Games/ByGameID`);
      url.searchParams.append('apikey', TGDB_API_KEY);
      url.searchParams.append('id', id);
      url.searchParams.append('fields', 'overview,rating,release_date,platform');
      
      const response = await fetch(url.toString());
      return await response.json();
    } catch (error) {
      console.error('TGDB Details Error:', error);
      return null;
    }
  }
};
