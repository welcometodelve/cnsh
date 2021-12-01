$(document).ready(function ($) {
    "use strict";
    // some elements are useless if javascript is disabled, therefore the
    // js-only css class hides them, we remove that class here
    $(".js-only").removeClass('js-only');

    // some elements are just by-foot alternatives to javascript methods,
    // so we hide them
    $(".js-hide").hide();

    // for some actions (eg delete) we display a confirmation message
    $("a.confirm").click(function () {
        return window.confirm(window.lang_confirm); //?????@gabor does not likes this!
    });

    // Set the focus to the search field
    if ($('.materials').length > 0 && $('#general-search-term').val() === "" && !isMobileDevice()) {
        $('#general-search-term').focus();
    }

    // to ensure the click anywhere would make the input lose focus (only necessarey for iPhones)
    $('body').on("touchstart", function(e) {
        if (!$(e.target).is('textarea,input,select')) {
            $(':focus').filter("textarea,input,select").blur();
        }
    });

    // Download section
    $('#cb_agree_license').change(function () {
        if ($('#cb_agree_license:checked').length >= 1) {
            enableDownloadLinks(true);
        } else {
            enableDownloadLinks(false);
        }
    });

    if (window.GGBT_objects_general !== undefined) {
        window.GGBT_objects_general.initAdvancedAccessSettingsPopup();
    } else {
        window.GGBT_gen_edit.initShareOptionsButtons($(".material-list .decorator.shared.isowner, .material-list .meta-not-public-info.isowner"));
    }

    // Make tab headers clickable
    $("#tabs li").click(function (e) {
        var link = $('a', this);
        if (link.length && link[0] !== e.target) {
            e.preventDefault();
            window.location.href = link[0].href;
        }
    });

    // Messages
    $('.message_announcement_close').click(function () {
        var id = $(this).parent().attr("id");
        id = id.substr(id.lastIndexOf("_") + 1);
        $(this).parents(".message-box").hide();
        document.cookie = "GeoGebraTubeA_" + id + "=1";
    });

    function enableDownloadLinks(enable) {
        enableLinks($('#download_ggb'), enable);
        enableLinks($('#download_offline'), enable);
        enableLinks($('#download_scorm'), enable);
        enableLinks($('#download_scorm_tuturl'), enable);
        enableLinks($('#download_latex'), enable);
        enableLinks($('#download_ibook_online'), enable);
        enableLinks($('#download_ibook_lite'), enable);
        enableLinks($('#download_ibook_widget_lite_tuturl'), enable);
        enableLinks($('#download-popup .material-list-item a'), enable);
        if (enable) {
            $('#download_list').removeAttr("disabled");
        } else {
            $('#download_list').attr("disabled", "disabled");
        }
    }

    $('#user_info_show_more').click(function() {
        $('.user_data_more').toggle("fast");
        $(this).toggleClass('active');
    });


    function enableLinks(links, enable) {
        if (links && links.length) {
            links.each(function () {
                var link = $(this);
                if (enable) {
                    link.removeClass("nounderline");
                    link.attr("href", link.data("href"));
                    link.removeAttr("disabled");
                } else {
                    link.addClass("nounderline");
                    link.data("href", link.attr("href"));
                    link.removeAttr("href");
                    link.attr("disabled", "disabled");
                }
            });
        }
    }

    if (typeof(window.license_agreed) !== 'undefined') { //@gabor does not likes this!
        $('#cb_agree_license').attr('checked', window.license_agreed);
        enableDownloadLinks(window.license_agreed);
    }


    // make thumbnails of featured materials clickable
    $('#featured li').click(function () {
        window.location = $(this).find('h4 a').attr('href');
    });

    // .. but don't trigger that reaction for clicks in the overlay area
    $('#featured li .overlay').click(function (event) {
        event.stopPropagation();
        return true;
    });

    $('select[name=taglanguage]').change(function () {
        var selectedlang = $(this).val();
        $.ajax({
            url: $(this).closest("form").attr("action"),
            type: 'post',
            async: true,
            dataType: 'html',
            data: 'selectedlang=' + encodeURIComponent(selectedlang) + '&textwritten=' + encodeURIComponent('+'),
            success: function (result) {
                $('textarea[name=predefined_tags]').val(result);
            },
            error: function (result) {
            }
        });
    });

    $('input#tagsubmit').click(function () {
        var selectedlang = $('select[name=taglanguage]').val();
        var textwritten = $('textarea[name=predefined_tags]').val();
        $.ajax({
            url: $(this).closest("form").attr("action"),
            type: 'post',
            async: true,
            dataType: 'html',
            data: 'selectedlang=' + encodeURIComponent(selectedlang) + '&textwritten=' + encodeURIComponent(textwritten),
            success: function (result) {
                $('textarea[name=predefined_tags]').val(result);
            },
            error: function (result) {
            }
        });
    });

    // 'detect-size' checkbox on material creation page
    if ($('#detect-size').length > 0) {
        $('#detect-size').change(function () {
            // checkbox is checked => disable textfields for manual size values
            if ($(this).is(':checked')) {
                $('#applet-size').css('visibility', 'hidden');
            } else {
                $('#applet-size').css('visibility', 'visible');
            }
        });
    }

    //noinspection JSAnnotator
    function checkAppletSize() {
        var width = $('#width').val();
        var height = $('#height').val();

        if (width > 900 || height > 600 + 102) {
            $('#appletsize_warning').show(300);
        } else {
            $('#appletsize_warning').hide(300);
        }
    }

    if ($('#appletsize_warning').length > 0) {

        // check size on load
        checkAppletSize();

        // and if the user changes the text
        $('#width').blur(function () {
            checkAppletSize();
        });

        $('#height').blur(function () {
            checkAppletSize();
        });
    }

    // favorite material for the old version => can be deleted in when new header is active
    if ($('#favorite').length > 0) {
        $('#favorite').click(function () {
            var button = $(this);
            $.get(button.attr("href")).success(function (result) {
                if (result.type === "success") {
                    if (result.newData) {
                        //only for old - not headed - version
                        button.removeClass('icon-favorite');
                        button.addClass('icon-is-favorite');
                        window.gaTrackFavoriteMaterial('unfavorite', window.material_id); //@gabor does not like this!
                    } else {
                        //only for old - not headed - version
                        button.removeClass('icon-is-favorite');
                        button.addClass('icon-favorite');
                        window.gaTrackFavoriteMaterial('favorite', window.material_id); //@gabor does not like this!
                    }
                }
            });

            return false;
        });
    }

    $("#tag_add").click(function () {
        if ($("#tag_add_appear").css('display') === 'none') {
            $("#tag_add_appear").css('display', 'block');
        } else {
            $("#tag_add_appear").css('display', 'none');
        }
    });

    $("#meta-more-link a").click(function () {
        $('#meta-more').slideDown();
        $('#meta-more-link').animate({opacity: 'hide', height: 'hide'}, 'fast');
        return false;
    });

    $("#derivatives_more").click(function () {
        $('.derivative.js-hide').show(300);
        $(this).hide();
        return false;
    });

    $("#tags_more").click(function () {
        $('.tag.js-hide').after("&nbsp;");
        $('.tag.js-hide').show(300);
        $(this).hide();
        return false;
    });

    $(".collection_delete").click(function () {
        var answer = window.confirm(window.lang_confirm); //@gabor does not like this!
        if (answer) {
            $.ajax({
                url: $(this).attr("href"),
                type: 'post',
                async: true,
                dataType: 'html',
                success: function (result) {
                    location.reload();
                },
                error: function (result) {
                    location.reload();
                }
            });
        }
        return false;
    });


    $('.simplemodal-close-hack').click(function () {
        location.reload();
        return false;
    });

    $('body').on('click', function(e) {
        if ($(e.target).is("#collection-add") || $(e.target).hasClass("collection-add")) {
            window.GGBT_gen_gui.showAddMaterialToBookModal($(e.target));
            return false;
        }
    });

    $("#join_group").on("click", function (e) {
        e.preventDefault();
        window.GGBT_gen_modal.showAjaxPopup("/group/join", {}, {
            className: "group_join_popup",
            maxWidth: "300"
        }, $(this).data("popup-title"), null, function () {
            $("#joingroup").on("click", function (e) {
                var code = $("#code").val();
                if (code) {
                    $.get("/group/join", {"code": code}).done(function (e) {
                        if (e.type === 'success' && e.newData) {
                            window.location = e.newData;
                        } else {
                            window.alert(e.message);
                        }
                    });
                }
            });
        });
    });

    // clicking upon the reply link of a comment will make a form appear
    // directly below the comment
    $(".reply").click(function () {
        var source = $(this);
        var id = source.attr("href").substring("#comment-".length);
        var reply_form = $("#comment-reply");
        var wasHidden = reply_form.css("display") === "none";
        var report_form = $("#comment-report");
        var wasHiddenReport = report_form.css("display") === "none";

        // Just change fields if the user requested replying to another comment
        // or the form was hidden. The wasHidden test is also important because
        // the value of the reply_to field may be cached by the browser across
        // requests.
        if (wasHidden || $("#reply_to").val() !== id) {
            var original = $(source.attr("href") + " > .children");
            var original_haschildren = true;
            if (original.length === 0) {
                original_haschildren = false;
                original = $(source.attr("href"));
            }

            // clear text
            reply_form.find("textarea").val("");

            if (!wasHiddenReport) {
                report_form.hide(200);
            }

            // if a reply form was displayed already hide this form first
            // before fading in the form at the new place, otherwise just
            // fade in the form
            if (!wasHidden) {
                reply_form.hide(200, function () {
                    if (original_haschildren) {
                        original.prepend(reply_form);
                    } else {
                        original.append(reply_form);
                    }
                    reply_form.show(400, function () {
                        this.scrollIntoView(false);
                    });
                });
            } else {
                if (original_haschildren) {
                    original.prepend(reply_form);
                } else {
                    original.append(reply_form);
                }
                reply_form.show(400, function () {
                    this.scrollIntoView(false);
                });
            }

            // change the form value which is indicating to which comment should
            // be replied
            $("#reply_to").val(id);
        }

        return false;
    });

    // clicking on report of comment gives a form
    $(".report_button").click(function () {
        var source = $(this);
        var id = source.attr("href").substring("#comment-".length);
        var report_form = $("#comment-report");
        var wasHidden = report_form.css("display") === "none";
        var reply_form = $("#comment-reply");
        var wasHiddenReply = reply_form.css("display") === "none";

        // Just change fields if the user requested reporting to another comment
        // or the form was hidden. The wasHidden test is also important because
        // the value of the report_which field may be cached by the browser across
        // requests.
        if (wasHidden || $("#report_which").val() !== id) {
            var original = $(source.attr("href") + " > .children");
            var original_haschildren = true;
            if (original.length === 0) {
                original_haschildren = false;
                original = $(source.attr("href"));
            }

            // clear text
            report_form.find("textarea").val("");

            if (!wasHiddenReply) {
                reply_form.hide(200);
            }

            // if a report form was displayed already hide this form first
            // before fading in the form at the new place, otherwise just
            // fade in the form
            if (!wasHidden) {
                report_form.hide(200, function () {
                    if (original_haschildren) {
                        original.prepend(report_form);
                    } else {
                        original.append(report_form);
                    }
                    report_form.show(400, function () {
                        this.scrollIntoView(false);
                    });
                });
            } else {
                if (original_haschildren) {
                    original.prepend(report_form);
                } else {
                    original.append(report_form);
                }
                report_form.show(400, function () {
                    this.scrollIntoView(false);
                });
            }

            // change the form value which is indicating which comment should
            // be reported
            $("#report_which").val(id);
        }

        return false;
    });

    // this link is shown in the reply form and hides that form
    $("#reply-remove").click(function () {
        $("#comment-reply").hide(200);
        $("#reply_to").val("0");
    });

    var commentEditForm = null;

    // edit comment
    $('.comment-edit').click(function () {
        var source = $(this);
        var commentContainer = source.parentsUntil('.comment').parent();

        // the user clicked on the edit link but the form is already visible
        if (commentEditForm !== null && commentEditForm.parentsUntil('.comment').parent().attr('id') === commentContainer.attr('id')) {
            commentEditForm.hide(200);
            commentEditForm = null;
        }

        // load edit form
        else {
            $.get(source.attr('href'), function (result) {
                if (commentEditForm !== null) {
                    commentEditForm.hide();
                    commentEditForm = null;
                }

                commentContainer.find('.text:first').after(result);
                window.addFormattingOptions(commentContainer.find('#comment-edit-form')); //@gabor does not like this!
                commentEditForm = commentContainer.find('#comment-edit-form');
            });
        }

        return false;
    });

    window.GGBT_gen_gui.initFollowersButton();

    $(".pagination li").click(function () {
        var link = $("a", this)[0];
        if (link !== undefined) {
            link.click();
        }
    });

    // this link is shown in the report form and hides that form
    $("#report-remove").click(function () {
        $("#report_which").val("0");
        $(this).parents('.report_form').hide(200);
    });

    $("#comment-report-remove").click(function () {
        $("#comment-report").hide(200);
    });

    // report comment (save report in database)
    $("#comment-report").submit(function () {
        $.ajax({
            url: $("#comment-report").attr("action"),
            type: 'post',
            async: true,
            dataType: 'html',
            data: $("#comment-report").serialize(),
            success: function (result) {
                if (result === 'success') {
                    $("#comment-report").before($("#report-message"));
                    $("#report-message").fadeIn().delay(2000).fadeOut('slow');
                }
                else if (result === 'error_15seconds') {
                    $("#comment-report").before($("#report-message-15"));
                    $("#report-message-15").fadeIn().delay(2000).fadeOut('slow');
                }
                else {
                    $("#comment-report").before($("#report-message-fail"));
                    $("#report-message-fail").fadeIn().delay(2000).fadeOut('slow');
                }
                $("#comment-report").hide(200);
                $("#report_which").val("0");
            },
            error: function (result) {
                $("#comment-report").before($("#report-message-fail"));
                $("#report-message-fail").fadeIn().delay(2000).fadeOut('slow');
            }
        });
        return false;
    });

    // clicking on report of comment gives a form
    $(".report_button_main").click(function () {
        var source = $(this);
        var id = source.attr("href").substring(1);
        var form_id = source.attr("data-formid");
        var report_form = $("#" + form_id);
        report_form.find("textarea").val("");
        report_form.toggle(200);
        return false;
    });

    $(".report_form").submit(function () {
        var form = $(this);
        $.ajax({
            url: form.attr("action"),
            type: 'post',
            async: true,
            dataType: 'html',
            data: form.serialize(),
            success: function (result) {
                if (result === "success") {
                    form.before($("#report-message"));
                    $("#report-message").fadeIn().delay(2000).fadeOut('slow');
                }
                else if (result === "error_15seconds") {
                    form.before($("#report-message-15"));
                    $("#report-message-15").fadeIn().delay(2000).fadeOut('slow');
                }
                else {
                    form.before($("#report-message-fail"));
                    $("#report-message-fail").fadeIn().delay(2000).fadeOut('slow');
                }
                form.hide(200);
            },
            error: function (result) {
                form.before($("#report-message-fail"));
                $("#report-message-fail").fadeIn().delay(2000).fadeOut('slow');
            }
        });
        return false;
    });

    function likeMaterial(source, url) {
        $.get(url, function (data) {
            if (data.status === 'success') {
                var preLikes = parseInt(source.html());
                source.html(data.stats.likes);

                var action = "like";
                if (preLikes > data.stats.likes) {
                    action = "unlike";
                }

                window.gaTrackLikeMaterial(action, window.material_id); //@gabor does not like this!
            }
        }, 'json');
    }

    $("#like").click(function () {
        likeMaterial($("#likes"), $(this).attr("href"));

        return false;
    });

    $(".meta-community .likes.click").click(function () {
        likeMaterial($(this), $(this).data("url"));

        return false;
    });

    $("input[name=manage_all1]").mousedown(function () {
        if ($(this).is(':checked')) {
            $(".mccheck").attr('checked', false);
            $("input[name=manage_all2]").attr('checked', false);
        }
        else {
            $(".mccheck").attr('checked', true);
            $("input[name=manage_all2]").attr('checked', true);
        }
    });

    $("input[name=manage_all2]").mousedown(function () {
        if ($(this).is(':checked')) {
            $(".mccheck").attr('checked', false);
            $("input[name=manage_all1]").attr('checked', false);
        }
        else {
            $(".mccheck").attr('checked', true);
            $("input[name=manage_all1]").attr('checked', true);
        }
    });

    $("input[name=submit1]").submit(function () {
        return false;
    });

    $("input[name=submit2]").submit(function () {
        return false;
    });

    $("select[name=report_select1]").change(function () {
        $("select[name=report_select2]").val(
            $("select[name=report_select1]").val()
        );
    });

    $("select[name=report_select2]").change(function () {
        $("select[name=report_select1]").val(
            $("select[name=report_select2]").val()
        );
    });

    $(".report_message_query_link").click(function () {
        var entryid = $(this).attr("href").substring(1);
        var container = $("#comment_for_" + entryid);

        if (container.data('loaded') === true) {
            if (container.css('display') === 'none') {
                container.css('display', 'block');
            } else {
                container.css('display', 'none');
            }
        } else {
            $.ajax({
                url: $("#report_manage_url").val(),
                type: 'post',
                async: true,
                dataType: 'html',
                data: "entry=" + encodeURIComponent(entryid),
                success: function (result) {
                    container.html(result);
                    container.css('display', 'block');
                    container.data('loaded', true);
                },
                error: function (result) {
                    window.alert("Ajax error");
                }
            });
        }
        return false;
    });


    // invokes the tag suggest plugin which loads new suggestions for tags
    // using AJAX
    if (typeof(window.url_tagsuggest) !== "undefined") {
        var tagInput = $('#tags, #wsf-meta-tags');
        if (tagInput.length > 0) {
            tagInput.tagSuggest({
                url: window.url_tagsuggest, //@gabor does not like this!
                delay: 2
            });
        }
    }


    var setToggleMaterialsFirstLoad = true;

    // show or hide the materials belonging to the collection currently shown
    $("#collection-toggle-materials").click(function () {
        var container = $("#collection-bar-materials");

        if (container.css("display") === "block") {
            container.hide(400);
        } else {
            if (setToggleMaterialsFirstLoad) {
                $.ajax({
                    url: $(this).attr("href"),
                    type: 'post',
                    async: true,
                    dataType: 'html',
                    success: function (result) {
                        // add
                        container.html(result);

                        container.find("li a").mouseenter(function () {
                            $("#collection-bar-materials-info").append($(this).parent().find("div").clone());
                        });

                        container.find("li a").mouseout(function () {
                            $("#collection-bar-materials-info").empty();
                        });

                        container.show(400);
                        setToggleMaterialsFirstLoad = false;
                    }
                });
            } else {
                container.show(400);
            }
        }

        return false;
    });

    window.GGBT_gen_backURL.init();

    window.GGBT_clipboard.initClipboardButtons();

    window.GGBT_gen_gui.initClearables();

    window.GGBT_croppie.init();
});

function isMobileDevice() {
    "use strict";
    if(window.innerWidth <= 768) {
        return true;
    } else {
        return false;
    }
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

window.GGBT_gen_gui = (function($) {
    "use strict";

    function isMobileSafari() {
        var userAgent = window.navigator.userAgent;
        return (userAgent.match(/ip(hone|od|ad)/i));
    }

    // Inputs that have that nice little X on the right/left to clear input
    function initClearables() {
        function tog(v) {
            return v ? 'addClass' : 'removeClass';
        }

        $(document).on('input focusin', ".clearable", function () {
            $(this)[tog(this.value)]('x');
        }).on('mousemove', '.x', function (e) {
            if ($(this).hasClass('left-x')) {
                $(this)[tog(/^(\d+)/.exec($(this).css('padding-left'))[0] > e.clientX - this.getBoundingClientRect().left)]('onX');
            } else {
                $(this)[tog(this.offsetWidth - /^(\d+)/.exec($(this).css('padding-right'))[0] < e.clientX - this.getBoundingClientRect().left)]('onX');
            }
        }).on('touchstart', '.x', function(e) {
            // special treatment for iPhones
            if (($(this).hasClass('left-x') && /^(\d+)/.exec($(this).css('padding-left'))[0] > e.originalEvent.touches[0].pageX - this.getBoundingClientRect().left) ||
                this.offsetWidth - /^(\d+)/.exec($(this).css('padding-right'))[0] < e.originalEvent.touches[0].pageX - this.getBoundingClientRect().left
            ) {
                e.preventDefault();
                $(this).removeClass('x onX').val('').change().keyup();
            }
        }).on('click', '.onX', function (ev) {
            ev.preventDefault();
            $(this).removeClass('x onX').val('').change().keyup();
        });
    }

    function initFollowersButton() {
        var followuser = $('#following_user').on("click", function(e) {
            var id = $(this).data('id'),
                act = $(this).data("act"),
                t = $(this);
            if (id) {
                $.post('/user/followers/', {
                        id: id,
                        act : act
                    })
                    .done(function(data) {
                        var followers;
                        if (data.action === "add") {
                            t.find("span").text(t.data("unfollow")).end().data("act", "del");
                            window.GGBT_gen_msg.msg(t.data("follow_confirm"));
                        } else if (data.action === "del") {
                            t.find("span").text(t.data("follow")).end().data("act", "add");
                            window.GGBT_gen_msg.msg(t.data("unfollow_confirm"));
                        }
                        if (data.followers && data.followers.length) {
                            followers = data.followers.length;
                        } else {
                            followers = 0;
                        }
                        window.GGBT_gen_gui.updateFollowersBadge(followers);
                        if (window.GGBT_sails_messageserver) {
                            window.window.GGBT_sails_messageserver.updateFollowers(id, followers);
                        }
                    })
                    .error(function(e) {
                        window.alert(e);
                    });
            }
        }).on("mouseover", function() {
            //$(this).toggleClass("active");
            if ($(this).data("act") === "del") {
                //$(this).outerWidth(btnFollowingWidth);
                $(this).find("span").text($(this).data("unfollow"));
                $(this).find("span").removeClass("icon-follow");
                $(this).find("span").addClass("icon-no-follow");
            }
        }).on("mouseout", function() {
            if ($(this).data("act") === "del") {
                $(this).find("span").text($(this).data("following"));
                $(this).find("span").removeClass("icon-no-follow");
                $(this).find("span").addClass("icon-follow");
            }
        }).data("followuser");
        if (followuser) {
            $("#following_user").trigger("click");
        }
    }

    function updateFollowersBadge(followers) {
        if (followers) {
            $("#badge-followers").show();
            $("#badge-followers-count").text(followers);
            if (followers === 1) {
                $("#badge-followers-text").text($("#badge-followers-text").data("badge_follower"));
            } else {
                $("#badge-followers-text").text($("#badge-followers-text").data("badge_followers"));
            }
        } else {
            $("#badge-followers").hide();
        }
    }

    function getBaseURL() {
        return window.location.protocol + "//" + window.location.host;
    }

    function showAddMaterialToBookModal(button) {
        var source = button.attr('data-url'),
            closeButtonText = button.attr('data-closebtntxt'),
            errorText = button.attr('data-error'),
            title = button.attr('data-title');
        if (closeButtonText === undefined) {
            closeButtonText = "done";
        }

        window.GGBT_gen_modal.setDefaults({button_close: closeButtonText});
        window.GGBT_gen_modal.showAjaxPopup(
            source,
            "",
            {className: 'collection-manage-dialog',
                autoPosition: true,
                autoResize: true
            },
            title,
            function() {
                // onOpen function

            },
            function() {
                // onShow function
                function toggleChapterList(listItem) {
                    if ($('input[type="checkbox"]', listItem).is(':checked')) {
                        $('.collection_add_list_chapter', listItem).show("fast");
//                            $('.collection_add_list_chapter', listItem).addClass("active");
                    } else {
                        $('.collection_add_list_chapter', listItem).hide("fast");
//                            $('.collection_add_list_chapter', listItem).removeClass("active");
                    }
                }

                function saveBookAssignemnt(listItem) {
                    var url = listItem.data("url");
                    var chapter_id = $('.collection_add_list_chapter select', listItem).val();
                    if (chapter_id !== undefined && chapter_id !== 0) {
                        url += '/chapter_id/' + chapter_id;
                    }
                    url += '/add/' + ($('input[type="checkbox"]', listItem).is(':checked') ? 'true' : 'false');
                    window.GGBT_gen_edit.setSaveStateInProgress();
                    $.get(url, "", function (data) {
                        if (data !== 'success') {
                            // revert changes
                            $('input[type="checkbox"]', listItem).attr('checked', !$('input[type="checkbox"]', listItem).is(':checked'));
                            toggleChapterList(listItem);
                            window.GGBT_gen_edit.setSaveStateError(errorText);
                        } else {
                            window.GGBT_gen_edit.setSaveStateSuccessful();
                        }
                    });
                }

                // Save assignment as soon as the checkbox is checked/unchecked
                $('input[type="checkbox"]', ".collection-manage-dialog").change(function () {
                    var source = $(this).parent();
                    toggleChapterList(source);
                    saveBookAssignemnt(source);
                });

                // Save assignment when the chapter is changed
                $('.collection_add_list_chapter select').change(function () {
                    saveBookAssignemnt($(this).parent().parent());
                });
            },
            function() {
                // onClose function
                if (!window.GGBT_book_general) {
                    parent.location.hash = "";
                }
            }
        );
    }

    function closePopupMenu(button) {
        $(button).parents(".popup-body").hide();
    }

    var locale;

    function setLocale(l) {
        locale = l;
    }

    function getDisplayDate(date, time) {
        var options = {month: 'short', day: 'numeric'};
        if (time) {
            options.hour = 'numeric';
            options.minute = 'numeric';
        }
        if (date.getFullYear() !== new Date().getFullYear()) {
            options.year = '2-digit';
        } else {
            options.year = undefined;
        }

        return date.toLocaleDateString(locale, options);
    }

    return {
        updateFollowersBadge : updateFollowersBadge,
        getBaseURL : getBaseURL,
        initFollowersButton : initFollowersButton,
        showAddMaterialToBookModal: showAddMaterialToBookModal,
        closePopupMenu: closePopupMenu,
        isMobileSafari: isMobileSafari,
        initClearables: initClearables,
        getDisplayDate: getDisplayDate,
        setLocale: setLocale
    };

})(jQuery);


window.GGBT_gen_modal = (function ($) {
    "use strict";

    var storedOptions,
        defaults,
        dlg;

    function showPopup(dlgElem, options, title, onOpenFct, onCloseFct) {

        // Check if another dialog is already open and store it
        if ($('#ggt-popup-wrapper').length === 1) {
            if (options.dontRestorePrevPopup) {
                closePopup();
            } else {
                $('body').append($('<div id="ggt-popup-stored"></div>').append($('#ggt-popup-header')).append($('#ggt-popup-content')));
                $('#ggt-popup-header').attr("id", "ggt-popup-header-stored");
                $('#ggt-popup-content').attr("id", "ggt-popup-content-stored");
                storedOptions = $.extend(true, {}, $.modal.getOptions());
                $.modal.close();

                var oriOnClose = options.onClose;
                options.onClose = function (dialog) {
                    if (typeof oriOnClose === "function") {
                        oriOnClose.onClose();
                    }

                    $.modal.close();
                    // Reopen the previously opened dialog
                    if ($('#ggt-popup-stored').length === 1) {
                        var storedDlg = $('#ggt-popup-stored').detach();
                        storedDlg.attr("id", "ggt-popup-wrapper");
                        $('#ggt-popup-header-stored', storedDlg).attr("id", "ggt-popup-header");
                        $('#ggt-popup-content-stored', storedDlg).attr("id", "ggt-popup-content");
                        storedDlg.modal(storedOptions);
                        $('#ggt-popup').show();
                        $('#ggt-popup-wrapper').show();
                    }

                    if (typeof onCloseFct === 'function') {
                        onCloseFct();
                    }
                };
            }
        }

        var onClose = function(dialog) {
            dialog.data.hide();
            dialog.container.hide();
            dialog.overlay.hide();
            $.modal.close();
            var pos = $('body').position();
            $('body').removeClass("noscroll");
            //take care of not delete the dialogelem forever
            if (typeof dlgElem !== 'string') {
                dlgElem.hide();
                //prevent the iframe to parsed again
                if (dlgElem.has("iframe") && !dlgElem.has("iframe[data-singleton]")) {
                    dlgElem.find("iframe").remove();
                }
                dlgElem.appendTo("body");
            }
            if (typeof onCloseFct === 'function') {
                onCloseFct();
            }
            $(window).trigger("resize");
        };

        var o = {
            onOpen: function (dialog) {
                if (typeof dlgElem !== 'string') {
                    dlgElem.show();
                }
                dialog.data.show();
                dialog.container.show();
                dialog.overlay.show();
                $('body').css('top', -($(window).scrollTop()) + 'px').addClass('noscroll');
                if (typeof onOpenFct === 'function') {
                    onOpenFct();
                }
            },
            onClose: onClose,
            escClose: true,
            overlayClose: true,
            focus: true,
            opacity: 70,
            overlayId: 'ggt-popup-overlay',
            containerId: 'ggt-popup',
            autoPosition: true,
            autoResize: true,
            closebutton: true,
            minHeight: undefined
            //position: [btnPos.top,btnPos.left]
        };

        if (options !== null && typeof options === 'object') {
            if (options.minHeight) {
                // Add the height of the title from the minheight
                options.minHeight += 30;
            }
            // merge defaults and user options
            o = $.extend({}, o, options);
        }

        var header = null;
        if (!o.noheader) {
            header = $('<div id="ggt-popup-header"></div>').prepend('<a class="ggt-popup-close"></a>');
            if (title !== null && title !== undefined) {
                header.prepend('<h5>' + title + '</h5>');
            }
        }
        if(o.noheaderline) {
            if(header !== null && header.find('h5').length > 0) {
                header.find('h5').css({borderBottom: '0px'});
            }
        }
        var content = $('<div id="ggt-popup-content"></div>').prepend(dlgElem);

        dlg = $('<div id="ggt-popup-wrapper"></div>').append(header).append(content).append('<div class="ajax-loading-glass"></div>');

        if (defaults && defaults.button_close && o.closebutton) {
            getPopupFooter();
        }
        return dlg.modal(o);
    }

    function setSize(height, width) {
        if (typeof $.modal !== "undefined") {
            if (height !== undefined) {
                $('#ggt-popup-iframe').height(height);
                height += $('#ggt-popup-header').height() + 3;
                if ($.modal.minHeight() > height) {
                    $.modal.minHeight(height);
                }
            }
            if (width !== undefined) {
                $('#ggt-popup-iframe').width(width);
            }
            $.modal.update(height, width);
        }
    }

    function resetHeight() {
        setSize($('#ggt-popup-content').height(), undefined);
    }

    function title(newTitle) {
        if (newTitle !== undefined && newTitle !== null) {
            $('#ggt-popup-header h5').html(newTitle);
        } else {
            return $('#ggt-popup-header h5').html();
        }
    }
    function showAjaxPopup(url, postParams, options, title, onOpenFct, onSuccessFct, onCloseFct, contentWrapper) {
        var o = {
            onOpen: function (dialog) {
                dialog.overlay.show();
                $('#ggt-popup').hide();
                $('body').css('top', -($(window).scrollTop()) + 'px').addClass('noscroll');
                if (typeof onOpenFct === 'function') {
                    onOpenFct();
                }
            }
        };
        if (typeof options === 'object') {
            // merge defaults and user options
            o = $.extend({}, o, options);
        }
        var dlg = showPopup('Loading ...', o, title, onOpenFct, onCloseFct);

        var fail = function (error) {
            var message = (typeof error.responseText !== "undefined" ? error.responseText : error.message);
            $('#ggt-popup-content').html("<h4>Error: " + message + "</h4>");
            $.modal.update($('#ggt-popup-content').height());
            $('#ggt-popup').show();
        };

        var onReceive = function (data) {
            var html;
            if (typeof data === "object") {
                if (data.type === "success") {
                    html = data.newData;
                } else {
                    fail(data);
                }
            } else {
                html = data;
            }

            if (html !== undefined) {
                if (contentWrapper !== undefined) {
                    contentWrapper.append(html);
                    html = contentWrapper.html();
                }

                $('#ggt-popup-content').html(html);
                $('#ggt-popup').show();

                if (typeof onSuccessFct === 'function') {
                    onSuccessFct();
                }
                $('.popup-easing').on("transitionend webkitTransitionEnd oTransitionEnd mozTransitionEnd", function() {
                    $.modal.update();
                });

                $.modal.update();
            }

        };
        var always = function () {
            window.GGBT_spinner.removeSpinner();
        };

        window.GGBT_spinner.attachSpinner();
        if (postParams !== null) {
            $.post(url, postParams, onReceive).fail(fail).always(always);
        } else {
            $.get(url, onReceive).fail(fail).always(always);
        }
        return dlg;
    }

    function showYesNoPopup(message, yesFct, noFct, yesText, noText, cancelText) {
        var yesBtn = $('<button class="button" id="popup-btn-yes">' + yesText + '</button>');
        yesBtn.click(function () {
            $.modal.close();
            if (yesFct !== null) {
                yesFct();
            }
        });

        var noBtn = $('<a id="popup-btn-no">' + noText + '</a>');
        noBtn.click(function () {
            $.modal.close();
            if (noFct !== null) {
                noFct();
            }
        });
        var buttons = yesBtn.add(noBtn);
        if (cancelText !== null && cancelText !== undefined) {
            var cancelBtn = $('<a id="popup-btn-cancel">' + cancelText + '</a>');
            cancelBtn.click(function () {
                $.modal.close();
            });
            buttons = buttons.add(cancelBtn);
        }

        return showMessagePopup(message, buttons, false, null, true);
    }

    function showMessagePopup(message, buttons, showOKButton, okText, noCloseIcon, onOpen) {
        var popup = $('<div id="popup-yesno" class="message-dialog">');
        popup.append('<div class="message-text">').text(message);
        popup.append('<br/><br/>');
        var buttonBar = $('<span class="button-bar">').appendTo(popup);
        if (buttons === null || showOKButton) {
            var okBtn = $('<button class="button" id="popup-btn-ok">' + okText + '</button>').appendTo(buttonBar);
            okBtn.click(function () {
                $.modal.close();
            });
        }
        if (buttons !== null) {
            buttons.appendTo(buttonBar);
        }
        var ret = showPopup(popup, {closebutton: false, close: (noCloseIcon ? false : true), noheader: noCloseIcon}, undefined, onOpen);
        var width = popup.width();
        if (width > $(window).width() - 80) {
            width = $(window).width() - 80;
        }
        setSize(undefined, width);

        // Hide the close icon
        if (noCloseIcon) {
            $('.modalCloseImg').hide();
        }

        return ret;
    }

    var iFrameSuccessFct;

    function showIframePopup(url, options, title, onOpenFct, onSuccessFct, onCloseFct) {
        if (true) {

            var ajaxURL = "/misc/autoembed?url="+encodeURIComponent(url)+"&width="+options.minWidth+"&height="+options.minHeight;

            var o = {
                autoResize: true
            };
            iFrameSuccessFct = onSuccessFct;
            if (typeof options === 'object') {
                // merge defaults and user options
                o = $.extend({}, o, options);
            }

            window.GGBT_gen_modal.onLoadIframe = function () {
                $('#ggt-popup-content iframe').show();
                $("#ggt-popup").removeClass("ajax-load");
                $("#ggt-popup-wrapper").css({width: "auto", height: "auto"});
                $.modal.update(options.minHeight, options.minWidth);
                $('#ggt-popup-iframe').width($('#ggt-popup .simplemodal-wrap').width());
                $('#ggt-popup-iframe').height($('#ggt-popup .simplemodal-wrap').height() - $('#ggt-popup-header').height() - 3);
                if (typeof iFrameSuccessFct === 'function') {
                    iFrameSuccessFct();
                }
                $('#ggt-popup').find('.simplemodal-wrap').css({overflow: "hidden"});

                window.GGBT_gen_modal.onLoadIframe = undefined;
            };

            var myOnSuccess = function() {
                if ($("#ggt-popup #ggt-popup-iframe").length > 0) {
                    $("#ggt-popup-wrapper").css({width: "100%", height: "100%"});
                    $("#ggt-popup").addClass("ajax-load");
                    $('#ggt-popup-content iframe').hide();
                }
            };

            return showAjaxPopup(ajaxURL, null, o, title, onOpenFct, myOnSuccess, onCloseFct);
        }
    }


    function showSearchPopup(url, postParams, options, title, onOpenFct, collection_add_function) {
        var header,
            input,
            collection_search_scrollstep = 0,
            collection_search_ison = false,
            collection_search_next = null;

        var o = {
            autoResize: false,
            minHeight: 500
        };
        if (typeof options === 'object') {
            // merge defaults and user options
            o = $.extend({}, o, options);
        }

        var params = {
            keyword: '',
            step: collection_search_scrollstep
        };
        if (typeof postParams === 'object') {
            params = $.extend({}, params, postParams);
        }

        function listLoaded() {
            if (typeof collection_add_function === "function") {
                collection_add_function();
            }
        }

        var onFirstLoad = function (result) {
            listLoaded();

            $('#ggt-popup-search-results').scroll(function () {
                if ($('#coll-addlist-loading').length > 0 && visible_in_container(this, $('#coll-addlist-loading')[0])) {
                    // Load additional results
                    if (!collection_search_ison) {
                        collection_search_scrollstep += 1;
                        collectionAjaxSearch($('#collection_search').val());
                    }
                }
            });
        };

        var onAddLoad = function (result) {
            var resultWrapper = $('#ggt-popup-search-results');
            $("#coll-addlist-loading").remove();
            if (collection_search_scrollstep === 0) {
                resultWrapper.empty();
                resultWrapper.append(result);
                resultWrapper.scrollTop(0);
            } else {
                resultWrapper.append(result);
            }
            console.log($(".collection_add").length);

            listLoaded();

            if (collection_search_next === null) {
                collection_search_ison = false;
            } else {
                var nextreq = collection_search_next;
                collection_search_next = null;
                collectionAjaxSearch(nextreq);
            }
        };

        function collectionAjaxSearch(keywordval) {
            collection_search_ison = true;
            params.keyword = keywordval;
            params.step = collection_search_scrollstep;
            $.ajax({
                url: url,
                type: "post",
                async: true,
                dataType: "html",
                data: params,
                success: onAddLoad,
                error: function (result) {
                    if (collection_search_next === null) {
                        collection_search_ison = false;
                    } else {
                        var nextreq = collection_search_next;
                        collection_search_next = null;
                        collectionAjaxSearch(nextreq);
                    }
                }
            });
        }

        function visible_in_container(p, e) {
            var z = p.getBoundingClientRect();
            var r = e.getBoundingClientRect();

            //check style visiblilty and off-limits
            return !(r.top > z.bottom || r.bottom < z.top ||
            r.left > z.right || r.right < z.left);
        }

        var resultWrapper = $('<div id="ggt-popup-search-results"/>');
        showAjaxPopup(url, params, o, title, onOpenFct, onFirstLoad, null, resultWrapper);

        header = $("#ggt-popup-header");
        input = $('<input id="ggt-popup-search" placeholder="' + o.searchplaceholder + '" />');

        header.prepend(input);
        input.keyup(function () {
            collection_search_scrollstep = 0;
            if (collection_search_ison) {
                collection_search_next = $(this).val();
            } else {
                collectionAjaxSearch($(this).val());
            }
        });

        //collectionAjaxSearch('');
    }


    var popupParent;

    function pushPopup(dlgElem, options, titletext, onOpenFct) {
        if (typeof dlgElem === 'object') {
            // convert DOM object to a jQuery object
            dlgElem = dlgElem instanceof $ ? dlgElem : $(dlgElem);
            popupParent = dlgElem.parent();
        } else {
            popupParent = undefined;
        }

        $('#ggt-popup-content').attr('id', 'ggt-popup-oldcontent');
        $('#ggt-popup-oldcontent').hide();
        $('#ggt-popup-oldcontent').data('title', title());
        var newContent = $('<div id="ggt-popup-content"></div>').prepend(dlgElem);
        var dlg = $('#ggt-popup-wrapper').append(newContent);
        $(dlgElem).show();
        title(titletext);
        setSize(newContent.height(), newContent.width());
    }

    function closePopup() {
        if ($('#ggt-popup-oldcontent').length === 1) {
            var oldDlg = $('#ggt-popup-content').children().first();
            var newDlg = $('#ggt-popup-oldcontent').children().first();
            if (popupParent !== undefined) {
                popupParent.append(oldDlg);
                oldDlg.hide();
            }
            $('#ggt-popup-content').remove();

            $('#ggt-popup-oldcontent').attr('id', 'ggt-popup-content');
            title($('#ggt-popup-content').data('title'));
            $('#ggt-popup-content').show();

            setSize(newDlg.height(), newDlg.width());
        } else {
            $.modal.close();
        }
    }

    var cache = {
        dom: null,
        scrollTop: null
    };

    function replacePopupContent(u, conf) {
        var data = conf && conf.data || {},
            onLoad = conf && conf.onLoad,
            json = conf && conf.json,
            url = u;

        if (conf.selectorToCache) {
            cache.scrollTop = $(conf.selectorToCache).scrollTop();
            cache.dom = $(conf.selectorToCache).detach();
        }
        if (url !== null) {
            if (json) {
                url += "/json/true";
            }
            $.ajax({
                type: "POST",
                url: url,
                data: data,
                dataType: json ? "json" : "html"
            })
                .done(function (result) {
                    if (!json) {
                        $("#ggt-popup-content").html(result);
                    }
                    if (typeof onLoad === "function") {
                        onLoad(json ? result : undefined);
                    }
                })
                .fail(function () {
                    window.alert("operation was wrong");
                })
                .always(function () {
                    console.log("replacecontent finished");
                });
        } else if (conf) {
            if (conf.fromCache) {
                var dom = $("#ggt-popup-content").empty().append(cache.dom);
                if (cache.scrollTop) {
                    cache.dom.scrollTop(cache.scrollTop);
                    cache.dom = null;
                    cache.scrollTop = null;
                }
            } else if (conf.html) {
                $("#ggt-popup-content").html(conf.html);
            } else if (conf.jq) {
                $("#ggt-popup-content").append(conf.jq);
            }
        }
    }

    function emptyPopupContent() {
        $("#ggt-popup-content").empty();
    }

    var footer = null;

    function getPopupFooter() {
        var footerText = $('<span id="popup-msg"></span>'),
            a;
        if (footer === null) {
            footer = $('<div id="ggt-popup-footer"></div>').appendTo(dlg);
            footer.append(footerText);
            if (defaults && defaults.button_close) {
                a = $('<a id="popup-button-close" class="button" title="' + defaults.button_close + '">' + defaults.button_close + '</a>');
                footer.append(a);
            }
        } else if (dlg) {
            dlg.append(footer);
        }
        dlg.on("click", "#popup-button-close", function (e) {
            e.preventDefault();
            closePopup();
        });
        return footer;
    }

    function showPopupFooterMessage(msg) {
        getPopupFooter().find("#popup-msg").text(msg).fadeIn("fast", function () {
            getPopupFooter().find("#popup-msg").fadeOut(3000);
        });
    }

    function setDefaults(defs) {
        defaults = defs;
    }

    function setCookie(cname, cvalue, exSeconds) {
        var d = new Date();
        d.setTime(d.getTime() + (exSeconds * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + "; " + expires + "; path=/";
    }

    function getCookie(cname) {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    }

    /*
     function checkNotifications() {
     var doCheck = function() {
     var cookie = getCookie("GeoGebraTubeNotifyTS");

     if (cookie === "") {
     // no cookie set -> make AJAX request
     // ohterwise do nothing and try it the next time!
     // this is to limit the request to max. 1 request per minute!
     $.ajax('/notification/get',
     {async: true}
     ).done(function (response) {
     if (response.type === "success") {
     // should we just set the cookie when everything was allright?
     if (response.data.count > 0) {
     $("#ggbNotifications").removeClass('notification-read');
     $("#ggbNotifications").addClass('notification-unread');
     }

     if (response.data.popup.length > 0) {
     // show the content of the notification!
     window.alert("test");
     }
     }
     }
     );

     setCookie("GeoGebraTubeNotifyTS", 1, 60);
     }
     };

     // we have to call it the first time manually
     doCheck();

     // check every 20 seconds for new notifications
     setInterval(doCheck, 20000);
     }
     */

    function showPdfPopup(src, title) {
        var width = Math.min($(window).width() -100, 1000);
        var height = $(window).height() - 130;
        if (title === undefined || title === "") {
            title = "&nbsp;";
        }
        var pdf =  $('<div style="width:'+width+'px; height:'+height+'px;"><embed src="' + src + '" width="100%" height="100%"></embed></div>');
        window.GGBT_gen_modal.showPopup(
           pdf,
            {
                autoResize: true,
                closebutton: false
            },
            title
        );
        window.GGBT_gen_modal.setSize(height, width);
    }


    return {
        showPopup: showPopup,
        showPopupFooterMessage: showPopupFooterMessage,
        showAjaxPopup: showAjaxPopup,
        showSearchPopup: showSearchPopup,
        showYesNoPopup: showYesNoPopup,
        showPdfPopup: showPdfPopup,
        replacePopupContent: replacePopupContent,
        emptyPopupContent: emptyPopupContent,
        showIframePopup: showIframePopup,
        showMessagePopup: showMessagePopup,
        closePopup: closePopup,
        pushPopup: pushPopup,
        setSize: setSize,
        resetHeight: resetHeight,
        title: title,
        setDefaults: setDefaults
        //checkNotifications: checkNotifications
    };

})(jQuery);
window.GGBT_gen_msg = (function($) {
    "use strict";
    var ID = "popup-msg";
    var DOM_STRING = '<div class="msg-box" id="' + ID + '">' +
        '<div class="message"></div>' +
        '</div>';
    var dom = null;

    function lazyInit() {
        if (!$("#" + ID).length) {
            dom = $(DOM_STRING).appendTo("body");
        } else {
            dom = $("#" + ID);
        }
        dom.off("click").on("click", function() {
           dom.hide();
        });
    }

    function setMessage(message) {
        dom.find(".message").text(message);
    }

    function animate() {
        dom.fadeIn(function() {
            setTimeout(function () {
                dom.fadeOut();
            }, 5000);
        });
    }

    function msg(message) {
        lazyInit();
        setMessage(message);
        animate();
    }
    return {
        msg : msg
    };
})(jQuery);

window.GGBT_gen_edit = (function ($) {
    "use strict";

    var SAVE_STATE_READY = 0,
        SAVE_STATE_INPROGRESS = 1,
        SAVE_STATE_SUCCESSFUL = 2,
        SAVE_STATE_ERROR = 3,
        saveState = 0,
        saveFunction,
        saveButtons,
        saveAndContinueButtons,
        saveAndCloseButtons;

    // 0=ready, 1=in progress, 2=successful, 3=error
    function setSaveState(state, message, short) {
        var disableButtons = false;
        $('#save-info-inprogress').hide();
        $('#save-info-successful').hide();
        $('#save-info-error').hide();
        if (state === SAVE_STATE_INPROGRESS) {
            disableButtons = true;
            $('#save-info-inprogress').show();
        } else if (state === SAVE_STATE_SUCCESSFUL) {
            if (message !== undefined) {
                if ($('#save-info-successful .message').length) {
                    $('#save-info-successful .message').text(message);
                } else {
                    $('#save-info-successful').text(message);
                }
            }
            if (short === undefined || !short) {
                $('#save-info-successful').show();
                setTimeout(function () {
                    $('#save-info-successful').hide();
                }, 5000);
            }
        } else if (state === SAVE_STATE_ERROR) {
            if ($('#save-info-error .message').length) {
                $('#save-info-error .message').hide();
                if (message.substring(0,6) === "error_" && $('#save-info-error .message.' + message).length) { // Show a predefined error message identified by the classname
                    $('#save-info-error .message.' + message).show();
                } else {
                    $('#save-info-error .message.general').text(message);
                    $('#save-info-error .message.general').show();
                }
            } else {
                $('#save-info-error').text(message);
            }
            $('#save-info-error').show();
        }
        saveState = state;
        if (disableButtons) {
            $(saveAndContinueButtons).attr("disabled", "disabled");
            $(saveButtons).attr("disabled", "disabled");
        } else {
            $(saveAndContinueButtons).removeAttr("disabled");
            $(saveButtons).removeAttr("disabled");
        }
    }

    function initWsfSaveAndContinue(saveFunction, button) {
        saveAndContinueButtons = $(saveAndContinueButtons).add(button);
        button.on("click", function (e) {
            if (saveState !== SAVE_STATE_INPROGRESS) {
                saveFunction(e, $(this));
            }
        });
    }

    function initSaveAndClose(saveFunction, button) {
        saveAndCloseButtons = $(saveAndCloseButtons).add(button);
        button.on("click", function (e) {
            if (saveState !== SAVE_STATE_INPROGRESS) {
                saveFunction(e);
            }
        });
    }

    function initShareOptionsButtons(buttons) {
        buttons.off("click").on("click", function(e) {
            e.preventDefault();
            window.GGBT_clb_shareoptions.showSharoptionsPopup($(this), function(modified) {
                if (modified) {
                    location.reload(true);
                }
            });
        });
    }

    function initSaveButton(saveFunction, button) {
        saveButtons = $(saveButtons).add(button);
        $(button).on("click", function (e) {
            var sender = $(this);
            e.preventDefault();
            if (saveState !== SAVE_STATE_INPROGRESS) {
                saveFunction(e, sender);
            }
        });
    }

    function initSave(saveFunction, button) {
        initSaveButton(saveFunction, button);
    }


    function setSaveStateSuccessful(msg, short) {
        setSaveState(SAVE_STATE_SUCCESSFUL, msg, short);
    }

    function setSaveStateError(msg) {
        setSaveState(SAVE_STATE_ERROR, msg);
    }

    function setSaveStateInProgress() {
        setSaveState(SAVE_STATE_INPROGRESS);
    }

    function getSaveState() {
        return saveState;
    }

    function setSaveFunction(func) {
        saveFunction = func;
    }

    function autoSave(data, callback) {
        if (typeof saveFunction === "function") {
            saveFunction(data, callback);
        }
    }

    function getSaveFunction() {
        return saveFunction;
    }

    return {
        initSave: initSave,
        initSaveAndClose: initSaveAndClose,
        initSaveAndContinue: initWsfSaveAndContinue,
        setSaveState: setSaveState,
        setSaveStateSuccessful: setSaveStateSuccessful,
        setSaveStateError: setSaveStateError,
        setSaveStateInProgress: setSaveStateInProgress,
        setSaveFunction: setSaveFunction,
        getSaveState: getSaveState,
        autoSave: autoSave,
        getSave: getSaveFunction,
        initShareOptionsButtons: initShareOptionsButtons,
        SAVE_STATE_INPROGRESS: SAVE_STATE_INPROGRESS,
        SAVE_STATE_ERROR: SAVE_STATE_ERROR
    };
})(jQuery);

function confirmLogin(formId, message, buttonTxt, cancelTxt) {
    "use strict";
    window.GGBT_gen_modal.showYesNoPopup(message, function() {
        $('#' + formId).submit();
    }, null, buttonTxt, cancelTxt);
}

window.GGBT_gen_backURL = (function($) {
    "use strict";
    
    function processBackHandlers() {
        var backurl = sessionStorage.getItem("backurl");
        if (backurl) {
            $("[data-backhandler]").attr("href", backurl);
        } else {
            $("[data-backhandler]").attr("href", window.GGBT_gen_gui.getBaseURL());
        }
    }

    function isSupported() {
        try {
            return window.sessionStorage !== undefined;
        } catch(e) {
            console.log("sessionStorage not supported" + e.message);
            return false;
        }
    }

    function init() {
        if (isSupported()) {
            processBackHandlers();
        }
    }

    function getBackUrl() {
        if (isSupported()) {
            return sessionStorage.getItem("backurl");
        } else {
            return undefined;
        }
    }

    function getBackUrlWithFallback() {
        if (window.GGBT_gen_backURL.getBackUrl()) {
            return window.GGBT_gen_backURL.getBackUrl();
        }
        return window.GGBT_gen_gui.getBaseURL();
    }

    function setBackUrl(backurl) {
        if (isSupported() && backurl) {
            sessionStorage.setItem("backurl", backurl);
        }
    }

    return {
        init : init,
        getBackUrl : getBackUrl,
        setBackUrl : setBackUrl,
        getBackUrlWithFallback : getBackUrlWithFallback,
        isSupported : isSupported
    };
})(jQuery);

window.GGBT_gen_singleton = (function($) {
    "use strict";

    var singletonWorksheet = null,
        singletonBook = null,
        mathApps = null;
    var ORIGIN = location.protocol + "//" + location.host,
        SINGLETON_PRELOAD_URL = "/material/preload/type/",
        preLoading = false;

    function showSingleton(element, conf) {
        var data;
        if (!conf.fromPopState) {
            pushIntoHistory(conf);
        }
        closeIframe();
        if (element.data("loaded") === true) {
            if (conf.type !== "mathapps") {
                data = {
                    type: "loadcontent",
                    href: (conf.href.indexOf("http") === 0) ? conf.href : window.GGBT_gen_gui.getBaseURL() + conf.href,
                    id: conf.id,
                    contentType: conf.type,
                    fromPopState : conf.fromPopState
                };
                element.find("iframe").get(0).contentWindow.postMessage(JSON.stringify(data), ORIGIN);
            }
        } else {
            window.GGBT_spinner.attachSpinner(element.get(0), '50%');
            element.find("iframe").attr("src", window.GGBT_gen_gui.getBaseURL() + conf.href + "/" + conf.type);
        }
        if (conf.type === "mathapps") {
            conf.href = "apps";
        }
        element.show();
        $("body").addClass("singleton");
        if (window.GGBT_gen_gui.isMobileSafari()) {
            $("#singletonworksheet, #singletonbook").css({
                "-webkit-overflow-scrolling" : "touch",
                "overflow" : "auto"
            });
        }
    }

    function isSingletonOpened() {
        return $("body").hasClass("singleton");
    }

    function getIframeWithContainer(id) {
        return $('<div>', {
            id: id,
            class : "singletoncontainer",
            html: '<iframe data-singleton="true" width="100%" height="100%" allowfullscreen="allowfullscreen" mozallowfullscreen="mozallowfullscreen" msallowfullscreen="msallowfullscreen" oallowfullscreen="oallowfullscreen" webkitallowfullscreen="webkitallowfullscreen"></iframe>'
        });
    }

    function getWorksheetIframe() {
        if (singletonWorksheet === null) {
            singletonWorksheet = getIframeWithContainer("singletonworksheet").prependTo("body");
            singletonWorksheet.find("iframe").on("load", function() {
                singletonWorksheet.attr("data-loaded", true);
                window.GGBT_spinner.removeSpinner(singletonWorksheet.get(0));
            });
        }
        return singletonWorksheet;
    }

    function getBookIframe() {
        if (singletonBook === null) {
            singletonBook = getIframeWithContainer("singletonbook").appendTo("body");
            singletonBook.find("iframe").on("load", function(e) {
                singletonBook.attr("data-loaded", true);
                window.GGBT_spinner.removeSpinner(singletonBook.get(0));
            });
        }
        return singletonBook;
    }

    function getMathAppsIframe() {
        if (mathApps === null) {
            mathApps = getIframeWithContainer("mathapps").appendTo("body");
            mathApps.find("iframe").on("load", function(e) {
                mathApps.attr("data-loaded", true);
            });
        }
        return mathApps;
    }

    function getIframe(type) {

        function open(conf) {
            if (type === "ws") {
                showSingleton(getWorksheetIframe(), conf);
            } else if (type === "book") {
                showSingleton(getBookIframe(), conf);
            } else if (type === "mathapps") {
                showSingleton(getMathAppsIframe(), conf);
            }
        }

        return {
            open : open
        };
    }

    var postToRefresh = null;


    function openAsSingleton(e) {
        var post = null;
        if (!e.shiftKey && !e.ctrlKey && e.which !== 2) {
            e.preventDefault();
            e.stopPropagation();
            preLoading = false;
            var link = $(e.currentTarget),
                type = link.data("type");
            if (type === "ggb") {
                type = "ws";
            }
            if (window.GGBT_group_general) {
                if (window.GGBT_group_student) {
                    post = link.parents(".details").prev("[data-group_id][data-post_id]");
                    if (post.length) {
                        post.data("needupdate", true);
                        postToRefresh = {
                            post_id: post.data("post_id"),
                            group_id: post.data("group_id"),
                            others: post.data("others")
                        };
                    }
                } else if (window.GGBT_group_stream) {
                    post = link.parents(".post[data-sharing_key]");
                    if (post.length) {
                        postToRefresh = {
                            sharing_key: post.data("sharing_key")
                        };
                    }
                }
            }
            getIframe(type).open({
                href: link.attr("href") || link.attr("data-href"),
                id: link.data("id"),
                type: type
            });
        }
    }

    function closeIframe() {
        if (isSingletonOpened()) {
            var msg = {
                type: "closedbyhost"
            };
            if ($(".singletoncontainer").length) {
                $(".singletoncontainer").hide();
                $(".singletoncontainer").find("iframe").get(0).contentWindow.postMessage(JSON.stringify(msg), ORIGIN);
                $("body").removeClass("singleton");
            }
            if (postToRefresh !== null && window.GGBT_group_general) {
                if (window.GGBT_group_student) {
                    window.GGBT_group_general.loadStudentContent(postToRefresh.post_id, postToRefresh.group_id, postToRefresh.others);
                } else if (window.GGBT_group_stream) {
                    window.GGBT_group_general.loadStreamPostContent(postToRefresh.sharing_key);
                }
                
            }
            if ($(".evaluation-wrapper[data-group-id]").length) {
                window.GGBT_group_general.refreshEvaluationGrid();
            }
        }
    }

    function closeSingleton(keep) {
        var msg = {
            type: "closesingleton"
        };
        if (!keep) {//needed for exercises
            window.GGBT_wsf_view.destroyApplets();
            window.GGBT_wsf_view.addLoadingForAjax();
        }
        window.parent.postMessage(JSON.stringify(msg), ORIGIN);
    }

    function pushIntoHistory(conf) {
        console.log("pushintohistory", conf);
        if (conf && conf.href) {
            history.pushState({
                href: conf.href,
                type: conf.type,
                noiframe : conf.noiframe
            }, document.title, conf.href);
        }
        console.log(history);
    }

    function initPostMessage() {
        window.onmessage =  function(event) {
            var origin = event.origin,
                data;
            if (origin === window.GGBT_gen_singleton.ORIGIN) {
                try{
                    data = JSON.parse(event.data);
                    if (data.type === "closesingleton") {
                        if (isSingletonOpened()) {
                            pushIntoHistory({href: sessionStorage.getItem("href"), noiframe: true});
                            closeIframe();
                        }
                    } else if(data.type === "gotohref") {
                        location.replace(data.href);
                    } else if(data.type === "loadnextpage"){
                        if (!preLoading) {
                            if (!data.onlyPushToHash) {
                                getIframe(data.contentType).open({href: data.href, type: data.contentType});
                            } else {
                                pushIntoHistory({type : data.contentType, href: data.href});
                            }
                        }
                    }
                }catch(e){
                    //this may happen with strange browser extensions
                }
            }
        };
    }

    function initCreator() {
        $("[itemprop=creator] a").on("click", function(e) {
            e.stopPropagation();
            e.preventDefault();
            window.GGBT_gen_singleton.goToHrefFromIframe($(this).attr("href"));
        });
    }

    function getActiveIframe() {
        if (getBookIframe().is(":visible")) {
            return getBookIframe();
        } else {
            return getWorksheetIframe();
        }
    }


    function initMathAppsPreload() {
        var button = $("#startmathapps");
        if (button.length) {
            getMathAppsIframe().find("iframe").attr("src", $("#startmathapps").attr("href")).end().hide();
            button.on("click", function(e) {
                openAsSingleton(e);
            });
        }
    }



    function initOnPageLoad() {
        getWorksheetIframe().find("iframe").attr("src", window.GGBT_gen_gui.getBaseURL() + SINGLETON_PRELOAD_URL + "ws").end().hide();
        getBookIframe().find("iframe").attr("src", window.GGBT_gen_gui.getBaseURL() + SINGLETON_PRELOAD_URL + "book").end().hide();
        initMathAppsPreload();
        preLoading = true;
    }

    function isIframe() {
        try {
            return window.self !== window.top;
        } catch (e) {
            return true;
        }
    }

    function isOwnIFrame() {
        return window.frameElement && window.frameElement.getAttribute("data-singleton");
    }

    function isHandler() {
        return $("[data-singleton=1]").length !== 0;
    }

    function goToHrefFromIframe(url) {
        var msg = {
            type: "gotohref",
            href: url
        };
        window.parent.postMessage(JSON.stringify(msg), window.GGBT_gen_singleton.ORIGIN);
    }

    function processUrl(url) {
        if (!window.GGBT_gen_singleton.isOwnIFrame()) {
            location.href = url;
        } else {
            goToHrefFromIframe(url);
        }
    }

    var singletonActive = false;
    var preloadOnDemand = false;

    function init(pod) {
        if (!isIframe() && isHandler() && !window.GGBT_gen_gui.isMobileSafari()) {
            initPostMessage();
            initAfterReload();
            preloadOnDemand = (pod || preloadOnDemand);
            if (!preloadOnDemand) {
                initOnPageLoad();
            }
            setSingletonActive(true);
        }
    }

    function addPageLoadListener(pod) {
        setSingletonActive(true);
        $(window).on("load", function(e) {
            init(pod);
        });
    }

    function initAfterReload(element) {
        if (!isSingletonActive()) {
            initPostMessage();
            setSingletonActive(true);
        }
        if (!window.GGBT_gen_gui.isMobileSafari()) {
            $("[data-singleton=1]", (element || document)).off("click").on("click", openAsSingleton);
        }
    }

    function isSingletonActive() {
        return singletonActive;
    }

    function setSingletonActive(value) {
        singletonActive = value;
    }

    return {
        init : init,
        initAfterReload : initAfterReload,
        ORIGIN : ORIGIN,
        isOwnIFrame : isOwnIFrame,
        isSingletonActive : isSingletonActive,
        setSingletonActive : setSingletonActive,
        goToHrefFromIframe : goToHrefFromIframe,
        processUrl : processUrl,
        closeSingleton : closeSingleton,
        initCreator : initCreator,
        addPageLoadListener : addPageLoadListener,
        getIframe : getIframe,
        closeIframe : closeIframe,
        isSingletonOpened : isSingletonOpened
    };
})(jQuery);

window.GGBT_generalHistory = (function() {
    "use strict";

    //this is need to be called, becaue it is really messy can be to use more onpopstate here and there in the app.
    //One of this is used for the singleton,
    //Second is used for the things we love.

    function initPopState() {
        if (!window.GGBT_gen_singleton.isOwnIFrame()) {
            console.log("initonpopstate called");
            if (window.location.pathname.indexOf("preload") === -1) {
                if (window.GGBT_gen_backURL.isSupported()) {
                    sessionStorage.setItem("href", window.location.pathname); //needed if we messing up history
                    console.log("popstate: ", sessionStorage.getItem("href"), window.location.pathname);
                }
            }
            window.onpopstate = function (e) {
                console.log("popstate called: ", e, e.state);
                var state = e.state;
                if (window.GGBT_wsf_view && window.GGBT_wsf_view.isFullScreen()) {
                    window.GGBT_wsf_view.closeFullScreen(e);
                } else if (state && state.href && window.GGBT_gen_singleton.isSingletonActive() && !state.noiframe) {
                    window.GGBT_gen_singleton.getIframe(state.type).open({
                        href: state.href,
                        type: state.type,
                        fromPopState: true
                    });
                } else if (window.GGBT_gen_singleton.isSingletonOpened()) {
                    window.GGBT_gen_singleton.closeIframe();
                } else if (window.GGBT_gen_backURL.isSupported()) {
                    if (sessionStorage.getItem("href") && (sessionStorage.getItem("href") !== window.location.pathname)) {
                        window.location.reload();
                    }
                }
            };
        }
    }

    initPopState();

})(jQuery);

window.GGBT_clipboard = (function($) {
    "use strict";

    var clipboard;

    function initClipboardButtons() {
        if (window.Clipboard !== undefined && $(".copy_clipboard").length > 0) {
            // initialize all copy_clipboard buttons and links
            if (clipboard) {
                clipboard.destroy();
            }

            clipboard = new window.Clipboard(".copy_clipboard");

            clipboard.on('success', function (e) {
                window.GGBT_gen_edit.setSaveStateSuccessful(window.lang_copy_clipboard_successful);
            });
        }
    }

    return {
        initClipboardButtons: initClipboardButtons
    };
})(jQuery);

window.GGBT_croppie = (function($) {
    "use strict";

    var uploadCrop;
    var o;

    function setCroppieOptions(options) {
        o = options;

        // set default values for everything undefined
        // croppie width
        if(typeof o.cw === 'undefined') {
            o.cw = 300;
        }
        // croppie height
        if(typeof o.ch === 'undefined') {
            o.ch = 300;
        }
        // boundary width
        if(typeof o.bw === 'undefined') {
            o.bw = (o.cw + 20);
        }
        // boundary height
        if(typeof o.bh === 'undefined') {
            o.bh = (o.ch + 20);
        }
        // enforce boundary
        if(typeof o.eb === 'undefined') {
            o.eb = true;
        }
        // enable zoom
        if(typeof o.ez === 'undefined') {
            o.ez = true;
        }
        // result width
        if(typeof o.rw === 'undefined') {
            o.rw = 400;
        }
        // result height
        if(typeof o.rh === 'undefined') {
            o.rh = 400;
        }
        // result height
        if(typeof o.action === 'undefined') {
            o.action = 'Please define an action!';
        }
    }

    /**
     * Shows a popup to change an image
     * @param button
     */
    function showChangeImagePopup(button) {
        var url = button.data("url");

        window.GGBT_gen_modal.showAjaxPopup(
            url, {},
            {className: 'popup-change-image popup-easing',
                autoPosition: true,
                autoResize: true,
                closebutton: false
            },
            button.data('title'),
            function() {
                // onOpen function
            },
            function() {
                // onShow function

            },
            function() {
                // onClose function
        });
    }

    /**
     * init a new croppie instance with the defaults settings
     */
    function initCroppie() {


        // BUTTON HANDLER: upload new image
        $('#upload').on('change', function () {
            readFile(this);
            $('.btn-save-image').show();
            $('#image-preview').hide();
        });

        // BUTTON HANDLER: get new image
        $('.btn-save-image').on('click', function(e) {
            uploadCrop.croppie('result', {
                type: 'canvas',
                size: {width: o.rw, height: o.rh}
            }).then(function(img) {
                window.GGB_general.showAjaxLoading($('.popup-change-image #ggt-popup-content'), true);

                $.ajax({
                    method: 'POST',
                    url: o.action,
                    processData: false,
                    data: img
                }).always(function() {
                    // FIXME: fail gracefully :)
                    window.location.reload(true);
                });
            });
        });
    }

    /**
     *  Init a new Croppie with options
     */
    function initImageCrop() {
        uploadCrop = $('#upload-croppie').croppie({
            enableExif: true,
            enforceBoundary: o.eb,
            viewport: {
                width: o.cw,
                height: o.ch,
                type: 'square'
            },
            boundary: {
                width: o.bw,
                height: o.bh
            },
            enableZoom: o.ez
        });
    }

    /**
     * helper function for change image (upload)
     * @param input
     */
    function readFile(input) {
        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
                // destroy previously uploaded picture
                if(uploadCrop) {
                    uploadCrop.croppie('destroy');
                }
                initImageCrop();

                uploadCrop.croppie('bind', {
                    url: e.target.result
                });

                // Resize the popup
                $.modal.update();

                $('#upload-croppie').addClass('ready');
            }
            reader.readAsDataURL(input.files[0]);
        }
    }

    function init() {
        $('body').on('click', function(e) {
            // popup for changing the profile banner
            if($(e.target).is('.banner-profile.allowChange, .banner-profile.allowChange .img, .banner-profile.allowChange .icon-edit')) {
                if($(e.target).hasClass('.banner-profile')) {
                    showChangeImagePopup($(e.target));
                } else {
                    showChangeImagePopup($(e.target).closest('.banner-profile'));
                }
            }
        });
    }

    
    return {
        init: init,
        showChangeImagePopup: showChangeImagePopup,
        setCroppieOptions: setCroppieOptions,
        initCroppie: initCroppie
    };
}) (jQuery);