function Piece(shapeType,color){
    this.shapeType = shapeType;
    this.color = color;
    this.rotation = 0;
    this.row = 0;
    this.column = 0;
    this.dimension = this.getShape().length;
};

Piece.prototype.clone = function(){
    var newPiece = new Piece(this.shapeType,this.color);
    newPiece.row = this.row;
    newPiece.column = this.column;
    newPiece.rotation = this.rotation;
    newPiece.dimension = this.dimension;
    return newPiece;
}


Piece.nextPiece = function(){
    randomShapeType = Math.floor(Math.random() * 7);
    return this.getPiece(randomShapeType);
};

Piece.prototype.getShape = function(){
    return SHAPES[this.shapeType][this.rotation];
};

Piece.getPiece = function(shapeType){
    var piece;
    switch (shapeType){
        case 0:// O
            piece = new Piece(shapeType,0x0000AA);
            break;
        case 1: // J
            piece = new Piece(shapeType,0xC0C0C0);
            break;
        case 2: // L
            piece = new Piece(shapeType,0xAA00AA);
            break;
        case 3: // Z
            piece = new Piece(shapeType,0x00AAAA);
            break;
        case 4: // S
            piece = new Piece(shapeType,0x00AA00);
            break;
        case 5: // T
            piece = new Piece(shapeType,0xAA5500);
            break;
        case 6: // I
            piece = new Piece(shapeType,0xAA0000);
            break;
    }
    piece.row = 0;
    piece.column = 5 - Math.floor( piece.dimension / 2 );
    return piece;
};


Piece.prototype.canMoveLeft = function(grid){   
    var shape = this.getShape();
    for(var r = 0; r < shape.length; r++){
        for(var c = 0; c < shape[r].length; c++){
            var _r = this.row + r;
            var _c = this.column + c - 1;
            if(shape[r][c]!=0){
                if(_c < 0 || grid.cells[_r][_c] > 0){
                    return false;
                }
            }
        }
    }
    return true;
}

Piece.prototype.canMoveRight = function(grid){
    var shape = this.getShape();
    for(var r = 0; r < shape.length; r++){
        for(var c = 0; c < shape[r].length; c++){
            var _r = this.row + r;
            var _c = this.column + c + 1;
            if(shape[r][c]!=0){
                if( _c > grid.cols - 1 || grid.cells[_r][_c] > 0){
                    return false;
                }
            }
        }
    }
    return true;
}

Piece.prototype.canMoveDown = function(grid){
    var shape = this.getShape();
    for(var r = 0; r < shape.length; r++){
        for(var c = 0; c < shape[r].length; c++){
            var _r = this.row + r + 1;
            var _c = this.column + c;
            if(shape[r][c]!=0){
                if( _r > grid.rows - 1 || grid.cells[_r][_c] > 0){
                    return false;
                }
            }
        }
    }
    return true;
}

Piece.prototype.canRotate = function(grid){
    var newPiece = this.clone();
    newPiece.rotation = (newPiece.rotation + 1) % 4;
    var shape = newPiece.getShape();
    for(var r = 0; r < shape.length; r++){
        for(var c = 0; c < shape[r].length; c++){
            var _r = this.row + r;
            var _c = this.column + c;
            if(shape[r][c]!=0){
                if( _c < 0 || _c > grid.cols - 1 || _r > grid.rows - 1 || grid.cells[_r][_c] > 0){
                    return false;
                }
            }
        }
    }
    return true;
};

Piece.prototype.moveLeft = function(grid){
    if(!this.canMoveLeft(grid)){
        return false;
    }
    this.column--;
    return true;
};

Piece.prototype.moveRight = function(grid){
    if(!this.canMoveRight(grid)){
        return false;
    }
    this.column++;
    return true;
};

Piece.prototype.moveDown = function(grid){
    if(!this.canMoveDown(grid)){
        return false;
    }
    this.row++;
    return true;
};


Piece.prototype.rotate = function(grid){
    if(!this.canRotate(grid)){
        return false;
    }
    this.rotation = (this.rotation + 1) % 4;
    return true;
};