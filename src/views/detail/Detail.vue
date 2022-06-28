<template>
  <div id="detail">
    <detail-nav-bar class="detail-nav"
    @titleClick="titleClick"
    ref="nva" ></detail-nav-bar>

    <scroll class="content" ref="scroll"
    @scroll="contentScroll" :probe-type="3">
        <ul>
          <li v-for="item in $store.state.cartList">
            {{item}}
          </li>
        </ul>
      <detail-swiper :top-images="topImages"></detail-swiper>
      <detail-base-info :goods="goods"></detail-base-info>
      <detail-shop-info :shop="shop"></detail-shop-info>
      <detail-goods-info :detail-info="detailInfo"
                         @imageLoad="imageLoad"></detail-goods-info>
      <detail-param-info ref="params" :param-info="paramInfo"></detail-param-info>
      <detail-comment-info ref="comment" :comment-info="commentInfo"></detail-comment-info>
      <detail-recommend-info ref="recommend" :recommend-list="recommendsList"></detail-recommend-info>
    </scroll>
      <detail-bottom-bar @addToCart="addToCart" class="bottom-bar"></detail-bottom-bar>
      <back-top @click.native="backClick" v-show="isShowBackTop"></back-top>

<!--      <toast :message="message" :show="show"></toast>-->
  </div>
</template>

<script>
import DetailNavBar from "@/views/detail/childComps/DetailNavBar";
import DetailSwiper from "@/views/detail/childComps/DetailSwiper";
import DetailBaseInfo from "@/views/detail/childComps/DetailBaseInfo";
import DetailShopInfo from "@/views/detail/childComps/DetailShopInfo";
import DetailGoodsInfo from "@/views/detail/childComps/DetailGoodsInfo";
import DetailParamInfo from "@/views/detail/childComps/DetailParamInfo";
import DetailCommentInfo from "@/views/detail/childComps/DetailCommentInfo";
import DetailRecommendInfo from "@/views/detail/childComps/DetailRecommendInfo";
import DetailBottomBar from "@/views/detail/childComps/DetailBottomBar";
import BackTop from "@/components/content/backTop/BackTop";

import Scroll from "@/components/common/scroll/Scroll";
import {backTopMixin, itemListenerMixin} from "@/common/mixin";
// import Toast from "@/components/common/toast/Toast";

import  {getDetail, Goods,Shop,GoodsParam,getRecommend} from "@/network/detail";
import {debounce} from "@/common/utils";

import {mapActions} from "vuex";


export default {
  name: "Detail",
  components: {
    DetailNavBar,
    DetailSwiper,
    DetailBaseInfo,
    DetailShopInfo,
    DetailGoodsInfo,
    DetailParamInfo,
    DetailCommentInfo,
    DetailRecommendInfo,
    DetailBottomBar,
    Scroll,
    // Toast
  },
  mixins:[backTopMixin],
  data() {
    return {
      iid: null,
      topImages: [],
      goods: {},
      shop:{},
      detailInfo: {},
      paramInfo: {},
      commentInfo: {},
      recommendsList: [],
      themeTopYs: [],
      refresh: null,
      getThemeTopY: null,
      currentIndex: 0,
      // message: '',
      // show: false,
    }
  },
  created() {
    //1.保存传入的iid
    this.iid = this.$route.params.iid

    //2.根据iid请求详情数据
    getDetail(this.iid).then(res => {
      //1.获取顶部的图片轮播数据
      // console.log(res);
      const data = res.result
      this.topImages = data.itemInfo.topImages

      //2.获取商品信息
      this.goods = new Goods(data.itemInfo,data.columns,data.shopInfo.services)

      //3.创建店铺信息的对象
      this.shop = new Shop(data.shopInfo)

      //4.获取详情信息
      this.detailInfo = data.detailInfo

      //5.获取参数信息
      this.paramInfo = new GoodsParam(data.itemParams.info,data.itemParams.rule)

      //6.取出评论信息
      if(data.rate.cRate !== 0) {
        this.commentInfo = data.rate.list[0]
      }

      //1.第一次获取，值不对

      /*this.$nextTick(() => {
        //根据最新的数据，对应的Dom是已经被渲染出来了
        //但是图片依然是没有加载完（目前获取到offsetTop不包含其中的图片）
        this.themeTopYs = []

        this.themeTopYs.push(0);
        this.themeTopYs.push(this.$refs.params.$el.offsetTop)
        this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
        this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)

        // console.log(this.themeTopYs);
      })
      */
    })

    //3.请求推荐数据
    getRecommend().then(res => {
      // console.log(res);
      this.recommendsList = res.data.list
    })

    //4.给getThemeTopY赋值,进行防抖
    this.getThemeTopY = debounce(() => {
      this.themeTopYs = []
      this.themeTopYs.push(0);
      this.themeTopYs.push(this.$refs.params.$el.offsetTop)
      this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
      this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
      this.themeTopYs.push(Number.MAX_VALUE)
    },100)
  },
  mounted() {
    this.refresh = debounce(this.$refs.scroll.refresh, 500)
    this.$bus.$on('detailItemImgLoad', () => {
      this.refresh()
    })
  },
  // updated() {
  //   this.themeTopYs = []
  //   this.themeTopYs.push(0);
  //   this.themeTopYs.push(this.$refs.params.$el.offsetTop)
  //   this.themeTopYs.push(this.$refs.comment.$el.offsetTop)
  //   this.themeTopYs.push(this.$refs.recommend.$el.offsetTop)
  // },
  deactivated() {

  },
  methods: {
    ...mapActions(['addCart']),
    imageLoad() {
      this.refresh()

      this.getThemeTopY()
    },
    titleClick(index) {
      // console.log(index);
      this.$refs.scroll.scrollTo(0,-this.themeTopYs[index],300)
    },
    contentScroll(position) {
      //1.获取y值
      const positoinY = -position.y

      //2.positoinY和主题中值进行对比
      //[0,9738,9120,9452,Number.Max_VALUE]
      let length = this.themeTopYs.length
      for(let i = 0; i < length-1; i++){
        // if (positionY > this.themeTopYs[parseInt(i)] && positionY < this.themeTopYs[i+1]) {
        //   console.log(i);
        // }

        if(this.currentIndex !== i && (positoinY >= this.themeTopYs[i] && positoinY
        < this.themeTopYs[i+1])) {
          this.currentIndex = i;
          this.$refs.nva.currentIndex = this.currentIndex
        }

        // if(this.currentIndex !==i && ((i < length -1 && positoinY >= this.themeTopYs[i] && positoinY <
        //   this.themeTopYs[i+1]) || (i === length -1 && positoinY >= this.themeTopYs[i]))) {
        //     this.currentIndex = i;
        //     console.log(this.currentIndex);
        //     this.$refs.nva.currentIndex = this.currentIndex
        // }

        //3.是否显示回到顶部
        this.listenShowBackTop(position)
      }
    },
    addToCart() {
      //1.获取商品信息
      const product = {}
      product.image = this.topImages[0]
      product.title = this.goods.title
      product.desc = this.goods.desc
      product.price = this.goods.realPrice
      product.iid = this.iid

      //2.将商品加入到购物车里(1.Promise 2.mapActions)
      //调用vuex的mutations里的方法
      // this.$store.commit('addCart',product)
      this.addCart(product).then(res =>{
        // this.show = true;
        // this.message = res;
        //
        // setTimeout(() => {
        //   this.show = false
        //   this.message = ''
        // },1500)
        // console.log(res);

        this.$toast.show(res,2000)
      })

      // this.$store.dispatch('addCart',product).then(res => {
      //   console.log(res);
      // })
    }
  }
}
</script>

<style scoped>
  #detail {
    height: 100vh;
    position: relative;
    z-index: 9;
    background-color: #fff;
  }

  .detail-nav {
    position: relative;
    z-index: 9;
    background-color: #fff;
  }

  .content {
    position: absolute;
    height: calc(100% - 44px - 58px);
  }

  .bottom-bar {

  }
</style>
