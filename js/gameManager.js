function GameManager(){
    const gridSize = 20;
    var gridCanvas = document.getElementById('game-canvas');
    var gridContext = gridCanvas.getContext('2d');
    var nextCanvas = document.getElementById('next-canvas');
    var nextContext = nextCanvas.getContext('2d');
    var scoreContainer = document.getElementById("score");
    var grid = new Grid(22, 10);
    var curPiece = null;
    var nextPiece = Piece.nextPiece();
    var ai = new AI(0.510066, 0.760666, 0.35663, 0.184483);
    var gravityTimerDelay = 500;
    var score = 0;
    var gravityTimer = new Timer(onGravityTimerTick, gravityTimerDelay);
    var aiButton = document.getElementById('ai-button');
    var restartButton = document.getElementById('restart-button');
    var isAIActive = false;
    var isKeyEnabled = false;
    aiButton.addEventListener('click', startAI);
    restartButton.addEventListener('click', restart);
    document.addEventListener('keydown', onKeyDown);

    newTurn();

    function restart(){
        grid = new Grid(22, 10);
        curPiece = null;
        nextPiece = Piece.nextPiece();
        score = 0;
        isKeyEnabled = true;
        updateScoreContainer();
        newTurn();
    };

    function startAI(){
        if(isAIActive){
            isAIActive = !isAIActive;
            aiButton.innerHTML = 'Start AI';
        }else{
            isAIActive = !isAIActive;
            aiButton.innerHTML = 'Stop AI';
            startWorkingPieceDropAnimation(function(){ // Start drop animation
                while(curPiece.moveDown(grid)); // Drop working piece
                operateTurn();
            });
        }
    }

    function onGravityTimerTick(){
            if(curPiece.canMoveDown(grid)){
                curPiece.moveDown(grid);
                redrawGridCanvas();
                return;
            }
            gravityTimer.stop();
            operateTurn();
        }
    

    function isGameOver(){
        return grid.exceeded();
    }

    // Process end of one turn
    function endTurn(){
        // Add working piece
        grid.addPiece(curPiece);

        // Clear lines
        score += grid.clearLines();

        // Refresh graphics
        redrawGridCanvas();
        updateScoreContainer();

        return !isGameOver();
    }

    function updateScoreContainer(){
        scoreContainer.innerHTML = score.toString();
    }

    
    // Drop animation
    var workingPieceDropAnimationStopwatch = null;

    function startWorkingPieceDropAnimation(callback = function(){}){
        // Calculate animation height
        animationHeight = 0;
        _workingPiece = curPiece.clone();
        while(_workingPiece.moveDown(grid)){
            animationHeight++;
        }

        var stopwatch = new Stopwatch(function(elapsed){
            if(elapsed >= animationHeight * 20){
                stopwatch.stop();
                redrawGridCanvas(20 * animationHeight);
                callback();
                return;
            }
            redrawGridCanvas(20 * elapsed / 20);
        });

        workingPieceDropAnimationStopwatch = stopwatch;
    }

    function cancelWorkingPieceDropAnimation(){
        if(workingPieceDropAnimationStopwatch === null){
            return;
        }
        workingPieceDropAnimationStopwatch.stop();
        workingPieceDropAnimationStopwatch = null;
    }


    function newTurn(){
        generatePiece();
        // Refresh Graphics
        redrawGridCanvas();
        redrawNextCanvas();

        if(isAIActive){
            isKeyEnabled = false;
            gravityTimer.stop();
            var pieces=new Array(curPiece,nextPiece)
            bestPiece = ai.best(grid, pieces).piece;
            curPiece = bestPiece;
            startWorkingPieceDropAnimation(function(){ // Start drop animation
                while(curPiece.moveDown(grid)); // Drop working piece
                operateTurn();
            });

        }else{
            isKeyEnabled = true;
            gravityTimer.start();
        }
    }

    function operateTurn(){
        if(!endTurn()){
            alert('Game Over!');
            return;
        }
        newTurn();
    }

    function onKeyDown(event){
        if(!isKeyEnabled){
            return;
        }
        switch(event.which){
            case 32: // spacebar
                isKeyEnabled = false;
                gravityTimer.stop(); // Stop gravity
                startWorkingPieceDropAnimation(function(){ // Start drop animation
                    while(curPiece.moveDown(grid)); // Drop working piece
                    operateTurn();
                });
                break;
            case 40: // down
                if(curPiece.canMoveDown(grid)){
                    curPiece.moveDown(grid);
                    redrawGridCanvas();
                    return;
                }
                operateTurn();
                break;
            case 37: //left
                if(curPiece.canMoveLeft(grid)){
                    curPiece.moveLeft(grid);
                    redrawGridCanvas();
                }
                break;
            case 39: //right
                if(curPiece.canMoveRight(grid)){
                    curPiece.moveRight(grid);
                    redrawGridCanvas();
                }
                break;
            case 38: //up
                if(curPiece.canRotate(grid)){
                    curPiece.rotate(grid);
                    redrawGridCanvas();
                }
                break;
        }
    }

    function generatePiece(){
        curPiece = nextPiece;
        nextPiece = Piece.nextPiece();
    }

 
    // Graphics
    function intToRGBHexString(v){
        return 'rgb(' + ((v >> 16) & 0xFF) + ',' + ((v >> 8) & 0xFF) + ',' + (v & 0xFF) + ')';
    }

    function redrawGridCanvas(workingPieceVerticalOffset = 0){
        // Clear
        gridContext.clearRect(0, 0, gridCanvas.width, gridCanvas.height);
        
        // Draw grid
        for(var r = 2; r < grid.rows; r++){
            for(var c = 0; c < grid.cols; c++){
                if (grid.cells[r][c] != 0){
                    gridContext.fillStyle= intToRGBHexString(grid.cells[r][c]);
                    gridContext.fillRect(20 * c, 20 * (r - 2), 20, 20);
                    gridContext.strokeStyle="#FFFFFF";
                    gridContext.strokeRect(20 * c, 20 * (r - 2), 20, 20);
                }
            }
        }

        // Draw working piece
        for(var r = 0; r < curPiece.dimension; r++){
            for(var c = 0; c < curPiece.dimension; c++){
                if (curPiece.getShape()[r][c] != 0){
                    gridContext.fillStyle = intToRGBHexString(curPiece.color);
                    gridContext.fillRect(20 * (c + curPiece.column), 20 * ((r + curPiece.row) - 2) + workingPieceVerticalOffset, 20, 20);
                    gridContext.strokeStyle="#FFFFFF";
                    gridContext.strokeRect(20 * (c + curPiece.column), 20 * ((r + curPiece.row) - 2) + workingPieceVerticalOffset, 20, 20);
                }
            }
        }
    }

    function redrawNextCanvas(){
        nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
        var xOffset = nextPiece.dimension == 2 ? 20 : nextPiece.dimension == 3 ? 10 : nextPiece.dimension == 4 ? 0 : null;
        var yOffset = nextPiece.dimension == 2 ? 20 : nextPiece.dimension == 3 ? 20 : nextPiece.dimension == 4 ? 0 : null;

        for(var r = 0; r < nextPiece.dimension; r++){
            for(var c = 0; c < nextPiece.dimension; c++){
                if (nextPiece.getShape()[r][c] != 0){
                    nextContext.fillStyle = intToRGBHexString(nextPiece.color);
                    nextContext.fillRect(xOffset + 20 * c, yOffset + 20 * r, 20, 20);
                    nextContext.strokeStyle = "#FFFFFF";
                    nextContext.strokeRect(xOffset + 20 * c, yOffset + 20 * r, 20, 20);
                }
            }
        }
    }


}


