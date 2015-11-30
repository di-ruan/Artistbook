var artist_id = "43ZHCT0cAZBISjO8DG9PnE";
var api_key = "XUYQDKM596JS3A6GC";

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
            //console.log(response);
            if(response && response.tracks) {
            	var tracks = response.tracks;
            	for(var i=0; i<tracks.length; i++) {
            		console.log(tracks[i].name);
            	}
            }
        }
    });
}

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
            //console.log(response);
            if(response && response.response && response.response.news) {
            	var news = response.response.news;
            	for(var i=0; i<news.length; i++) {
            		console.log(news[i].name);
            	}
            }
        }
    });
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
            console.log(response);
            if(response && response.response && response.response.artist.artist_location) {
            	var location = response.response.artist.artist_location;
            	console.log(location.city);
            }
        }
    });
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
            console.log(response);
            if(response && response.response && response.response.images) {
            	var images = response.response.images;
            	for(var i=0; i<images.length; i++) {
            		console.log(images[i].url);
            	}
            }
        }
    });
}

getTopTracks(artist_id);
getArtistNews(artist_id);
getArtistInfo(artist_id);
getArtistImage(artist_id);