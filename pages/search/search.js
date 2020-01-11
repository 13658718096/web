var app = getApp();
// pages/search/search.js
Page({
  data: {
    informHidden:true,//初始化隐藏没有宝贝信息
    focus: true,//获取焦点，默认为false这里为true
    hotKeyShow:false,//默认热门搜索和历史搜索不显示，如果hotKeyShow为真，则显示，加载成功后再显示
    historyKeyShow:true,
    searchValue:'',//搜索框中的默认值为空
    page: 0,
    productData:[],//热门和历史搜索记录初始化为空
    historyKeyList:[],//历史搜索赋值为空
    hotKeyList:[],//热门搜索值为空
  },
  onLoad: function (options) {//进入页面加载的初始化数据
    var that = this;
    wx.request({
      url:app.d.ceshiUrl + '/Search/index',//接口地址
      method:'post',
      data: {uid: app.d.userId },//用户id
      header:{
        'Content-Type':'application/x-www-form-urlencoded'//编码方式
      },
      success: function (res) {
        var remen = res.data.remen;//回调成功后接口地址处理后json化的数据，代表热门搜索数据
        var history = res.data.history;//回调成功后接口地址处理后json化的数据，代表历史搜索数据

        that.setData({
          hotKeyShow: true,//显示热门搜索和历史搜索字段
          historyKeyList: history,//为historyKeyList赋值
          hotKeyList: remen,//为hotKeyList赋值
          informHidden: true,//加载完成之后仍然隐藏
        });
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    })
  },
  /**onReachBottom: function () {//这里要做适当处理，不然的话会反反复复加载数据
    //下拉加载更多多...
    this.setData({
      page: (this.data.page + 10)
    })

    this.searchProductData();
  },*/
  doKeySearch: function (e) {//历史搜索和热门搜索tap事件
    var key = e.currentTarget.dataset.key;//获取事件自定义data属性的key值
    //var length = e.currentTarget.dataset.length;
    //console.log(key);
    this.setData({
      searchValue: key,//把以上获得的key值赋给搜索框input表单的value值
      hotKeyShow: false,//隐藏热门和历史搜索字段的值
      historyKeyShow: false,
     //length:0,

    });

    this.data.productData.length = 0;
    this.searchProductData();//调用此函数
  },
  doSearch: function () {//搜索框tap事件
    var searchKey = this.data.searchValue;//把搜索框input表单中的值赋给searchKey值
    console.log(searchKey);
    if (!searchKey) {//没有值的时候
      this.setData({
        focus: true,
        hotKeyShow: true,//显示热门和历史搜索关键字段列表
        historyKeyShow: true,
      });
      return false;//返回
    };

    this.setData({
      hotKeyShow: false,//隐藏热门和历史搜索关键字段列表
      historyKeyShow: false,
    })

    this.searchProductData();//调用此函数搜索商品名称
    this.getOrSetSearchHistory(searchKey);//调用此此函数缓存历史搜索记录
  },
  getOrSetSearchHistory: function (key) {
    var that = this;
    wx.getStorage({
      key: 'historyKeyList',
      success: function (res) {
        console.log(res.data);

        //console.log(res.data.indexOf(key))
        if (res.data.indexOf(key) >= 0) {
          return;
        }

        res.data.push(key);
        wx.setStorage({
          key: "historyKeyList",
          data: res.data,
        });

        that.setData({
          historyKeyList: res.data
        });
      }
    });
  },
  searchValueInput: function (e) {//搜索表单input事件
    var value = e.detail.value;//执行事件后表单的value值
    this.setData({
      searchValue: value, //把value赋给searchValue值
    });
    if (!value && this.data.productData.length == 0) {//input搜索框中的表单value值不存在并且搜索到的记录个数为0个
      this.setData({
        hotKeyShow: true,//显示热门和历史搜索列表记录
        historyKeyShow: true,
      });
    }
  },
  searchProductData: function () {
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Search/searches',//接口地址
      method: 'post',
      data: {//把以下参数带到/Search/searches接口地址中处理
        keyword: that.data.searchValue,//搜索框的值赋给keyword
        uid: app.d.userId,//用户id
        page: that.data.page,//页码
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var data = res.data.pro;
        if (!data) {//这个不能少否则搜索到的空结果会提示有一个对象就是null
          that.setData({ informHidden: false})//没有数据的时候，显示没有更多宝贝
           return false;
        }
        that.setData({
          productData: that.data.productData.concat(data),
          informHidden: false,//点击搜索相关产品加载回调成功之后，没有宝贝提示框设置为显示
        });
      },
      fail: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      },
    });
  },

});