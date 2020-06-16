<template>
  <Layout>
    <h1 class="u-margin-bottom-l">Twitter tips</h1>

    <p class="u-margin-bottom-l">
      From time to time I tweet about Angular, TypeScript, RxJS and more.
      Here are my 💡tweets.
    </p>

    <ul class="tweet-list">
      <li class="tweet-list__item" v-for="edge in $page.tweets.edges" :key="edge.node.id">
        <blockquote class="tweet">
          <div class="tweet__header">
            <a class="tweet-user" :href="`https://twitter.com/${edge.node.user.screenName}`" target="_blank" rel="noopener">
              <img class="tweet-user__image" :src="edge.node.user.profileImage">
              <div>
                <div class="tweet-user__name">{{ edge.node.user.name }}</div>
                <div class="tweet-user__screen-name">@{{ edge.node.user.screenName }}</div>
              </div>
            </a>
            <img class="tweet__logo" src="../assets/Twitter_Logo_Blue.svg">
          </div>

          <p class="u-margin-bottom-l" v-html="edge.node.text"></p>
          <img class="tweet__image" v-for="photoUrl in edge.node.photoUrls" :src="photoUrl">
        </blockquote>
      </li>
    </ul>

  </Layout>
</template>

<page-query>
  query {
    tweets: allTweets(sortBy: "createdAt", order: DESC) {
      edges {
        node {
          id
          idStr
          createdAt
          text
          photoUrls
          user {
            name
            screenName
            profileImage
          }
        }
      }
    }
  }
</page-query>

<script>
  export default {
    metaInfo: {
      title: 'Twitter'
    },
    data: function () {
      return {
        tweets: []
      };
    },
    methods: {
      onSubmit(event) {
        const isValid = event.target.checkValidity();
        event.target.classList.add('submitted');

        if (!isValid) {
          event.preventDefault();
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../assets/variables';

  .tweet-list {
    margin: 0;
    padding: 0 0 $size-xl 0;

    &__item {
      border: 1px solid lightgray;
      border-radius: $default-border-radius;
      list-style-type: none;
      margin-bottom: $size-l;
    }
  }

  .tweet {
    margin: 0;
    padding: $size-m $size-l;

    &__header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: $size-l;
    }

    &__logo {
      width: $size-xl;
    }

    &__image {
      max-width: 100%;
    }
  }

  .tweet-user {
    display: flex;
    align-items: center;

    &__image {
      width: 48px;
      height: 48px;
      border-radius: 24px;
      margin-right: $size-s;
    }
    &__name {
      color: var(--default-text-color);
      font-weight: bold;
    }
    &__screen-name {}
  }
</style>
