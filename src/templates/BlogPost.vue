<template>
  <Layout>
    <h1 class="u-margin-bottom-s">{{ $page.post.title }}</h1>
    <p class="u-text-color-secondary u-margin-bottom-xxl">{{ $page.post.date }} · {{ $page.post.timeToRead }} min read · {{ $page.post.lang === 'de' ? 'deutsch' : 'english' }}</p>
    <div class="post-content" v-html="$page.post.content"></div>
  </Layout>
</template>

<page-query>
  query Post ($id: ID!) {
    post: blogPost (id: $id) {
      title
      description
      date (format: "DD.MM.YYYY")
      timeToRead
      author
      category
      lang
      path
      content
    }
  }
</page-query>

<script>
  import Layout from '~/layouts/Default.vue'

  export default {
    components: {
      Layout
    },
    metaInfo () {
      return {
        title: this.$page.post.title,
        htmlAttrs: {
          lang: this.$page.post.lang || 'en'
        },
        meta: [
          { key: 'description', name: 'description', content: this.$page.post.description }
        ]
      }
    }
  }
</script>

<style lang="scss">
  @import '../assets/variables';

  .post-content {
    padding-bottom: $size-m;

    h2, h3, h4, h5, h6 {
      margin-top: $size-xl;
      margin-bottom: $size-s;
    }

    p {
      margin: 0 0 $size-s 0;
    }
  }

</style>
