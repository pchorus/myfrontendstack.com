<template class="test-class">
  <div :class="{ 'dark-mode': isDarkMode, 'light-mode': !isDarkMode }">
    <div class="header u-margin-bottom-xl">
      <header class="header__content">
        <g-link class="header__link" to="/">
          <img class="header__logo" src="../assets/logo.svg" height="34px" alt="Logo" />
          <span>myfrontendstack</span></g-link>
        <div class="menu" :class="{ 'menu--visible': this.isMobileMenuVisible }">
          <nav class="nav">
            <g-link class="menu__item" to="/">Blog</g-link>
            <g-link class="menu__item" to="/tweets">Tweets</g-link>
          </nav>
          <button class="menu__item" @click="onToggleDarkMode()">{{ isDarkMode ? 'Light Mode' : 'Dark mode' }}</button>
        </div>
        <button class="menu-button" type="button" @click="onMenuButtonClick">
          <svg height="32px" id="hamburger" style="enable-background:new 0 0 32 32;" fill="var(--default-text-color)" version="1.1"
               viewBox="0 0 32 32" width="32px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg"
               xmlns:xlink="http://www.w3.org/1999/xlink">
            <path d="M4,10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2  s0.896,2,2,2h24c1.104,0,2-0.896,2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z"/>
          </svg>
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
  metadata {
    siteName
  }
}
</static-query>

<script>
  export default {
    data: function () {
      return {
        isMobileMenuVisible: false,
        isDarkMode: false
      };
    },
    mounted: function () {
      this.isDarkMode = localStorage ? localStorage.getItem('isDarkMode') === 'true' : false
    },
    methods: {
      onMenuButtonClick: function () {
        this.isMobileMenuVisible = !this.isMobileMenuVisible;
      },
      onToggleDarkMode: function () {
        this.isDarkMode = !this.isDarkMode;
        if (localStorage) {
          localStorage.setItem('isDarkMode', this.isDarkMode);
        }
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
    .light-mode & {
      -webkit-box-shadow: 0px 0px 16px 0px rgba(136,136,136,1);
      -moz-box-shadow: 0px 0px 16px 0px rgba(136,136,136,1);
      box-shadow: 0px 0px 16px 0px rgba(136,136,136,1);
    }

    &__content {
      padding: $size-m;

      @media (min-width: $max-width-tablet + 1) {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    &__link {
      display: flex;
      align-items: center;
      color: var(--default-text-color);
      font-family: 'Montserrat', sans-serif;
      text-decoration: none;
      font-size: $size-m;
    }
    &__logo {
      margin-right: $size-xs;
    }
  }

  .menu-button {
    color: var(--default-text-color);
    font-size: $size-m;
    position: absolute;
    top: $size-m;
    right: $size-m;
    padding: 0;

    @media (min-width: $max-width-tablet + 1) {
      display: none;
    }
  }

  .menu {
    display: none;

    &--visible {
      display: block;
    }

    &__item {
      border: none;
      outline: none;
      padding: 0;
      margin-top: $size-m;
      text-decoration: none;
      display: block;
      font-family: 'Montserrat', sans-serif;
      font-size: $font-size-m;
      color: var(--default-text-color);
      cursor: pointer;

      &:hover {
        color: $primary-color;
      }
    }

    @media (min-width: $max-width-tablet + 1) {
      display: flex;
      align-items: center;

      &__item {
        margin-top: 0;
        margin-left: $size-m;
      }
    }
  }

  @media (min-width: $max-width-tablet + 1) {
    .nav {
      display: flex;
    }
  }
</style>
