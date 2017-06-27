(function(){

// Variables only used in this file
const picsPath: string = "../pics/tetrispics/";
const xImg:string = "X";
let gameDiv: HTMLElement, gameDivWrapper: HTMLElement;
let playAreaHeight: number, playAreaWidth: number;
let tileSide: number;
let boardImg: HTMLImageElement[][];

// Variables used in both files
let boardValues: string[][];
let numCols: number, numRows: number;
let gameSpeed: number;
let pieces: string[][][][], pieceId: { [key: string]: number };
let gameScore: number, pieceStats: number[];

// Variables used only in this file
let coefficients: number[];
let dropPieceSlowly: boolean;

let animate: (callback: FrameRequestCallback) => number;



// add piece: setNewPiece
// change row, col, tileside: resetBoard()
// gamespeed: setGamespeed()
// 

function setGameDivs(): boolean{
    let game: HTMLElement | null = document.getElementById("tetris"),  gameWrapper: HTMLElement | null = document.getElementById("tetrisWrap");
    if(!game || !gameWrapper) return false;
    gameDiv = game;
    gameDivWrapper = gameWrapper;
    return true;
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

function setOriginalPieces(): void{
    pieces = [];
    pieceId = {};
    pieceId["O"] = 0;
    pieceId["I"] = 1;
    pieceId["J"] = 2;
    pieceId["L"] = 3;
    pieceId["T"] = 4;
    pieceId["S"] = 5;
    pieceId["Z"] = 6;

    for(let i:number = 0; i<Object.keys(pieceId).length; ++i){
        pieces.push([]);
        pieceStats.push(0);
    }

    pieces[pieceId["O"]] = [
        [
            ["O","O"],
            ["O","O"]
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
            ["X","J"],
            ["X","J"],
            ["J","J"]
        ]
    ]

    pieces[pieceId["L"]] = [
        [
            ["L","X"],
            ["L","X"],
            ["L","L"]
        ]
    ];

    pieces[pieceId["T"]] = [
        [
            ["X","T","X"],
            ["T","T","T"]
        ]
    ];

    pieces[pieceId["S"]] = [
        [
            ["X","S","S"],
            ["S","S","X"]
        ]
    ];

    pieces[pieceId["Z"]] = [
        [
            ["Z","Z","X"],
            ["X","Z","Z"]
        ]
    ];

    for(let i:number = 0; i<Object.keys(pieceId).length; ++i) setRotatedPiece(i);
}

function setGamespeed(): void{
    // get gamespeed from form
    gameSpeed = 10;
}

function setRowColTile(): void{
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

function removeChildren(node: HTMLElement): void {
    while(node.lastChild) node.removeChild(node.lastChild);
}

function resetBoard(): boolean{
    if(!setGameDivs()) return false;
    setRowColTile();
    setGamespeed();
    removeChildren(gameDiv);
    drawInitialBoard();
    return true;
}

function initializeBoard(): boolean{
    if(!resetBoard()) return false;
    setOriginalPieces();
    return true;
}

function drawInitialBoard(): void{
    let tileSidePx: string = tileSide + "px";
    for(let i:number = 0; i<numRows; ++i){
        boardImg.push([]);
        boardValues.push([]);
        let div: HTMLElement = document.createElement("div");
        div.className = "tetrisRow";
        div.style.height = tileSidePx;
        gameDiv.appendChild(div);
        for(let j:number = 0; j<numCols; ++j){
            let tile: HTMLElement = document.createElement('div');
            tile.className = "tetrisTile";
            tile.style.width = tileSidePx;
            tile.style.height = tileSidePx;
            tile.id = i + " " + j;
            
            let img: HTMLImageElement = document.createElement('img');
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

function drawUpdatedBoard(): void{
    for(let i: number = 0; i<numRows; ++i){
        for(let j: number = 0; j<numCols; ++j){
            if(boardImg[i][j].src.charAt(boardImg[i][j].src.length-5) !== boardValues[i][j]){
                boardImg[i][j].src = picsPath + boardValues[i][j] + ".png";
            }
        }
    }
}

function setCoefficients(): void{
    coefficients.push(-0.192716);
    coefficients.push(-1);
    coefficients.push(0.00742194);
    coefficients.push(0.292781);
    coefficients.push(0.182602);
    coefficients.push(0.175692);
    coefficients.push(-0.0439177);
}

function placePiece(board: string[][], pieceToDrop: string[][], rowToPlace: number, colToPlace: number): boolean{
    if(rowToPlace > board.length - pieceToDrop.length || rowToPlace < 0) return false;

    for(let i=0; i<pieceToDrop.length; ++i){
        for(let j=0; j<pieceToDrop[i].length; ++j){
            if(pieceToDrop[i][j] !== "X" && board[rowToPlace + i][colToPlace + j] !== "X") return false;
        }
    }

    for(let i=0; i<pieceToDrop.length; ++i){
        for(let j=0; j<pieceToDrop[i].length; ++j){
            if(pieceToDrop[i][j] !== "X"){
                board[rowToPlace + i][colToPlace + j] = pieceToDrop[i][j];
                if(dropPieceSlowly){ 
                    // boardImg[rowToPlace + i][colToPlace + j].src = 
                }
            }
        }
    }

    return true;
}

function erasePiece(board: string[][], pieceToDrop: string[][], rowToPlace: number, colToPlace: number): void{
    for(let i=0; i<pieceToDrop.length; ++i){
        for(let j=0; j<pieceToDrop[i].length; ++j){
            if(pieceToDrop[i][j] !== "X") board[rowToPlace + i][colToPlace + j] = "X";
            if(dropPieceSlowly){
                // some thing
            }
        }
    }
}

function dropPiece(board: string[][], pieceToDrop: string[][], colToDrop: number): boolean{
    if(colToDrop < 0 || colToDrop >= board.length) return false;
    
    let i:number = 0;    

    while(placePiece(board, pieceToDrop, i, colToDrop)){
        erasePiece(board, pieceToDrop, i, colToDrop);
        i += 1;
    }
    
    if(i == 0) return false;

    placePiece(board, pieceToDrop, i-1, colToDrop);

    return true;
}

// function canDropPiece(board: string[][], )

function main(): void{
    if(!initializeBoard()) return;
    dropPieceSlowly = true;
    dropPiece(boardValues, pieces[3][2], 3);
    dropPiece(boardValues, pieces[0][0], 0);
    dropPiece(boardValues, pieces[5][0], 1);
    drawUpdatedBoard();

    dropPiece(boardValues, pieces[6][1], 0);

    animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function(callback) { window.setTimeout(callback, 1000/60) };
}


main();


}());