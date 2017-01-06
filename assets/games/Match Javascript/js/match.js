// use classnames to redraw.. 
// cause
// http://stackoverflow.com/questions/1716266/javascript-document-getelementbyid-slow-performance/1716873#1716873
// window.requestAnimationFrame



// Board parameters
var ROWS = 8;
var COLS = 8;
var height = 450;
var width = 450;
var backColor = '#935347';
var foreColor = "#C7AD88";
var gap = 10;

// Game parameters
var board = [];
// Number of different tiles
var diffTiles = 5;
var prev = [];
var images = [];
var won = new Number();

function main(){
	div = document.getElementById("tilesWrap");
	div.style.width = width + "px";
	div.style.height = height + "px";
	// load Images
	loadImages();
	
	createBoard();
	// Upper level canvases
	createOptions();
	
}

function createOptions(){
	var doc = document.createDocumentFragment();

	ROWS = 4; COLS = 1;
	// ▼  ▲
	var options = ["Easy", "Medium", "Hard", "Custom"];
	var tileWidth = (width - gap*(COLS+1))/COLS;
	var tileHeight = (height - gap*(ROWS+1))/ROWS;
	var widthDiff = tileWidth - Math.floor(tileWidth);
	var heightDiff = tileHeight - Math.floor(tileHeight);
	tileWidth = Math.floor(tileWidth);
	tileHeight = Math.floor(tileHeight);
	for(var i=1; i<=ROWS; i++){
		for(var j=1; j<=COLS; j++){
		var tempCanvas = document.createElement("canvas");
		tempCanvas.id = i + " " + j;
		tempCanvas.onclick = function(){openOptions(this);};
		tempCanvas.width = tileWidth;
		tempCanvas.height = tileHeight;

		tempCanvas.addEventListener("mouseover", function () {
			onHover(this, "#000000");
    	});
    	tempCanvas.addEventListener("mouseout", function () {
			onHover(this, foreColor);
    	});

		tempCanvas.style.float = "left";
		tempCanvas.style.position = "relative";
		tempCanvas.style.zIndex = 1;

		// tempCanvas.style.paddingLeft = gap + widthDiff;
		// tempCanvas.style.paddingTop = gap + heightDiff;
		if(gap == 0){
			if(i==1 && j == 1){
				tempCanvas.style.marginTop = heightDiff*(ROWS+1)/2;
				tempCanvas.style.marginLeft = widthDiff*(COLS+1)/2;
			}
			else if(i ==1){
				tempCanvas.style.marginTop = heightDiff*(ROWS+1)/2;
			}
			else if(j == 1){
				tempCanvas.style.marginLeft = widthDiff*(COLS+1)/2;
			}	  			
  		}
  		else{
  			tempCanvas.style.marginLeft = gap + widthDiff;
			tempCanvas.style.marginTop = gap + heightDiff; 
  		}



		tempCanvas.style.right = 0;
		tempCanvas.style.bottom = 0;


		// Context
		var tempCtx = tempCanvas.getContext("2d");
        tempCtx.textAlign = "center";
		tempCtx.textBaseline = "middle";
		tempCtx.fillStyle = foreColor;
		tempCtx.font = "bold " + (0.66*(tileWidth < tileHeight ? tileWidth : tileHeight) ) + "px Arial";
		tempCtx.open = true;
		tempCtx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
		tempCtx.fillStyle = "#000000";
		tempCtx.fillText(options[i-1], tileWidth/2, tileHeight/2);
		tempCtx.fillStyle = foreColor;

		// Append using fragments... cause faster?
		doc.appendChild(tempCanvas);
		}		
	}
	document.getElementById("tilesWrap").appendChild(doc);	
}

// assume gap is the same...
// takes in number of rows... 
// colPerRow is an array, gives number of columns per row
// rowHeights is an array which gives
// function generalTiles(nRows, colPerRow, rowHeights, ){

// }

function styleAll(canvas){
	canvas.style.left = 0;
	canvas.style.top = 0;
	canvas.style.margin = "auto";	
	canvas.style.display = "block";
	canvas.style.bottom = 0;
	canvas.style.right = 0;
}

// function onOut(canvas){
// 	var ctx = canvas.getContext("2d");
// 	ctx.fillStyle = foreColor;
// 	ctx.rect(0,0,)
// }


function onHover(canvas, color){
	// if(pic == "True"){
	// 	console.log("hello");
	// }
	var ctx = canvas.getContext("2d");
	ctx.strokeStyle = color;
	ctx.lineWidth = 10;
	ctx.rect(0,0,canvas.width,canvas.height);
	ctx.stroke();
}

function updateVal(r, c, Val){
	canvas = document.getElementById(r + " " + c);
	context = canvas.getContext("2d");
	context.fillRect(0,0,canvas.width, canvas.height);
	context.fillStyle = "#000000";
	context.fillText(Val,  canvas.width/2,canvas.height/2);// canvas.height/2);
	context.fillStyle = foreColor;
}

var rowVal = 6, colVal = 6, diffTilesVal = 6;

function addOne(r, c){
	if(r == 4){
		if(c == 1){
			// returning if invalid settings... the last three aren't required, but anyways...
			if((rowVal % 2 != 0 && colVal%2 != 0) || (diffTilesVal > (rowVal*colVal)/2) || diffTilesVal > 19 || rowVal <= 0 || colVal <= 0 || diffTilesVal <= 0){
				var p = document.getElementById("text")
				console.log(p);
				p.innerHTML = "INVALID";
				setTimeout(function(){
					p.innerHTML = "";
		    	}, 500);
				return;
			}
			deleteCanvas();
			ROWS = rowVal;
			COLS = colVal;
			diffTiles = diffTilesVal;
			populateBoard();
			createTiles();
		}
		if(c == 2){
			deleteCanvas();
			createOptions();
		}
	}
	if(c != 2 && c != 4){
		return;
	}
	var val = (c == 2 ? 1 : -1);
	if(r==1){
		rowVal += val;
		updateVal(r,3, rowVal);
	}
	else if(r==2){
		colVal += val;
		updateVal(r,3, colVal);
	}
	else if(r==3){
		diffTilesVal += val;
		updateVal(r,3, diffTilesVal);
	}
	else
		return;
}

function customOption(canvas){
	var choices = canvas.id.split(" ");
	for(var i=choices.length-1; i>=0; i--) { choices[i] = +choices[i]; }
	addOne(choices[0], choices[1]);


	// deleteCanvas();
}

function openOptions(opCanvas){
	var choice = opCanvas.id.split(" ")[0];
	choice = +choice;
	deleteCanvas();
	if(choice == "1"){
		ROWS = 4; COLS = 4; diffTiles = 4;
	}
	else if(choice == "2"){
		ROWS = 6;
		COLS = 6;
		diffTiles = 10;
	}
	else if(choice == "3"){
		ROWS = 8;
		COLS = 8;
		diffTiles = 19;
	}
	else if(choice == "4"){
		var doc = document.createDocumentFragment();

		// get vals from user 
		// one of ROWS and COLS must be even...
		// diffTiles < ROWS*COLS/2;
		ROWS = 4; COLS = 4;
		var options = ["Rows", "▲", rowVal, "▼", "Cols", "▲", colVal, "▼", "Tiles",  "▲", diffTilesVal , "▼", "Play!", "Back"];
		var tileWidth = (width - gap*(COLS+1))/COLS;
		var tileHeight = (height - gap*(ROWS+1))/ROWS;
		var widthDiff = tileWidth - Math.floor(tileWidth);
		var heightDiff = tileHeight - Math.floor(tileHeight);
		tileWidth = Math.floor(tileWidth);
		tileHeight = Math.floor(tileHeight);
		for(var i=1; i<=ROWS; i++){
			for(var j=1; j<=ROWS; j++){
				// quickfix change...
				if(i == 4 && (j == 3 || j == 4)){
					continue;
				}
				if(i == ROWS && j <=2){
					tileWidth = (width - gap*(2+1))/2;
					widthDiff = tileWidth - Math.floor(tileWidth);
					tileWidth = Math.floor(tileWidth);
				}
				else if(i==ROWS && j > 2){
					var tempCanvas = document.createElement("canvas");
					tempCanvas.id = i + " " + j;
					doc.appendChild(tempCanvas);
					continue;
				}
			var tempCanvas = document.createElement("canvas");
			tempCanvas.id = i + " " + j;
			tempCanvas.onclick = function(){customOption(this);};
			tempCanvas.width = tileWidth;
			tempCanvas.height = tileHeight;

			tempCanvas.addEventListener("mouseover", function () {
				onHover(this, "#000000");
	    	});
	    	tempCanvas.addEventListener("mouseout", function () {
				onHover(this, foreColor);
	    	});

			tempCanvas.style.float = "left";
			tempCanvas.style.position = "relative";
			tempCanvas.style.zIndex = 1;
			tempCanvas.style.paddingLeft = gap + widthDiff;
			tempCanvas.style.paddingTop = gap + heightDiff;
			// Context
			var tempCtx = tempCanvas.getContext("2d");
	        tempCtx.textAlign = "center";
			tempCtx.textBaseline = "middle";
			tempCtx.fillStyle = foreColor;
			tempCtx.font = "bold " + (0.33*(tileWidth < tileHeight ? tileWidth : tileHeight)) + "px Arial";
			tempCtx.open = true;
			tempCtx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
			tempCtx.fillStyle = "#000000";
			tempCtx.fillText(options[(i-1)*COLS+j-1], tileWidth/2, tileHeight/2);
			tempCtx.fillStyle = foreColor;

			// Append to body
			doc.appendChild(tempCanvas);	
			}
		}
		document.getElementById("tilesWrap").appendChild(doc);	
		return;	
	}
	else{
		// ("Not in choice .. something wrong..")
	}
	
	populateBoard();
	// Lower layer canvas
	createTiles();
}

function deleteCanvas(r=ROWS,c=COLS){
	for(var i=1; i<=r; i++){
		for(var j=1; j<=c; j++){
			var canvas = document.getElementById(i + " " + j);
			if(canvas != undefined){
				canvas.parentNode.removeChild(canvas);
			}
		}
	}
}

function createTiles(){
	var doc = document.createDocumentFragment();

	var tileWidth = (width - gap*(COLS+1))/COLS;
	var tileHeight = (height - gap*(ROWS+1))/ROWS;
	var widthDiff = tileWidth - Math.floor(tileWidth);
	var heightDiff = tileHeight - Math.floor(tileHeight);
	tileWidth = Math.floor(tileWidth);
	tileHeight = Math.floor(tileHeight);
	for(var i=1; i<=ROWS; i++){
		for(var j=1; j<=COLS; j++){
			var tempCanvas = document.createElement("canvas");
			tempCanvas.id = i+" "+j;
			tempCanvas.onclick = function(){openTile(this);};

			// tempCanvas.addEventListener("mouseover", function () {
			// onHover(this, "#000000");
   //  		});
	   //  	tempCanvas.addEventListener("mouseout", function () {
				// onHover(this, foreColor, "True");
	   //  	});

			tempCanvas.width = tileWidth;
			tempCanvas.height = tileHeight;
			tempCanvas.style.zIndex = 1;
			tempCanvas.style.position = "relative";
			tempCanvas.style.float = "left";
			tempCanvas.style.paddingLeft = gap + widthDiff; 
			tempCanvas.style.paddingTop = gap + heightDiff; 


			// Context
			var tempCtx = tempCanvas.getContext("2d");
			tempCtx.fillStyle = foreColor;
			tempCtx.open = true;
			tempCtx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
			// Append to body
			doc.appendChild(tempCanvas);			
		}
	}
	document.getElementById("tilesWrap").appendChild(doc);
}

function loadImages(){
	for(var i=0; i<19; i++){
		var newImage = new Image();
		newImage.src = "./images/" + i + ".jpg";
		images.push(newImage);
	}
}


function openTile(tempCanvas){
	var tileArr = tempCanvas.id.split(" ");
	for(var i=tileArr.length-1; i>=0; i--) { tileArr[i] = +tileArr[i]; }
	// tileArr is an integer array i.e. [row, col]
	var tempCtx = tempCanvas.getContext("2d");
	if(!tempCtx.open || (prev.length > 0 && prev[0] == tileArr[0] && prev[1] == tileArr[1])){
		return;
	}
	var bVal = board[((tileArr[0]-1)*COLS+tileArr[1])-1];

	// base_image = new Image();
	// base_image.src = "./images/" + bVal + ".png"
	// base_image.onload = function(){
		
	// };
	tileAnim(tempCanvas, bVal);
	

	// tempCtx.strokeText(board[(((tileArr[0]-1)*COLS)+tileArr[1])-1],
				// tempCanvas.width/2, tempCanvas.height/2);
	if(prev.length > 0){
		var CurTileCtx = document.getElementById(prev[0] + " " + prev[1]).getContext("2d");
		
		if(prev[2] == bVal){
			tempCtx.fillStyle = backColor;
			CurTileCtx.fillStyle = backColor;
			tempCtx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
			CurTileCtx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
			tempCtx.open = false;
			CurTileCtx.open = false;
			won -= 2;
			if(won == 0){
				onGameOver();
				// call function to destroy everything and re start options...
			}
		}
		else{

			// add border before closing...
			// setTimeout(function(){
			// 	tempCtx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
			// 	CurTileCtx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
		 //    }, 500);

			setTimeout(function(){
				// var max = (tempCanvas.width > tempCanvas.height ? tempCanvas.width/2 : tempCanvas.height/2);
				// var i = 0;
				// for(var i=0; i<max; i++){
				// 	CurTileCtx.rect(i,i,tempCanvas.width-i, tempCanvas.height-i);
				// 	CurTileCtx.stroke();
				// }

				tempCtx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
				CurTileCtx.fillRect(0,0, tempCanvas.width, tempCanvas.height);
		    }, 500);
		}
		prev = [];	
	}
	else{
		
		// tempCtx.strokeText(board[(((tileArr[0]-1)*COLS)+tileArr[1])-1],
		// 	tempCanvas.width/2, tempCanvas.height/2);
		prev = [tileArr[0], tileArr[1], bVal];
	}
}

function onGameOver() {
	deleteCanvas();

	// for(var i=1; i<=ROWS; i++){
	// 	for(var j=1; j<=COLS; j++){
	// 		var delCanvas = document.getElementById(i + " " + j);
	// 		delCanvas.parentNode.removeChild(delCanvas);
	// 	}
	// }
	// add some animations after game over, like a congrats message...
	createOptions();
}

function tileAnim(tempCanvas, bVal){
	var x = 100;
	var res = 2;

	var tempCtx = tempCanvas.getContext("2d");

	// for(var i = 0; i < 100; i += res){
	// 	tempCtx.drawImage(images[bVal], i, 0, res, 100, 
	// 		50 + i -0.2*i,10,res, 100);
	// }

	tempCtx.drawImage(images[bVal], 0, 0, tempCanvas.width, tempCanvas.height);

	// var flip


}

function createBoard(){
	var canvas = document.createElement("canvas");
	var context = canvas.getContext('2d');
	canvas.id = "board";
	canvas.width = width;
	canvas.height = height;
	canvas.style.zIndex = 0;
	canvas.style.left = 0;
	canvas.style.top = 0;
	canvas.style.margin = "auto";	
	canvas.style.display = "block";
	canvas.style.bottom = 0;
	canvas.style.right = 0;
	canvas.style.position = "absolute";
	// Context
	context.fillStyle = backColor;
	context.fillRect(0,0,width,height);
	// Append to body
	document.body.appendChild(canvas);
}



// Change... push while Shuffling
function populateBoard(){
	won = ROWS*COLS;
	board = [];
  	var diffTileIndex = 0;
  	for(var i=ROWS*COLS; i>0; i -= 2){
  		board.push(diffTileIndex);
  		board.push(diffTileIndex);
  		diffTileIndex += 1;
  		diffTileIndex %= diffTiles;
  	}
  	// Shuffle Array
  	for (var i = board.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = board[i];
      board[i] = board[j];
      board[j] = temp;
  }
}

