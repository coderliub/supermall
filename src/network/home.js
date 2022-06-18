import {request} from "@/network/request";

export function getHomeMultidata() {
  return request({
    url: '/home/multidata'
  })
}

export function getHomeGoods(type,page) {
  return request({
    url: 'home/data',
    params: {
      type,
      page
    }
  })
}
// let totalNums = []
//
// const nums1 = [111,22,333]
// const nums = [20,11,222]
//
// totalNums.push(...nums1)
