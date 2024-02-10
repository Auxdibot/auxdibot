import axios from 'axios';

export async function getChannelId(username) {
   try {
      const response = await axios.get('https://www.googleapis.com/youtube/v3/channels', {
         params: {
            part: 'id,brandingSettings',
            forHandle: username,
            key: process.env.YOUTUBE_API_KEY,
         },
      });
      if (response.data.items.length < 0) return undefined;
      return response.data.items[0];
   } catch (error) {
      return undefined;
   }
}
