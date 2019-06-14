// This is the main.js file. Import global CSS and scripts here.
// The Client API can be used here. Learn more: gridsome.org/docs/client-api

import '~/assets/styles.scss'
import 'prismjs/themes/prism.css'

import DefaultLayout from '~/layouts/Default.vue'

import * as Sentry from '@sentry/browser';
import * as Integrations from '@sentry/integrations';

export default function (Vue, { router, head, isClient }) {
  // Set default layout as a global component
  Vue.component('Layout', DefaultLayout);

  head.link.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Montserrat:400,600&display=swap'
  });

  head.link.push({
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css?family=Open+Sans&display=swap'
  });

  Sentry.init({
    dsn: 'https://11a6f584ceaa48dd91b12200e6530b1e@sentry.io/1482644',
    integrations: [new Integrations.Vue({Vue, attachProps: true})],
  });
}
