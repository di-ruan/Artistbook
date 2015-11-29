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
            history: 'history-tab',
            searchresults: 'search-results-tab'
        }
    }
};

/**
 * Initializes the events
 */
$(document).ready(function(){
   initTabs();
   initPicModal();
   initProfilePic();
});

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
    pic.click(function(e){
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
function setFollowWidgetUrl(url) {
    $('iframe#follow-widget').attr('src', url);
}

/**
 * Sets the url for the iframe containing the play widget
 */
function setPlayWidgetUrl(url) {
    $('iframe#play-widget').attr('src', url);
}