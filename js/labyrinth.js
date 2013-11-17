/*!
 * labyrinth.js
 * by Brianna Williams
 *
 * functions that can be used to generate a labyrinth.
 */
var rand = function(start, end) {
  return Math.floor((Math.random()*end)+start);
};

var array_rand = function(ary) {
  var i = rand(0,ary.length);
  return ary[i];
};

var in_array = function(needle, haystack) {
    for(var i = 0; i < haystack.length; i = i + 1) {
        if(haystack[i] == needle)
        {
            return true;
        }
    }
    return false;
};

var stringify_cell = function(cell) {
    return cell.x.toString() + "," + cell.y.toString();
}

var generate_maze = function( cols, rows ) {
    var cell_count = rows * cols;
    var maze = [];
    var stack = [];
    var visited = [];
    var x = 0;
    var y = 0;

    // generating the maze grid here people
    // loop through cols
    // loop through rows
    ///
    for (var c = 0; c < cols; c = c + 1)
    {
        maze[c] = [];
        
        for(var r = 0; r < rows; r = r + 1)
        {
            maze[c][r] = { top: true, right: true, bottom: true, left: true };
        }
    }
    
    var get_unvisited_neighbors = function(x,y,cols,rows) {
        var unvisited = [];
        var cell = false;
        
        var maybe_push_unvisited = function() {
            if( !in_array( stringify_cell(cell), visited ) ) {
                unvisited.push(cell);
            }
            cell = false;
        };
        
        // top neighbor
        if( y > 0 ) {
            cell = { x: x, y: (y-1) };
            maybe_push_unvisited();
        }
        
        // right neighbor
        if( x < (cols-1) ) {
            cell = { x: (x+1), y: y }; 
            maybe_push_unvisited();
        }
        
        // bottom neighbor
        if( y < (rows-1) ) {
            cell = { x: x, y: (y+1) };
            maybe_push_unvisited();
        }
        
        // left neighbor
        if( x > 0 ) {
            cell = { x: (x-1), y: y };
           maybe_push_unvisited();
        }

        return unvisited;
    };
    

    // helper function to break walls between cells
    var break_wall = function(cell1,cell2) {
        // cell1 == { x: 3, y: 3 }

        // do these border on top, left, bottom or right
        // To figure out t, b, l or right
        // first see if the cells are in the same column or row
        // then see if 
        // figure out what edges to break
        // bottom cell
        if( cell1.x===cell2.x && cell1.y===(cell2.y-1) ) {
            maze[cell1.x][cell1.y].bottom = false;
            maze[cell2.x][cell2.y].top = false;
        }
        else if( cell1.x==cell2.x && cell1.y==(cell2.y+1) ) { // top cell 
            maze[cell1.x][cell1.y].top = false;
            maze[cell2.x][cell2.y].bottom = false;
        } 
        else if( cell1.y==cell2.y && cell1.x==(cell2.x-1) ) { // right cell
            maze[cell1.x][cell1.y].right = false;
            maze[cell2.x][cell2.y].left = false;
            
        }
        else if( cell1.y==cell2.y && cell1.x==(cell2.x+1) ){ // left cell
            maze[cell1.x][cell1.y].left = false;
            maze[cell2.x][cell2.y].right = false;
        }
    };
    
    var create_entrance_or_exit = function(cell) {
        // detect maze edges bordering cell
        var edges = [];
        
        if( cell.x == 0 ) {
            edges.push('left');
        }
        else if( cell.x == (cols-1) ) {
            edges.push('right');
        }
        
        if( cell.y == 0 ) {
            edges.push('top');
        }
        else if( cell.x == (rows-1) ) {
            edges.push('bottom');
        }
        
        if( edges.length > 0 ) {
            var random_edge = array_rand(edges);
            maze[cell.x][cell.y][random_edge] = false;
        }
    }

    // pushing to visited:
    // visited.push([x,y]);
    
    // pushing and popping on stack
    // stack.push([x,y]);
    // cell = stack.pop();
    
    // Building the maze here
    
    var cell = {};
    var starting_edge = array_rand(['x','y']);
    
    if(starting_edge === 'x') {
        cell = {x: 0, y: rand(0, rows)};
    }
    else {
        cell = {x: rand(0, cols), y: 0};
    }

    create_entrance_or_exit(cell);

    var neighbor = false;
    var unvisited = [];

    var maybe_push_visited = function(cell) {
        var stringified_cell = stringify_cell(cell);
        if(!in_array(stringified_cell,visited)) {
            visited.push(stringified_cell);
        }
    };
    
    var is_edge_cell = function(cell) {
        var edges = [(cols-1),(rows-1)];
        return ( in_array(cell.x,edges) || in_array(cell.y,edges) );
    };

    var last_edge_cell = false;

    while( visited.length < cell_count ) {
        // track to calculate exit cell
        if( is_edge_cell(cell) ) {
            last_edge_cell = cell;
        }

        unvisited = get_unvisited_neighbors( cell.x, cell.y, cols, rows );
        if( unvisited.length > 0 ) {
            maybe_push_visited(cell);
            stack.push(cell);
            neighbor = array_rand(unvisited);
            break_wall(cell, neighbor);
            cell = neighbor;
        }
        else {
            maybe_push_visited(cell);
            cell = stack.pop();
        }
    }

    create_entrance_or_exit(last_edge_cell);

    return maze;
};

var draw_maze = function(id, maze, width) {
    // Using an html5 canvas to draw the grid
    var cell_size = width / maze.length;
    
    var canvas = document.getElementById(id);
    var context = canvas.getContext('2d');

    var draw_cell = function( x, y ) {
        var cell = maze[x][y];
        
        // Mapping cells to pixel values
        var corners = { top_left: { x: x*cell_size,
                                    y: y*cell_size },
                        top_right: { x: (x+1)*cell_size,
                                     y: y*cell_size },
                        bottom_right: { x: (x+1)*cell_size,
                                        y: (y+1)*cell_size },
                        bottom_left: { x: x*cell_size,
                                       y: (y+1)*cell_size } };

        context.strokeStyle = '#000000';
        
        context.clearRect(corners.top_left.x-1, corners.top_left.y-1, cell_size+2, cell_size+2);

        // draw Top
        if( cell.top ) {
            context.moveTo( corners.top_left.x, corners.top_left.y );
            context.lineTo(corners.top_right.x, corners.top_right.y);
            context.stroke();
        }

        // draw right
        if( cell.right ) {
            context.moveTo( corners.top_right.x, corners.top_right.y );
            context.lineTo(corners.bottom_right.x, corners.bottom_right.y);
            context.stroke();
        }

        // draw bottom
        if( cell.bottom ) {
            context.moveTo( corners.bottom_right.x, corners.bottom_right.y );
            context.lineTo(corners.bottom_left.x, corners.bottom_left.y);
            context.stroke();
        }

        // draw left
        if( cell.left ) {
            context.moveTo( corners.bottom_left.x, corners.bottom_left.y );
            context.lineTo(corners.top_left.x, corners.top_left.y);
            context.stroke();
        }
    };

    context.beginPath();

    for(var c = 0;c < maze.length;c = c + 1) {
        for(var r = 0; r < maze[c].length; r = r + 1) {
            draw_cell(c,r);
        }
    }
};