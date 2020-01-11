//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    loadHidden: true,//初始化变量，默认‘数据加载中...’提示框加载时显示
    moreHidden: 'none',//‘数据存在时,显示加载更多商品按钮,默认值为不显示'，也就是讲显示‘数据加载中’，点击查看更多按钮默认为隐藏
    imgUrls:[],//默认为空，初始化数据
    indicatorDots:true,//默认显示
    autoplay:true,//默认自动播放
    interval:5000,//5000毫秒
    duration:1000,//1000毫秒
    circular:true,//使用衔接动画
    productData: [],//存放分页累加数据，初始化为空
    page: 2,//分页显示，从第2页开始显示
    index: 2,//索引
    // 滑动
    imgUrl: [],

  },
  /**幻灯片参设定start */
  changeIndicatorDots: function (e) {
    this.setData({//设置指示点的值
      indicatorDots: !this.data.indicatorDots
    })
  },
  changeAutoplay: function (e) {
    this.setData({//设置自动播放
      autoplay: !this.data.autoplay
    })
  },
  intervalChange: function (e) {
    this.setData({//设置播放间隔时长
      interval: e.detail.value
    })
  },
  durationChange: function (e) {
    this.setData({//设置滑动动画时长
      duration: e.detail.value
    })
  },
  /**幻灯片参设定end */

  /**———幻灯片和首页商品列表Api接口调用后台数据——start */
  onLoad: function (options) {
    this.setData({ loadHidden: false })//进入首页页面时，显示数据之前，将‘数据加载中...’提示框显示
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Ad/index',//请求的Api接口
      method: 'post',//以post方式传值
      data: {},//传递参数为空，表示不传递任何参数
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'//头部编码方式，不能换，否则会出错
      },
      success: function (res) {//回调成功
        var ggtop = res.data.ggtop;//获得接口中的res.data.ggtop数据，并且赋值给ggtop 
        var prolist = res.data.prolist;//获得接口中的res.data.prolist数据，并且赋值给prolist,这里的数据其实就是首页产品列表页 
        //that.initProductData(data);
        that.setData({
          imgUrls: ggtop,//设定imagUrls的数据为ggtop 数组
          productData: prolist,//设定productData的数据为prolist数组(json以后) 
          moreHidden: true,//初始化隐藏之后，第一次进入首页，回调第一页数据成功后，开始显示加载更多按钮           
        });
        //endInitData
      },
      fail: function (e) {//回调数据失败的时候,提示网络异常
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
      complete: function () {//数据加载完毕后
        //显示出加载中的提示
        that.setData({ loadHidden: true })// 数据加载完成之后，隐藏‘数据加载中...’提示框,如果不把这里设置为true，加载框会一直显示加载状态     
      }
    })

  },
  /**———幻灯片和首页商品列表Api接口调用后台数据——end */
  onReachBottom: function () {
    var that = this;
     that.onLoad();
  },

  //点击加载更多（类似于分页，从第二页开始，因此初始化要设置page为2,每次点击加载更多时候，page+1,并利用concat()，将分页数据逐一累加显示）
  getMore: function (e) {
    var that = this;
    var page = that.data.page;
    wx.request({
      url: app.d.ceshiUrl + '/Ad/getlist',
      method: 'post',
      data: { page: page },//把当前page参数带入到'/Ad/getlist'动作中去运行
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'//传输html表单表单默认的编码方式
      },
      success: function (res) {
        var prolist = res.data.prolist;//获得接口中的res.data.prolist数据，并且赋值给prolist 
        if (!prolist) {
          that.setData({ moreHidden: 'none' })//没有数据的时候，不显示‘加载更多’按钮
          //return false;
          wx.showToast({
            title: '没有更多商品！',
            duration: 2000
          });
          return false;
        }
        //that.initProductData(data);
        that.setData({
          page: page + 1,//当前页码加一 
          productData: that.data.productData.concat(prolist)//把这一次获得的数据累加到上一次之后,注意prolist不是第一页的prolist(onLoad:function(options){})，而是第二页开始分页后的prolist,只是取了个相同的名字
        });
        //endInitData
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    })
  },
})
