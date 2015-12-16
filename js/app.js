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
            similarArtists: 'profile-artists-tab',
            following: 'following-tab',
            history: 'history-tab'
        },
        maxArtistHistorySave: 20,
        preventSearch: false,
        defaultArtistId: "43ZHCT0cAZBISjO8DG9PnE"
    },
    historyVersion: 1,    
    artistHistory: [],
    artistHistoryDictionary: {},
    state: {
        selectedSearchTab: null,
        selectedProfileTab: null,
        selectedSearchBy: null,
        searchTerm: null,
        profileArtist: null,
        playingSong: null,
        isHelpModalOpen: false,
        leftPaneCollapsed: false,
        searchResults: [],
        emptySearchResultsDisplayed: false,
        searchResultsExpanded: false,
        pictureModal: {
            open: false,
            url: ''
        }
    }
};

var artist_id2 = "2XBzvyw3fwtZu4iUz12x0G";
var api_key = "XUYQDKM596JS3A6GC";
// this token should be replaced every time from http://http://spotartist-web-auth.mybluemix.net/
var access_token = 'BQBuQ-ODuego1QlAPXoIW5k7FtEeiVYusqiOdMTTo1l12diy6utBY64VlFu7Zha8Mclh2TeUucYVj-eG0u7CIQ3PbO0SKx1Z7vfjOnIDMzB97liR0HnCn8dGmnYZDBAy-0ng-V7Frht64_GKkxBYU3hD4TwxQIaihW82OX8pZmit3ep0jtWLyJUO21k';

// when searching for genre, style or mood, we need have a autocomplete from the list and
// let the user to select what they want.
var genre_list = [], style_list = [], mood_list = [];

/**
 * Initializes the events
 */
$(document).ready(function(){        
    initFollowWidget();
    initTabs();
    initCollapse();
    initPicModal();
    initHelpModal();
    initProfilePic();
    initSearchBar();
    initSearchResults();
    initMetadata();
        
    loadArtistHistory();  
    var stateLoaded = loadState();
    
    if (!stateLoaded) {        
        loadProfile(sa.config.defaultArtistId);
    }  
});


function initFollowWidget() {
    var widgetIframe = $('#follow-widget');
    
    widgetIframe.click(function(){
        //set a 500ms delay, otherwise following list may requested before the new artist actually be added.
        setTimeout(function(){
            console.log("updated following list");
            getFollowingList(showFollowingList);
        }, 500);
    });
    
    /*
     * Awful hack to "listen" to clicks on the follow widget
     */
    function checkClick() {
        var active = $(document.activeElement);
        
        if(active.attr('id') == widgetIframe.attr('id')) {
            active.blur();            
            widgetIframe.trigger('click');
        }
        
        setTimeout(checkClick, 200);
    }
    
    checkClick();
}

function loadProfile(id) {
    var artist = {
        id: id
    };
    
    sa.state.profileArtist  = artist;
    
    addArtistToHistory(artist);
    
    getArtistPictureAndName(id, artist, addArtistToVisitHistory);
    getTopTracks(id, artist);
    getArtistNews(id, artist);
    getArtistInfo(id, artist);
    getArtistImage(id, artist);
    getSimilarArtists(id, artist);
    setFollowWidgetUrl(id);

    // Let the AJAX functions load
    setTimeout(function(){
        saveState();
    }, 3000);
}

/**
 * Initializes the tabs
 */
function initTabs() {
    var tabs = $('.x-tab');
    
    tabs.click(function(){
       var tab = $(this),
            tabId = tab.attr('id'),            
            contentId = '#' + tab.attr('data-content'),            
            content = $(contentId),
            tabsList = tab.closest('.x-tabs'),
            stateKey = tabsList.attr('data-state-key'),
            contentHolderId = '#' + tabsList.attr('data-content-holder'),
            contentHolder = $(contentHolderId),
            contents = contentHolder.find('.x-tab-content'),
            tabs = tabsList.find('.x-tab');
       
       tabs.removeClass('x-active');       
       tab.addClass('x-active');
       
       contents.removeClass('x-active');
       content.addClass('x-active');
       
       if(stateKey) {
           sa.state[stateKey] = tabId;
           saveState();
       }       
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
    });
}

function initHelpModal() {
    var helpButton = $('#help-button'),
        helpModal = $('#help-modal'),
        win = helpModal.find('.x-modal-window'),
        x = helpModal.find('.x-x'),
        okButton = helpModal.find('.x-ok-btn');

    helpButton.click(function(e){
        e.preventDefault();
        showHelpModal();
    });
    
    okButton.click(function(e){
        e.preventDefault();
        hideHelpModal();
    });
    
    helpModal.click(function(e){
        var target = $(e.target);
       
        if (target.closest('.x-modal-window').length) {
            return;
        }
        
        e.preventDefault();
        hideHelpModal();
    });
    
    x.click(function(e){
        e.preventDefault();
        hideHelpModal();
    });
}

/**
 * Hides the pic modal
 */
function hidePicModal() {
    var imageModal = $('#image-modal');         
    imageModal.removeClass('x-active');
        
    sa.state.pictureModal.open = false;
    sa.state.pictureModal.url = null;
    saveState();
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
    
    sa.state.pictureModal.open = true;
    sa.state.pictureModal.url = picSrc;
    saveState();
}

function hideHelpModal() {
    var helpModal = $('#help-modal');        
    helpModal.removeClass('x-active');
    sa.state.isHelpModalOpen = false;
    saveState();
}

function showHelpModal() {
    var helpModal = $('#help-modal');    
    helpModal.addClass('x-active'); 
    
    sa.state.isHelpModalOpen = true;
    saveState();
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
        searchTerm = null;
    
    searchBar.on("input change keyup paste", function(e) {          
        if (sa.config.preventSearch) {
            return;
        }
        
       if (timeoutId) {
           clearTimeout(timeoutId);
       }
       
       timeoutId = setTimeout(function(){                       
           timeoutId = null;

           var searchVal = searchBar.val(),
               searchType = $('.active').data("search");

           sa.state.searchTerm = searchVal;
           saveState();

           if (searchTerm === searchVal) {
               return;
           }
           
           searchTerm = searchVal;

           if (!searchTerm) {
               showArtistHistoryToSearchResults();
               return;
           }
           searchTermObject = {};
           searchTermObject[searchType] = searchTerm;
           doSearch(searchTermObject, searchType);
       }, 1000);
    });

    $(".dropdown-menu li").click(function(){
        var search_hint = {
            NAME: 'Enter full or partial name of the artist...',
            GENRE: 'Enter genre of artists (pop, funk, jazz, noise, etc)',
            MOOD: 'How do you feel like now (cool, happy, peaceful, etc)?'
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
function doSearch(searchTermObject, searchType) {
    $('#search-results').empty();
    searchArtistByCriteria(searchTermObject, showArtistSearchResult);
    
    sa.state.selectedSearchBy = searchType;
    saveState();
}

/**
 * Get available genres, styles and mood for artist search.
 * Set vars in genre_list, style_list and mood_list.
 */
function initMetadata() {
    getGenreList(genre_list);
    getStyleList(style_list);
    getMoodList(mood_list);
    getFollowingList(showFollowingList);
    displayVisitHistory();
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
        sa.state.searchResultsExpanded = true;
        saveState();
    });
    
    searchBar.blur(function(e){            
        setTimeout(function(){
            searchResults.removeClass('x-display');   
            sa.state.searchResultsExpanded = false;
            saveState();
        }, 200);
    });
}

function initCollapse() {
    var leftPane = $('#main-left-pane'),
        handle = leftPane.find('.x-drawer-handle');

    handle.click(function(e){
        e.preventDefault();
        
        if (leftPane.hasClass('x-collapsed')) {
            expandSideBar();
        } else {
            collapseSideBar();
        }
    });
}

function collapseSideBar() {    
    var leftPane = $('#main-left-pane');    
    leftPane.addClass('x-collapsed');
    
    sa.state.leftPaneCollapsed = true;
    saveState();
}

function expandSideBar() {    
    var leftPane = $('#main-left-pane');
    leftPane.removeClass('x-collapsed');
    
    sa.state.leftPaneCollapsed = false;
    saveState();
}

function showArtistHistoryToSearchResults() {
    var searchResults = $('#search-results'),
        history = sa.artistHistory;

    searchResults.empty();
    
    searchResults.append('<div class="x-section-header">Recent Searches</div>');
    
    history.forEach(function(historyArtist) {        
        addArtistToSearchResults(historyArtist, true);
    });
}

function addArtistToSearchResults(artist, preventAddToState) {
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
    
    sa.state.emptySearchResultsDisplayed = false;
    saveState();
    
    if (!preventAddToState) {
        sa.state.searchResults.push(artist);
        saveState();
    }
}

function showEmptySearchResultMessage() {
    var searchResults = $('#search-results'),
        html = [
            '<div class="x-empty-search">',
                '<div>',
                    '<strong>Your search did not match any artist</strong>',
                '</div>',
                '<div>Suggestions:</div>',
                '<ul class="x-suggestions">',
                    '<li>Make sure all words are spelled correctly</li>',
                    '<li>Try different keywords</li>',
                    '<li>Try more general keywords</li>',
                    '<li>Try fewer keywords</li>',
                '</ul>',
            '</div>'
        ];
        
    sa.state.emptySearchResultsDisplayed = true;
    searchResults.empty();
    searchResults.append(html.join(''));
    saveState();
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

function loadState() {
    var stateJson = localStorage.getItem('saved-state');
    
    if (!stateJson) {
        return false;
    }
    
    sa.state = JSON.parse(stateJson);    
    
    var state = sa.state;  
    
    if (state.leftPaneCollapsed) {
        collapseSideBar();
    }
    
    if (state.selectedSearchTab) {
        selectTab(state.selectedSearchTab);
    }
    
    if (state.selectedProfileTab) {
        selectTab(state.selectedProfileTab);
    }
    
    if (state.searchTerm) {        
        $('#main-search').val(state.searchTerm);
    }
    
    if (state.searchResults && state.searchResults.length) {
        var searchResults = state.searchResults;
        
        state.searchResults = [];
        
        searchResults.forEach(function(artist){
            addArtistToSearchResults(artist);
        });                
    } else if (state.emptySearchResultsDisplayed) {
        showEmptySearchResultMessage();
    }
    
    if (state.selectedSearchBy) {
        var btn = $('.input-group-btn li[data-search=' + state.selectedSearchBy + ']');        
        btn.trigger('click');
    }
    
    if (state.searchResultsExpanded) {
        sa.config.preventSearch = true;
        $('#main-search').trigger('focus');
        
        setTimeout(function(){
            sa.config.preventSearch = false;  
        }, 200);
    }
    
    if (state.pictureModal && state.pictureModal.open && state.pictureModal.url) {
        showPicModal(state.pictureModal.url);
    }
    
    if (state.isHelpModalOpen) {
        showHelpModal();
    }
    
    
    if (state.profileArtist) {
        var artist = state.profileArtist;
        
        showArtistPicture(artist.image_url);
        showArtistName(artist.name);
        showArtistNews(artist.news);
        showArtistInfo(artist.info);
        showArtistImage(artist.images);
        showSimilarArtists(artist.similar_artists);
        setFollowWidgetUrl(artist.id);
        showTopTracks(artist.tracks);                
    }
    
    if (state.playingSong) {
        playSong(state.playingSong, true);
    }        
    
    return true;
}

function saveState() {
    localStorage.setItem('saved-state', JSON.stringify(sa.state));
}