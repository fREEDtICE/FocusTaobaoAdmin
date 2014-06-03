module.exports = exports = (function () {
    var cols = 4,
        pageSize = 40;
    return {
        cols: cols,
        pageSize: pageSize,
        validateCols: function (col) {
            col = parseInt(col) ? col : cols;
            col = col > 0 && col < 10 ? col : cols;
            return col;
        }
    };
})();

