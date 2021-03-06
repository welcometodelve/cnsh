/*global $, GGBT_wsf_edit, jQuery, console, alert, GGBApplet, renderGGBElement, GGBT_wsf_general, MutationObserver, GGBT_wsf_metadata_edit*/
window.GGBT_jlatexmath = (function() {
    "use strict";

    function initializeCanvas(canvas, pixelRatio) {
        var context;

        context = canvas.getContext("2d");

        canvas.style.width = canvas.width + 'px';
        canvas.style.height = canvas.height + 'px';
        canvas.width *= pixelRatio;
        canvas.height *= pixelRatio;
        context.scale(pixelRatio, pixelRatio);
    }

    function drawLatexOnCanvas(canvas) {
        var latex = canvas.getAttribute("data-content"),
            ctx = canvas.getContext("2d"),
            opts = {
                context: ctx,
                latex: latex,
                size: 14,
                x: 0,
                y: 0,
                type: 0,
                foregroundColor: "#000000",
                //backgroundColor: "#ffffff", //needed to get it transparent
                //callback : function() {console.log("latex ready yeah");}
                insets: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                }

            },
            size;
        if (!latex) {
            console.log("empty latex added.....");
            return;
        }
        if (window.jlmlib) {
            size = window.jlmlib.drawLatex(opts);
            if(size){
                canvas.width = size.width;
                canvas.height = size.height;
                canvas.style.lineHeight = size.height + "px";
                canvas.style.verticalAlign = (-100 + Math.round(size.baseline * 100)) + "%";
                initializeCanvas(canvas, size.pixelRatio || 1);
                window.jlmlib.drawLatex(opts); //hack, not cool
            } else {
                canvas.width = 70;
                    canvas.height = 30;
                ctx.strokeText("LaTeX error",0,25);
            }
        } else {
            console.log("latex was not loaded yet");
        }
    }

    function drawLatexJQ(canvaslist) {
        if (canvaslist && canvaslist.length) {
            canvaslist.each(function(e) {
                drawLatexOnCanvas(this);
            });
        }
    }

    return {
        drawLatexOnjQuery : drawLatexJQ,
        drawLatexOnCanvas : drawLatexOnCanvas
    };
})();
