// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const axios = require('axios');

module.exports = function (api) {
  api.loadSource(async ({ addCollection }) => {
    const collection = addCollection({
      typeName: 'Tweets',
    });

    const tweets = require('./src/assets/tweets.json')
      .results
      .map(tweet => {
        const entities = tweet.extended_tweet ? tweet.extended_tweet.entities : tweet.entities;
        let text = tweet.extended_tweet ? tweet.extended_tweet.full_text : tweet.text;

        if (entities.media) {
          entities.media
            .map(media => media.url)
            .forEach(mediaUrl => text = text.replace(mediaUrl, '').trim());
        }

        if (entities.urls) {
          entities.urls.forEach(({ url, expanded_url, display_url }) =>
            text = text.replace(
              url,
              `<a href="${expanded_url}" target="_blank" rel="noopener">${display_url}</a>`
            ).trim()
          );
        }

        if (entities.hashtags) {
          entities.hashtags
            .forEach(hashtag => text = text.replace(
              `#${hashtag.text}`,
              `<a href="https://twitter.com/hashtag/${hashtag.text}" target="_blank" rel="noopener">#${hashtag.text}</a>`
            ));
        }

        return {
          idStr: tweet.id_str,
          createdAt: Date.parse(tweet.created_at),
          text,
          user: {
            name: tweet.user.name,
            screenName: tweet.user.screen_name,
            profileImage: tweet.user.profile_image_url_https.replace('_normal.jpg', '_bigger.jpg')
          },
          photoUrls: entities.media ? entities.media.filter(media => media.type === 'photo').map(media => media.media_url_https) : [],
          hashtags: entities.hashtags ? entities.hashtags.map(hashtag => hashtag.text) : [],
        };
      });

    tweets.forEach(collection.addNode);
  })

  api.createPages(({ createPage }) => {
    // Use the Pages API here: https://gridsome.org/docs/pages-api
  })
}
