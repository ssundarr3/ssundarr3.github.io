// (function(){

// filepaths, class and id names
const picsPath: string = "assets/images/tetrispics/", emptyTile:string = "X", imageExtension:string = ".png", 
tetrisWrapDiv:string = "tetrisWrap", tetrisDiv:string = "tetris", tetrisTile:string = "tetrisTile", tetrisRow:string = "tetrisRow",
tetrisTextDiv:string = "tetrisText";

// game parameters
let gameSpeed: number, linesCleared: number, gameScore: number, gameOver: boolean;

// board parameters
let boardImg: HTMLImageElement[][], boardValues: string[][];
let numCols: number, numRows: number, tileSide: number;
let boardSet: boolean = false;

// ai parameters
let coefficients: number[], autopilot: boolean;

// piece parameters, piece class and related functions
let pieces: string[][][][], pieceStats: number[];
let nextPiece: number, piecePlaced: boolean;

let curPiece: Piece;
class Piece{
    let: number; // letter
    row: number;
    col: number;
    rot: number; // rotation
}

function newPiece(p:Piece): Piece{
    return {row:p.row, col:p.col, rot:p.rot, let:p.let};
}

function copyPiece(copyFrom:Piece, copyTo:Piece){
    copyTo.row = copyFrom.row;
    copyTo.col = copyFrom.col;
    copyTo.let = copyFrom.let;
    copyTo.rot = copyFrom.rot;
}

// 
// SET ONCE FUNCTIONS 
//

function log(){
    console.log("clicked!!");
}

function setButtonFunctions(): void{
    let rowColTileButton = document.getElementById("tetrisRowColTileForm");
    let tetrisAddNewPieceButton = document.getElementById("tetrisAddNewPieceButton");
    let tetrisGameSpeedButton = document.getElementById("tetrisGameSpeedButton");
    let autoPilotButton = document.getElementById("tetrisAutoPilot");
    let textNotification = document.getElementById("tetrisTextNotification");

    if(!rowColTileButton || !tetrisAddNewPieceButton || !tetrisGameSpeedButton || !autoPilotButton || !textNotification) return;

    let textNotifyP: HTMLElement = textNotification;

    rowColTileButton.onclick = function(){
        let rowEle = <HTMLInputElement>document.getElementById("tetrisRowInput");
        let colEle = <HTMLInputElement>document.getElementById("tetrisColInput");
        let tileEle = <HTMLInputElement>document.getElementById("tetrisTileInput");
        if(!rowEle || !colEle || !tileEle) return;
        let r: number = +rowEle.value, c: number = +colEle.value, t: number = +tileEle.value;

        if(r < 8 || r > 60 || c < 8 || c > 60 || t < 10){
            textNotifyP.innerHTML = "#Rows: [8, 60], #Cols: [8, 60], tileSide: [10, inf)";
        }
        else{
            setGameboard(r, c, t);
        }
    };
    tetrisAddNewPieceButton.onclick = function(){
        let tetrisAddNewPieceText = <HTMLInputElement>document.getElementById("tetrisAddNewPiece");
        if(tetrisAddNewPieceText){
            let str: string = tetrisAddNewPieceText.value;
            str = str.replace(/(\r\n|\n|\r)/gm,"");
            let partsOfStr: string[] = str.split(',');
            let sizeOfFirstRow = partsOfStr[0].length;
            let newPieceStr: string[][] = [];
            for(let i: number = 0; i<partsOfStr.length; ++i){
                newPieceStr.push([]);
                for(let j:number = 0; j<partsOfStr[i].length; ++j){
                    newPieceStr[i].push(partsOfStr[i][j]);
                    if(partsOfStr[i][j] !== "A" && partsOfStr[i][j] !== "X" && partsOfStr[i][j] !== "I" &&
                    partsOfStr[i][j] !== "O" && partsOfStr[i][j] !== "T" && partsOfStr[i][j] !== "J" && partsOfStr[i][j] !== "L"
                    && partsOfStr[i][j] !== "Z" && partsOfStr[i][j] !== "S" || sizeOfFirstRow !== partsOfStr[i].length){
                        textNotifyP.innerHTML = "You can only have A, I, O, T, J, L, Z, S or X in your new piece, and all rows must contain the same number of tiles!";
                        return;
                    }
                }
            }


            pieces.push([newPieceStr]);

            let statsDisplayDiv:HTMLElement|null = document.getElementById(tetrisTextDiv);

            if(statsDisplayDiv){
                let pieceAndNumDiv = document.createElement("div");
                pieceAndNumDiv.className = "tetrisPieceAndNumber";
                let pieceDiv = document.createElement("div");
                pieceDiv.className = "tetrisPiece";
                for(let a:number = 0; a<pieces[pieces.length -1][0].length; ++a){
                    let rowDiv = document.createElement("div");
                    rowDiv.className = "tetrisRow";
                    for(let b:number = 0; b<pieces[pieces.length -1][0][0].length; ++b){
                        let tileSidePx: string = tileSide + "px";
                        let img: HTMLImageElement = document.createElement('img');
                        if(pieces[pieces.length -1][0][a][b] === "X"){
                            img.style.opacity = "0"; //For real browsers;
                            img.style.filter = "alpha(opacity=50)"; //For IE;
                        }
                        img.src = picsPath + pieces[pieces.length -1][0][a][b] + imageExtension;
                        img.style.height = tileSidePx;  // "100%";
                        img.style.width = tileSidePx; // "100%";
                        rowDiv.appendChild(img);
                    }
                    pieceDiv.appendChild(rowDiv);
                }
                pieceAndNumDiv.appendChild(pieceDiv);
                let numberDiv = document.createElement("div");
                numberDiv.className = "tetrisNumber";
                numberDiv.id = "tetris" + (pieces.length -1) + "number";
                numberDiv.innerHTML = "0";

                pieceAndNumDiv.appendChild(numberDiv);

                statsDisplayDiv.appendChild(pieceAndNumDiv);
            }
            setRotatedPiece(pieces.length -1);
            pieceStats.push(0);
        }
    };
    tetrisGameSpeedButton.onclick = function(){
        let inputEle = <HTMLInputElement>document.getElementById("tetrisGameSpeed");
        if(inputEle){
            let gs: number = +inputEle.value; // + to cast to number
            if(gs < 1 || gs > 60){
                textNotifyP.innerHTML = "Game Speed: [1, 60]";
            }
            else{
                setGamespeed(gs);
            }
        }
    };
    
    autoPilotButton.onclick = function (){
        setAutopilot();
    };
    
}

function setCoefficients(): void{
    coefficients = [];
    coefficients.push(-0.192716);
    coefficients.push(-1);
    coefficients.push(0.00742194);
    coefficients.push(0.292781);
    coefficients.push(0.182602);
    coefficients.push(0.175692);
    coefficients.push(-0.0439177);
}

function setOriginalPieces(): void{
    pieces = [];

    pieces.push([
        [
            ["O","O"],
            ["O","O"]
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
            ["X","J"],
            ["X","J"],
            ["J","J"]
        ]
    ]);

    pieces.push([
        [
            ["L","X"],
            ["L","X"],
            ["L","L"]
        ]
    ]);

    pieces.push([
        [
            ["X","T","X"],
            ["T","T","T"]
        ]
    ]);

    pieces.push([
        [
            ["X","S","S"],
            ["S","S","X"]
        ]
    ]);

    pieces.push([
        [
            ["Z","Z","X"],
            ["X","Z","Z"]
        ]
    ]);

    let statsDisplayDiv:HTMLElement|null = document.getElementById(tetrisTextDiv);

    pieceStats = [];
    for(let i:number = 0; i<pieces.length; ++i){
        if(statsDisplayDiv){
            let pieceAndNumDiv = document.createElement("div");
            pieceAndNumDiv.className = "tetrisPieceAndNumber";
            let pieceDiv = document.createElement("div");
            pieceDiv.className = "tetrisPiece";
            for(let a:number = 0; a<pieces[i][0].length; ++a){
                let rowDiv = document.createElement("div");
                rowDiv.className = "tetrisRow";
                for(let b:number = 0; b<pieces[i][0][0].length; ++b){
                    let tileSidePx: string = tileSide + "px";
                    let img: HTMLImageElement = document.createElement('img');
                    if(pieces[i][0][a][b] === "X"){
                        img.style.opacity = "0"; //For real browsers;
                        img.style.filter = "alpha(opacity=50)"; //For IE;
                    }
                    img.src = picsPath + pieces[i][0][a][b] + imageExtension;
                    img.style.height = tileSidePx;  // "100%";
                    img.style.width = tileSidePx; // "100%";
                    rowDiv.appendChild(img);
                }
                pieceDiv.appendChild(rowDiv);
            }
            pieceAndNumDiv.appendChild(pieceDiv);
            let numberDiv = document.createElement("div");
            numberDiv.className = "tetrisNumber";
            numberDiv.id = "tetris" + i + "number";
            numberDiv.innerHTML = "0";

            pieceAndNumDiv.appendChild(numberDiv);

            statsDisplayDiv.appendChild(pieceAndNumDiv);
        }
        setRotatedPiece(i);
        pieceStats.push(0);
    }

}

function setKeyPressListeners(): void{
    let tetrisWrapDivElement: HTMLElement | null = document.getElementById(tetrisWrapDiv);
    if(!tetrisWrapDivElement) return;

    tetrisWrapDivElement.addEventListener("keydown", function(event) {
        let value: number = Number(event.keyCode);



        if(value === 37 || value === 38 || value === 39 || value === 40 || value === 32)
            event.preventDefault();
        else return;
        
        if(gameOver){
            setGameboard(numRows, numCols, tileSide);
            animate(step);
            return;
        }

        if(autopilot){
            setAutopilot();
            gameSpeed = 1;
        }

        // left, right, up, down, space
        if(value === 37) moveLeft(boardValues, curPiece, true); 
        else if(value === 39) moveRight(boardValues, curPiece, true);
        else if(value === 38) moveClockwise(boardValues, curPiece, true);
        else if(value === 40 && makeNextDefaultMove(boardValues, curPiece, true)){}
        else if(value === 32){
            if(!moveBottom(boardValues, curPiece, true)){
                gameOver = true;
                drawLastPiece();
            }
        }
    });
}

// 
// SET MANY TIMES FUNCTIONS
//

function setCurVariables(): void{
    curPiece.row = -1;
    curPiece.col = numCols/2 -1;
    curPiece.rot = 0;
    curPiece.let = nextPiece;
    pieceStats[curPiece.let] += 1;
    let numberDiv = document.getElementById("tetris" + curPiece.let + "number");
    if(numberDiv) numberDiv.innerHTML = pieceStats[curPiece.let] + "";
    nextPiece = randomPiece();
    piecePlaced = false;

    if(autopilot) setBestRotationAndCol();
}

let bagOfPieces: number[] = [];
function randomPiece(): number{
    if(bagOfPieces.length <= 1){
        const numberOfEachPiece = 5;
        for(let i: number = 0; i<pieces.length; ++i){
            for(let j:number = 0; j<numberOfEachPiece; ++j){
                bagOfPieces.push(i);
            }
        }

        // shuffle array
        for(let k:number = 0; k<bagOfPieces.length; ++k){
            let min = k, max = bagOfPieces.length-1;
            let swapIndex: number = Math.floor(Math.random() * (max - min + 1)) + min;
            let tmp:number = bagOfPieces[swapIndex];
            bagOfPieces[swapIndex] = bagOfPieces[k];
            bagOfPieces[k] = tmp;
        }
    }

    let x: number | undefined = bagOfPieces.pop();
    return x ? x : 0;
}

// 
// SET FROM USER FUNCTIONS
//

function setRowColTile(): void{

}

function setAutopilot(): void{
    let buttonEle = <HTMLButtonElement>(document.getElementById("tetrisAutoPilot"));
    if(buttonEle.name === "On"){
        buttonEle.name = "Off";
        autopilot = false;
        buttonEle.innerHTML = "Turn Autopilot On";
    }
    else{
        buttonEle.name = "On";
        autopilot = true;
        buttonEle.innerHTML = "Turn Autopilot Off";        
    }
}

function setGamespeed(gs:number = 2): void{
    
    gameSpeed = gs;
}

function setNewPiece(): void{
    // set new piece if it's okay
    // should not already be present
    // should be at most 5x5
    // remove extra rows of zeroes
    // all rows should have same number of items
    // etc etc.
    //set PieceId

    // pieceStats.push(0);
}

function setBoardAndBoardImg(gameDiv: HTMLElement): void{
    let tileSidePx: string = tileSide + "px";
    for(let i:number = 0; i<numRows; ++i){
        boardImg.push([]);
        boardValues.push([]);
        let div: HTMLElement = document.createElement("div");
        div.className = tetrisRow;
        div.style.height = tileSidePx;
        gameDiv.appendChild(div);
        for(let j:number = 0; j<numCols; ++j){

            let img: HTMLImageElement = document.createElement('img');
            img.src = picsPath + emptyTile + imageExtension;
            img.style.height = tileSidePx;  // "100%";
            img.style.width = tileSidePx; // "100%";
            // img.style.objectFit = "contain";

            // tile.appendChild(img);
            boardImg[i].push(img);
            div.appendChild(img);
            boardValues[i].push(emptyTile);
        }
    }
}

function setGameboard(r: number = 12, c: number = 8, t: number = 23): void{
    let textP: HTMLElement | null = document.getElementById("tetrisTextNotification");
    if(textP) textP.innerHTML = "";

    let linesRemovedP = document.getElementById("tetrisTextLinesCleared")
    if(linesRemovedP) linesRemovedP.innerHTML = "Lines: " + "0";

    numCols = c;
    numRows = r;
    tileSide = t;

    linesCleared = 0;
    gameOver = false;
    curPiece = {row: -1, col: numCols/2 -1, rot: 0, let: 0};
    nextPiece = randomPiece();

    pieceStats = [];
    if(pieces) for(let i:number = 0; i<pieces.length; ++i){
        pieceStats.push(0);
        let numberDiv = document.getElementById("tetris" + i + "number");
        if(numberDiv) numberDiv.innerHTML = "0";
    }
    boardImg = [];
    boardValues = [];
    // setting boardImg and boardValues

    let gameDiv: HTMLElement | null = document.getElementById(tetrisDiv),  gameDivWrapper: HTMLElement | null = document.getElementById(tetrisWrapDiv);
    if(!gameDiv || !gameDivWrapper) return;

    // remvoe old tiles.
    while(gameDiv.lastChild) gameDiv.removeChild(gameDiv.lastChild);
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

function checkTwoPieceSame(pieceOne: string[][], pieceTwo: string[][]): boolean{
    if(pieceOne.length === 0 || pieceTwo.length === 0 || pieceOne.length !== pieceTwo.length || 
        pieceOne[0].length === 0 || pieceTwo[0].length === 0 || pieceOne[0].length !== pieceTwo[0].length){
        return false;
    }

    for(let i:number = 0; i<pieceOne.length; ++i){
        for(let j:number = 0; j<pieceOne[i].length; ++j){
            if(pieceOne[i][j] !== pieceTwo[i][j]) return false;
        }
    }

    return true;
}

function setRotatedPiece(whichPiece: number): void{
    let pieceToRotate: string[][] = pieces[whichPiece][0], rotatedPiece: string[][]= [];
    while(1){
        for(let j:number = 0; j<pieceToRotate[0].length; ++j){
            rotatedPiece.push([]);
            for(let i:number = pieceToRotate.length-1; i>=0; --i){
                rotatedPiece[j].push(pieceToRotate[i][j]);
            }
        }
        if(checkTwoPieceSame(rotatedPiece, pieces[whichPiece][0])) break;
        pieces[whichPiece].push(rotatedPiece);
        pieceToRotate = rotatedPiece;
        rotatedPiece = [];
    }
}

function movePieceFromTo(board: string[][], pieceFrom: Piece, pieceTo: Piece, applyToRealBoard: boolean): boolean{
    // erase old piece if it exists
    // let x:Piece = {row:fromRow, col:fromCol, let:curPiece.let, rot:curPiece.rot};
    erasePiece(board, pieceFrom, applyToRealBoard); // changed!!!!
    if(placePiece(board, pieceTo, applyToRealBoard)){
        return true;
    }
    else{
        placePiece(board, pieceFrom, applyToRealBoard);
        return false;
    }
}

function moveRight(board: string[][], p:Piece, applyToRealBoard: boolean): boolean{
    let newP: Piece = newPiece(p);
    newP.col += 1;
    if(movePieceFromTo(board, p, newP, applyToRealBoard)){
        copyPiece(newP, p);
        return true;
    }
    else return false;
}

function moveLeft(board: string[][], p:Piece, applyToRealBoard: boolean): boolean{
    let newP: Piece = newPiece(p);
    newP.col += -1;
    if(movePieceFromTo(board, p, newP, applyToRealBoard)){
        copyPiece(newP, p);
        return true;
    }
    else return false;
}

function moveDown(board: string[][], p:Piece, applyToRealBoard: boolean): boolean{
    let newP: Piece = newPiece(p);
    newP.row += 1;
    if(movePieceFromTo(board, p, newP, applyToRealBoard)){
        copyPiece(newP, p);
        return true;
    }
    else return false;
}

function moveClockwise(board: string[][], p:Piece, applyToRealBoard: boolean): boolean{
    let newP: Piece = newPiece(p);
    newP.rot += 1; 
    newP.rot %= pieces[newP.let].length;
    if(movePieceFromTo(board, p, newP, applyToRealBoard)){
        copyPiece(newP, p);
        return true;
    }
    else return false;
}

function moveBottom(board: string[][], p:Piece, applyToRealBoard: boolean): boolean{
    if(gameOver) return false;
    while(moveDown(board, p, applyToRealBoard)){}

    removeLines(board, p, applyToRealBoard);

    setCurVariables();

    if(!makeNextDefaultMove(board, p, true)){
        return false;
    }

    animationFrame = 1;
    return true;
}

//
// AI FUNCTIONS
//

function movePieceToBottom(board: string[][], p: Piece): boolean{
    if(!placePiece(board, p, false)) return false;

    let toPiece:Piece = newPiece(p);
    toPiece.row += 1;
    while(movePieceFromTo(board, p, toPiece, false)){
        p.row += 1;
        toPiece.row += 1;
    }

    return true;
}

function calculateFitness(board: string[][], numCleared: number): number{
    var totalHeight = 0,
        maxHeight = 0,
        numHoles = 0,
        numBlockades = 0,
        heightDifferences = 0,
        firstHeight = 0,
        lastHeight = 0;
    // Calculate: firstHeight & lastHeight:
    for (let i:number = 0; i < board.length; i++) {
        if (board[i][0] !== emptyTile) {
            firstHeight = board.length - i;
            break;
        }
    }
    for (let i:number = 0; i < board.length; i++) {
        if (board[i][board[0].length - 1] !== emptyTile) {
            lastHeight = board.length - i;
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
        for (var j:number = 0; j < board.length; j++) {
            if (board[j][i] !== emptyTile) startCountingHeight = true;
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
        if (currHeight > maxHeight) maxHeight = currHeight;
        // Data: Count difference in adjacent column heights.
        if (i != 0) heightDifferences += Math.abs(currHeight - prevHeight);
        // Data: Count total height.
        totalHeight += currHeight;
        // Data: Count blockades:
        if (lastHole != -1) {
            numBlockades += currHeight - (board.length - lastHole);
        }
        heights.push(currHeight);
    }

    var fitness =   coefficients[0] * heightDifferences +
                    coefficients[1] * numHoles +
                    coefficients[2] * (board.length - maxHeight) +
                    coefficients[3] * numCleared +
                    coefficients[4] * firstHeight +
                    coefficients[5] * lastHeight +
                    coefficients[6] * numBlockades;
    return fitness;
}

function setBestRotationAndCol(): void{
    let bestRot: number = 0, bestCol = 0, bestFitness = -1e10;
    
    for(let i:number = 0; i<pieces[curPiece.let].length; ++i){ // for each rotation of currentPiece
        for(let j:number = 0; j<boardValues[0].length - pieces[curPiece.let][i][0].length + 1; ++j){ // for each col of current Rotation
            let p1: Piece = {row: 0, col: j, rot: i, let: curPiece.let};
            
            let b1: string[][] = [];
            for(let q:number = 0; q<boardValues.length; ++q) b1.push(boardValues[q].slice());

            if(!movePieceToBottom(b1, p1)) continue;

            let removed1: number = removeLines(b1, p1, false);

            for(let a:number = 0; a<pieces[nextPiece].length; ++a){
                for(let b:number = 0; b<boardValues[0].length - pieces[nextPiece][a][0].length + 1; ++b){
                    let p2: Piece = {row: 0, col: b, rot: a, let: nextPiece};

                    let b2: string[][] = [];
                    for(let q:number = 0; q<b1.length; ++q) b2.push(b1[q].slice());

                    if(!movePieceToBottom(b2, p2)) continue;

                    let removed2: number = removeLines(b2, p2, false);

                    let thisFitness: number = calculateFitness(b2, removed1+removed2);

                    if(thisFitness > bestFitness){
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

function placePiece(board: string[][], pieceDrop: Piece, applyToRealBoard: boolean): boolean{
    let pieceToDrop: string[][] = pieces[pieceDrop.let][pieceDrop.rot];
    
    if(!withinBounds(pieceDrop.row, board.length - pieceToDrop.length+1) ||
    !withinBounds(pieceDrop.col, board[0].length - pieceToDrop[0].length+1)) return false;
    
    for(let i=0; i<pieceToDrop.length; ++i){
        for(let j=0; j<pieceToDrop[i].length; ++j){
            if(pieceToDrop[i][j] !== emptyTile && board[pieceDrop.row + i][pieceDrop.col + j] !== emptyTile) return false;
        }
    }

    for(let i=0; i<pieceToDrop.length; ++i){
        for(let j=0; j<pieceToDrop[i].length; ++j){
            if(pieceToDrop[i][j] !== emptyTile){
                board[pieceDrop.row + i][pieceDrop.col + j] = pieceToDrop[i][j];
                if(applyToRealBoard) boardImg[pieceDrop.row + i][pieceDrop.col + j].src = picsPath + pieceToDrop[i][j] + imageExtension;
            }
        }
    }

    return true;
}

function erasePiece(board: string[][], pieceErase: Piece, applyToRealBoard: boolean): void{
    let pieceToErase: string[][] = pieces[pieceErase.let][pieceErase.rot];
    
    if(!withinBounds(pieceErase.row, board.length - pieceToErase.length+1) || 
        !withinBounds(pieceErase.col, board[0].length - pieceToErase[0].length+1)) return;
    
    for(let i=0; i<pieceToErase.length; ++i){
        for(let j=0; j<pieceToErase[i].length; ++j){
            if(pieceToErase[i][j] !== emptyTile){
                board[pieceErase.row + i][pieceErase.col + j] = emptyTile;
                if(applyToRealBoard) boardImg[pieceErase.row + i][pieceErase.col + j].src = picsPath + emptyTile + imageExtension;
            }
        }
    }
}

function withinBounds(numberToCheck: number, maxRange: number): boolean{
    return (numberToCheck >=0 && numberToCheck < maxRange); 
}

function drawUpdatedBoard(board: string[][]): void{
    for(let i: number = 0; i<board.length; ++i){
        for(let j: number = 0; j<board[i].length; ++j){
            if(boardImg[i][j].src.charAt(boardImg[i][j].src.length-5) !== board[i][j]){
                boardImg[i][j].src = picsPath + board[i][j] + imageExtension;
            }
        }
    }
}

function removeLines(board: string[][], p:Piece, applyToRealBoard: boolean): number{
    let pieceDropped: string[][] = pieces[p.let][p.rot];
    let numLinesCleared: number = 0;

    for(let i:number = 0; i<pieceDropped.length; ++i){
        let rowCompleted = true;
        for(let j:number = 0; j<board[0].length; ++j){
            if(board[i+p.row][j] === emptyTile){
                rowCompleted = false;
                break;
            }
        }
        if(!rowCompleted) continue;

        numLinesCleared += 1;
        board.splice(p.row+i, 1);

        let newRow: string[] = [];
        for(let k:number = 0; k<board[0].length; ++k){
            newRow.push(emptyTile);
        }

        board.splice(0, 0, newRow);
    }

    if(applyToRealBoard){
        drawUpdatedBoard(board);
        linesCleared += numLinesCleared;
        let linesRemovedP = document.getElementById("tetrisTextLinesCleared")
        if(linesRemovedP) linesRemovedP.innerHTML = "Lines: " + linesCleared;
    }


    return numLinesCleared;
}

function makeNextDefaultMove(board: string[][], p:Piece, applyToRealBoard:boolean): boolean{
    if(piecePlaced){
        if(!moveDown(board, p, applyToRealBoard)){
            removeLines(board, p, applyToRealBoard);
            setCurVariables();
        }
    }
    else{
        if(moveDown(board, p, applyToRealBoard)){
            piecePlaced = true;
        }
        else{
            return false;
        }
    }
    return true;
}

function drawLastPiece(): void{

    curPiece.row = 0;
    let pieceThatCouldnt:string = "X";
    for(let i=0; i<pieces[curPiece.let][curPiece.rot].length; ++i){
        for(let j=0; j<pieces[curPiece.let][curPiece.rot][i].length; ++j){
            if(pieces[curPiece.let][curPiece.rot][i][j] !== emptyTile){
                if(!withinBounds(curPiece.row + i, boardValues.length) || 
                ! withinBounds(curPiece.col + j, boardValues[0].length)) continue;
                pieceThatCouldnt = pieces[curPiece.let][curPiece.rot][i][j];
                boardValues[curPiece.row + i][curPiece.col + j] = pieces[curPiece.let][curPiece.rot][i][j];
            }
        }
    }

    let textP: HTMLElement | null = document.getElementById("tetrisTextNotification");
    if(textP) textP.innerHTML = "Block " + pieceThatCouldnt + " couldn't be placed<br>Game Over!<br>Press Space to restart"; 


    drawUpdatedBoard(boardValues);
}

//
// MAIN AND ANIMATE FUNCTIONS
//
let animate: (callback: FrameRequestCallback) => number, animationFrame: number;

function setAnimation(): void{
    animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(callback) { return window.setTimeout(callback, 1000/60); };
    animationFrame = 0;
}

function step(): void{
    if(gameOver) return;
    if(animationFrame >= 60) animationFrame = 0;

    if(animationFrame === 0){
        if(autopilot){
            if(!moveBottom(boardValues, curPiece, true)){
                gameOver = true;
                drawLastPiece();
                return;
            }
        }
        else{
            if(!makeNextDefaultMove(boardValues, curPiece, true)){
                gameOver = true
                drawLastPiece();
                return;
            }
        }
    }

    animationFrame += gameSpeed;
    animate(step);
}


function main(): void{
    // Not dependent on anything
    setButtonFunctions();
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



