function getArtistNews(artist_id) {
	var link = 'http://developer.echonest.com/api/v4/artist/news';
	$.ajax({
        url: link,
        data: { 
            "api_key": api_key,
            "id": 'spotify:artist:' + artist_id,
            "format": 'json'
        },
        cache: true,
        type: "GET",
        success: function(response) {
            if(response && response.response && response.response.news) {
                showArtistNews(response.response.news);
            }
        }
    });
}

function showArtistNews(news) {
    for(var i in news) {
        $("#profile-timeline-tab-content-ul").append(
            '<li>' + news[i].name + '</li>'
        );
    }
}

function getArtistInfo(artist_id) {
	var link = 'http://developer.echonest.com/api/v4/artist/profile';
	$.ajax({
        url: link,
        data: { 
            "api_key": api_key,
            "id": 'spotify:artist:' + artist_id,
            "format": 'json',
            "bucket": 'artist_location'
        },
        cache: true,
        type: "GET",
        success: function(response) {
            if(response && response.response && response.response.artist.artist_location) {
                showArtistInfo(response.response.artist.artist_location);
            }
        }
    });
}

function showArtistInfo(info) {
    for(var att in info) {
        $("#profile-about-tab-content-ul").append(
            '<li>' + info[att] + '</li>'
        );
    }
}

function getArtistImage(artist_id) {
	var link = 'http://developer.echonest.com/api/v4/artist/images';
	$.ajax({
        url: link,
        dataType: 'jsonp',
        data: { 
            "api_key": api_key,
            "id": 'spotify:artist:' + artist_id,
            "format": 'jsonp'
        },
        cache: true,
        type: "GET",
        success: function(response) {
            if(response && response.response && response.response.images) {
                showArtistImage(response.response.images);
            }
        }
    });
}

function showArtistImage(images) {
    for(var i in images) {
        $("#profile-photos-tab-content-ul").append(
            '<li><img src="' + images[i].url + '"></img></li>'
        );
    }   
}

function getTopTracks(artist_id) {
    var link = 'https://api.spotify.com/v1/artists/' + artist_id + '/top-tracks';
    $.ajax({
        url: link,
        data: { 
            "country": "US"
        },
        cache: true,
        type: "GET",
        success: function(response) {           
            if(response && response.tracks) {
                showTopTracks(response.tracks);
            }
        }
    });
}

function showTopTracks(tracks) {
    for(var i in tracks) {
        $("#profile-songs-tab-content-ul").append(
            '<li>' + tracks[i].name + '</li>'
        );
    }   
}

function getSimilarArtists(artist_id) {
    var link = 'http://developer.echonest.com/api/v4/artist/similar';
    $.ajax({
        url: link,
        data: { 
            "api_key": api_key,
            "id": 'spotify:artist:' + artist_id,
            "format": 'json'
        },
        cache: true,
        type: "GET",
        success: function(response) {           
            if(response && response.response && response.response.artists) {
                showSimilarArtists(response.response.artists);
            }
        }
    });
}

function showSimilarArtists(artist) {
    for(var i in artist) {
        $("#profile-artists-tab-content-ul").append(
            '<li>' + artist[i].name + '</li>'
        );
    }   
}

