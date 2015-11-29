$(document).ready(function(){
   initTabs();
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

function selectTab(tabString) {
    
}

