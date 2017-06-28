// (function(){
// filepaths, class and id names
var picsPath = "../pics/tetrispics/", emptyTile = "X", imageExtension = ".png", tetrisWrapDiv = "tetrisWrap", tetrisDiv = "tetris", tetrisTile = "tetrisTile", tetrisRow = "tetrisRow", tetrisTextDiv = "tetrisText";
// game parameters
var gameSpeed, linesCleared, gameScore, gameOver;
// board parameters
var boardImg, boardValues;
var numCols, numRows, tileSide;
// ai parameters
var coefficients, autopilot;
// piece parameters, piece class and related functions
var pieces, pieceStats;
var nextPiece, piecePlaced;
var curPiece;
var Piece = (function () {
    function Piece() {
    }
    return Piece;
}());
function newPiece(p) {
    return { row: p.row, col: p.col, rot: p.rot, let: p.let };
}
function copyPiece(copyFrom, copyTo) {
    copyTo.row = copyFrom.row;
    copyTo.col = copyFrom.col;
    copyTo.let = copyFrom.let;
    copyTo.rot = copyFrom.rot;
}
// 
// SET ONCE FUNCTIONS 
//
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
    var statsDisplayDiv = document.getElementById(tetrisTextDiv);
    pieceStats = [];
    for (var i = 0; i < pieces.length; ++i) {
        if (statsDisplayDiv) {
            var pieceAndNumDiv = document.createElement("div");
            pieceAndNumDiv.className = "tetrisPieceAndNumber";
            var pieceDiv = document.createElement("div");
            pieceDiv.className = "tetrisPiece";
            for (var a = 0; a < pieces[i][0].length; ++a) {
                var rowDiv = document.createElement("div");
                rowDiv.className = "tetrisRow";
                for (var b = 0; b < pieces[i][0][0].length; ++b) {
                    var tileSidePx = "23px";
                    var img = document.createElement('img');
                    if (pieces[i][0][a][b] == "X") {
                        img.style.opacity = "0"; //For real browsers;
                        img.style.filter = "alpha(opacity=50)"; //For IE;
                    }
                    img.src = picsPath + pieces[i][0][a][b] + imageExtension;
                    img.style.height = tileSidePx; // "100%";
                    img.style.width = tileSidePx; // "100%";
                    rowDiv.appendChild(img);
                }
                pieceDiv.appendChild(rowDiv);
            }
            pieceAndNumDiv.appendChild(pieceDiv);
            var numberDiv = document.createElement("div");
            numberDiv.className = "tetrisNumber";
            numberDiv.id = "tetris" + i + "number";
            numberDiv.innerHTML = "123";
            pieceAndNumDiv.appendChild(numberDiv);
            statsDisplayDiv.appendChild(pieceAndNumDiv);
        }
        setRotatedPiece(i);
        pieceStats.push(0);
    }
}
function setKeyPressListeners() {
    var tetrisWrapDivElement = document.getElementById(tetrisWrapDiv);
    if (!tetrisWrapDivElement)
        return;
    tetrisWrapDivElement.addEventListener("keydown", function (event) {
        var value = Number(event.keyCode);
        if (value === 37 || value === 38 || value === 39 || value === 40 || value === 32)
            event.preventDefault();
        else
            return;
        if (gameOver) {
            setGameboard();
            animate(step);
            return;
        }
        autopilot = false;
        gameSpeed = 1;
        // left, right, up, down, space
        if (value === 37)
            moveLeft(boardValues, curPiece, true);
        else if (value === 39)
            moveRight(boardValues, curPiece, true);
        else if (value === 38)
            moveClockwise(boardValues, curPiece, true);
        else if (value === 40 && makeNextDefaultMove(boardValues, curPiece, true)) { }
        else if (value === 32) {
            if (!moveBottom(boardValues, curPiece, true)) {
                gameOver = true;
            }
        }
    });
}
// 
// SET MANY TIMES FUNCTIONS
//
function setCurVariables() {
    curPiece.row = -1;
    curPiece.col = numCols / 2 - 1;
    curPiece.rot = 0;
    curPiece.let = nextPiece;
    pieceStats[curPiece.let] += 1;
    var numberDiv = document.getElementById("tetris" + curPiece.let + "number");
    if (numberDiv)
        numberDiv.innerHTML = pieceStats[curPiece.let] + "";
    nextPiece = randomPiece();
    piecePlaced = false;
    if (autopilot)
        setBestRotationAndCol();
}
var bagOfPieces = [];
function randomPiece() {
    if (bagOfPieces.length <= 1) {
        var numberOfEachPiece = 5;
        for (var i = 0; i < pieces.length; ++i) {
            for (var j = 0; j < numberOfEachPiece; ++j) {
                bagOfPieces.push(i);
            }
        }
        // shuffle array
        for (var k = 0; k < bagOfPieces.length; ++k) {
            var min = k, max = bagOfPieces.length - 1;
            var swapIndex = Math.floor(Math.random() * (max - min + 1)) + min;
            var tmp = bagOfPieces[swapIndex];
            bagOfPieces[swapIndex] = bagOfPieces[k];
            bagOfPieces[k] = tmp;
        }
    }
    var x = bagOfPieces.pop();
    return x ? x : 0;
}
// 
// SET FROM USER FUNCTIONS
//
function setAutopilot() {
    autopilot = true;
}
function setGamespeed() {
    gameSpeed = 2;
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
function setGameboard() {
    var textP = document.getElementById("tetrisTextNotification");
    if (textP)
        textP.innerHTML = "";
    var linesRemovedP = document.getElementById("tetrisTextLinesCleared");
    if (linesRemovedP)
        linesRemovedP.innerHTML = "Lines: " + "0";
    numCols = 8;
    numRows = 12;
    tileSide = 23;
    linesCleared = 0;
    gameOver = false;
    curPiece = { row: -1, col: numCols / 2 - 1, rot: 0, let: 0 };
    nextPiece = randomPiece();
    pieceStats = [];
    if (pieces)
        for (var i = 0; i < pieces.length; ++i) {
            pieceStats.push(0);
            var numberDiv = document.getElementById("tetris" + i + "number");
            if (numberDiv)
                numberDiv.innerHTML = "0";
        }
    boardImg = [];
    boardValues = [];
    // setting boardImg and boardValues
    var gameDiv = document.getElementById(tetrisDiv), gameDivWrapper = document.getElementById(tetrisWrapDiv);
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
//
// MANIPULATE PIECE FUNCTIONS
//
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
function moveRight(board, p, applyToRealBoard) {
    var newP = newPiece(p);
    newP.col += 1;
    if (movePieceFromTo(board, p, newP, applyToRealBoard)) {
        copyPiece(newP, p);
        return true;
    }
    else
        return false;
}
function moveLeft(board, p, applyToRealBoard) {
    var newP = newPiece(p);
    newP.col += -1;
    if (movePieceFromTo(board, p, newP, applyToRealBoard)) {
        copyPiece(newP, p);
        return true;
    }
    else
        return false;
}
function moveDown(board, p, applyToRealBoard) {
    var newP = newPiece(p);
    newP.row += 1;
    if (movePieceFromTo(board, p, newP, applyToRealBoard)) {
        copyPiece(newP, p);
        return true;
    }
    else
        return false;
}
function moveClockwise(board, p, applyToRealBoard) {
    var newP = newPiece(p);
    newP.rot += 1;
    newP.rot %= pieces[newP.let].length;
    if (movePieceFromTo(board, p, newP, applyToRealBoard)) {
        copyPiece(newP, p);
        return true;
    }
    else
        return false;
}
function moveBottom(board, p, applyToRealBoard) {
    while (moveDown(board, p, applyToRealBoard)) { }
    removeLines(board, p, applyToRealBoard);
    setCurVariables();
    if (!makeNextDefaultMove(board, p, true)) {
        return false;
    }
    animationFrame = 1;
    return true;
}
//
// AI FUNCTIONS
//
function movePieceToBottom(board, p) {
    if (!placePiece(board, p, false))
        return false;
    var toPiece = newPiece(p);
    toPiece.row += 1;
    while (movePieceFromTo(board, p, toPiece, false)) {
        p.row += 1;
        toPiece.row += 1;
    }
    return true;
}
function calculateFitness(board, numCleared) {
    var totalHeight = 0, maxHeight = 0, numHoles = 0, numBlockades = 0, heightDifferences = 0, firstHeight = 0, lastHeight = 0;
    // Calculate: firstHeight & lastHeight:
    for (var i_1 = 0; i_1 < board.length; i_1++) {
        if (board[i_1][0] !== emptyTile) {
            firstHeight = board.length - i_1;
            break;
        }
    }
    for (var i_2 = 0; i_2 < board.length; i_2++) {
        if (board[i_2][board[0].length - 1] !== emptyTile) {
            lastHeight = board.length - i_2;
            break;
        }
    }
    // Calculate: the rest:
    // Count from the top
    var heights = [board[0].length];
    var prevHeight = 0;
    var currHeight = 0;
    for (var i = 0; i < board[0].length; i++) {
        var startCountingHeight = false;
        prevHeight = currHeight;
        currHeight = 0;
        var lastHole = -1;
        for (var j = 0; j < board.length; j++) {
            if (board[j][i] !== emptyTile)
                startCountingHeight = true;
            if (startCountingHeight) {
                currHeight++;
                // Data: Count holes
                if (board[j][i] === emptyTile) {
                    numHoles++;
                    lastHole = j;
                }
            }
        }
        // Data: Count maximum column height
        if (currHeight > maxHeight)
            maxHeight = currHeight;
        // Data: Count difference in adjacent column heights.
        if (i != 0)
            heightDifferences += Math.abs(currHeight - prevHeight);
        // Data: Count total height.
        totalHeight += currHeight;
        // Data: Count blockades:
        if (lastHole != -1) {
            numBlockades += currHeight - (board.length - lastHole);
        }
        heights.push(currHeight);
    }
    var fitness = coefficients[0] * heightDifferences +
        coefficients[1] * numHoles +
        coefficients[2] * (board.length - maxHeight) +
        coefficients[3] * numCleared +
        coefficients[4] * firstHeight +
        coefficients[5] * lastHeight +
        coefficients[6] * numBlockades;
    return fitness;
}
function setBestRotationAndCol() {
    var bestRot = 0, bestCol = 0, bestFitness = -1e10;
    for (var i = 0; i < pieces[curPiece.let].length; ++i) {
        for (var j = 0; j < boardValues[0].length - pieces[curPiece.let][i][0].length + 1; ++j) {
            var p1 = { row: 0, col: j, rot: i, let: curPiece.let };
            var b1 = [];
            for (var q = 0; q < boardValues.length; ++q)
                b1.push(boardValues[q].slice());
            if (!movePieceToBottom(b1, p1))
                continue;
            // console.log(i);
            var removed1 = removeLines(b1, p1, false);
            for (var a = 0; a < pieces[nextPiece].length; ++a) {
                for (var b = 0; b < boardValues[0].length - pieces[nextPiece][a][0].length + 1; ++b) {
                    var p2 = { row: 0, col: b, rot: a, let: nextPiece };
                    var b2 = [];
                    for (var q = 0; q < b1.length; ++q)
                        b2.push(b1[q].slice());
                    if (!movePieceToBottom(b2, p2))
                        continue;
                    var removed2 = removeLines(b2, p2, false);
                    var thisFitness = calculateFitness(b2, removed1 + removed2);
                    if (thisFitness > bestFitness) {
                        bestFitness = thisFitness;
                        bestRot = i;
                        bestCol = j;
                    }
                }
            }
        }
    }
    curPiece.rot = bestRot;
    curPiece.col = bestCol;
}
//
// MANIPULATE BOARD FUNCTIONS
//
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
function withinBounds(numberToCheck, maxRange) {
    return (numberToCheck >= 0 && numberToCheck < maxRange);
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
function removeLines(board, p, applyToRealBoard) {
    var pieceDropped = pieces[p.let][p.rot];
    var numLinesCleared = 0;
    for (var i = 0; i < pieceDropped.length; ++i) {
        var rowCompleted = true;
        for (var j = 0; j < board[0].length; ++j) {
            if (board[i + p.row][j] === emptyTile) {
                rowCompleted = false;
                break;
            }
        }
        if (!rowCompleted)
            continue;
        numLinesCleared += 1;
        board.splice(p.row + i, 1);
        var newRow = [];
        for (var k = 0; k < board[0].length; ++k) {
            newRow.push(emptyTile);
        }
        board.splice(0, 0, newRow);
    }
    if (applyToRealBoard) {
        drawUpdatedBoard(board);
        linesCleared += numLinesCleared;
        var linesRemovedP = document.getElementById("tetrisTextLinesCleared");
        if (linesRemovedP)
            linesRemovedP.innerHTML = "Lines: " + linesCleared;
    }
    return numLinesCleared;
}
function makeNextDefaultMove(board, p, applyToRealBoard) {
    if (piecePlaced) {
        if (!moveDown(board, p, applyToRealBoard)) {
            removeLines(board, p, applyToRealBoard);
            setCurVariables();
        }
    }
    else {
        if (moveDown(board, p, applyToRealBoard)) {
            piecePlaced = true;
        }
        else {
            console.log("Game Over!");
            return false;
        }
    }
    return true;
}
function drawLastPiece() {
    var textP = document.getElementById("tetrisTextNotification");
    if (textP)
        textP.innerHTML = "Game Over! <br>Press Space to restart";
    curPiece.row = 0;
    for (var i = 0; i < pieces[curPiece.let][curPiece.rot].length; ++i) {
        for (var j = 0; j < pieces[curPiece.let][curPiece.rot][i].length; ++j) {
            if (pieces[curPiece.let][curPiece.rot][i][j] !== emptyTile) {
                if (!withinBounds(curPiece.row + i, boardValues.length) ||
                    !withinBounds(curPiece.col + j, boardValues[0].length))
                    continue;
                boardValues[curPiece.row + i][curPiece.col + j] = pieces[curPiece.let][curPiece.rot][i][j];
            }
        }
    }
    drawUpdatedBoard(boardValues);
}
//
// MAIN AND ANIMATE FUNCTIONS
//
var animate, animationFrame;
function setAnimation() {
    animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (callback) { return window.setTimeout(callback, 1000 / 60); };
    animationFrame = 0;
}
function step() {
    if (animationFrame >= 60)
        animationFrame = 0;
    if (animationFrame === 0) {
        if (autopilot) {
            if (!moveBottom(boardValues, curPiece, true)) {
                gameOver = true;
                drawLastPiece();
                return;
            }
        }
        else {
            if (!makeNextDefaultMove(boardValues, curPiece, true)) {
                gameOver = true;
                drawLastPiece();
                return;
            }
        }
    }
    animationFrame += gameSpeed;
    animate(step);
}
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
