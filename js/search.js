'use strict';

$(document).on('click', '#s-result-icon', function () {
  var id = $(this).attr('data-spotifyid');
  loadProfile(id);
});

$(document).on('click', '#follow-widget', function () {
  console.log("clicked on follow widget");
});

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
    "bucket" : ["images", "hotttnesss", "genre", "id:spotify"],
  };
  ["name", "genre", "style", "mood", "artist_start_year_before"].forEach(function(e) {
    if (e in searchTerms) {
      q[e] = searchTerms[e];
    }
  });
  if (!q.name) {
    q.artist_location = "country:united states";
    q.sort = "hotttnesss-desc";
  }
  $.ajax({
    url: uri,
    data: q,
    cache: true,
    type: "GET",
    traditional: true,
    success: function(response) {
      if(response && response.response && response.response.artists) {
        if (next) {
          sa.state.searchResults = [];
          response.response.artists.forEach(function(e) {
            if (!e || !e.foreign_ids || e.foreign_ids.length <= 0) {
              console.log('skipped one search result: no spotify id');
              return;
            }
            var spotifyId = e.foreign_ids[0].foreign_id.substring('spotify:artist:'.length);
            e.id = spotifyId;
            getArtistPicture(spotifyId, function (err, imgUrl) {
              if (err) {
                return;
              }
              console.log('img url: ' + imgUrl);
              e.images = [];
              e.images.push({'url' : imgUrl});
              next(e);
            });
          });
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

var showArtistSearchResult = function(a) {
  var artist = {
      id: a.id,
      image_url: null,
      name: a.name,
      hotness: a.hotttnesss.toFixed(2)
  };
    
  if (a.images.length > 0) {
    artist.image_url = a.images[0].url;
  }
  
  addArtistToSearchResults(artist);
};

function getSearchHistory() {
  if (localStorage.getItem("search-history")) {
    return JSON.parse(localStorage.getItem("search-history"));
  } else {
    return [];
  }
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
    var img = 'no img';
    if (a.images && a.images.length > 0) {
      img = a.images[0].url;
    }
    var htmlString = '<div class="media s-artist-row">' +
      '<div class="media-left">' +
      '<a href="#">' +
      '<img class="media-object s-artist-icon-64" id="s-result-icon" data-spotifyid="' + a.id +
      '"src="' + img + '" alt="Artist">' +
      '</a>' +
      '</div>' +
      '<div class="media-body s-artist-holder">' +
      '<a href="#"><h5 class="media-heading" id="s-result-icon" data-spotifyid="' + a.id + '">' + a.name + '</h5></a>' +
      '</div>' +
      '</div>';
    $('#following-tab-content').append(htmlString);
  });
};

function getArtistPicture(artist_id, next) {
  var link = 'https://api.spotify.com/v1/artists/' + artist_id;
  $.ajax({
    url: link,
    cache: true,
    type: "GET",
    success: function(response) {
      if(response && response.images && response.images.length > 0) {
        next(null, response.images[0].url);
      } else {
        next({"msg" : "no img avai for this artist id: " + artist_id});
      }
    }
  });
}

var addArtistToVisitHistory = function(artist) {
  if (!localStorage.getItem('v-history')) {
    localStorage.setItem('v-history', '[]');
  }
  var vHistory = JSON.parse(localStorage.getItem('v-history'));
  for (var i = 0; i < vHistory.length; ++i) {
    if (vHistory[i].id === artist.id) {
      vHistory.splice(i, 1);
      i--;
    }
  }
  vHistory.splice(0, 0, artist);
  localStorage.setItem('v-history', JSON.stringify(vHistory));
  displayVisitHistory();
};

var displayVisitHistory = function() {
  if (!localStorage.getItem('v-history')) {
    return;
  }
  var $h = $("#history-tab-content");
  $h.empty();
  var vHistory = JSON.parse(localStorage.getItem('v-history'));
  vHistory.forEach(function(a) {
    var htmlString = '<div class="media s-artist-row">' +
      '<div class="media-left">' +
      '<a href="#">' +
      '<img class="media-object s-artist-icon-64" id="s-result-icon" data-spotifyid="' + a.id +
      '"src="' + a.image_url + '" alt="Artist">' +
      '</a>' +
      '</div>' +
      '<div class="media-body s-artist-holder">' +
      '<a href="#"><h5 class="media-heading" id="s-result-icon" data-spotifyid="' + a.id + '">' + a.name + '</h5></a>' +
      '</div>' +
      '</div>';
    $h.append(htmlString);
  });
};