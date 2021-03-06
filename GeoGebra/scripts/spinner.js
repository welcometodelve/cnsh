window.GGBT_spinner = (function () {
    "use strict";

    function attachSpinner(element, top) {
        if (window.Spinner) {
            /*spin.js*/
            var opts = {
                lines: 11, // The number of lines to draw
                length: 6, // The length of each line
                width: 3, // The line thickness
                radius: 10, // The radius of the inner circle
                scale: 1, // Scales overall size of the spinner
                corners: 1, // Corner roundness (0..1)
                color: '#666', // #rgb or #rrggbb or array of colors
                opacity: 0.25, // Opacity of the lines
                rotate: 0, // The rotation offset
                direction: 1, // 1: clockwise, -1: counterclockwise
                speed: 1, // Rounds per second
                trail: 60, // Afterglow percentage
                fps: 20, // Frames per second when using setTimeout() as a fallback for CSS
                zIndex: 2e9, // The z-index (defaults to 2000000000)
                className: 'spinner', // The CSS class to assign to the spinner
                top: top || '50%', // Top position relative to parent
                left: '50%', // Left position relative to parent
                shadow: false, // Whether to render a shadow
                hwaccel: true, // Whether to use hardware acceleration
                position: 'absolute' // Element positioning
            };
            var el = element || document.body;
            removeSpinner(el);
            new window.Spinner(opts).spin(el);
        }
    }

    function removeSpinner(element) {
        var el = element || document.body;
        var spinner = el.querySelector(".spinner");
        if (spinner) {
            spinner.parentNode.removeChild(spinner);
        }
    }

    function toggleSpinner(element, spin) {
        var el = element || document.body;
        if (spin) {
            window.GGBT_spinner.attachSpinner(el, '50%');
        } else {
            window.GGBT_spinner.removeSpinner(el);
        }
    }

    function attachOnDOMContentLoaded() {
        document.addEventListener("DOMContentLoaded", function() {
            attachSpinner(document.body, '50%');
        });
    }

    return {
        attachSpinner: attachSpinner,
        removeSpinner: removeSpinner,
        toggleSpinner: toggleSpinner,
        attachOnDOMContentLoaded: attachOnDOMContentLoaded
    };
})();