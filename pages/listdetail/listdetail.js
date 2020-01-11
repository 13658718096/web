// pages/listdetail/listdetail.js
//获取应用实例  
var app = getApp()
Page({
  data: {
    loadHidden: true,//初始化变量，默认‘数据加载中...’提示框隐藏
    moreHidden: 'none',//‘数据存在时,显示加载更多商品按钮,默认值为不显示'
    current: 0,
    shopList: [],//初始化数据
    page: 2,//分页从第二页开始
    index: 2,//分页第二页的索引值
    catId: 0,//小类的初始化id
     },  

  onLoad: function (options) {
    this.setData({ loadHidden: false })//进入首页页面时，显示数据之前，将‘数据加载中...’提示框显示
    var objectId = options.title;//category/index.wxml页面传过来的头部标题
    //更改头部标题
    wx.setNavigationBarTitle({//更改头部导航栏标题
      title: objectId,//标题更改为category/index.wxml页面传过来的头部标题
      success: function () {
      },
    });

    //页面初始化 options为页面跳转所带来的参数
    var cat_id = options.cat_id;//category/index.wxml页面传过来的小类id值
    var that = this;//切换指针
    that.setData({
      loadHidden: false,
      catId: cat_id,
     })
    //ajax请求数据
    wx.request({
      url: app.d.ceshiUrl + '/Product/listsmalltype',//接口地址
      method: 'post',//以post方式提交
      data: {cat_id: cat_id},//携带小类id到接口地址中处理
      header: {
        'content-type': 'application/x-www-form-urlencoded'//编码方式
      },
      success: function (res) {
        var shoplist = res.data.pro;//数据回调成功后，将json化的数据数组res.data.pro赋值给shoplist
        that.setData({
          shopList: shoplist,//为shopList赋值
          moreHidden: true,//初始化隐藏之后，第一次进入首页加载完数据后，开始显示加载更多按钮  
        })
      },
      error: function (e) {
        wx.showToast({//弹出提示框
          title: '网络异常！',
          duration: 2000//时长
        });
      },
      complete: function () {//数据加载完毕后
        //显示出加载中的提示
        that.setData({ loadHidden: true })// 数据加载完成之后，隐藏‘数据加载中...’提示框,如果不把这里设置为true，加载框会一直显示加载状态     
      }
    })

  },

  //点击加载更多（类似于分页，从第二页开始，因此初始化要设置page为2,每次点击加载更多时候，page+1,并利用concat()，将分页数据逐一累加显示）
  getMore: function (e) {
    var that = this;
    var page = that.data.page;//当前页码默认为2
    wx.request({
      url: app.d.ceshiUrl + '/Product/get_more',//接口地址
      method: 'post',
      data: {//把以下参数带入到接口地址中处理
        page: page,//当前页码
        cat_id: that.data.catId,//小类id
           },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {//回调成功
        var prolist = res.data.pro;//把回调以后得到的res.data.pro数组数据的值赋给prolist
        if (!prolist) {//如果数组中的数据加载完成后，处理以下情况
          that.setData({ moreHidden: 'none' })//没有数据的时候，不显示‘加载更多’按钮
          wx.showToast({
            title: '没有更多数据！',//提示框显示没有更多数据
            duration: 2000
          });
          return false;//这个不能少
        }
          that.setData({
            page: page + 1,//当前页码每次加一
            shopList: that.data.shopList.concat(prolist)//把这一次获得的数据累加到上一次之后,存放数据的就是shopList数组
        });
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
