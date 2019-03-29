'use strict';

/* Controllers */

angular.module('macsocial.controllers', ['ngCookies', 'mgcrea.ngStrap'])

  .controller('postController', ['$scope', '$routeParams', '$http', 'Post', 'Stats', '$timeout', '$cookies', '$modal', '$filter', function($scope, $routeParams, $http, Post, Stats, $timeout, $cookies, $modal, $filter) {
  /* ************************************************************************************* 
    Posts Controller
   ************************************************************************************* */
    
   // check for login redirect cookie
   if ($cookies.glogin_rdirect && $cookies.glogin_rdirect != "none") {
    var newLoc = $cookies.glogin_rdirect;
    $cookies.glogin_rdirect = "none";
    window.location = newLoc;
   }

    $scope.loading = true;
    $scope.statusFilter = $routeParams.statusFilter || "pending";
    $scope.postAction = $routeParams.postAction;
    $scope.postActionId = $routeParams.postId;
    $scope.beforeFilter = "";
    $scope.stats = {};
    $scope.posts = [];

    $scope.postInfo = function(post) {
      var myModal = $modal({title: 'Post #' + post.POST_ID, content: $filter('summarizePostInfo')(post), show: true, html: true, width: "90%"});
    };

    $scope.isoOptions = {
      itemSelector: '.hubpost', 
      masonry: {columnWidth: 16}
    };
    $scope.loadPosts = function(status, before) {
      var concatPosts = status != 'pending' &&  $scope.statusFilter == status;
      $scope.statusFilter = status;
      Post.query({status: status, count: 20, before: before}).$promise.then(function(data){
          var localPosts = data.posts;
          $.each(localPosts, function(index, post){
            post.warming = true;
            if (post.POST_PROPERTIES.photo_width) {
              post.imgWidth = 300;
              post.imgHeight = 300 * (post.POST_PROPERTIES.photo_height/post.POST_PROPERTIES.photo_width);
            }
          });
          $scope.loading = false;
          if (concatPosts)
            $scope.posts =  $scope.posts.concat(localPosts);
          else
            $scope.posts = localPosts;
          $scope.beforeFilter = "";
          if (data.before) {
            $scope.beforeFilter = data.before;
          }
          $timeout(function(){
              angular.forEach($scope.posts, function(post) {post.warming = false;});
            }, 500);
          $timeout(function() {$scope.checkPostAction()}, 1500);
        }).catch(function(error) {
        });
      Stats.query().$promise.then(function(data){
          $scope.stats = {};
          angular.forEach(data, function(statsVal, statusKey) {
            $scope.stats[statusKey] = statsVal.COUNT;
          });
        });
    }
    $scope.nextPage = function() {
      $scope.loadPosts($scope.statusFilter, $scope.beforeFilter);
    }
    $scope.publishAll = function() {
      var pendingPosts = $.grep($scope.posts, function(post, index) {
        return (post.STATUS && post.STATUS == "pending");
      });
      var pendingPostIDs = $.map(pendingPosts, function(o) { return o["POST_ID"]; });
      Post.update({action: "publish", postIDs: pendingPostIDs}).$promise.then(function(data){
          if (data.success) {
            $scope.loadPosts("pending");
          } else {
          }
        }).catch(function(error) {});
    }
    $scope.toggleStar = function(post) {
      var action = post.starred === true ? "star" : "unstar";
      var localPost = post;
      post.starLoading = true;
      Post.update({action: action, postIDs: [post.POST_ID]}, function(data){
        localPost.POST_PROPERTIES.starred = localPost.starred;
        localPost.starLoading = false;
      })
    }
    $scope.publishPost = function(post) {
      var localPost = post;
      var previousStatus = post.STATUS;
      post.loadingPublish = true;
      Post.update({action: "publish", postIDs: [post.POST_ID]}, function(data){
        localPost.STATUS = "published";
        localPost.rejected = false;
        localPost.loadingPublish = false;
        $scope.stats[previousStatus] ? $scope.stats[previousStatus]-- : $scope.stats[previousStatus] = 0;
        $scope.stats["published"] ? $scope.stats["published"]++ : $scope.stats["published"] = 1;
        if ($scope.statusFilter == "pending" && $scope.countPostsByStatus("pending") == 0)
          $scope.loadPosts("pending");
      }); 
    }
    $scope.rejectPost = function(post) {
      var localPost = post;
      var previousStatus = post.STATUS;
      post.loadingRemove = true;
      Post.update({action: "unpublish", postIDs: [post.POST_ID]}, function(data){
        localPost.STATUS = "hidden";
        localPost.rejected = true;
        localPost.loadingRemove = false;
        $scope.stats[previousStatus] ? $scope.stats[previousStatus]-- : $scope.stats[previousStatus] = 0;
        $scope.stats["hidden"] ? $scope.stats["hidden"]++ : $scope.stats["hidden"] = 1;
        if ($scope.statusFilter == "pending" && $scope.countPostsByStatus("pending") == 0)
          $scope.loadPosts("pending");
      }); 
    }
    $scope.countPostsByStatus = function(status) {
      return $.grep($scope.posts, function(post, index) {
        return (post.STATUS && post.STATUS == status);
      }).length;
    };
    $scope.testIso = function(){
      $scope.$emit('iso-method', {name:'destroy', params:null});
    };
    $scope.$on("iso-init", function() {
    });
    $scope.checkPostAction = function() {
      if ($scope.statusFilter =="pending" && $scope.postAction && $scope.postActionId)
      {
        var actionPost = $scope.getPostByID($scope.postActionId);
        if (actionPost) {
          if ($scope.postAction == "approve") {
            $scope.publishPost(actionPost);
            $scope.userMessage = "Post #" + $scope.postActionId + " was published.";
          } 
          else if ($scope.postAction == "remove") {
            $scope.rejectPost(actionPost);
            $scope.userMessage = "Post #" + $scope.postActionId + " was removed.";
          }
        }
      }
    };
    $scope.getPostByID = function (searchId) {
      for (var i = 0; i<$scope.posts.length; i++)
      {
        if ($scope.posts[i].POST_ID && $scope.posts[i].POST_ID == searchId)
          return $scope.posts[i];
      }
      return null;
    };

    $scope.loadPosts($scope.statusFilter);

  }])

  .controller('feedController', ['$scope', '$aside', 'Feed', '$modal', function($scope, $aside, Feed, $modal) {
  /* ************************************************************************************* 
    Feeds Controller
   ************************************************************************************* */
    $scope.serviceValues = [
      {label: 'Twitter', value: 'twitter'},
      {label: 'Instagram', value: 'instagram'},
      {label: 'Facebook', value: 'facebook'}
    ];
    $scope.statusValues = [
      {label: 'Pending', value: 'pending'},
      {label: 'Published', value: 'published'}
    ];
    $scope.queryTypeValues = [
      {label: 'Posted By', value: 'user'},
      {label: 'Liked By', value: 'liked'},
      {label: 'Tagged With', value: 'tag'},
      {label: 'Keyword Search', value: 'search'}
    ];
    $scope.masters = {};
    $scope.newFeed = {};
    $scope.showDeleted = false;


    $scope.sortableOptions = {
      stop: function(e, ui) {
        // Reorder posts here
        var newOrder = $.map($scope.feeds, function(o) { return o["FEED_ID"]; });
        Feed.update({"feed": {"reorder": newOrder}}, function(data) {
          $scope.feeds = data.feeds;
        });
      }
    };

    $scope.loadFeeds = function(){
      Feed.query({deleted: $scope.showDeleted}, function(data) {
        $scope.feeds = data.feeds;
      });
    };
    $scope.loadFeeds();
    $scope.toggleDeleted = function() {
      $scope.showDeleted = !$scope.showDeleted;
      $scope.loadFeeds();
    }
    $scope.beginEdit = function(feed) {
      //console.log("Edit feed " + feed.FEED_ID + "!");
      // store pristine version in case of cancel
      $scope.masters[feed.FEED_ID] = angular.copy(feed);
      feed.editing = true;
    };
    $scope.saveEdit = function(feed) {
      //console.log("updating feed with data:");
      //console.log(feed);
      Feed.update({feed: feed}).$promise.then(function(data) {
        feed.editing = false;
        //console.log("update result is: ");
        //console.log(data);
      }).catch(function(error) {
        console.log("error saving feed");
        console.log(error);
      });
    };
    $scope.cancelEdit = function(feed) {
      //console.log("Cancel editing feed " + feed.FEED_ID + "!");
      // revert to stored copy
      for (var i=0; i < $scope.feeds.length; i++)
      {
        if ($scope.feeds[i].hasOwnProperty('FEED_ID') && $scope.feeds[i].FEED_ID == feed.FEED_ID)
          angular.copy($scope.masters[feed.FEED_ID], $scope.feeds[i]);
      }
      feed.editing = false;
    };
    $scope.beginNew = function(){
      //console.log("begin add new");
      $scope.addingNew = true;
    };
    $scope.cancelNew = function(){
      $scope.addingNew = false;
    };
    $scope.saveNew = function(feed) {
      Feed.put({feed: feed}).$promise.then(function(data) {
        //console.log(data);
         $scope.addingNew = false;
         $scope.newFeed = {};
         $scope.loadFeeds();
      }).catch (function (error) {
        });
    };
    $scope.deleteFeed = function(feed) {
      if (window.confirm("Are you sure you want to delete this feed?")) {
        Feed.update({"feed": {"delete": feed.FEED_ID}}).$promise.then(
            function (data) {
              $scope.loadFeeds();
            }
          );
      }
    }
    $scope.undeleteFeed = function(feed) {
      if (window.confirm("Are you sure you want to bring back this feed?")) {
        feed.DELETED = false;
        feed.ORDER = 0;
        //console.log(feed);
        Feed.update({"feed": feed}).$promise.then(
            function (data) {
              //console.log(data);
              $scope.loadFeeds();
            }
          );
      }
    }
  }])


  .controller('filterController', ['$scope', '$aside', 'Filter', function($scope, $aside, Filter) {
  /* ************************************************************************************* 
    Filters Controller
   ************************************************************************************* */
      $scope.filters = [];
      Filter.query({}, function(data) {
        $scope.filters = data.filters;
      })
  }]);;
