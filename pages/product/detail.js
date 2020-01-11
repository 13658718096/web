// pages/product/detail.js
//获取应用实例  
var app = getApp();
//引入这个插件，使html内容自动转换成wxml内容
var WxParse = require('../../wxParse/wxParse.js');//小程序中不能解析html引入此插件把html解析成小程序认可的wxml
Page({
  firstIndex: -1,
  data: {
    shujuHidden: 'none',
    bannerApp: true,
    winWidth: 0,
    winHeight: 0,
    currentTab: 0, //tab切换,选项卡tab当前索引默认为 0
    productId: 0,//从首页产品表中传过来的每个产品id值默认值为0
    itemData: {},//每个相应的产品相关字段信息集合，如id,商品名称，价格，商品详细介绍等，默认为空，没有传值id为0时为空。
    buynum: 1,//初始化购买数量设定为1
    // 属性选择
    firstIndex: -1,
    //准备数据
      },
  /**id传值显示内容页中的数据集合信息-start-*/
  // 加载时通过首页产品的单个id传值
  onLoad: function (option) {
   var that = this;//切换指针
    that.setData({
      productId: option.productId,//把 productId值设置为首页index.wxml中url="../product/detail?productId={{item.id}}"传过来的id值
    });
    that.loadProductDetail();//调用下面的loadProductDetail: function () {}函数

  },
  // 商品详情数据获取
  loadProductDetail: function () {
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Product/index',//数据提交的Api接口地址
      method: 'post',//post方式提交
      data: {
        pro_id: that.data.productId,//把此参数提交到'/Product/index'地址中处理
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'//hmtl编码方式，默认的，换成其它方式不行
      },
      success: function (res) {
        var status = res.data.status;//接口数据中的值，为1时表示成功，否则 提示错误
        if (status == 1) {
          var pro = res.data.pro;//数据回调成功后，获得的以json数组解析的res.data.pro值赋给变量pro
          var contents = pro.contents/*pro数组中contents元素的值，并将它赋给变量contents*/
          WxParse.wxParse('contents', 'html', contents, that, 5);/*WxParse.wxParse('contents', 'html', contents, that, 5)中'contents'代表的是detail.wxml中data="{{wxParseData:contents.nodes}}绑定的contents数据名，contents是上面var contents = pro.contents传入的数据值也就是字段contents里面的图文混排内容，其它参数选项向后看。WxParse.wxParse(‘article’, ‘html’, this.data.article, this, 5);WxParse.wxParse(bindName , type, data, target,imagePadding)1.bindName绑定的数据名(必填)2.type可以为html或者md(必填)：但在实际应用中，发现此插件比较倾向于处理 html 的解析，对于 markdown语法只是简单的兼容。3.data为传入的具体数据(必填)4.target为Page对象,一般为this(必填)5.imagePadding为当图片自适应是左右的单一padding(默认为0,可选)，这里我选5*/
          that.setData({
            itemData: pro,//调成功后设置 itemData的值为pro
            shujuHidden: true
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000,
          });
        }
      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
        });
      },
    });
  },
  /**id传值显示内容页中的数据集合信息-end-*/
  /**绑定 bindtap="swichNav"事件-start-*/
  swichNav: function (e) {//点击tab切换
    var that = this;
    if (that.data.currentTab === e.target.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.target.dataset.current//设置当前选项卡index的值为促发事件目标数据的当前下标（索引或者index）
      })
    }
  }, 
  /**绑定 bindtap="swichNav"事件-end-*/
  /**绑定 bindchange="bindChange"事件-start-*/
  bindChange: function (e) {//滑动切换tab 
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  /**绑定 bindchange="bindChange"事件-end-*/
  /** 弹窗显示动画-start-*/
  setModalStatus: function (e) {
    var animation = wx.createAnimation({
      duration: 200,//duration:number类型，400毫秒，动画持续时间，单位 ms。
      timingFunction: "linear",//timingFunction:动画的效果,string类型，'linear'	为默认值表示线性动画
      delay: 0 //delay:动画延迟时间，单位 ms,number数字类型
    })

    this.animation = animation
    animation.translateY(300).step();/*对Y轴平移300px。Animation.translate(number tx, number ty),number tx
      当仅有该参数时表示在 X 轴偏移 tx，单位 px;number ty在 Y 轴平移的距离，单位为 px.而Animation.translateY(number translation)：number translation
      在 Y 轴平移的距离，单位为 px**/

    this.setData({
      animationData: animation.export()/*Array.<Object> Animation.export()导出动画队列。export 方法每次调用后会清掉之前的动画操返回值为animationData**/
    })

    if (e.currentTarget.dataset.status == 1) {//这里相当于detail.wxml中view class="bg_red white w50 fl_l" bindtap="setModalStatus" data-status="1">立即购买</view>中data-status="1"，不过js后台中触发事件后当前对象数据的状态时要写成e.currentTarget.dataset.status == 1

      this.setData(
        {
          showModalStatus: true//显示立即购买弹窗部分
        }
      );
    }
    setTimeout(function () {
      animation.translateY(0).step()//超时动画不平移
      this.setData({
        animationData: animation
      })
      if (e.currentTarget.dataset.status == 0) {//为0时弹窗不显示，默认为0
        this.setData(
          {
            showModalStatus: false//弹窗不显示
          }
        );
      }
    }.bind(this), 200)//绑定超时200毫秒
  },
  /** 弹窗显示动画-end-*/

  /**弹窗显示框里的购物车数量加减-start-*/
    changeNum: function (e) {
      var that = this;
      if (e.target.dataset.alphaBeta == 0) {//前台的detail.wmxl中alpha-beta连字符会转成驼峰命名法即alphaBeta,当等于0时，表示点击了递减
        if (this.data.buynum <= 1) {
          buynum: 1
        } else {
          this.setData({
            buynum: this.data.buynum - 1//每次递减1
          })
        };
      } else {//为1的时候，表示点击了递增价
        this.setData({
          buynum: this.data.buynum + 1//每次递增1
        })
      };
    },
  /**弹窗显示框里的购物车数量加减-end-*/
  //添加到收藏
  addFavorites: function (e) {
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Api/Product/col',
      method: 'post',
      data: {
        uid: app.d.userId,
        pid: that.data.productId,
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        // //--init data        
        var data = res.data;
        if (data.status == 1) {
          wx.showToast({
            title: '操作成功！',
            duration: 2000
          });
          //变成已收藏，但是目前小程序可能不能改变图片，只能改样式
          that.data.itemData.isCollect = true;
        } else {
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
/**添加到购物车-start-*/
  addShopCart: function (e) { //添加到购物车
    var that = this;
    wx.request({
      url: app.d.ceshiUrl + '/Shopping/add',//提交接口地址
      method: 'post',//post提交
      data: {//把以下三个参数提交到/Shopping/add接口地址进行处理
        uid: app.d.userId,//用户id
        pid: that.data.productId,//产品id
        num: that.data.buynum,//购买数量
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'//编码方式
      },
      success: function (res) {
        var data = res.data;
        if (data.status == 1) {
          var ptype = e.currentTarget.dataset.type;
          if (ptype == 'buynow') {
            wx.redirectTo({
              url: '../order/pay?cartId=' + data.cart_id//ptype类型为buynow跳转到../order/pay并携带参数cartId
            });
            return;
          } else {
            wx.showToast({
              title: '加入购物车成功',
              icon: 'success',
              duration: 2000
            });
          }
        } else {
          wx.showToast({
            title: data.err,
            duration: 2000
          });
        }
      },
      fail: function () {
        // fail
        wx.showToast({
          title: '网络异常！',
          duration: 2000
        });
      }
    });
  },
  /**添加到购物车-end-*/
   initNavHeight: function () {////获取系统信息
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        });
      }
    });
  },
  bannerClosed: function () {
    this.setData({
      bannerApp: false,
    })
  }
});
