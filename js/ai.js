function AI(heightWeight, linesWeight, holesWeight, bumpinessWeight){
    this.heightWeight = heightWeight;
    this.linesWeight = linesWeight;
    this.holesWeight = holesWeight;
    this.bumpinessWeight = bumpinessWeight;
}



AI.prototype.best = function(grid,pieces,curPieceIndex = 0){
    var bestPiece = null;
    var bestScore = null;
    var curPiece = pieces[curPieceIndex];
    
    
    for(var rotation = 0; rotation < 4 ; rotation++){
        var _curPiece = curPiece.clone();
        for(var i = 0; i < rotation ; i++){
            _curPiece.rotate(grid);
        }

        while(_curPiece.moveLeft(grid));
        while(grid.valid(_curPiece)){
            var _tempCurPiece = _curPiece.clone();
            while(_tempCurPiece.moveDown(grid));

            var _grid = grid.clone();   
            _grid.addPiece(_tempCurPiece);

            var score = null;
            if(curPieceIndex == 0){
                score = this.best(_grid,pieces,1).score;
            }else if(curPieceIndex == 1){
                score = this.getFitness(_grid);
            }

            if(score > bestScore || bestScore == null){
                bestScore = score;
                bestPiece = _curPiece.clone();
            }
            _curPiece.column++;
        }
    }
    return {piece:bestPiece, score:bestScore};
}

AI.prototype.getFitness = function(grid){
    return -this.heightWeight * grid.aggregateHeight() + this.linesWeight * grid.lines() - this.holesWeight * grid.holes() - this.bumpinessWeight * grid.bumpiness();
}