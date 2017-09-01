var util = require('../../utils/util.js')
var app = getApp();
Page({
  // RESTFul API JSON
  // SOAP XML
  //粒度 不是 力度
  data: {
    inTheaters: {},
    comingSoon: {},
    top250: {},
    searchResult: {},
    containerShow: true,
    searchPanelShow: false,
  },
// 页面加载请求首页数据
  onLoad: function (event) {
    console.log('开始加载数据');
    //   请求地址
    var inTheatersUrl = app.globalData.doubanBase +
      "/v2/movie/in_theaters" + "?start=0&count=3";
    var comingSoonUrl = app.globalData.doubanBase +
      "/v2/movie/coming_soon" + "?start=0&count=3";
    var top250Url = app.globalData.doubanBase +
      "/v2/movie/top250" + "?start=0&count=3";
    // 调用请求方法（地址、key值、类型标题）
    this.getMovieListData(inTheatersUrl, "inTheaters", "正在热映");
    this.getMovieListData(comingSoonUrl, "comingSoon", "即将上映");
    this.getMovieListData(top250Url, "top250", "豆瓣Top250");
  },
// 点击获取更多电影
  onMoreTap: function (event) {
    // 获取点击事件的category属性
    var category = event.currentTarget.dataset.category;
    wx.navigateTo({
      // 豆瓣接口
      url: "more-movie/more-movie?category=" + category
    })
  },
// 获取单个电影详细信息
  onMovieTap:function(event){
    // 获取点击的电影id
    var movieId = event.currentTarget.dataset.movieid;
    wx.navigateTo({
      url: "movie-detail/movie-detail?id="+movieId
    })
  },
//请求电影数据方法 
  getMovieListData: function (url, settedKey, categoryTitle) {
    //   保存上下文环境
    var that = this;
    wx.request({
      url: url,
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: {
        "Content-Type": "json"
      },
    //   成功之后，调用处理电影数据方法
      success: function (res) {
        that.processDoubanData(res.data, settedKey, categoryTitle)
      },
      fail: function (error) {
        // fail
        console.log(error)
      }
    })
  },

  onCancelImgTap: function (event) {
      this.setData({
        containerShow: true,
        searchPanelShow: false,
        searchResult:{}
      }
    )
  },

  onBindFocus: function (event) {
    this.setData({
      containerShow: false,
      searchPanelShow: true
    })
  },

  onBindBlur: function (event) {
    var text = event.detail.value;
    var searchUrl = app.globalData.doubanBase + "/v2/movie/search?q=" + text;
    this.getMovieListData(searchUrl, "searchResult", "");
  },
// 处理电影数据
  processDoubanData: function (moviesDouban, settedKey, categoryTitle) {
    // 定义电影数据容器
    var movies = [];
    // 循环请求到的数据 
    for (var idx in moviesDouban.subjects) {
      var subject = moviesDouban.subjects[idx];
      var title = subject.title;
    //   简写标题
      if (title.length >= 6) {
        title = title.substring(0, 6) + "...";
      }
      // [1,1,1,1,1] [1,1,1,0,0]
      var temp = {
        stars: util.convertToStarsArray(subject.rating.stars),//星星个数
        title: title,//电影名字
        average: subject.rating.average,//平均分
        coverageUrl: subject.images.large,//封面图
        movieId: subject.id //电影id
      }
    //   push到电影容器内
      movies.push(temp)
    }
    var readyData = {};
    /*
        'inTheaters'：{
            "categoryTitle":"正在热映",
            "movies":[{}，{}，{}，单个电影信息...]
        },
        'comingSoon':{
            "categoryTitle":"即将上映",
            "movies":[{}，{}，{}，单个电影信息...]
        },
        'top250':{
            "categoryTitle":"top250",
            "movies":[{}，{}，{}，单个电影信息...]
        }
     */
    readyData[settedKey] = {
      categoryTitle: categoryTitle,
      movies: movies
    }
    // 加工后返回给data{}中
    this.setData(readyData);
  }
})