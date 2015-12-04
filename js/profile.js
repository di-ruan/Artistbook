function getArtistPictureAndName(artist_id) {
    var link = 'https://api.spotify.com/v1/artists/' + artist_id;
    $.ajax({
        url: link,
        cache: true,
        type: "GET",
        success: function(response) {
            if(response && response.images && response.images.length > 0) {
                showArtistPicture(response.images[0].url);
            }
            showArtistName(response.name);
        }
    });
}

function showArtistPicture(url) {
    $("#profile-picture").attr("src", url);
}

function showArtistName(name) {
    $("#profile-name").text(name);
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
            if(response && response.response && response.response.news) {
                showArtistNews(response.response.news);
            }
        }
    });
}

function showArtistNews(news) {    
    var newsTabContent = $('#profile-timeline-tab-content');
    
    newsTabContent.empty();
    
    news.forEach(function(article){
        addNewsArticle(article, newsTabContent);
    });
}

function addNewsArticle(article, destination) {      
    var articleHtmlArray = [
        '<div class="x-news-article">',
            '<h4>',
                '<a target="_blank" href="' + article.url + '">',
                    article.name,
                '</a>',
            '</h4>',
            '<div class="x-article-date">',
                parseArticleDate(article.date_found),
            '</div>',
            '<div class="x-article-summary">',
                parseArticleSummary(article.summary, 300),
            '</div>',
        '</div>'
    ];
    
    var html = $(articleHtmlArray.join(''));
    
    destination.append(html);
}

function parseArticleSummary(summary, maxLength) {
    var words = summary.split(' '),
        cut = false,
        retStr = '';
    
    words.forEach(function(word){
        if (retStr.length + word.length + 1> maxLength) {
            cut = true;
            return false;
        }
        
        retStr += word + ' ';
    });
    
    if (cut) {
        retStr += '...';
    }
    
    return retStr;
}

function parseArticleDate(date) {
    var parts = date.split('T'),
        dateParts = parts[0].split('-'),
        year = dateParts[0],
        month = dateParts[1],
        day = dateParts[2];
    
    return month + '/' + day + '/' + year;        
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
    var aboutTabContent = $("#profile-about-tab-content");    
    aboutTabContent.empty();
    
    var center = info.location,
        src = [
            'https://maps.googleapis.com/maps/api/staticmap?center=',
                center,
            '&zoom=7&size=300x300&maptype=roadmap&markers=color:blue%7C' + center        
        ],
        imgHtml = '<img src="' + src.join('') + '"/>',
        aboutHtml = [];
        
    if (center) {
        aboutHtml.push('<div class="x-map-holder">');
        aboutHtml.push(imgHtml);
        aboutHtml.push('</div>');
    } 
        
    aboutHtml.push('<ul class="x-location-list">');
        
    $.each(info, function(key, value){
        aboutHtml.push('<li>' + value + '</li>');
    });
    
    aboutHtml.push('</ul>');
    
           
    
    aboutTabContent.append(aboutHtml.join(''));
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
    var photosTabContent = $("#profile-photos-tab-content");
    
    photosTabContent.empty();
        
    images.forEach(function(image){
        var imgHtml = [
            '<div class="x-photo-holder">',
                '<div class="x-photo-holder-inner">',
                    '<img src="' + image.url + '" />',
                '</div>',
            '</div>'
        ],
        imgHolder = $(imgHtml.join('')),
        img = imgHolder.find('img');
            
        img.load(function(){
           imgHolder.addClass('x-display');
           addModalPicEvent(imgHolder);
        });
        
        photosTabContent.append(imgHolder);
    });    
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
    var songsTabContent = $("#profile-songs-tab-content");   
    songsTabContent.empty();
    
    tracks.forEach(function(track){
        var imgUrl = '',
            albumText = '';
            
        if (track.album) {
            albumText = '<strong>Album:</strong> ' + track.album.name;
            
            if (track.album.images && track.album.images.length) {
                imgUrl = track.album.images[track.album.images.length - 1].url;
            }
        }
        
        var trackHtmlArray = [
            '<div class="x-track-holder">',
                '<div class="x-track-img-holder" style="background-image: url(',
                    imgUrl,
                    ')">',
                    '<a class="x-play-button"></a>',
                '</div>',
                '<div class="x-track-info">',
                    '<div class="x-track-name">',
                        '<h4>' + track.name + '</h4>',
                    '</div>',
                    '<div class="x-track-album">',
                        albumText,
                    '</div>',
                '</div>',
            '</div>'
        ];
        
        var trackHtml = $(trackHtmlArray.join('')); 
        
        trackHtml.click(function(e){
            e.preventDefault();            
            playSong(track);
        });
        
        songsTabContent.append(trackHtml);   
    });                
}

// TODO
function playSong(track) {
    console.log('play song called', track);
}

function getSimilarArtists(artist_id) {
    var link = 'http://developer.echonest.com/api/v4/artist/similar';
    $.ajax({
        url: link,
        dataType: 'jsonp',
        data: { 
            "api_key": api_key,
            "id": 'spotify:artist:' + artist_id,
            "format": 'jsonp',
            "bucket": 'id:spotify'
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

function showSimilarArtists(artists) {
    var ids = "";
    for(var i in artists) {
        if(artists[i].foreign_ids && artists[i].foreign_ids.length > 0) {
            var id = artists[i].foreign_ids[0].foreign_id;
            ids += id.slice(15) + ','
        }   
    }
    ids = ids.slice(0, -1);
    var link = 'https://api.spotify.com/v1/artists';
    $.ajax({
        url: link,
        data: { 
            "ids": ids
        },
        cache: true,
        type: "GET",
        success: function(response) {    
            if(response && response.artists) {
                $("#profile-artists-tab-content-ul").empty();
                for(var i in response.artists) {
                    if(response.artists[i].images && response.artists[i].images.length > 0) {
                        var image = response.artists[i].images[0].url;
                        $("#profile-artists-tab-content-ul").append(
                            '<li><img src="' + image + '"><a href="javascript:loadProfile(\''+ response.artists[i].id + '\')">' + response.artists[i].name + '</a></li>');
                    }
                }
            }
        }
    });
}
