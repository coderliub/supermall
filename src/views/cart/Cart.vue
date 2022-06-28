<template>
  <div class="cart">
    <nav-bar class="nav-bar">
      <div slot="center">购物车({{cartLength}})</div>
    </nav-bar>
<!--    商品列表-->
    <scroll class="content" ref="scroll">
    <cart-list></cart-list>
    </scroll>

<!--    底部汇总-->
  <cart-bottom-bar></cart-bottom-bar>
  </div>
</template>

<script>
import NavBar from "@/components/common/navbar/NavBar";
import Scroll from "@/components/common/scroll/Scroll";

import CartList from "@/views/cart/childComps/CartList";
import CartBottomBar from "@/views/cart/childComps/CartBottomBar";

import {mapGetters} from "vuex";

export default {
  name: "Cart",
  components: {
    NavBar,
    CartList,
    Scroll,
    CartBottomBar
  },
  computed: {
      ...mapGetters(['cartLength','cartList'])
  },
  activated() {
    this.$refs.scroll.refresh()
  }
}
</script>
<style scoped>
  .cart {
    height: 100vh;
  }

  .nav-bar {
    background-color: var(--color-tint);
    color: #fff;
    font-weight: 700;
  }

  .content {
    height: calc(100% - 44px - 58px - 34px);
    overflow: hidden;
  }
</style>
