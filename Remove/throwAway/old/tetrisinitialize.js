(function () {
    // Variables only used in this file
    var picsPath = "../pics/tetrispics/";
    var xImg = "X";
    var gameDiv, gameDivWrapper;
    var playAreaHeight, playAreaWidth;
    var tileSide;
    var boardImg;
    // Variables used in both files
    var boardValues;
    var numCols, numRows;
    var gameSpeed;
    var pieces, pieceId;
    var gameScore, pieceStats;
    // Variables used only in this file
    var coefficients;
    var dropPieceSlowly;
    var animate;
    // add piece: setNewPiece
    // change row, col, tileside: resetBoard()
    // gamespeed: setGamespeed()
    // 
    function setGameDivs() {
        var game = document.getElementById("tetris"), gameWrapper = document.getElementById("tetrisWrap");
        if (!game || !gameWrapper)
            return false;
        gameDiv = game;
        gameDivWrapper = gameWrapper;
        return true;
    }
    function setNewPiece() {
        // set new piece if it's okay
        // should not already be present
        // should be at most 5x5
        // remove extra rows of zeroes
        // all rows should have same number of items
        // etc etc.
        //set PieceId
        // pieceStats.push(0);
    }
    function checkTwoPieceSame(pieceOne, pieceTwo) {
        if (pieceOne.length === 0 || pieceTwo.length === 0 || pieceOne.length !== pieceTwo.length ||
            pieceOne[0].length === 0 || pieceTwo[0].length === 0 || pieceOne[0].length !== pieceTwo[0].length) {
            return false;
        }
        for (var i = 0; i < pieceOne.length; ++i) {
            for (var j = 0; j < pieceOne[i].length; ++j) {
                if (pieceOne[i][j] !== pieceTwo[i][j])
                    return false;
            }
        }
        return true;
    }
    function setRotatedPiece(whichPiece) {
        var pieceToRotate = pieces[whichPiece][0], rotatedPiece = [];
        while (1) {
            for (var j = 0; j < pieceToRotate[0].length; ++j) {
                rotatedPiece.push([]);
                for (var i = pieceToRotate.length - 1; i >= 0; --i) {
                    rotatedPiece[j].push(pieceToRotate[i][j]);
                }
            }
            if (checkTwoPieceSame(rotatedPiece, pieces[whichPiece][0]))
                break;
            pieces[whichPiece].push(rotatedPiece);
            pieceToRotate = rotatedPiece;
            rotatedPiece = [];
        }
    }
    function setOriginalPieces() {
        pieces = [];
        pieceId = {};
        pieceId["O"] = 0;
        pieceId["I"] = 1;
        pieceId["J"] = 2;
        pieceId["L"] = 3;
        pieceId["T"] = 4;
        pieceId["S"] = 5;
        pieceId["Z"] = 6;
        for (var i = 0; i < Object.keys(pieceId).length; ++i) {
            pieces.push([]);
            pieceStats.push(0);
        }
        pieces[pieceId["O"]] = [
            [
                ["O", "O"],
                ["O", "O"]
            ]
        ];
        pieces[pieceId["I"]] = [
            [
                ["I"],
                ["I"],
                ["I"],
                ["I"]
            ]
        ];
        pieces[pieceId["J"]] = [
            [
                ["X", "J"],
                ["X", "J"],
                ["J", "J"]
            ]
        ];
        pieces[pieceId["L"]] = [
            [
                ["L", "X"],
                ["L", "X"],
                ["L", "L"]
            ]
        ];
        pieces[pieceId["T"]] = [
            [
                ["X", "T", "X"],
                ["T", "T", "T"]
            ]
        ];
        pieces[pieceId["S"]] = [
            [
                ["X", "S", "S"],
                ["S", "S", "X"]
            ]
        ];
        pieces[pieceId["Z"]] = [
            [
                ["Z", "Z", "X"],
                ["X", "Z", "Z"]
            ]
        ];
        for (var i = 0; i < Object.keys(pieceId).length; ++i)
            setRotatedPiece(i);
    }
    function setGamespeed() {
        // get gamespeed from form
        gameSpeed = 10;
    }
    function setRowColTile() {
        // do bounds-checking and set to defaults if they don't line up
        boardImg = [];
        boardValues = [];
        playAreaHeight = gameDivWrapper.clientHeight;
        playAreaWidth = gameDivWrapper.clientWidth;
        // get numCols, numRows, tileSide from user    
        numCols = 12;
        numRows = 30;
        // if(numCols*tileSide > playAreaWidth || numRows*tileSide > playAreaHeight ) ....
        tileSide = 20; // set tileSide so that it covers entire screen!
        // check something... forgot for now
        gameScore = 0;
        pieceStats = [];
    }
    function removeChildren(node) {
        while (node.lastChild)
            node.removeChild(node.lastChild);
    }
    function resetBoard() {
        if (!setGameDivs())
            return false;
        setRowColTile();
        setGamespeed();
        removeChildren(gameDiv);
        drawInitialBoard();
        return true;
    }
    function initializeBoard() {
        if (!resetBoard())
            return false;
        setOriginalPieces();
        return true;
    }
    function drawInitialBoard() {
        var tileSidePx = tileSide + "px";
        for (var i = 0; i < numRows; ++i) {
            boardImg.push([]);
            boardValues.push([]);
            var div = document.createElement("div");
            div.className = "tetrisRow";
            div.style.height = tileSidePx;
            gameDiv.appendChild(div);
            for (var j = 0; j < numCols; ++j) {
                var tile = document.createElement('div');
                tile.className = "tetrisTile";
                tile.style.width = tileSidePx;
                tile.style.height = tileSidePx;
                tile.id = i + " " + j;
                var img = document.createElement('img');
                img.src = picsPath + xImg + ".png";
                img.style.height = "100%";
                img.style.width = "100%";
                // img.style.objectFit = "contain";
                tile.appendChild(img);
                boardImg[i].push(img);
                div.appendChild(tile);
                boardValues[i].push(xImg);
            }
        }
    }
    function drawUpdatedBoard() {
        for (var i = 0; i < numRows; ++i) {
            for (var j = 0; j < numCols; ++j) {
                if (boardImg[i][j].src.charAt(boardImg[i][j].src.length - 5) !== boardValues[i][j]) {
                    boardImg[i][j].src = picsPath + boardValues[i][j] + ".png";
                }
            }
        }
    }
    function setCoefficients() {
        coefficients.push(-0.192716);
        coefficients.push(-1);
        coefficients.push(0.00742194);
        coefficients.push(0.292781);
        coefficients.push(0.182602);
        coefficients.push(0.175692);
        coefficients.push(-0.0439177);
    }
    function placePiece(board, pieceToDrop, rowToPlace, colToPlace) {
        if (rowToPlace > board.length - pieceToDrop.length || rowToPlace < 0)
            return false;
        for (var i = 0; i < pieceToDrop.length; ++i) {
            for (var j = 0; j < pieceToDrop[i].length; ++j) {
                if (pieceToDrop[i][j] !== "X" && board[rowToPlace + i][colToPlace + j] !== "X")
                    return false;
            }
        }
        for (var i = 0; i < pieceToDrop.length; ++i) {
            for (var j = 0; j < pieceToDrop[i].length; ++j) {
                if (pieceToDrop[i][j] !== "X") {
                    board[rowToPlace + i][colToPlace + j] = pieceToDrop[i][j];
                    if (dropPieceSlowly) {
                        // boardImg[rowToPlace + i][colToPlace + j].src = 
                    }
                }
            }
        }
        return true;
    }
    function erasePiece(board, pieceToDrop, rowToPlace, colToPlace) {
        for (var i = 0; i < pieceToDrop.length; ++i) {
            for (var j = 0; j < pieceToDrop[i].length; ++j) {
                if (pieceToDrop[i][j] !== "X")
                    board[rowToPlace + i][colToPlace + j] = "X";
                if (dropPieceSlowly) {
                    // some thing
                }
            }
        }
    }
    function dropPiece(board, pieceToDrop, colToDrop) {
        if (colToDrop < 0 || colToDrop >= board.length)
            return false;
        var i = 0;
        while (placePiece(board, pieceToDrop, i, colToDrop)) {
            erasePiece(board, pieceToDrop, i, colToDrop);
            i += 1;
        }
        if (i == 0)
            return false;
        placePiece(board, pieceToDrop, i - 1, colToDrop);
        return true;
    }
    // function canDropPiece(board: string[][], )
    function main() {
        if (!initializeBoard())
            return;
        dropPieceSlowly = true;
        dropPiece(boardValues, pieces[3][2], 3);
        dropPiece(boardValues, pieces[0][0], 0);
        dropPiece(boardValues, pieces[5][0], 1);
        drawUpdatedBoard();
        dropPiece(boardValues, pieces[6][1], 0);
        animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) { window.setTimeout(callback, 1000 / 60); };
    }
    main();
}());
