<template>
  <div class="card">
    <g-link class="link" :to="post.path">
      <div>
        <h2 class="link__title u-margin-bottom-xs">{{ post.title }}</h2>
        <p class="u-text-color-secondary">{{ post.date }} · {{ post.timeToRead }} min read · {{ post.lang === 'de' ? 'deutsch' : 'english' }}</p>
      </div>
    </g-link>
  </div>
</template>

<script>
  export default {
    props: ['post']
  }
</script>

<style lang="scss" scoped>
  @import '../assets/variables';

  .card {
  }

  .link {
    text-decoration: none;

    &__title {
      font-family: 'Montserrat', sans-serif;
      color: var(--default-text-color);
    }
  }
</style>
