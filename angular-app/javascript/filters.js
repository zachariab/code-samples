'use strict';

/* Filters */

angular.module('macsocial.filters', []).
  filter('timeSince', function() {
    return function(ts) {
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
    };

  }).filter('summarizeFeedInfo', function() {
    return function(feed) {
          var rArray = ["<strong>"];
          switch(feed.SERVICE){
            case "twitter":
              rArray.push("Tweets");
            break;
            case "facebook":
              rArray.push("Facebook statuses");
            break;
            case "instagram":
              rArray.push("Instagram pictures");
            break;
          }
          switch(feed.QUERY_TYPE){
            case "user":
              rArray.push("</strong> that are <strong>posted by</strong> user <strong>" + feed.QUERY_TERM);
            break;
            case "liked":
              rArray.push("</strong> that are <strong>liked</strong> by user <strong>" + feed.QUERY_TERM);
            break;
            case "search":
              rArray.push("</strong> that match <strong>search</strong> term <strong>" + feed.QUERY_TERM);
            break;
            case "tag":
              rArray.push("</strong> that are <strong>tagged</strong> with <strong>#" + feed.QUERY_TERM);
            break;
          }
          rArray.push('</strong> and set status to <strong>' + feed.DEFAULT_STATUS +  '</strong>');
          return rArray.join(" ") + ".";
        };
  }).filter('summarizePostInfo', function() {
    return function(post) {
          function objToTable(obj, prefix) {
                          var rArray = [];
                          angular.forEach(obj, function(val, key) {
                            if (typeof(val) == "object")
                              rArray.push(objToTable(val, key));
                            else {
                              rArray.push('<tr><th style="text-transform: capitalize">' + ((prefix ? prefix + " / " : "") + key).toLowerCase().replace(/_/g, "\u00A0") + "</th><td>");
                              rArray.push(val);
                              rArray.push("</td></tr>");
                            }
                          });
                          return rArray.join(" ");
                        };
          function objToList(obj, prefix) {
                          var rArray = [];
                          angular.forEach(obj, function(val, key) {
                            if (typeof(val) == "object")
                              rArray.push(objToList(val, key));
                            else {
                              rArray.push("<dt>" + (prefix ? prefix + " / " : "") + key + "</dt><dd>");
                              rArray.push(val);
                              rArray.push("</dd>");
                            }
                          });
                          return rArray.join(" ");
                        };
          //return '<dl class="dl-horizontal">' + objToList(post, "") + "</dl>";
          return '<table class="table table-condensed">' + objToTable(post) + '</table>';
        };
  });
