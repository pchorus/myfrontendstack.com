<template>
  <Layout>
    <h1 class="u-margin-bottom-xxl">Blog</h1>

    <ol class="blog-list">
      <li v-for="edge in $page.posts.edges" :key="edge.node.title">
        <BlogPostCard class="u-margin-bottom-xl" :post="edge.node"></BlogPostCard>
      </li>
    </ol>
  </Layout>
</template>

<page-query>
  query BlogPosts {
    posts: allBlogPost {
      edges {
        node {
          title
          date (format: "DD.MM.YYYY")
          timeToRead
          author
          category
          lang
          path
        }
      }
    }
  }
</page-query>

<script>
import BlogPostCard from "../components/BlogPostCard";
export default {
  components: {BlogPostCard},
  metaInfo: {
    title: 'Blog',
    htmlAttrs: {
      lang: 'en'
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../assets/variables';

  .blog-list {
    list-style-type: none;
    margin: 0;
    padding: 0 0 $size-xl 0;
  }
</style>
