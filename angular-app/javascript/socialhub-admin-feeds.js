var API_BASE_URL = "/admin/api/feeds";

var current_feeds = [];
var hbTemplate;
var $container = $('#hubposts');
$container.delegate("a.publish", "click", publishPost);
$container.delegate("a.remove", "click", rejectPost);
$container.delegate("input", "change", toggleStar);
		
$(function(){
  hbTemplate = Handlebars.compile($("#posts-template").html());
  loadPosts();
});
				
$("a[data-action]").click(function(evt){
  var buttonElem = $(this);
  evt.preventDefault();
  switch(buttonElem.attr("data-action")) {
    case "filter":
      postFilters.since = postFilters.before = "";
      //console.log("Load posts filtered by " + buttonElem.attr("data-filter-group") + ":" + buttonElem.attr("data-filter"));
      if (buttonElem.attr("data-filter-group")=="network")
      {
        postFilters.network = buttonElem.attr("data-filter");
        loadPosts();
        setNavSelection(buttonElem);
      }
      else //status filter
      {
        postFilters.status = buttonElem.attr("data-filter");
        loadPosts();
        setNavSelection(buttonElem);
      }
    break;
    case "publishall":
      postFilters.since = postFilters.before = ""
      publishAll();
    break;
    case "loadnewer":
      postFilters.since = SinceIndex;
      postFilters.before = "";
      loadPosts();
    break;
    case "loadolder":
      postFilters.before = BeforeIndex;
      postFilters.since = "";
      loadPosts();
    break;
  }
});

function loadPosts() {
  var url = API_BASE_URL;
  $container.addClass("hiding");
  $.ajax({
    dataType: "json",
    url: url,
    jsonp: true,
    success: handlePosts,
    data: postFilters,
    dataType: 'jsonp',
    jsonp: 'callback'
  });
}

function handlePosts(postData) {
  var posts = postData.posts;
  var new_posts = [];
  if ($container.hasClass("isotoped"))
    $container.isotope('destroy');
  $container.empty();
  current_posts = [];
  $.each(posts, function(postIndex, post){
    var new_post_elem = $(hbTemplate(post)).get(0);
    current_posts.push({
      id: post.POST_ID,
      el: new_post_elem,
      data: post
    });
    new_posts.push(new_post_elem);
    $container.append(new_post_elem);
  });
  var tempSince = BeforeIndex;
  BeforeIndex = SinceIndex;
  SinceIndex = tempSince;
  if (postData.before)
    BeforeIndex = postData.before;
  if (postData.since)
    SinceIndex = postData.since;
  if (!posts.length)
    noResultsMsg.clone().appendTo($container);
  $container.isotope();
  $container.isotope( 'on', 'layoutComplete', function() {
    $container.removeClass("hiding");
  })
  $container.isotope({
        itemSelector: '.hubpost',
        masonry: {
        columnWidth: 16
        }
      }).addClass("isotoped");
  $("a[data-action]").removeClass("loading");
}

function setNavSelection(selectedElem) {
  $("a[data-action]").removeClass("active loading");
  $(selectedElem).addClass("active loading");
}

/**  ------------------  INTERACTIONS ------------------ **/

function saveAction(action, postIDs, success, error) {
  var successFunc = success;
  var errorFunc = error;
  $.ajax({
    type: 'POST',
    url: API_BASE_URL,
    data: JSON.stringify({action: action, postIDs: postIDs}),
    success: successFunc,
    error: errorFunc,
    contentType: "application/json",
    dataType: 'json'
  });
}

function updatePosts(posts) {
  $.each(posts, function(index, postObj){
    current_posts[getPostIndex(postObj)].data = postObj;
  })
}

function getPostIndex(post) {
  for(var i=0; i<current_posts.length; i++)
  {
    if (current_posts[i].data.POST_ID == post.POST_ID)
      return i;
  }
}

function publishAll() {
  var idArray = [];
  for(var i=0; i<current_posts.length; i++)
  {
    if (current_posts[i].data.STATUS == "pending")
    {
      $(current_posts[i].el).find(".publish").addClass("loading");
      idArray.push(current_posts[i].data.POST_ID);
    }
  }
  if (idArray.length)
  {
    saveAction("publish", idArray, 
      function(data) {
        if (data.success) {
          loadPosts();
        } else{
          $container.find(".publish").removeClass("loading"); alert("failted to save action");
        }
      },
      function(data) {$container.find(".publish").removeClass("loading"); alert("failted to save action")}
      );
  }
  else
  {
    loadPosts();
  }
}

function toggleStar(starEvt) {
  var checkboxElem = this;
  var starOn = this.checked;
  var action = starOn ? "star" : "unstar";
  var postID = $(this).closest(".hubpost").attr("data-post-id");
  checkboxElem.disabled = true;
  $(checkboxElem).parent().addClass("loading");
  saveAction(action, [postID], 
    function(data) {
      if (data.success) {
        $(checkboxElem).parent().removeClass("loading");
        checkboxElem.disabled = false;
        $(checkboxElem).closest(".hubpost").toggleClass("popular");
        updatePosts(data.posts);
      } 
      else {
        $(checkboxElem).parent().removeClass("loading");
        checkboxElem.disabled = false;
        checkboxElem.checked = !starOn;
        alert("there was an error: " + data.message);
      }
    },
    function(data) { 
      $(checkboxElem).parent().removeClass("loading");
      checkboxElem.disabled = false;
      checkboxElem.checked = !starOn;
      alert("there was an error");
    }
  );
}

function publishPost(event) {
  var eventButton = $(event.target);
  var hubPostElem = eventButton.closest(".hubpost");
  var action = "publish";
  var postID = hubPostElem.attr("data-post-id");
  event.preventDefault();
  if (!eventButton.hasClass("loading")) {
    eventButton.addClass("loading");
    saveAction(action, [postID], 
      function(data) {
        if (data.success) {
          eventButton.removeClass("loading");
          hubPostElem.removeClass("rejected pending blocked hidden");
          hubPostElem.addClass("published");
          eventButton.hide(300);
          hubPostElem.find(".remove").show(300);
          updatePosts(data.posts);
        } else{
          eventButton.removeClass("loading"); alert("failted to save action");
        }
      },
      function(data) {eventButton.removeClass("loading"); alert("failted to save action")}
      );
  }
}

function rejectPost(event) {
  var eventButton = $(event.target);
  var hubPostElem = eventButton.closest(".hubpost");
  var action = "unpublish";
  var postID = hubPostElem.attr("data-post-id");
  event.preventDefault();
  if (!eventButton.hasClass("loading")) {
    eventButton.addClass("loading");
    saveAction(action, [postID], 
      function(data) {
        if (data.success) {
          eventButton.removeClass("loading");
          hubPostElem.removeClass("pending published blocked");
          hubPostElem.addClass("rejected hidden");
          eventButton.hide(300);
          hubPostElem.find(".publish").show(300);
          updatePosts(data.posts);
        } else {
          eventButton.removeClass("loading"); alert("failed to save action");  
        } 
      },
      function(data) {eventButton.removeClass("loading"); alert("failed to save action")}
      );
  }
  $(event.target).hide(300).closest(".hubpost").addClass("rejected");
}



/**  ------------------  HANDLEBARS HELPTERS ------------------ **/

Handlebars.registerHelper('isPopular', function(value, options) {
  if(value.POST_PROPERTIES.starred) {
  return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('ifGreater', function(v1, v2, options) {
  if(v1 > v2) {
  return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('propImageHeight', function(fixedWidth, imageWidth, imageHeight, options) {
  return(Math.floor(fixedWidth * (imageWidth/imageHeight)));
});

Handlebars.registerHelper('getId', function(value, options) {
  var escaped = Handlebars.Utils.escapeExpression(value);
  escaped = escaped.replace(/t/g, '');
  return escaped;
  });

Handlebars.registerHelper('ifCond', function(v1, v2, options) {
  if(v1 === v2) {
    return options.fn(this);
  }
  return options.inverse(this);
});

Handlebars.registerHelper('timeSince', function(ts) {
    var now = new Date();
    var ts = new Date(ts);
    var delta = new Date().getTime() - ts.getTime();

    delta = delta/1000; //us to s
    //console.log('Time delta is ' + new Date() + ' - ' + ts);
    var ps, pm, ph, pd, min, hou, sec, days;

    if(delta<=59){
        ps = (delta>1) ? "s": "";
        return delta+" second"+ps + " ago";
    }

    if(delta>=60 && delta<=3599){
        min = Math.floor(delta/60);
        sec = delta-(min*60);
        pm = (min>1) ? "s": "";
        ps = (sec>1) ? "s": "";
        return min+" minute"+pm + " ago";
    }

    if(delta>=3600 && delta<=86399){
        hou = Math.floor(delta/3600);
        min = Math.floor((delta-(hou*3600))/60);
        ph = (hou>1) ? "s": "";
        pm = (min>1) ? "s": "";
        return hou+" hour"+ph + " ago";
    } 

    if(delta>=86400 && delta<172800){
        //days = Math.floor(delta/86400);
        //hou =  Math.floor((delta-(days*86400))/60/60);
        //pd = (days>1) ? "s": "";
        //ph = (hou>1) ? "s": "";
        //return days+" day"+pd;
        return "yesterday";
    }

    if(delta>=172800 && delta<(86400*5)){
        days = Math.floor(delta/86400);
        hou =  Math.floor((delta-(days*86400))/60/60);
        pd = (days>1) ? "s": "";
        ph = (hou>1) ? "s": "";
        return days+" day"+pd + " ago";
    }

    return ts.toDateString();
});



/**  ------------------  SMALL POLYFILLS ------------------ **/


function objToQueryString(obj) {
  var str = [];
  for(var p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
}


// Console-polyfill. MIT license.
// https://github.com/paulmillr/console-polyfill
// Make it safe to do console.log() always.
(function(con) {
  'use strict';
  var prop, method;
  var empty = {};
  var dummy = function() {};
  var properties = 'memory'.split(',');
  var methods = ('assert,clear,count,debug,dir,dirxml,error,exception,group,' +
     'groupCollapsed,groupEnd,info,log,markTimeline,profile,profileEnd,' +
     'table,time,timeEnd,timeStamp,trace,warn').split(',');
  while (prop = properties.pop()) con[prop] = con[prop] || empty;
  while (method = methods.pop()) con[method] = con[method] || dummy;
})(this.console = this.console || {}); // Using `this` for web workers.

// IndexOf Polyfill
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (searchElement, fromIndex) {
      if ( this === undefined || this === null ) {
        throw new TypeError( '"this" is null or not defined' );
      }

      var length = this.length >>> 0; // Hack to convert object.length to a UInt32

      fromIndex = +fromIndex || 0;

      if (Math.abs(fromIndex) === Infinity) {
        fromIndex = 0;
      }

      if (fromIndex < 0) {
        fromIndex += length;
        if (fromIndex < 0) {
          fromIndex = 0;
        }
      }

      for (;fromIndex < length; fromIndex++) {
        if (this[fromIndex] === searchElement) {
          return fromIndex;
        }
      }

      return -1;
    };
  } 

