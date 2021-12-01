var swiper;
var sel_chapter_id = null;
var sel_material_id = null;
var sel_sharing_key = null;

window.GGBT_book_general = (function() {
    "use strict";

    function initBooks($) {
        swiper = initSwipe($);


        // Decide if nav menu should be initially opened, depending on the display width
        showNavMenu($, (!isTabletScreen()), false, false);

        // Load all worksheets as screenshots
        $('.page.worksheet').each(function() {
            loadAppletForPage($, $(this), true);
        });

        processHash($);


        // Switch page when a link on the chapter page was clicked.
        $('.page.submenu .toc li, .page.submenu .submenu_matlist li').click(function(e) {
            if (! swiper.inSwipe) {
                e.stopPropagation();
                switchToPage($, $('#'+$(this).data('page-id')), false);
            }
        });

        // Switch the chapter when a menu item is clicked
        $('#menu li .menu-item').click(function(e) {
            stopPropagationIfInSingleton(e);
            var pageId = getIdFromMenuItem($, $(this).parents("li"));
            switchToPage($, $('#'+pageId), true);
        });

        // Switch the worksheet when a submenu item was clicked
        $('#menu .submenu-items li').click(function(e) {
            stopPropagationIfInSingleton(e);
            var page = $("#" + $(this).attr("data-target-id"));
            switchToPage($, page, true);
        });

        // Hide/Show Navigation when clicking on the bookmark arrow
        $('.j-bookmark-arrow').click(function(e) {
            stopPropagationIfInSingleton(e);
            if(!navVisible && window.GGBT_wsf_general) {
                window.GGBT_wsf_general.closeInfoFromView();
            }
            showNavMenu($, !navVisible, true);
        });

        if (getIEVersion() < 10) {
            $('.submenu li').hover(null, function() {
                $('#menuBg').css("box-shadow", "1px 0px 3px #F7F7F7");
            });
        }

        $('.j-nav-next.j-nav-nextisbookpage').click(function(e) {
            stopPropagationIfInSingleton(e);
            switchToPage($, activePage.next('.page'), true);
            return false;
        });
        $('.j-nav-prev.j-nav-previsbookpage').click(function(e) {
            stopPropagationIfInSingleton(e);
            switchToPage($, activePage.prev('.page'), true);
            return false;
        });
        $('.j-nav-overview-text').click(function(e) {
            stopPropagationIfInSingleton(e);
            if (activePage.hasClass("submenu")) {
                // Switch to title
                switchToPage($, $('#page_submenu_title'), true);
            } else {
                // Switch to chapter overview/title
                var chapterPage = activePage.prevAll('.submenu').first();
                switchToPage($, chapterPage, true);
            }
        });

        // Close menu when clicking outside of the menu on smartphone/tablet
        function stopPropagationIfInSingleton(e) {
            if (window.GGBT_gen_singleton &&
                    window.GGBT_gen_singleton.isOwnIFrame() &&
                    $(e.target).attr("target") !== "_blank") {
                e.preventDefault();
                e.stopPropagation();
            }
        }

        $('#page_container').click(function(e) {
            // stopPropagationIfInSingleton(e);
            if (isTabletScreen() && navVisible) {
                showNavMenu($, false, true, true);
            }
        });

        $(window).resize(function() {
            updateMenuWidth($);
        });

        $(window).on('hashchange', function() {
            if (!inUpdateHash) {
                processHash($);
            }
        });

        $('.page').scroll(function() {
            swiper.scrollToActivePage(false);
            refreshAppletHitPoints($);
        });

        /*$('#menu').scroll(function() {
         updateBookMarkArrow($);
         updateBookMarkOverlay($, true);
         });*/

        // register a key eventlistener for navigation shortcut keys
        document.addEventListener('keyup', handleKeyUp, false);

        if (window.GGBT_gen_singleton.isOwnIFrame()) {
            window.GGBT_gen_singleton.initCreator();
        }

        // initHeight(jQuery);
    }

    var currentPage = {
        href : "preload"
    };

    function setCurrentPage(page) {
        currentPage = page;
    }

    function getCurrentPage() {
        return currentPage;
    }

    return {
        setCurrentPage: setCurrentPage,
        getCurrentPage: getCurrentPage,
        initBooks : initBooks
    };
})();
$(window.GGBT_book_general.initBooks);

function handleKeyUp(e) {
    "use strict";

    // Switch pages on cursor left/right
    if (window.GGBT_wsf_general && (e.keyCode === 39 || e.keyCode === 37)) {
        // Check which item has the focus
        if ($(':focus').parents("article").length <= 0) {
            var scrollArea = (window.GGBT_wsf_general.getWorkSheet()[0].scrollWidth - window.GGBT_wsf_general.getWorkSheet()[0].clientWidth);
            var scrollLeft = window.GGBT_wsf_general.getWorkSheet()[0].scrollLeft;
            if (e.keyCode === 39 && (scrollArea === 0 || scrollLeft/scrollArea === 1)) {
                switchToPage($, activePage.next('.page'), true);
            } else if (e.keyCode === 37 && (scrollArea === 0 || scrollLeft/scrollArea === 0)) {
                switchToPage($, activePage.prev('.page'), true);
            }
        }
    }
}


var activePage = null;
var activeApplet = null;
var ajaxLoadingWorksheet = false;
var preLoadAppletCount = 1;
var WORKSHEET_APPLET_IDS = "worksheet_applet_ids_";

function switchToPage($, pageElem, animate) {
    if ((activePage != null && pageElem[0] == activePage[0]) || ! pageElem.hasClass("page")) {
        swiper.scrollToActivePage();
        return;
    }

    // If the page is a placeholder, move the contents of the page containing the real worksheet to the new
    if (pageElem.hasClass("j-isplaceholder")) {
        // Find the page containing the worksheet
        var oriPage = $('.page.worksheet[data-material_id="'+pageElem.attr("data-material_id")+'"]').not('.j-isplaceholder');

        // Swap the contents of the original page with the new page
        pageElem.find('.wsf-ws-scroller').append(oriPage.find('.wsf-ws-scroller .wsf-wrapper'));
        oriPage.addClass("j-isplaceholder");
        pageElem.removeClass("j-isplaceholder");
        if (oriPage.hasClass("ajax-toload")) {
            pageElem.addClass("ajax-toload");
            oriPage.removeClass("ajax-toload");
            pageElem.attr("data-url", oriPage.attr("data-url"));
        } else {
            // Move the contributors to the footer
            oriPage.find('.sWs-footer-contributors').contents().appendTo(pageElem.find('.jWS-footer .sWs-footer-contributors'));
        }
    }

    // Switch to new page
    activePage = pageElem;

    // initHeight($);

    swiper.scrollToActivePage();

    // Hide the nav menu for worksheets if the screen is to small to show both
    if (activePage.hasClass("worksheet") && navVisible) {
        var maxPageWidth = $(window).width() - $('#menuBg').width();
        var scroller = $('.wsf-ws-scroller', activePage)[0];
        var scrollBarWidth = scroller.offsetWidth - scroller.clientWidth;
        var pageWidth = scroller.scrollWidth + scrollBarWidth;
        if (pageWidth > maxPageWidth) {
            showNavMenu($, false, false, false);
        }
    }

    // scroll to  the top of the page
    $('body').scrollTop(0);
    $('body').css({visibility:"visible"});

    // Load the page from the server
    if (activePage.hasClass("ajax-toload")) {
        lazyLoadPage($, activePage, continueSwitch);
    } else if (!activePage.hasClass("ajax-load")) { // Avoid double loading of current page
        continueSwitch();
    }

    function loadWorksheet() {
        var newApplet = getAppletForPage($, activePage, sel_material_id);

        var appletType = window["appletType_" + sel_material_id];

        // Check if the new applet uses a different HTML 5 source and reload the page
        if (!(newApplet instanceof Array) && activeApplet != null && newApplet != null) {
            if (ggbHTML5LoadedCodebaseVersion != null && (ggbHTML5LoadedCodebaseVersion != newApplet.getHTML5CodebaseVersion() ||
                (newApplet.getViews().is3D && ggbHTML5LoadedScript.indexOf("web3d") == -1))) {

                if (appletType.indexOf("java") == -1 || !newApplet.isJavaInstalled()) {

                    // The page has to be reloaded
                    location.reload();
                }
            }
        }

        // Load the applet of the new page
        if (!bookIsOffline) {
            gaTrackMaterialView(sel_material_id, GA_MATERIAL_VIEW_BOOK);
        }
        loadAppletForPage($, activePage, false, sel_material_id);

        activeApplet = newApplet;

//            if (nextPage.length > 0) {
//                var nextApplet = getAppletForPage($, nextPage);
//                preLoadAllowed = (nextApplet != null && ggbHTML5LoadedCodebaseVersion == nextApplet.getHTML5CodebaseVersion() && preLoadAppletCount > 0);
//                preLoadAllowed = (nextApplet != null && preLoadAppletCount > 0 && nextAppletType.indexOf("compiled") > -1)
//            }

        refreshAppletHitPoints($);
    }

    function continueSwitch() {
        var preLoadAllowed = false;
        if (activePage.hasClass("worksheet")) {
            sel_material_id = getMaterialIdFromPage($, activePage);
            sel_sharing_key = getSharingKeyFromPage($, activePage);
            sel_chapter_id = null;
        } else {
            sel_material_id = null;
            sel_sharing_key = null;
            sel_chapter_id = activePage.attr("data-chapter_id");
        }

        // Select menu item
        markMenuItemSelected($, navVisible ? animate : false, false);

        // Update navigation items
        $('.j-nav-prev.j-nav-previsbookpage', activePage).toggleClass("inactive", ! activePage.prev().hasClass("page"));
        $('.j-nav-next.j-nav-nextisbookpage', activePage).toggleClass("inactive", ! activePage.next().hasClass("page"));

        var nextPage = activePage.nextAll('.worksheet').first();

        // Remove all loaded applets (except from the new and the next page)
        $('.worksheet.loaded').not(activePage).each(function() {
            if ((activePage.hasClass("worksheet") && preLoadAppletCount == 0) || this != nextPage[0]) {
                removeAppletForPage($, $(this));
            } else {
                startAppletAnimationForPage($, $(this), false);
            }
        });

        if (!window.GGBT_book_general.getCurrentPage().fromPopState) {
            updateHash($);
        } else {
            window.GGBT_book_general.getCurrentPage().fromPopState = false;
        }

        if (activePage.hasClass("worksheet")) {
            loadWorksheet();

            // Start the animation for the active applet
            //startAppletAnimationForPage($, activePage, true);

        }

        // load the next and the previous pages
        if (nextPage.hasClass("ajax-toload")) {
            lazyLoadPage($, nextPage, continuePreloadNextPage);
        } else {
            continuePreloadNextPage();
        }
        var prevPage = activePage.prevAll('.worksheet').first();
        if (prevPage.hasClass("ajax-toload")) {
            lazyLoadPage($, prevPage);
        }

        // Switch the active flexible worksheet
        if (window.GGBT_wsf_general) {
            window.GGBT_wsf_general.onSwitchWorksheet(activePage);

            activePage.append($('.wsf-info-wrapper'));
        }

        // initHeight($);

        function continuePreloadNextPage() {
            var page = nextPage;

            // check if preloading of the page is allowed
            if (page.length > 0) {
                var appletType = window["appletType_"+getMaterialIdFromPage($, page)];
                var applet = getAppletForPage($, page);

                // Preload the worksheet
                if (!applet instanceof Array && applet != null && preLoadAppletCount > 0 && appletType.indexOf("compiled") > -1) {
                    if (activePage.hasClass("worksheet")) {
                        loadAppletForPage($, page, false);
                    } else {
                        setTimeout(function() {loadAppletForPage($, page, false)}, 400);
                    }
                }
            }
        }
    }
}

function lazyLoadPage($, pageElem, onSuccess) {
    pageElem.removeClass("ajax-toload");
    pageElem.addClass("ajax-load");
    pageElem.find('.wsf-ws-scroller').addClass("ajax-loading-glass");
    if (window.GGBT_wsf_view) {
        window.GGBT_wsf_view.initNewWorksheet(pageElem);
    }
    ajaxLoadingWorksheet = true;
    $.get(pageElem.data("url"), null, function(resp) {
        pageElem.removeClass("ajax-load");
        pageElem.find('.wsf-ws-scroller').removeClass("ajax-loading-glass");
        ajaxLoadingWorksheet = false;

        // Delete the items from the table
        if (resp.substr(0,5) !== "error") {
            if (pageElem.has('.wsf-ws-scroller >.wsf-wrapper')) {
                $('.wsf-ws-scroller >.wsf-wrapper', pageElem).append(resp);
            } else {
                pageElem.append(resp);
            }

            // Move the contributors to the footer
            pageElem.find('.sWs-lazyload-contributors').contents().appendTo(pageElem.find('.jWS-footer .sWs-footer-contributors'));
            pageElem.find('.sWs-lazyload-contributors').remove();

            loadAppletForPage($, pageElem, true);


            if (window.GGBT_wsf_view) {
                window.GGBT_wsf_view.initNewWorksheet(pageElem);
            }

            if (typeof onSuccess === "function") {
                onSuccess();
            }
        } else {
            pageElem.addClass("ajax-toload");
            alert("An error occurred while loading the page from the server. Please refresh the page to try again.");
        }
    });
}

var navVisible = true;
function showNavMenu($, show, animate) {
    if (navVisible == show) return;

    var duration = animate ? 400 : 0;

    var complete = function() {
        if (window.GGBT_ws_header_footer) {
            window.GGBT_ws_header_footer.setWsScrollerHeight();
        }
        // initHeight($);
        refreshAppletHitPoints($);
    };

    navVisible = show;
    $('#menu-container').toggleClass('open', show);
    if(show) {
        // menu show
        $('#menu-container').animate( {left: '0px'}, {duration: duration});
        $('#menuBg').animate( {left: '0px'}, {duration: duration});

        if (isTabletScreen()) {
            $('#page_container').animate( {marginLeft: '0'}, {duration: duration, complete: complete});
            $('.wsf-ws-scroller').animate({opacity: '0.2'}, {duration: duration, complete: complete});
            $('.wsf-ws-scroller').css({pointerEvents: 'none'});
        } else {
            $('#page_container').animate( {marginLeft: getMenuWidth() + 'px'}, {duration: duration, complete: complete});
        }
    } else {
        // menu hide
        var margin = getMenuWidth();
        if (animate) {
            $('#menu-container').animate( {left: '-'+margin+'px'}, {duration: duration});
            $('#menuBg').animate( {left: '-'+margin+'px'}, {duration: duration});

            $('#page_container').animate({marginLeft: '0'}, {duration: duration, complete: complete});
            $('.wsf-ws-scroller').animate({opacity: '1'}, {duration: duration, complete: complete});
        } else {
            $('#menu-container').css({left: '-'+margin+'px'});
            $('#menuBg').css({left: '-'+margin+'px'});
            $('#page_container').css( {marginLeft: '0'});
            $('.wsf-ws-scroller').css({opacity: '1'});
        }
        $('.wsf-ws-scroller').css({pointerEvents: 'initial'});
    }
}

function updateMenuWidth($) {
     // set correct width for navigation 270 for smallphones, 300px for bigger screens
    // needs to be called on resize
    if(navVisible) {
        if (!isTabletScreen()) {
            $('#page_container').css( {marginLeft: getMenuWidth() + 'px'});
        }
    } else {
        $('#menu-container').css({left: '-' + getMenuWidth() + 'px'});
        $('#menuBg').css({left: '-' + getMenuWidth() + 'px'});
    }
}

function getMenuWidth() {
    return isSmallPhoneScreen() ? 270 : 300;
}


function refreshAppletHitPoints($) {
    if (activeApplet != null) {
        if (activeApplet instanceof Array) {
            for (i = 0; i < activeApplet.length; ++i) {
                var appletElement = window["applet_"+activeApplet[i]];
                if (typeof appletElement == 'object') {
                    appletElement.refreshHitPoints();
                }
            }
        } else {
            activeApplet.refreshHitPoints();
        }
    }
}

// Selects a menu item by setting the sel class and calling the callback function onSelectMenuItem.
function markMenuItemSelected($, animate) {

    $('#menu li').removeClass("sel"); // remove sel from menu and submenu items

    var page_id = activePage.attr("id");
    $('#menu li[data-target-id="'+page_id+'"]').addClass("sel").parents('.menu-opened').addClass("sel");

    openSelectedSubMenu($, animate);
}

/**
 * Builds the hash string that stores the current navigation information and changes it in the browser URL
 */
var inUpdateHash = false;
function updateHash($) {
    inUpdateHash = true;
    var hash = buildHashString($, getSelectedMenuId($));
    if (!window.GGBT_gen_singleton.isOwnIFrame() && hash) {
        try {
            parent.location.hash = hash;
        } catch (e) {
            location.hash = hash;
        }
        setTimeout(function () {
            inUpdateHash = false;
        }, 50);
    } else if (hash) {
        var msg = {
            type: "loadnextpage",
            href: window.GGBT_book_general.getCurrentPage().href + hash,
            contentType: "book",
            onlyPushToHash : true
        };
        window.parent.postMessage(JSON.stringify(msg), window.GGBT_gen_singleton.ORIGIN);
    }
}

function buildHashString($, menu_id) {
    if (sel_chapter_id != null && sel_chapter_id != "0") {
        return "#chapter/" + sel_chapter_id;
    } else if (sel_sharing_key != null && sel_sharing_key !== "") {
        return "#material/" + sel_sharing_key;
    } else if (sel_material_id != null) {
        return "#material/" + sel_material_id;
    } else {
        return '';
    }
}

function processHash($) {
    "use strict";
    var hash = location.hash,
        page;
    try {
        hash = parent.location.hash;
    } catch (e) {}
    console.log(hash);

    activePage = null;

    var hashes = hash.substr(1).split("/");
    if (hashes[0] === "chapter") {
        page = $('.page.submenu[data-chapter_id="'+parseInt(hashes[1])+'"]').eq(0);
    } else if (hashes[0] === "material") {
        if (isNaN(hashes[1])) {
            var material_id = getMaterialIdFromSharingKey($, hashes[1]);
        } else {
            var material_id = parseInt(hashes[1]);
        }
        page = $('.page.worksheet[data-material_id="'+material_id+'"]').eq(0); // There could be multiple pages for this material_id. Take the first.
    }
    if (page !== undefined && page.length > 0) {
        switchToPage($, page, false);
    }

    // fallback to title page
    if (activePage == null) {
        switchToPage($, $('#page_submenu_title'), false);
    }
}

function loadAppletForPage($, pageElem, onlyScreenshot, material_id) {
    if (!$(pageElem).hasClass('worksheet')) {
        return;
    }
    if (material_id == null) {
        material_id = getMaterialIdFromPage($, pageElem);
    }

    // Hide the applet until loading is complete
    showAppletsForPage($, pageElem, false);


    var applet = getAppletById(material_id);
    if (applet instanceof Array) {
        for (i = 0; i < applet.length; ++i) {
            var appletElement = window["applet_"+applet[i]];
            if (typeof appletElement == 'object') {
                loadApplet($, appletElement, applet[i], onlyScreenshot, true);
            }
        }
    } else if (applet instanceof Object) {
        loadApplet($, applet, material_id, onlyScreenshot, false);
    } else {
        return;
    }

    if (! onlyScreenshot) {
        pageElem.addClass("loaded");
    }
}

function loadApplet($, applet, material_id, onlyScreenshot, isElement) {

    // Check if the applet is already loaded
    var currentType = applet.getLoadedAppletType();
    if (currentType == 'java' || currentType == 'html5' || currentType == 'compiled' || (currentType == 'screenshot' && onlyScreenshot)) {
        showApplet($, material_id, true);
        applet.resize();
        return;
    }

    if (!onlyScreenshot) {
        applet.resize(); // Resize the screenshot so that it is displayed in the correct size, while the applet is beeing loaded
    }

    // Find type of applet to load
    var appletType = (onlyScreenshot ? 'screenshot' : window["appletType_"+material_id]);
    if (appletType == undefined)
        appletType = 'auto';

    if (appletType == 'screenshot') {
        var containerId = 'applet_container_preview_'+material_id;
    } else {
        var containerId = 'applet_container_'+material_id;
    }

    // Load the applet
    // applet.inject(containerId, "screenshot", true);
    applet.inject(containerId, appletType, true);

    if (applet.getLoadedAppletType() == 'java') {
        // Show java applet immediately, because they have no onload event.
        showApplet($, material_id, false);
    }
}

function showAppletsForPage($, pageElem, show) {
    $(".applet_container", pageElem).toggleClass('showapplet', show);
    $(".applet_container_preview", pageElem).toggleClass('showapplet', show);
}

function showApplet($, material_id, show) {
    $('#applet_container_'+material_id).toggleClass('showapplet', show);
    $('#applet_container_preview_'+material_id).toggleClass('showapplet', show);
}

function ggbAppletOnLoad(id) {
    // Hide the screenshot and move the applet into view
    var container = (jQuery('#'+id).hasClass('applet_container') ? jQuery('#'+id) : jQuery('#'+id).parents('.applet_container'));
    if (container.length) {
        var material_id = getMaterialIdFromAppletContainer(jQuery, container);
        showApplet(jQuery, material_id, true);

        refreshAppletHitPoints(jQuery);

        if (!container.attr("id") === "fullscreencontent") {
            var page = jQuery('#' + id).parents('.page');
            if ((page[0] != activePage[0])) {
                var applet = window["applet_" + material_id];
                startAppletAnimation(applet, false);
            }
        }

        if (window.GGBT_ws_header_footer) {
            window.GGBT_ws_header_footer.setWsScrollerHeight();
        }
        // initHeight(jQuery, false);
    }
}

function ggbAppletPlayerOnload(appletElem) {
    var material_id = getMaterialIdFromAppletContainer(jQuery, appletElem);
    showApplet(jQuery, material_id, true);
}

// This method is called when the first compiled applets are loaded -> Show all loaded applets
function ggbCompiledAppletsOnLoad() {
    jQuery('.worksheet.loaded').each(function() {
        showAppletsForPage(jQuery, jQuery(this), true);
        startAppletAnimationForPage(jQuery, jQuery(this), (this == activePage[0]));
    });
}


function getAppletForPage ($, pageElem, material_id) {
    if (material_id == null) {
        material_id = getMaterialIdFromPage($, pageElem);
    }
    return window["applet_"+material_id];
}

function removeAppletForPage($, pageElem, material_id) {
    if (material_id == null) {
        material_id = getMaterialIdFromPage($, pageElem);
    }
    var applet = getAppletById(material_id);

    // Check if the applet is already loaded
    if (applet instanceof Array) {
        for (i = 0; i < applet.length; ++i) {
            var appletElement = window["applet_"+applet[i]];
            if (typeof appletElement == 'object') {
                removeApplet($, appletElement, applet[i]);
            }
        }
    } else if (applet instanceof Object) {
        removeApplet($, applet, material_id)
    } else {
        return;
    }

    pageElem.removeClass("loaded");
}

function removeApplet($, applet, material_id) {

    // Remove the applet, but keep the screenshot
    if (applet.getLoadedAppletType() == 'java' || applet.getLoadedAppletType() == 'html5' || applet.getLoadedAppletType() == 'compiled') {
        // Remove the applet, but keep the screenshot
        applet.removeExistingApplet('applet_container_'+material_id, true);
    }
    showApplet($, material_id, false);
}

function getAppletById(material_id) {
    var applet = window[WORKSHEET_APPLET_IDS + material_id] || window['applet_' + material_id];
    return applet;
}
function startAppletAnimationForPage($, pageElem, start) {
    var material_id = getMaterialIdFromPage($, pageElem);
    var applet = getAppletById(material_id);

    if (applet instanceof Array) {
        for (i = 0; i < applet.length; ++i) {
            var appletElement = window["applet_"+applet[i]];
            if (typeof appletElement == 'object') {
                startAppletAnimation(appletElement, start);
            }
        }
    } else if (applet instanceof Object) {
        startAppletAnimation(applet, start);
    } else {
        return;
    }
}

function startAppletAnimation(applet, start) {
    if (start) {
        applet.startAnimation();
    } else {
        applet.stopAnimation();
    }
}

function getMaterialIdFromPage($, pageElem) {
    return $(pageElem).attr("data-material_id");
}

function getSharingKeyFromPage($, pageElem) {
    return $(pageElem).data("sharing_key");
}

function getMaterialIdFromSharingKey($, sel_sharing_key) {
    var page = $('#pages .page[data-sharing_key="'+sel_sharing_key+'"]');
    return getMaterialIdFromPage($, page);
}

function getMaterialIdFromAppletContainer($, appletContainer) {
        return $(appletContainer).attr("id").substr(17);
}

/**
 * Opens one submenu and closed all others
 * @param $
 * @param animate
 */
function openSelectedSubMenu($, animate) {
    function final() {

        if (window.GGBT_ws_header_footer) {
            window.GGBT_ws_header_footer.setWsScrollerHeight();
        }
        // initHeight($);

        // Scroll the  selected menu into view
        //var menuItem = $('.menu-opened.sel .menu-item, .menu-closed.sel .menu-item');
        //if (menuItem.offset().top + menuItem.height() + 20 > $(window).height())
        //    menuItem[0].scrollIntoView(false);
    }

    var openedMenu = $('.menu-opened:not(.sel) .menu-wrapper.open');
    if (openedMenu.length>0) {
        var openedTop = openedMenu.offset().top;
        var openedHeight = $('.submenu-items', openedMenu).outerHeight(true);
    }

    // Close all submenues that are not selected
    $('.menu-opened:not(.sel) .submenu-items').hide((animate ? 'blind' : null));
    $('.menu-opened:not(.sel) .menu-wrapper').removeClass('open');

    // Show the selected submenu
    $('.menu-opened.sel .menu-wrapper').addClass('open');
    $('.menu-opened.sel .submenu-items').show((animate ? 'blind' : null), null, null, final);

    // Trigger the height update now if it will not be triggered after the show animation
    if (!animate || $('.menu-opened.sel .submenu-items').length == 0) {
        final();
    }
}


// Helper functions
function getSelectedMenuId($) {
    return getIdFromMenuItem($, $("#menu li.sel"));
}

function getIdFromMenuItem($, item) {
    if ($(item).length>0) {
        return $(item).data("target-id");
    } else {
        return null;
    }
}
if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    }
}

function log (text) {
    if ( window.console && window.console.log ) {
        console.log(text);
    }
}

function  getIEVersion() {
    a=navigator.appVersion;
    return a.indexOf('MSIE')+1?parseFloat(a.split('MSIE')[1]):999
}

//font-styling
if (! bookIsOffline) {
    WebFontConfig = {google: { families: [ 'Muli:300:latin' ] }};
    (function() {
        var wf = document.createElement('script');
        wf.src = ('https:' == document.location.protocol ? 'https' : 'http') + '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
        wf.type = 'text/javascript';
        wf.async = 'true';
        var s = document.getElementsByTagName('script')[0];
        s.parentNode.insertBefore(wf, s);
    })();
}

function isPhoneScreen() {
    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    return w <= 640;
}
function isSmallPhoneScreen() {
    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    return w <= 320;
}
function isTabletScreen() {
    var w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    return w <= 768;
}


function initSwipe($) {

    var swiper = {};
    swiper.inSwipe = false;
    var pages = $("#pages .page");
    pages.hide();

    swiper.scrollToActivePage = function() {
        if (activePage == null)
            return;
        pages.hide();
        activePage.show();
    }

    return swiper;
}
