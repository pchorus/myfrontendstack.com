<template>
  <Layout>
    <h1 class="u-margin-bottom-l">Contact</h1>

    <p>My name is Pascal and I am a Senior Frontend Developer from Aachen, Germany.</p>
    <p class="u-margin-bottom-s">I am writing this blog about my learnings about Angular, TypeScript, JavaScript, RxJS and so on.</p>

    <p class="u-margin-bottom-l">If you like to get in touch, please send me a message via the form below
      or send a message via
      <a href="https://twitter.com/myfrontendstack" rel="noopener" target="_blank">Twitter</a>.
    </p>

    <form name="contact" method="POST" action="/message-sent" @submit="onSubmit" novalidate data-netlify data-netlify-honeypot="bot-field">
      <input name="bot-field" hidden readonly />
      <input name="form-name" value="contact" hidden readonly />

      <div class="form-element">
        <label for="email" class="form-element__label">Your email address</label>
        <input id="email" name="email" class="form-element__input" required />
        <p class="form-element__error">Please provide your email address.</p>
      </div>

      <div class="form-element">
        <label for="message" class="form-element__label">Your message</label>
        <textarea id="message" name="message" class="form-element__input" rows="8" required></textarea>
        <p class="form-element__error">Please provide a message.</p>
      </div>

      <button class="button button--primary u-margin-bottom-xl" type="submit">Send</button>
    </form>

  </Layout>
</template>

<script>
  export default {
    metaInfo: {
      title: 'Contact'
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
