// wrap everything in a closure so as to not disrupt other scripts
// (function(){
var picsPath = "../pics/tetrispics/", emptyTile = "X", imageExtension = ".png", tetrisWrap = "tetrisWrap", tetris = "tetris", tetrisTile = "tetrisTile", tetrisRow = "tetrisRow";
var boardImg, boardValues;
var numCols, numRows, tileSide;
var pieces, pieceStats;
var gameSpeed, gameScore;
var Piece = (function () {
    function Piece() {
    }
    return Piece;
}());
// let curPiece.row: number, curPiece.col: number, curPiece.let: number, curPiece.rot: number, 
var nextPiece, piecePlaced;
var curPiece;
var coefficients, autopilot;
var animate, animationFrame;
function setKeyPressListeners() {
    var tetrisWrapElement = document.getElementById(tetrisWrap);
    if (!tetrisWrapElement)
        return;
    tetrisWrapElement.addEventListener("keydown", function (event) {
        var value = Number(event.keyCode);
        if (value == 37 || value == 38 || value == 39 || value == 40 || value == 32)
            event.preventDefault();
        else
            return;
        autopilot = false;
        // left, right, up, down, space
        if (value === 37 && movePieceFromTo(boardValues, { row: curPiece.row, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, { row: curPiece.row, col: curPiece.col - 1, rot: curPiece.rot, let: curPiece.let }, true))
            curPiece.col -= 1;
        else if (value === 39 && movePieceFromTo(boardValues, { row: curPiece.row, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, { row: curPiece.row, col: curPiece.col + 1, rot: curPiece.rot, let: curPiece.let }, true))
            curPiece.col += 1;
        else if (value === 38 && movePieceFromTo(boardValues, { row: curPiece.row, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, { row: curPiece.row, col: curPiece.col, rot: ((curPiece.rot + 1) % pieces[curPiece.let].length), let: curPiece.let }, true))
            curPiece.rot = (curPiece.rot + 1) % pieces[curPiece.let].length;
        else if (value === 40 && makeNextDefaultMove()) { } //movePieceFromTo(boardValues, pieces[curPiece.let][curPiece.rot], curPiece.row, curPiece.col, curPiece.row+1, curPiece.col, curPiece.rot, true)) curPiece.row += 1; 
        else if (value == 32) {
            while (movePieceFromTo(boardValues, { row: curPiece.row, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, { row: curPiece.row + 1, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, true))
                curPiece.row += 1;
            removeLines(boardValues, pieces[curPiece.let][curPiece.rot], curPiece.row, true);
            setCurVariables();
            makeNextDefaultMove();
            animationFrame = 1;
        }
    });
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
// adds a new piece. changes only pieces, and pieceStats
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
// sets all originalk pieces. changes only pieces and pieceStats.
function setOriginalPieces() {
    pieces = [];
    pieces.push([
        [
            ["O", "O"],
            ["O", "O"]
        ]
    ]);
    pieces.push([
        [
            ["I"],
            ["I"],
            ["I"],
            ["I"]
        ]
    ]);
    pieces.push([
        [
            ["X", "J"],
            ["X", "J"],
            ["J", "J"]
        ]
    ]);
    pieces.push([
        [
            ["L", "X"],
            ["L", "X"],
            ["L", "L"]
        ]
    ]);
    pieces.push([
        [
            ["X", "T", "X"],
            ["T", "T", "T"]
        ]
    ]);
    pieces.push([
        [
            ["X", "S", "S"],
            ["S", "S", "X"]
        ]
    ]);
    pieces.push([
        [
            ["Z", "Z", "X"],
            ["X", "Z", "Z"]
        ]
    ]);
    pieceStats = [];
    for (var i = 0; i < pieces.length; ++i) {
        setRotatedPiece(i);
        pieceStats.push(0);
    }
}
// sets only gamespeed
function setGamespeed() {
    gameSpeed = 1;
}
// sets board, boardImg
function setBoardAndBoardImg(gameDiv) {
    var tileSidePx = tileSide + "px";
    for (var i = 0; i < numRows; ++i) {
        boardImg.push([]);
        boardValues.push([]);
        var div = document.createElement("div");
        div.className = tetrisRow;
        div.style.height = tileSidePx;
        gameDiv.appendChild(div);
        for (var j = 0; j < numCols; ++j) {
            // let tile: HTMLElement = document.createElement('div');
            // tile.className = tetrisTile;
            // tile.style.width = tileSidePx;
            // tile.style.height = tileSidePx;
            // tile.id = i + " " + j;
            var img = document.createElement('img');
            img.src = picsPath + emptyTile + imageExtension;
            img.style.height = tileSidePx; // "100%";
            img.style.width = tileSidePx; // "100%";
            // img.style.objectFit = "contain";
            // tile.appendChild(img);
            boardImg[i].push(img);
            div.appendChild(img);
            boardValues[i].push(emptyTile);
        }
    }
}
// sets numRows, numCols, tileSide, gameScore, nextPiece, pieceStats, boardImg, boardValues
// pieceStats added here as well, because user may change board's row/col => pieceStats must be cleared
function setGameboard() {
    numCols = 12;
    numRows = 20;
    tileSide = 23;
    gameScore = 0;
    nextPiece = randomPiece();
    pieceStats = [];
    if (pieces)
        for (var i = 0; i < pieces.length; ++i)
            pieceStats.push(0);
    boardImg = [];
    boardValues = [];
    // setting boardImg and boardValues
    var gameDiv = document.getElementById(tetris), gameDivWrapper = document.getElementById(tetrisWrap);
    if (!gameDiv || !gameDivWrapper)
        return;
    // remvoe old tiles.
    while (gameDiv.lastChild)
        gameDiv.removeChild(gameDiv.lastChild);
    // let playAreaHeight:number = gameDivWrapper.clientHeight;   
    // let playAreaWidth:number = gameDivWrapper.clientWidth;
    setBoardAndBoardImg(gameDiv);
    // do bounds-checking and set to defaults if they don't line up
    // board should have at least a few rows and columns...
    // get numCols, numRows, tileSide from user    
    // if(numCols*tileSide > playAreaWidth || numRows*tileSide > playAreaHeight ) ....
    // set tileSide so that it covers entire screen!
    // check something... forgot for now
}
function setCoefficients() {
    coefficients = [];
    coefficients.push(-0.192716);
    coefficients.push(-1);
    coefficients.push(0.00742194);
    coefficients.push(0.292781);
    coefficients.push(0.182602);
    coefficients.push(0.175692);
    coefficients.push(-0.0439177);
}
function setAutopilot() {
    autopilot = true;
}
function setCurVariables() {
    curPiece = { row: -1, col: numCols / 2 - 1, rot: 0, let: nextPiece };
    // curPiece.row = -1;
    // curPiece.col = numCols/2 - 1;
    // curPiece.rot = 0;
    // curPiece.let = nextPiece;
    pieceStats[curPiece.let] += 1;
    nextPiece = randomPiece();
    piecePlaced = false;
    if (autopilot)
        setBestRotationAndCol();
}
function randomPiece() {
    return Math.floor((Math.random() * (pieces.length)));
}
// sets the animate callback and the current animationFrame
function setAnimation() {
    animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) { return window.setTimeout(callback, 1000 / 60); };
    animationFrame = 0;
}
function withinBounds(numberToCheck, maxRange) {
    return (numberToCheck >= 0 && numberToCheck < maxRange);
}
// checks if piece can be places at row, col. and places it there if it can
function placePiece(board, pieceDrop, applyToRealBoard) {
    var pieceToDrop = pieces[pieceDrop.let][pieceDrop.rot];
    if (!withinBounds(pieceDrop.row, board.length - pieceToDrop.length + 1) ||
        !withinBounds(pieceDrop.col, board[0].length - pieceToDrop[0].length + 1))
        return false;
    for (var i = 0; i < pieceToDrop.length; ++i) {
        for (var j = 0; j < pieceToDrop[i].length; ++j) {
            if (pieceToDrop[i][j] !== emptyTile && board[pieceDrop.row + i][pieceDrop.col + j] !== emptyTile)
                return false;
        }
    }
    for (var i = 0; i < pieceToDrop.length; ++i) {
        for (var j = 0; j < pieceToDrop[i].length; ++j) {
            if (pieceToDrop[i][j] !== emptyTile) {
                board[pieceDrop.row + i][pieceDrop.col + j] = pieceToDrop[i][j];
                if (applyToRealBoard)
                    boardImg[pieceDrop.row + i][pieceDrop.col + j].src = picsPath + pieceToDrop[i][j] + imageExtension;
            }
        }
    }
    return true;
}
// removes piece at row, col
function erasePiece(board, pieceErase, applyToRealBoard) {
    var pieceToErase = pieces[pieceErase.let][pieceErase.rot];
    if (!withinBounds(pieceErase.row, board.length - pieceToErase.length + 1) ||
        !withinBounds(pieceErase.col, board[0].length - pieceToErase[0].length + 1))
        return;
    for (var i = 0; i < pieceToErase.length; ++i) {
        for (var j = 0; j < pieceToErase[i].length; ++j) {
            if (pieceToErase[i][j] !== emptyTile) {
                board[pieceErase.row + i][pieceErase.col + j] = emptyTile;
                if (applyToRealBoard)
                    boardImg[pieceErase.row + i][pieceErase.col + j].src = picsPath + emptyTile + imageExtension;
            }
        }
    }
}
function drawUpdatedBoard(board) {
    for (var i = 0; i < board.length; ++i) {
        for (var j = 0; j < board[i].length; ++j) {
            if (boardImg[i][j].src.charAt(boardImg[i][j].src.length - 5) !== board[i][j]) {
                boardImg[i][j].src = picsPath + board[i][j] + imageExtension;
            }
        }
    }
}
// returns the number of lines cleared
function removeLines(board, pieceDropped, rowDroppedAt, applyToRealBoard) {
    var numLinesCleared = 0;
    for (var i = 0; i < pieceDropped.length; ++i) {
        var rowCompleted = true;
        for (var j = 0; j < board[0].length; ++j) {
            if (board[i + rowDroppedAt][j] === emptyTile) {
                rowCompleted = false;
                break;
            }
        }
        if (!rowCompleted)
            continue;
        numLinesCleared += 1;
        board.splice(rowDroppedAt + i, 1);
        var newRow = [];
        for (var k = 0; k < board[0].length; ++k) {
            newRow.push(emptyTile);
        }
        board.splice(0, 0, newRow);
    }
    if (applyToRealBoard) {
        drawUpdatedBoard(board);
        gameScore += numLinesCleared;
    }
    return numLinesCleared;
}
// movePieceFromTo moves delta amount from original position
// pieceToMove: string[][], fromRow: number, fromCol: number, toRow: number, toCol: number, toRot: number, applyToRealBoard: boolean): boolean{
function movePieceFromTo(board, pieceFrom, pieceTo, applyToRealBoard) {
    // erase old piece if it exists
    // let x:Piece = {row:fromRow, col:fromCol, let:curPiece.let, rot:curPiece.rot};
    erasePiece(board, pieceFrom, applyToRealBoard); // changed!!!!
    if (placePiece(board, pieceTo, applyToRealBoard)) {
        return true;
    }
    else {
        placePiece(board, pieceFrom, applyToRealBoard);
        return false;
    }
}
function setBestRotationAndCol() {
    curPiece.col = 1;
    curPiece.rot = 0; // pieces[curPiece.let].length % 3;
}
function moveRight(board, p, applyToRealBoard) {
    var newP = p;
    newP.col += 1;
    if (movePieceFromTo(board, p, newP, applyToRealBoard)) {
        p = newP;
        return true;
    }
    else
        return false;
}
function moveLeft(board, p, applyToRealBoard) {
    var newP = p;
    newP.col += -1;
    if (movePieceFromTo(board, p, newP, applyToRealBoard)) {
        p = newP;
        return true;
    }
    else
        return false;
}
function moveDown(board, p, applyToRealBoard) {
    var newP = p;
    newP.row += 1;
    if (movePieceFromTo(board, p, newP, applyToRealBoard)) {
        p = newP;
        return true;
    }
    else
        return false;
}
function moveClockwise(board, p, applyToRealBoard) {
    var newP = p;
    newP.rot += (newP.rot + 1) % pieces[newP.let].length;
    if (movePieceFromTo(board, p, newP, applyToRealBoard)) {
        p = newP;
        return true;
    }
    else
        return false;
}
function moveBottom(board, p, applyToRealBoard) {
    var newP = p;
    newP.col += 1;
    if (movePieceFromTo(board, p, newP, applyToRealBoard)) {
        p = newP;
        return true;
    }
    else
        return false;
}
function makeNextDefaultMove() {
    if (piecePlaced) {
        if (movePieceFromTo(boardValues, { row: curPiece.row, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, { row: curPiece.row + 1, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, true)) {
            // if(movePieceFromTo(boardValues, pieces[curPiece.let][curPiece.rot], curPiece.row, curPiece.col, curPiece.row+1, curPiece.col, curPiece.rot, true)){
            curPiece.row += 1;
        }
        else {
            removeLines(boardValues, pieces[curPiece.let][curPiece.rot], curPiece.row, true);
            setCurVariables();
        }
    }
    else {
        if (movePieceFromTo(boardValues, { row: curPiece.row, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, { row: curPiece.row + 1, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, true)) {
            // if(movePieceFromTo(boardValues, pieces[curPiece.let][curPiece.rot], curPiece.row, curPiece.col, curPiece.row+1, curPiece.col, curPiece.rot, true)){
            curPiece.row += 1;
            piecePlaced = true;
        }
        else {
            console.log("Game Over!");
        }
    }
}
function step() {
    if (animationFrame >= 60)
        animationFrame = 0;
    if (animationFrame === 0) {
        if (autopilot) {
            // movePieceFromTo(boardValues, pieces[curPiece.let][curPiece.rot], curPiece.row, curPiece.col, curPiece.row+1, curPiece.col, curPiece.rot, true))
            while (movePieceFromTo(boardValues, { row: curPiece.row, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, { row: curPiece.row + 1, col: curPiece.col, rot: curPiece.rot, let: curPiece.let }, true)) {
                curPiece.row += 1;
            }
            removeLines(boardValues, pieces[curPiece.let][curPiece.rot], curPiece.row, true);
            setCurVariables();
            makeNextDefaultMove();
            animationFrame = 1;
        }
        else {
            makeNextDefaultMove();
        }
    }
    animationFrame += gameSpeed;
    animate(step);
}
// calls all setters and the animate callback
function main() {
    // Not dependent on anything
    setOriginalPieces();
    setGamespeed();
    setCoefficients();
    setAnimation();
    setAutopilot();
    // Dependent on pieces being set. (setOriginalPieces() happening first)
    setGameboard();
    setCurVariables();
    setKeyPressListeners();
    animate(step);
}
main();
// }());
