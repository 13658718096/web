// pages/category/index.js//index.js
//获取应用实例  
var app = getApp();
Page({
  data: {
    // types: null,
    typeTree: {}, // 数据缓存
    currType: 0,
    // 当前类型
    "types": [
    ],//初始化一级大类数据
    typeTree: [],//初始化二级小类数据
  },
  /**进入分类页面时加载相关数据：左边的大类数据和右边一个大类对应的N个小类的数据-start-*/
  onLoad: function (option) {
    var that = this;//切换指针
    wx.request({//数据请求
      url: app.d.ceshiUrl + '/Category/index',//Api接口地址
      method: 'post',//post方式提交
      data: {},//不携带任何参数到接口地址中处理
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'//头部编码方式
      },
      success: function (res) {//成功回调数据
        var status = res.data.status;
        if (status == 1) {//如果成功回调
          var list = res.data.list;//将回调的大类数据数组赋值给list
          var catList = res.data.catList; //将回调的小类数据数组赋值给catList
          that.setData({
            types: list,//将小类数组数据list赋值给types
            typeTree: catList[0],//注意0的下标表示右侧将显示（currType: 1）也就是休闲食品所包含的对应小类.只显示小类下标为0的第一组小类数据也就是第一个大类休闲食品                                     //对应的N个若干小类。其中0表示第1个索引位置大类
            currType: 1, /*此项控制着右侧导航栏选中的大类的项样式，为1表示选中休闲食品 ,为2表示选中粮油要和typeTree: catList[0]配合使用*/
          });
        } else {
          wx.showToast({
            title: res.data.err,
            duration: 2000,
          });
        }
        console.log(list)

      },
      error: function (e) {
        wx.showToast({
          title: '网络异常！',
          duration: 2000,
        });
      },

    });
  },
/**进入分类页面时加载相关数据：左边的大类数据和右边一个大类对应的N个小类的数据-end-*/

  tapType: function (e) {//点击左边大类显示右边相应的小类
    var that = this;
    const currType = e.currentTarget.dataset.typeId;//声明变量currType 等于event事件当前目标对象数据的大类id值

    that.setData({
      currType: currType//设置currType变量值
    });
    console.log(currType);//打印
    wx.request({
      url: app.d.ceshiUrl + '/Category/getcat',//数据处理第三方接口地址
      method: 'post',//以post方式传递
      data: { cat_id: currType },//把参数带到/Category/getcat接口地址中运行
      header: {
        'Content-Type': 'application/x-www-form-urlencoded'//编码方式
      },
      success: function (res) {//成功回调
        var status = res.data.status;//声明回调数据中的 res.data.status的值
        if (status == 1) {
          var catList = res.data.catList;//回调点击某个大类时，获得的相应小类数据
          that.setData({
            typeTree: catList,//把相应的小类数据赋值给typeTree
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
      }
    });
  }
})