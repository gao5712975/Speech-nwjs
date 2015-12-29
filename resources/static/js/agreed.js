$(function () {
    $('[data-toggle="popover"]').popover({
        html: true,
        animation: false
    });

    $("#buttonPopover").mouseout(function (e) {
        e.preventDefault();
        $(this).click();
    }).mouseover(function (e) {
        e.preventDefault();
        $(this).click();
    });

    //播放模式切换
    $("#playMode").click(function () {
        var index = $(this).attr("data-value");
        var arr = $(this).attr("data-play").split(",");
        if (arr.length == +index) {
            index = 0;
        }
        $(this).text(arr[+index]);
        $(this).attr("data-value", ++index);
    });
    //修改保护
    $(".controlDisabledBox").change(function (e) {
        e.preventDefault();
        if ($(this).is(":checked")) {
            $(this).parent().next().removeAttr("disabled");
        } else {
            $(this).parent().next().attr("disabled", "disabled");
        }
    })

});