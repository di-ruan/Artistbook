var id = "43ZHCT0cAZBISjO8DG9PnE";

function getTopTracks(id) {
	var link = 'https://api.spotify.com/v1/artists/' + id + '/top-tracks';
	$.ajax({
        url: link,
        data: { 
            "country": "US"
        },
        cache: true,
        type: "GET",
        success: function(response) {
            console.log(response);
            if(response && response.tracks) {
            	var tracks = response.tracks;
            	for(var i=0; i<tracks.length; i++) {
            		console.log(tracks[i].name);
            	}
            }
        }
    });
}

getTopTracks(id);