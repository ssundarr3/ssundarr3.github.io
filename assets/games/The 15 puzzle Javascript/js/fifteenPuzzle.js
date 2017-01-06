// use classnames to redraw.. 
// http://stackoverflow.com/questions/1716266/javascript-document-getelementbyid-slow-performance/1716873#1716873
// window.requestAnimationFrame


// Board parameters
var ROWS = 5;
var COLS = 5;
var height = 450;
var width = 450;
var backColor = '#935347';
var foreColor = "#C7AD88";
var gap = 5;

// Game parameters
var movesMade = [];
var tileOpen = ROWS + " " + COLS;

function main(){
	fitOntoDiv();
	createBoard();
	createTiles();	
}

function fitOntoDiv(){
	var div = document.getElementById("tilesWrap");
	div.style.width = width + "px";
	div.style.height = height + "px";
}


function updateVal(r, c, Val){
	canvas = document.getElementById(r + " " + c);
	context = canvas.getContext("2d");
	context.fillRect(0,0,canvas.width, canvas.height);
	context.fillStyle = "#000000";
	context.fillText(Val,  canvas.width/2,canvas.height/2);// canvas.height/2);
	context.fillStyle = foreColor;
}

function deleteCanvas(r=ROWS,c=COLS){
	for(var i=1; i<=r; i++){
		for(var j=1; j<=c; j++){
			var canvas = document.getElementById(i + " " + j);
			canvas.parentNode.removeChild(canvas);
		}
	}
}

function nextToTile(canvasId){
	var openRow = +tileOpen.split(" ")[0],
		openCol = +tileOpen.split(" ")[1], 
		clickRow = +canvasId.split(" ")[0], 
		clickCol = +canvasId.split(" ")[1];
	if ((clickCol+1 == openCol && clickRow == openRow) ||
		(clickCol-1 == openCol && clickRow == openRow) ||
		(clickRow+1 == openRow && clickCol == openCol) ||
		(clickRow-1 == openRow && clickCol == openCol)){
		return true;
	}
	else{
		return false;
	}
}


function openTile(canvas){
	if(canvas == null || canvas == undefined){
		return;
	}
	if(nextToTile(canvas.id)){
		movesMade.push(canvas.id);
		var openCanvas = document.getElementById(tileOpen);
		var openContext = openCanvas.getContext("2d");
		var context = canvas.getContext("2d");
		var tempNumber = canvas.number;

		canvas.number = openCanvas.number;
		openCanvas.number = tempNumber;


		tileOpen = canvas.id;


		openContext.fillStyle = foreColor;
		openContext.fillRect(0,0, openCanvas.width, openCanvas.height);
		openContext.fillStyle = "#000000";
		openContext.fillText(openCanvas.number, openCanvas.width/2, openCanvas.height/2);
		openContext.fillStyle = foreColor;


		context.fillStyle = backColor;
		context.fillRect(0,0, canvas.width, canvas.height);
	}
}

function createTiles(){
	tileOpen = ROWS + " " + COLS;
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
			tempCanvas.number = (i-1)*COLS + j;
			tempCanvas.onclick = function(){openTile(this);};

			// tempCanvas.addEventListener("mouseover", function () {
			// onHover(this, "#000000");
   //  		});
	  //   	tempCanvas.addEventListener("mouseout", function () {
			// 	onHover(this, foreColor);
	  //   	});



			tempCanvas.width = tileWidth;
			tempCanvas.height = tileHeight;

			tempCanvas.style.zIndex = 1;
			tempCanvas.style.position = "relative";
			tempCanvas.style.float = "left";
			

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

			// Context
			var tempCtx = tempCanvas.getContext("2d");
			tempCtx.font = (tileHeight < tileWidth ? tileHeight : tileWidth )*0.66 + "px Calibri";
			tempCtx.textAlign = "center";
			tempCtx.textBaseline = "middle";
			
			if(i == ROWS && j == COLS){
				tempCtx.fillStyle = backColor;
				tempCtx.fillRect(0,0, tileWidth, tileHeight);
			}
			else{
				tempCtx.fillStyle = foreColor;
				tempCtx.fillRect(0,0, tileWidth, tileHeight);
				tempCtx.fillStyle = "#000000";
				tempCtx.fillText((i-1)*COLS + j, tileWidth/2, tileHeight/2);
				tempCtx.fillStyle = foreColor;
			}
			// Append to body
			doc.appendChild(tempCanvas);			
		}
	}
	document.getElementById("tilesWrap").appendChild(doc);
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


function shuffle(){
	for(var i=0, j = ROWS*COLS*10; i < j; i++){
		var r = +tileOpen.split(" ")[0];
		var c = +tileOpen.split(" ")[1];
		var choice = Math.floor((Math.random()*4) + 1);
		if(choice == 1){
			openTile((document.getElementById((r-1) + " " + c)));
		}
		else if(choice == 2){
			openTile(document.getElementById((r+1) + " " + c));
		}
		else if(choice == 3){
			openTile(document.getElementById((r) + " " + (c-1)));
		}
		else{
			openTile(document.getElementById(r + " " + (c+1)));
		}
	}
}

function options(){
	document.getElementById("modal").style.display = "block" ;
}

function submit(){
	var options = document.getElementById("optionsForm");
	deleteCanvas();
	ROWS = +options.elements[0].value;
	COLS = +options.elements[1].value;
	gap = +options.elements[2].value;
	createTiles();
	document.getElementById("modal").style.display = "none" ;
}

function impossible(){
	reset();
	console.log("thinking...")
}

function reset(){
	deleteCanvas();
	createTiles();
}

function help(){
	alert("This is a game. Learn how to play it by playing it.");
}

