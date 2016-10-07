/*
Assumptions:
 - ids are unique integers starting at 0
 - gates aren't tasks at all and we're only removing tasks
 - any non-gateway state can only point to one other state
 - there is always a start and end state
 - node is installed on computer
 - at least ES5 being used

Features:
 - gates can branch to unlimited states
 - supports loops
*/

// put file paths here where you want to read/write your diagram
var PATH_IN = './diagram.json';
var PATH_OUT = './diagram_sol.json';

var fs = require('fs');

var main = function(){

    var nodes = preProcessing('./diagram.json');

    pruneNodes(nodes);

    var out = postProcessing(nodes);

    saveFile(PATH_OUT, JSON.stringify(out));
};

// returns array of nodes
var preProcessing = function(path){
    var file = require(path);
    var nodes = [];

    file.nodes.forEach(function(node){
        node.edgeArr = [];
        nodes[node.id] = node; //node in array at its id position
    });

    file.edges.forEach(function(edge){
        nodes[edge.from].edgeArr.push(edge.to);
    });

    nodes[0].from = [0];

    return nodes;
};



// returns last node of a route
var getLastNode = function(route){
    return nodes[route[route.length -1]];
};


var pruneNodes = function(nodes){
    var allowedNodes = ['HumanTask', 'Gateway', 'Start', 'End'];
    var nodeStack = [nodes[0]];
    var currentNode;
    var nextNode;

    while(nodeStack.length !== 0){
        currentNode = nodeStack.pop();
        currentNode.visited = true;

        // at the end of diagram or loop
        if(currentNode.type == 'End'){
            continue;
        }

        // if node has non-allowed node
        if(allowedNodes.indexOf(currentNode.type) === -1){
            addFrom(nodes[currentNode.from[0]], nodes.getNext(currentNode));
            nodes[currentNode.id] = undefined;
        }else{ 
            for(var i=0; i<currentNode.edgeArr.length; i++){
                addFrom(currentNode, nodes[currentNode.edgeArr[i]]);
            }
        }

        //push next nodes on stack
        for(var i=0; i<currentNode.edgeArr.length; i++){
            nodes[currentNode.edgeArr[i]].visited ? null : nodeStack.push(nodes[currentNode.edgeArr[i]]);
        }        
    }
};

// separates nodes with all info to nodes/edges
var postProcessing = function(inNodes){
    var returnObj = {};
    var nodes = returnObj.nodes = [];
    var edges = returnObj.edges = [];

    for(var i=0; i<inNodes.length; i++){
        var tempNode = {};
        if(!inNodes[i]){
            continue;
        }
        tempNode.id = inNodes[i].id;
        tempNode.name = inNodes[i].name;
        tempNode.type = inNodes[i].type;

        nodes.push(tempNode);

        if(i !== 0){
            for(var j=0; j<inNodes[i].from.length; j++){
                edges.push({from: inNodes[i].from[j], to: inNodes[i].id});
            }
        }
    }

    return returnObj;
};

var saveFile = function(path, json){
    fs.writeFile(path, json, function(err) {
        if(err) {
            return console.log(err);
        }

    console.log("The file was saved in " + path);
    }); 
};

// gets next node in array based on path
Array.prototype.getNext = function(node){
    return this[node.edgeArr[0]];
};

// gets first node that points to current node
Array.prototype.getLast = function(node){
    return this[node.from[0]];
};

// adds a connection from fromNode to toNode
var addFrom = function(fromNode, toNode){
    toNode.from = !toNode.from ? [] : toNode.from;
    toNode.from.push(fromNode.id);
};


main();