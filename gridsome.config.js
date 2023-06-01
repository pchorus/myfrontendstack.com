// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: 'myfrontendstack',
  siteUrl: 'https://myfrontendstack.com',
  siteDescription: 'Blog about frontend web development with Angular, TypeScript, RxJS and more.',
  templates: {
    BlogPost: '/:title'
  },
  plugins: [{
    use: '@gridsome/source-filesystem',
    options: {
      path: 'posts/**/*.md',
      typeName: 'BlogPost'
    }
  }, {
    use: '@gridsome/plugin-sitemap'
  }],
  transformers: {
    remark: {
      plugins: [
        '@gridsome/remark-prismjs'
      ]
    }
  }
}
