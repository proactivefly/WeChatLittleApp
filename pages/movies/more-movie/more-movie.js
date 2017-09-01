// 拿到全局变量
var app = getApp()
var util = require('../../../utils/util.js')
Page({
  data: {
    movies: {},
    navigateTitle: "",
    requestUrl: "",
    totalCount: 0,
    isEmpty: true,
  },
  // 页面加载方法
  onLoad: function (options) {
    // 获取上一个页面传递过来的url数据，页面标题
    var category = options.category;
    // 动态设置页面标题
    this.data.navigateTitle = category;
    var dataUrl = "";
    // 根据用户点击设置url
    switch (category) {
      case "正在热映":
        dataUrl = app.globalData.doubanBase +
          "/v2/movie/in_theaters";
        break;
      case "即将上映":
        dataUrl = app.globalData.doubanBase +
          "/v2/movie/coming_soon";
        break;
      case "豆瓣Top250":
        dataUrl = app.globalData.doubanBase + "/v2/movie/top250";
        break;
    }
    // 动态设置当前页面标题
    wx.setNavigationBarTitle({
      title: this.data.navigateTitle
    })
    // 把url数据响应在data中供其他函数使用
    this.data.requestUrl = dataUrl;
    // 发送http请求数据，并执行回调函数
    util.http(dataUrl, this.processDoubanData)
  },
  // 下滑下载更多
  onScrollLower: function (event) {
    var nextUrl = this.data.requestUrl +
      "?start=" + this.data.totalCount + "&count=20";
    util.http(nextUrl, this.processDoubanData)
    // 发起请求时showloading效果
    wx.showNavigationBarLoading()
  },
  // 下拉刷新
  onPullDownRefresh: function (event) {
    var refreshUrl = this.data.requestUrl +
      "?star=0&count=20";
    this.data.movies = {};
    this.data.isEmpty = true;
    this.data.totalCount = 0;
    util.http(refreshUrl, this.processDoubanData);
    // 开启loading效果
    wx.showNavigationBarLoading();
  },
  // 处理数据
  processDoubanData: function (moviesDouban) {
    var movies = [];
    for (var idx in moviesDouban.subjects) {
      var subject = moviesDouban.subjects[idx];
      var title = subject.title;
      if (title.length >= 6) {
        title = title.substring(0, 6) + "...";
      }
      // [1,1,1,1,1] [1,1,1,0,0]
      // 保存电影临时数据
      var temp = {
        stars: util.convertToStarsArray(subject.rating.stars),
        title: title,
        average: subject.rating.average,
        coverageUrl: subject.images.large,
        movieId: subject.id
      }
      // push单个电影
      movies.push(temp)
    }
    var totalMovies = {}

    //如果要绑定新加载的数据，那么需要同旧有的数据合并在一起
    if (!this.data.isEmpty) {
      totalMovies = this.data.movies.concat(movies);
    }
    else {
      totalMovies = movies;
      this.data.isEmpty = false;
    }
    this.setData({
      movies: totalMovies
    });

    this.data.totalCount += 20;
    // 加载完数据隐藏loading效果
    wx.hideNavigationBarLoading();
    // 设置完数据结束下拉刷新结束下拉刷新
    wx.stopPullDownRefresh()
  },
  // 页面准备之后修改标题
  onReady: function (event) {
    wx.setNavigationBarTitle({
      title: this.data.navigateTitle
    })
  },
  // 点击某个电影方法
  onMovieTap: function (event) {
    var movieId = event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: '../movie-detail/movie-detail?id=' + movieId
    })
  },
})