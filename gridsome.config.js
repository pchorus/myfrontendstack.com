// This is where project configuration and plugin options are located. 
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: 'myfrontendstack',
  siteUrl: 'https://myfrontendstack.com',
  plugins: [{
    use: '@gridsome/source-filesystem',
    options: {
      path: 'posts/**/*.md',
      typeName: 'BlogPost',
      route: '/:slug'
    }
  }, {
    use: '@gridsome/plugin-google-analytics',
    options: {
      id: 'UA-141874687-1'
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
