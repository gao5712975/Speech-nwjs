$(function () {
    $('[data-toggle="popover"]').popover({
        html: true,
        animation: false
    });

    $("#playMode").click(function () {
        var index = $(this).attr("data-value");
        var arr = $(this).attr("data-play").split(",");
        if (arr.length == +index) {
            index = 0;
        }
        $(this).text(arr[+index]);
        $(this).attr("data-value", ++index);
    })
});