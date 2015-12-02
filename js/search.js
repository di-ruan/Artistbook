'use strict';

/**
 * search artist from API
 * @param searchTerms
 * @param next(artists) function should display the search result and active the tab.
 * artists is an array of {id, name, images[url]}
 *
 */
function searchArtistByCriteria(searchTerms, next) {
  console.log("GET http://developer.echonest.com/api/v4/artist/search");
  var uri = 'http://developer.echonest.com/api/v4/artist/search';
  var q = {
    "api_key" : api_key,
    "bucket" : "images"
  };
  ["genre", "style", "mood", "artist_start_year_before"].forEach(function(e) {
    if (e in searchTerms) {
      q[e] = searchTerms[e];
    }
  });
  $.ajax({
    url: uri,
    data: q,
    cache: true,
    type: "GET",
    traditional: true,
    success: function(response) {
      if(response && response.response && response.response.artists) {
        if (next) {
          next(response.response.artists);
        }
      } else {
        console.log("invalid response");
      }
    }
  });
}

/**
 * called by app.js: initMetadata
 */
function getGenreList(rst) {
  console.log("GET http://developer.echonest.com/api/v4/artist/list_genres");
  $.ajax({
    url: "http://developer.echonest.com/api/v4/artist/list_genres",
    data: {
      "api_key" : api_key
    },
    type: "GET",
    success: function(response) {
      if(response && response.response && response.response.genres) {
        rst.length = 0;
        response.response.genres.forEach(function(e) {
          rst.push(e.name);
        });
      } else {
        console.log("invalid response");
      }
    }
  });
}

/**
 * called by app.js: initMetadata
 */
function getStyleList(rst) {
  console.log("GET http://developer.echonest.com/api/v4/artist/list_terms");
  $.ajax({
    url: "http://developer.echonest.com/api/v4/artist/list_terms",
    data: {
      "api_key" : api_key,
      "type" : "style"
    },
    type: "GET",
    success: function(response) {
      if(response && response.response && response.response.terms) {
        rst.length = 0;
        response.response.terms.forEach(function(e) {
          rst.push(e.name);
        });
      } else {
        console.log("invalid response");
      }
    }
  });
}

/**
 * called by app.js: initMetadata
 */
function getMoodList(rst) {
  console.log("GET http://developer.echonest.com/api/v4/artist/list_terms");
  $.ajax({
    url: "http://developer.echonest.com/api/v4/artist/list_terms",
    data: {
      "api_key" : api_key,
      "type" : "mood"
    },
    type: "GET",
    success: function(response) {
      if(response && response.response && response.response.terms) {
        rst.length = 0;
        response.response.terms.forEach(function(e) {
          rst.push(e.name);
        });
      } else {
        console.log("invalid response");
      }
    }
  });
}

// TODO: should show artists in search results
var showArtistSearchResults = function(artists) {
  console.log("TODO: should show artists in search results");
  console.log(artists);
  artists.forEach(function (a) {
    var img;
    if (a.images.length > 0) {
      img = a.images[0].url;
    } else {
      img = "no img";
    }
    $('#search-results-tab-content').append("<li>" + a.name + "(" + img +  ")</li>");
  });
};

// TODO: should show search history
var showSearchHistory = function() {
  var history = getSearchHistory();
  console.log("TODO: should show search history");
  console.log(history);
  $("#history-tab-content").empty();
  history.forEach(function(h) {
    $("#history-tab-content").append('<li>' + JSON.stringify(h) + '</li>');
  });
};

/**
 * update search history both in storage and UI, return true if added, otherwise false
 * @param searchTerms
 * @returns {boolean}
 */
var addSearchToHistory = function(searchTerms) {
  var history = getSearchHistory();
  var toAdd = true;
  for (var i in history) {
    if (isEquivalent(history[i], searchTerms)) {
      toAdd = false;
      break;
    }
  }
  if (toAdd) {
    history.push(searchTerms);
    setSearchHistory(history);
    showSearchHistory();
  }
  return toAdd;
};

function getSearchHistory() {
  if (localStorage.getItem("search-history")) {
    return JSON.parse(localStorage.getItem("search-history"));
  } else {
    return [];
  }
}

function setSearchHistory(history) {
  localStorage.setItem("search-history", JSON.stringify(history));
}

/**
 * check if 2 objects are equal by key-values
 * @param a
 * @param b
 * @returns {boolean}
 */
function isEquivalent(a, b) {
  var aProps = Object.getOwnPropertyNames(a);
  var bProps = Object.getOwnPropertyNames(b);
  if (aProps.length != bProps.length) {
    return false;
  }
  for (var i = 0; i < aProps.length; i++) {
    var propName = aProps[i];
    if (a[propName] !== b[propName]) {
      return false;
    }
  }
  return true;
}

// -- user --
function getFollowingList(next) {
  console.log('GET https://api.spotify.com/v1/me/following?type=artist');
  $.ajax({
    url: 'https://api.spotify.com/v1/me/following?type=artist',
    method: 'GET',
    headers: {
      "Authorization" : "Bearer " + access_token
    },
    success: function(response) {
      if (response && response.artists && response.artists.items) {
        next(response.artists.items);
      } else {
        console.log("invalid response");
      }
    }
  });
}

var showFollowingList = function(artists) {
  $('#following-tab-content').empty();
  artists.forEach(function(a) {
    $('#following-tab-content').append('<li>' + a.name + '</li>');
  });
};