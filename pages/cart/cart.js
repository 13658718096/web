var app = getApp();
// pages/cart/cart.js
Page({
  data: {
    page: 1,
    minusStatuses: ['disabled', 'disabled', 'normal', 'normal', 'disabled'],//默认的－和＋框几种状态，不设置点击加减不会有加一或者减一的效果
    total: 0,//汇总结算金额默认为0
    carts: []//默认购物车为空
  },
  /**加载页面时显示购物车列表-start-*/
  onLoad: function (options) {//进入页面时下载购物车中的数据
    this.loadProductData();//调用loadProductData: function (){}函数
    this.sum();//调用this.sum()函数
  },
  onShow: function () {
    this.loadProductData();
  },  
  // 数据案例,实际上就是添加购物车数据的逐条显示
  loadProductData: function () {
    var that = this;//切换指针
    wx.request({//接口请求
      url: app.d.ceshiUrl + '/Shopping/index',//接口地址
      method: 'post',//post方式提交数据
      data: {
        user_id: app.d.userId//携带用户id参数到接口中运行
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'//编码方式
      },
      success: function (res) {//回调数据成功
        var cart = res.data.cart;//拿到回调的res.data.cart数据，并把它赋值给cart.注意这里的json化后的cart数组数据包含了所有添加到购物车的N条记录
        that.setData({
          carts: cart,//设置cart值赋给carts
        });
      },
    });
  },
  /**加载页面时显示购物车列表-end-*/

  /**金额汇总this.sum()函数,这是一个通用金额汇总功能函数-start-*/
  sum: function () {
    var carts = this.data.carts;//当前的购物车中的商品条数列表，简单的讲就是添加了多少件商品.注意this.data.carts指的是cart.wmxl中<view wx:for="{{carts}}" ...>... 的{{carts}
    // 计算总金额
    var total = 0;//总金额初始化为0
    for (var i = 0; i < carts.length; i++) {//遍历购物车长度，即有多少件商品
      if (carts[i].selected) {//是否在购物车中选择了相应的商品，如果有执行下面代码
        total += carts[i].num * carts[i].memberprice;//注意原来为carts[i].price但是我的关键字是memberprice所以要稍作改动否则会出现nan或者null的错误
        //carts[i].num和carts[i].memberprice在小程序打印后的结果是carts[1] /**1购物车中有1条记录，为2购物车中有2条记录*/
        //                                                       ▼ 0 {7} /**0这里表示购物车第一个位置，即索引为0，可理解为第一条记录。7表示有7个字段
        //                                                           id:104 /**id字段 */
        //                                                           num:3  /**数量字段 */
        //                                                           memberprice:88.0 /**会员价字段*/.......
        //total +表示把前面选择的商品选项和后面的商品选项累加，得到总的商品金额
      }
    }
    // 写回经点击修改后的数组
    this.setData({
      carts: carts,//记得每次要最后要设定购物车值
      total: '¥ ' + total//设定总金额
    });
  },
  /**金额汇总this.sum()函数,这是一个通用金额汇总功能函数-end-*/

  /** 点击自减按钮-start-*/
  bindMinus: function (e) {
    var that = this;//切换指针
    var index = parseInt(e.currentTarget.dataset.index);//parseInt()只有字符串中的第一个数字会被返回。parseInt("10"); 10 parseInt("19",10);		//返回 19 (10+9)
    var num = that.data.carts[index].num;//这里得到的是cart.wmxl前台中
    // <view wx:for="{{carts}}" ...>... 中{{carts}对应that.data.carts[]
    //<!-- 减号 --> data-index="{{index}}" ....>-</text>中{{index}}对应index
     // <!--数值 --> <input .... value="{{item.num}}" />中{{item.num}}对应num
    // 如果只有1件了，就不允许再减了
    if (num > 1) {//数量大于1时，自减1
      num--;
    }
    console.log(num);
    var cart_id = e.currentTarget.dataset.cartid;
    wx.request({
      url: app.d.ceshiUrl + '/Shopping/up_cart',//接口地址
      method: 'post',//post方式提交数据
      data: {//携带的参数
        user_id: app.d.userId,//用户id
        num: num,//减一后的数量，作为参数带到接口中处理
        cart_id: cart_id//购物车表id
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'//编码方式
      },
      success: function (res) {//回调数据成功
        var status = res.data.status;//回调数据中更新数据成功以否状态
        if (status == 1) {//等于1的时候更新成功
          // 只有大于一件的时候，才能normal状态，否则disable状态
          var minusStatus = num <= 1 ? 'disabled' : 'normal';//小于等于1的时候点击状态不可用，否则正常可用
          // 购物车数据
          var carts = that.data.carts;//前台cart.wxml中wx:for="{{carts}}"数据
          carts[index].num = num;//减一后的数量赋值给前台cart.wxml中wx:for="{{carts}}"数据，里{{index}}索引号为index,数量为num的值即把每次减一后的数量赋值到                                     // <!--数值 --> <input .... value="{{item.num}}" 
          // 按钮可用状态
          var minusStatuses = that.data.minusStatuses;
          minusStatuses[index] = minusStatus;
          // 将数值与状态写回
          that.setData({
            minusStatuses: minusStatuses
          });
          that.sum();
        } else {
          wx.showToast({
            title: '操作失败！',
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
  /** 点击自减按钮-end-*/

  /** 点击自曾按钮-start-*/
  bindPlus: function (e) {
    var that = this;
    var index = parseInt(e.currentTarget.dataset.index);
    var num = that.data.carts[index].num;
    // 自增
    num++;
    console.log(num);
    var cart_id = e.currentTarget.dataset.cartid;
    wx.request({
      url: app.d.ceshiUrl + '/Shopping/up_cart',
      method: 'post',
      data: {
        user_id: app.d.userId,
        num: num,
        cart_id: cart_id
      },
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: function (res) {
        var status = res.data.status;
        if (status == 1) {
          // 只有大于一件的时候，才能normal状态，否则disable状态
          var minusStatus = num <= 1 ? 'disabled' : 'normal';
          // 购物车数据
          var carts = that.data.carts;
          carts[index].num = num;
          // 按钮可用状态
          var minusStatuses = that.data.minusStatuses;
          minusStatuses[index] = minusStatus;
          // 将数值与状态写回
          that.setData({
            minusStatuses: minusStatuses
          });
          that.sum();
        } else {
          wx.showToast({
            title: '操作失败！',
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
  /** 点击自曾按钮-end-*/

  bindCheckbox: function (e) {
    /*绑定点击事件，将checkbox样式改变为选中与非选中*/
    //拿到下标值，以在carts作遍历指示用
    var index = parseInt(e.currentTarget.dataset.index);
    //原始的icon状态
    var selected = this.data.carts[index].selected;
    var carts = this.data.carts;
    // 对勾选状态取反
    carts[index].selected = !selected;
    // 写回经点击修改后的数组
    this.setData({
      carts: carts
    });
    this.sum()
  },
 /**选中按钮状态，全选，不选，反选以及只选某个商品按钮-start- */
  bindSelectAll: function () {
    // 环境中目前已选状态
    var selectedAllStatus = this.data.selectedAllStatus;
    // 取反操作
    selectedAllStatus = !selectedAllStatus;
    // 购物车数据，关键是处理selected值
    var carts = this.data.carts;
    // 遍历
    for (var i = 0; i < carts.length; i++) {
      carts[i].selected = selectedAllStatus;//选中购物车某项值时显示在全选按钮之后显示金额
    }
    this.setData({
      selectedAllStatus: selectedAllStatus,//选中状态赋值，此步不可少
      carts: carts//购物车赋值，此步不可少
    });
    this.sum()//调用sum()函数得到总金额
  },
 /**选中按钮状态，全选，不选，反选以及只选某个商品按钮-end- */

  /**检查选项按钮-start- */
  bindCheckout: function () {
    // 初始化toastStr字符串
    var toastStr = '';
    // 遍历取出已勾选的id
    for (var i = 0; i < this.data.carts.length; i++) {
      if (this.data.carts[i].selected) {
        toastStr += this.data.carts[i].id;//把获得的每件购物商品串联起来
        toastStr += ',';//用什么串联呢，用，号
      }
    }
    if (toastStr == '') {//如果id为空
      wx.showToast({
        title: '请选择要结算的商品！',//提示文字
        duration: 2000//2000毫秒
      });
      return false;
    }
    //存回data
    wx.navigateTo({
      url: '../order/pay?cartId=' + toastStr,//成功跳转的地址
    })
  },
  /**检查选项按钮-end- */

  bindToastChange: function () {
    this.setData({
      toastHidden: true
    });
  },

   /**删除每件商品按钮-start- */ 
  removeShopCard: function (e) {
    var that = this;//切换指针
    var cardId = e.currentTarget.dataset.cartid;//促发事件当前目标数据cartid(这里是购物车表的id)
    wx.showModal({
      title: '提示',
      content: '你确认移除吗',
      success: function (res) {
        res.confirm && wx.request({//发出请求
          url: app.d.ceshiUrl + '/Shopping/delete',//接口地址
          method: 'post',//post方式提交数据
          data: {
            cart_id: cardId,//携带此参数到接口中处理
          },
          header: {
            'Content-Type': 'application/x-www-form-urlencoded'//编码方式
          },
          success: function (res) {//回调成功
             var data = res.data;//回调成功后的数组数据
            if (data.status == 1) {//回调成功后的数组数据中状态为1，表示删除成功
               that.loadProductData();//加载购物车数据
            } else {
              wx.showToast({
                title: '操作失败！',
                duration: 2000
              });
            }
          },
        });
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
   /**删除每件商品按钮-end- */
})