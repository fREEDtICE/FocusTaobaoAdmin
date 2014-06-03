!(function (taobao, $) {
    "use strict";


    taobao.makePage = function (sel, pageno, pagesize, total) {
        function createPageLink(pageno, pagesize, total) {
            var $li = $("<li></li>");
        };

        sel = "string" === typeof sel ? sel : "ul.pagination";
        pageno = "number" === typeof pageno ? pageno : 1;
        pagesize = "number" === typeof pagesize ? pagesize : 40;

        var $ul = $(sel);
//        <ul class="pagination">
//            <li><a href="javascript:void(0);" data-url="/tpi/product/list?cid={{cid}}&pageno=1&pagesize={{pageSize}}">&laquo;</a></li>
//            <li><a href="javascript:void(0);" data-url="/tpi/product/list?cid={{cid}}&pageno={{pageNo-2}}&pagesize={{pageSize}}">{{pageNo-2}}</a></li>
//            <li><a href="javascript:void(0);" data-url="/tpi/product/list?cid={{cid}}&pageno={{pageNo-1}}&pagesize={{pageSize}}">{{pageNo-1}}</a></li>
//            <li><a href="javascript:void(0);" data-url="/tpi/product/list?cid={{cid}}&pageno={{pageNo}}&pagesize={{pageSize}}">{{pageNo}}</a></li>
//            <li><a href="javascript:void(0);" data-url="/tpi/product/list?cid={{cid}}&pageno={{pageNo+1}}&pagesize={{pageSize}}">{{pageNo+1}}</a></li>
//            <li><a href="javascript:void(0);" data-url="/tpi/product/list?cid={{cid}}&pageno={{pageNo+2}}&pagesize={{pageSize}}">{{pageNo+2}}</a></li>
//            <li><a href="javascript:void(0);" data-url="/tpi/product/list?cid={{cid}}&pageno={{parseInt(total/pageSize)}}&pagesize={{pageSize}}">&raquo;</a></li>
//        </ul>
    };

    window.focusTaobao || (window.focusTaobao = taobao);

    return taobao;
}(window.focusTaobao || {}, window.jQuery));