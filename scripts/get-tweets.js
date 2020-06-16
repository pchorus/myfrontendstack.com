const axios = require('axios');
const fs = require('fs');

writeTweetsToFile();

async function writeTweetsToFile() {
  try {
    const results = await getTweets();
    fs.writeFileSync('../src/assets/tweets.json', JSON.stringify(results, undefined, 2), { encoding: 'utf-8'});
    return 0;
  } catch (e) {
    console.log('Writing tweets to file failed', e);
    return 1;
  }
}

async function getTweets() {
  const { data: { access_token } } = await axios({
    method: 'post',
    url: 'https://api.twitter.com/oauth2/token',
    data: 'grant_type=client_credentials',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    auth: {
      username: process.env.TWITTER_API_KEY,
      password: process.env.TWITTER_API_SECRET_KEY
    }
  });
  const { data } = await axios.get('https://api.twitter.com/1.1/tweets/search/fullarchive/prod.json', {
    params: {
      query: 'from:PascalChorus 💡',
      fromDate: '201501010000',
      maxResults: '100'
    },
    headers: {
      authorization: `Bearer ${access_token}`
    }
  });

  return data;
}
