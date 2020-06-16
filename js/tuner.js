function Tuner(population = 1000, maxMovePerCandidate = 500, roundPerCandidate = 5, mutateRate = 0.05){
    this.population = population;
    this.maxMovePerCandidate = maxMovePerCandidate;
    this.roundPerCandidate = roundPerCandidate;
    this.mutateRate = mutateRate;

    function randomInteger(min, max){
        return Math.floor(Math.random() * (max - min) + min);
    }

    function normalize(candidate){
        var norm = Math.sqrt(candidate.heightWeight * candidate.heightWeight + candidate.linesWeight * candidate.linesWeight + candidate.holesWeight * candidate.holesWeight + candidate.bumpinessWeight * candidate.bumpinessWeight);
        candidate.heightWeight /= norm;
        candidate.linesWeight /= norm;
        candidate.holesWeight /= norm;
        candidate.bumpinessWeight /= norm;
    }

    function generateRandomCandidate(){
        var candidate = {
            heightWeight: Math.random() - 0.5,
            linesWeight: Math.random() - 0.5,
            holesWeight: Math.random() - 0.5,
            bumpinessWeight: Math.random() - 0.5
        };
        normalize(candidate);
        return candidate;
    }

    function sort(candidates){
        candidates.sort(function(a, b){
            return b.fitness - a.fitness;
        });
    }

    function crossOver(father, mother){
        var candidate = {
            heightWeight: father.fitness * father.heightWeight + mother.fitness * mother.heightWeight,
            linesWeight: father.fitness * father.linesWeight + mother.fitness * mother.linesWeight,
            holesWeight: father.fitness * father.holesWeight + mother.fitness * mother.holesWeight,
            bumpinessWeight: father.fitness * father.bumpinessWeight + mother.fitness * mother.bumpinessWeight,
            fitness:0
        };
        normalize(candidate);
        return candidate;
    }

    function mutate(candidate){
        var quantity = Math.random() * 0.4 - 0.2; // plus/minus 0.2
        switch(randomInteger(0, 4)){
            case 0:
                candidate.heightWeight += quantity;
                break;
            case 1:
                candidate.linesWeight += quantity;
                break;
            case 2:
                candidate.holesWeight += quantity;
                break;
            case 3:
                candidate.bumpinessWeight += quantity;
                break;
        }
    }

    function computeFitnesses(candidates){
        for(var i = 0; i < candidates.length; i++){
            var curCandidate = candidates[i];
            var ai = new AI(curCandidate.heightWeight,curCandidate.linesWeight,curCandidate.holesWeight,curCandidate.bumpinessWeight);
            var total_score = 0;
            for(var j = 0; j < roundPerCandidate; j++){
                var grid = new Grid(22,10);
                var curPiece = Piece.nextPiece();
                var nextPiece = Piece.nextPiece();
                var score = 0;
                var numberOfMoves = 0;
                while((numberOfMoves < maxMovePerCandidate) && !grid.exceeded()){
                    var pieces=new Array(curPiece,nextPiece);
                    var bestPiece = ai.best(grid,pieces).piece;
                    curPiece = bestPiece;
                    while(curPiece.moveDown(grid));
                    grid.addPiece(curPiece);
                    score += grid.clearLines();
                    curPiece = nextPiece;
                    nextPiece = Piece.nextPiece();
                    numberOfMoves++;
                }
                total_score+=score
            }
            curCandidate.fitness = total_score / roundPerCandidate;
        }
        
    }

    function deleteNLastReplacement(candidates, newCandidates){
        candidates.splice(-newCandidates.length);
        for(var i = 0; i < newCandidates.length; i++){
            candidates.push(newCandidates[i]);
        }
        sort(candidates);
    }

    function tournamentSelectPair(candidates, K){
        /*
            Note that the following assumes that the candidates array is
            sorted according to the fitness of each individual candidates.
            Hence it suffices to pick the least 2 indexes out of the random
            ones picked.
        */
        var fittestCandidateIndex1 = null;
        var fittestCanddiateIndex2 = null;
        for(var i = 0; i < K; i++){
            var selectedIndex = randomInteger(0, candidates.length);
            if(fittestCandidateIndex1 === null || selectedIndex < fittestCandidateIndex1){
                fittestCanddiateIndex2 = fittestCandidateIndex1;
                fittestCandidateIndex1 = selectedIndex;
            }else if (fittestCanddiateIndex2 === null || selectedIndex < fittestCanddiateIndex2){
                fittestCanddiateIndex2 = selectedIndex;
            }
        }
        return [candidates[fittestCandidateIndex1], candidates[fittestCanddiateIndex2]];
    }

    this.tune = function(){
        var candidates = [];
        var candidate = {
            heightWeight: 0.510066,
            linesWeight: 0.760666,
            holesWeight: 0.35663,
            bumpinessWeight: 0.184483,
            fitness:0
        };
        candidates.push(candidate);
        for(var i = 0 ; i < this.population - 1 ; i++){
            candidates.push(generateRandomCandidate());
        }

        var numberOfGeneration = 0;

        console.log('Computing fitnesses of initial generation');
        computeFitnesses(candidates);
        sort(candidates);
        var totalFitness = 0;
        for(var i = 0; i < candidates.length; i++){
            totalFitness += candidates[i].fitness;
        }
        console.log('Average fitness = ' + (totalFitness / candidates.length));
        console.log('Highest fitness = ' + candidates[0].fitness + '(' + numberOfGeneration + ')');
        console.log('Fittest candidate = ' + JSON.stringify(candidates[0]) + '(' + numberOfGeneration + ')');

        while(true){
            var newCandidates = [];
            for(var i = 0; i < Math.floor(0.3 * this.population) ; i++){
                var pair = tournamentSelectPair(candidates, 0.1 * this.population);
                var child = crossOver(pair[0], pair[1]);
                if(Math.random() < this.mutateRate){// 5% chance of mutation
                    mutate(child);
                }
                normalize(child);
                newCandidates.push(child);
            }
            console.log('Computing fitnesses of '+ numberOfGeneration +' generation');
            computeFitnesses(newCandidates);
            deleteNLastReplacement(candidates, newCandidates);
            var totalFitness = 0;
            for(var i = 0; i < candidates.length; i++){
                totalFitness += candidates[i].fitness;
            }
            console.log('Average fitness = ' + (totalFitness / candidates.length));
            console.log('Highest fitness = ' + candidates[0].fitness + '(' + numberOfGeneration + ')');
            console.log('Fittest candidate = ' + JSON.stringify(candidates[0]) + '(' + numberOfGeneration + ')');
            numberOfGeneration++;
        }
    }
};