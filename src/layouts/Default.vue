<template>
  <div>
    <div class="header u-margin-bottom-xl">
      <header class="header__content">
        <g-link class="header__link" to="/">myfrontendstack</g-link>
        <nav class="nav" :class="{ 'nav--visible': this.isMobileMenuVisible }">
          <g-link class="nav__item" to="/">Blog</g-link>
          <g-link class="nav__item" to="/contact">Contact</g-link>
        </nav>
        <button class="button button--text menu-button" type="button" @click="onMenuButtonClick">
          <img src="../assets/hamburger.svg" height="28px" alt="Menü"/>
        </button>
      </header>
    </div>
    <div class="content">
      <slot/>
    </div>
  </div>
</template>

<static-query>
query {
  metaData {
    siteName
  }
}
</static-query>

<script>
  export default {
    data: function () {
      return {
        isMobileMenuVisible: false
      };
    },
    methods: {
      onMenuButtonClick: function () {
        this.isMobileMenuVisible = !this.isMobileMenuVisible;
      }
    }
  }
</script>

<style lang="scss" scoped>
  @import '../assets/variables';

  .content {
    max-width: $max-content-width;
    margin: 0 auto;
    padding: 0 $size-m;
  }

  .header {
    -webkit-box-shadow: 0px 0px 16px 0px rgba(136,136,136,1);
    -moz-box-shadow: 0px 0px 16px 0px rgba(136,136,136,1);
    box-shadow: 0px 0px 16px 0px rgba(136,136,136,1);

    &__content {
      padding: $size-m;

      @media (min-width: $max-width-tablet + 1) {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    &__link {
      color: $default-text-color;
      font-family: 'Montserrat', sans-serif;
      text-decoration: none;
      font-size: $size-m;
    }
  }

  .menu-button {
    color: $default-text-color;
    font-size: $size-m;
    position: absolute;
    top: $size-m;
    right: $size-m;
    padding: 0;

    @media (min-width: $max-width-tablet + 1) {
      display: none;
    }
  }

  .nav {
    display: none;

    &--visible {
      display: block;
    }

    &__item {
      font-family: 'Montserrat', sans-serif;
      color: $default-text-color;
      margin-top: $size-m;
      text-decoration: none;
      display: block;

      &:hover {
        color: $primary-color;
      }
    }

    @media (min-width: $max-width-tablet + 1) {
      display: flex;

      &__item {
        margin-top: 0;
        margin-left: $size-m;
      }
    }
  }
</style>
