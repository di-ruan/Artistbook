/**
 * Global var containing some config.
 */
var sa = {
    config: {
        tabNamesMap: {
            timeline: 'profile-timeline-tab',
            about: 'profile-about-tab',
            photos: 'profile-photos-tab',
            songs: 'profile-songs-tab',
            following: 'following-tab',
            history: 'history-tab'
        },
        maxArtistHistorySave: 20
    },
    historyVersion: 1,
    currentArtist: null,
    artistHistory: [],
    artistHistoryDictionary: {}
};

var artist_id1 = "43ZHCT0cAZBISjO8DG9PnE";
var artist_id2 = "2XBzvyw3fwtZu4iUz12x0G";
var api_key = "XUYQDKM596JS3A6GC";
// this token should be replaced every time running.
var access_token = 'BQCVwdHEh7-p6jZ4mvKyZBG6PUtzErnAG7RwsT5oV2sAtFNlETEtc2GZESOth7hZbRY8N3n2Dk34H69b_YzAJqVyN6y3DspWc80Y2IowrVwyuaBAHjTTY6AwPR9aqi9Zrv46sGyH_TV7hNBbPIT9_U4AosiTDLLekiLChDrE7hdCKyHY1ZnKGtx5hnY';

//TODO: autocomplete for searching by genre, style or mood
// when searching for genre, style or mood, we need have a autocomplete from the list and
// let the user to select what they want.
var genre_list = [], style_list = [], mood_list = [];

/**
 * Initializes the events
 */
$(document).ready(function(){    
    loadArtistHistory();
    initTabs();
    initPicModal();
    initProfilePic();
    initSearchBar();
    initSearchResults();
    loadProfile(artist_id1);
    initMetadata();    
});

function loadProfile(id) {
    var artist = {
        id: id
    };
    
    sa.currentArtist  = artist;
    addArtistToHistory(artist);
    
    getArtistPictureAndName(id, artist);
    getTopTracks(id, artist);
    getArtistNews(id, artist);
    getArtistInfo(id, artist);
    getArtistImage(id, artist);
    getSimilarArtists(id, artist);
    setFollowWidgetUrl(id);
}

/**
 * Initializes the tabs
 */
function initTabs() {
    var tabs = $('.x-tab');
    
    tabs.click(function(){
       var tab = $(this),
            contentId = '#' + tab.attr('data-content'),            
            content = $(contentId),
            tabsList = tab.closest('.x-tabs'),
            contentHolderId = '#' + tabsList.attr('data-content-holder'),
            contentHolder = $(contentHolderId),
            contents = contentHolder.find('.x-tab-content'),
            tabs = tabsList.find('.x-tab');
       
       tabs.removeClass('x-active');       
       tab.addClass('x-active');
       
       contents.removeClass('x-active');
       content.addClass('x-active');
    });   
}

/**
 * Selects a tab by id
 */
function selectTab(tabId) {
    $('#' + tabId).trigger('click');
}

/**
 * Selects a tab by tab name (see config)
 */
function selectTabByName(tabName){
    if(!tabName || !tabName.toLowerCase) {
        console.log('tab name required and has to be a string');
        return;
    }
    
    tabName = tabName.toLowerCase();
    
    if (sa.config.tabNamesMap[tabName]) {
        selectTab(sa.config.tabNamesMap[tabName]);
    } else {
        console.log("Tab name " + tabName + ' not found in tabNamesMap', sa.config.tabNamesMap);
    }
}

/**
 * Selects a profile tab
 */
function selectProfileTab(tabName) {
    selectTabByName(tabName);
}

/**
 * Selects a search tab
 */
function selectSearchTab(tabName) {
    selectTabByName(tabName);
}

/**
 * Initializes the pic modal events
 */
function initPicModal() {
    var imageModal = $('#image-modal'),
            x = imageModal.find('.x-x'),
            img = imageModal.find('img');
    
    img.click(function(e){
        e.preventDefault();
        return false;
    })
    
    imageModal.click(function(e){
        e.preventDefault();
        hidePicModal();
    });
    
    x.click(function(e){
        e.preventDefault();
        hidePicModal();
    })
}

/**
 * Hides the pic modal
 */
function hidePicModal() {
    var imageModal = $('#image-modal');      
    
    imageModal.removeClass('x-active');
}

/**
 * Displays the pic modal and changes the source of the pick to the src passed
 * as a param
 */
function showPicModal(picSrc) {
    var imageModal = $('#image-modal'),
        img = imageModal.find('img');
    
    imageModal.addClass('x-active');
    img.attr('src', picSrc);
}

/**
 * Initializes the event for profile pic
 */
function initProfilePic(){
    var profilePic = $('#profile-picture');    
    addModalPicEvent(profilePic);
}

/**
 * Adds click event to display modal pic
 */
function addModalPicEvent(pic) {
    var container = pic;
    
    if (!pic.is('img')) {
        pic = pic.find('img');        
    }
    
    container.click(function(e){
       e.preventDefault();
       
       var picSrc = pic.attr('src');
       
       if (picSrc) {
           showPicModal(picSrc);
       }
    });
}

/**
 * Sets the url for the profile pic
 */
function setProfilePicUrl(url){
    var profilePic = $('#profile-picture');
    profilePic.attr('src', url);
}

/**
 * Sets the url to the iframe containing the follow widget
 */
function setFollowWidgetUrl(artist_id) {
    var url = "https://embed.spotify.com/follow/1/?uri=spotify:artist:" + artist_id + "&size=basic&theme=light";
    $('iframe#follow-widget').attr('src', url);
    
}

/**
 * Sets the url for the iframe containing the play widget
 */
function setPlayWidgetUrl(url) {
    $('iframe#play-widget').attr('src', url);
}

function initSearchBar() {
    var searchBar = $('#main-search'),
        searchTermObject = {},
        timeoutId = null,
        searchTerm = '';
    
    searchBar.on("input change keyup paste", function() {                 
       if (timeoutId) {
           clearTimeout(timeoutId);
       }
       
       timeoutId = setTimeout(function(){
           timeoutId = null;

           var searchVal = searchBar.val(),
               searchType = $('.active').data("search");

           if (searchTerm == searchVal) {
               return;
           }
           
           searchTerm = searchVal;

           if (!searchTerm) {
               showArtistHistoryToSearchResults();
               return;
           }

           searchTermObject[searchType] = searchTerm;
           doSearch(searchTermObject);
       }, 1000);
    });

    $(".dropdown-menu li").click(function(){
        var search_hint = {
            NAME: 'Enter full or partial name of the artist...',
            GENRE: 'Enter genre of artists you are interested in...',
            STYLE: 'Enter style of artists you are interested in...',
            MOOD: 'How do you feel like now?'
        };
        var selText = $(this).text();
        $('.active').removeClass('active');
        $(this).addClass('active');
        $(this).parents('.input-group-btn').find('.dropdown-toggle').html(selText + ' <span class="caret"></span>');
        searchBar.attr('placeholder', search_hint[selText]);
    });

}

/**
 * Do search
 * @param searchTerm for now is a string of mood. It is better to make it as json object.
 */
function doSearch(searchTermObject) {
    addSearchToHistory(searchTermObject);
    cleanSearchResult();
    
    searchArtistByCriteria(searchTermObject, showArtistSearchResult);
}

/**
 * Get available genres, styles and mood for artist search.
 * Set vars in genre_list, style_list and mood_list.
 */
function initMetadata() {
    getGenreList(genre_list);
    getStyleList(style_list);
    getMoodList(mood_list);
    showSearchHistory();
    getFollowingList(showFollowingList);
}

function initSearchResults(){
    var searchBar = $('#main-search'),
        searchResults = $('#search-results');

    searchBar.focus(function(e){
        e.preventDefault();
        
        if (!searchBar.val()) {
            showArtistHistoryToSearchResults();
        }
        
        searchResults.addClass('x-display');
    });
    
    searchBar.blur(function(e){            
        setTimeout(function(){
            searchResults.removeClass('x-display');   
        }, 200);
    });
}

function showArtistHistoryToSearchResults() {
    var searchResults = $('#search-results'),
        history = sa.artistHistory;

    searchResults.empty();
    
    searchResults.append('<div class="x-section-header">Recent Searches</div>');
    
    history.forEach(function(historyArtist) {
        addArtistToSearchResults(historyArtist);
    });
}

function addArtistToSearchResults(artist) {
    var searchResults = $('#search-results');
    var artistHtml = [
        '<div class="x-artist-search-result">',
            '<div class="x-artist-img-holder"style="background-image: url(', 
                    artist.image_url + ')">',
            '</div>',
            '<div class="x-artist-info">',
                '<div class="x-artist-name">',
                    '<h4>',
                        artist.name,
                    '</h4>',
                '</div>',
                '<div class="x-artist-num-followers">',

                '</div>',
            '</div>',
        '</div>'
    ];

    var html = $(artistHtml.join('')); 
    
    html.click(function(e){
        e.preventDefault();
        loadProfile(artist.id);
    });
    
    searchResults.append(html);
}

function addArtistToHistory(artist) {    
    var newDictionary = {},
        newArray = [],
        i = 0;

    sa.artistHistory.forEach(function(historyArtist){
        if (i >= sa.config.maxArtistHistorySave - 1) {
            return false;
        }
        
        //Skip it
        if (artist.id == historyArtist.id) {
            return;
        }
        
        i++;       
        newDictionary[historyArtist.id] = historyArtist;
        newArray.push(historyArtist);
    });
    
    newArray.unshift(artist);
    newDictionary[artist.id] = artist;
    
    sa.artistHistory = newArray;
    sa.artistHistoryDictionary = newDictionary;
    
    setTimeout(function(){
        saveArtistHistory();
    }, 2500);
}

function saveArtistHistory() {
    localStorage.setItem('artist-history', JSON.stringify(sa.artistHistory));    
}

function loadArtistHistory(){
    var historyArray = localStorage.getItem('artist-history');
    
    if (historyArray) {
        sa.artistHistory = JSON.parse(historyArray);
        
        sa.artistHistory.forEach(function(artist){
           sa.artistHistory[artist.id] = artist;
        });
    }
}