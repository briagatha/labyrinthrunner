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
};

var parse_cell_string = function(cell_string) {
    var split = cell_string.split(",");
    return { x: parseInt(split[0],10), y: parseInt(split[1],10) };
};

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
        var top = 0;
        var right = (cols-1);
        var bottom = (rows-1);
        var left = 0;
        
        if( cell.x == left ) {
            edges.push('left');
        }
        else if( cell.x == right ) {
            edges.push('right');
        }
        
        if( cell.y == top ) {
            edges.push('top');
        }
        else if( cell.y == bottom ) {
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
    
    var start_cell = cell;

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
        return ( cell.x == (cols-1) || cell.y == (rows-1) );
    };

    var end_cell = false;

    while( visited.length < cell_count ) {
        // track to calculate exit cell
        if( is_edge_cell(cell) ) {
            end_cell = cell;
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

    create_entrance_or_exit(end_cell);

    return { start_cell: start_cell, end_cell: end_cell, maze: maze };
};

var draw_maze = function(id, mz, width) {
    var maze = mz.maze;
    
    // Using an html5 canvas to draw the grid
    var cell_size = width / maze.length;
    var height = cell_size * maze[0].length;
    
    var stage = new Kinetic.Stage({
        container: id,
        width: width,
        height: height
    });
    
    var layer = new Kinetic.Layer();
    
    // Maze coordinates to canvas pixel coordinates
    var get_cell_corners = function( cell ) {
        // Mapping cells to pixel values
        return { top_left: { x: cell.x*cell_size,
                             y: cell.y*cell_size },
                 top_right: { x: (cell.x+1)*cell_size,
                              y: cell.y*cell_size },
                 bottom_right: { x: (cell.x+1)*cell_size,
                                 y: (cell.y+1)*cell_size },
                 bottom_left: { x: cell.x*cell_size,
                                y: (cell.y+1)*cell_size } };
    };
    
    // Canvas pixel coordinates to maze coordinates
    var get_cell_from_coords = function( x, y ) {
        var cell = {};
        
        cell.x = parseInt( ( x / cell_size ), 10 );
        cell.y = parseInt( ( y / cell_size ), 10 );
        
        return cell;
    };

    var draw_cell = function( cell ) {
        var edges = maze[cell.x][cell.y];
        
        // Mapping cells to pixel values
        var corners = get_cell_corners( cell );

        // draw Top
        if( edges.top ) {
            layer.add(new Kinetic.Line({
                points: [corners.top_left,corners.top_right],
                stroke: 'black',
                strokeWidth: 1
            }));
        }

        // draw right
        if( edges.right ) {
            layer.add(new Kinetic.Line({
                points: [corners.top_right,corners.bottom_right],
                stroke: 'black',
                strokeWidth: 1
            }));
        }

        // draw bottom
        if( edges.bottom ) {
            layer.add(new Kinetic.Line({
                points: [corners.bottom_right,corners.bottom_left],
                stroke: 'black',
                strokeWidth: 1
            }));
        }

        // draw left
        if( edges.left ) {
            layer.add(new Kinetic.Line({
                points: [corners.bottom_left,corners.top_left],
                stroke: 'black',
                strokeWidth: 1
            }));
        }
    };

    for(var c = 0;c < maze.length;c = c + 1) {
        for(var r = 0; r < maze[c].length; r = r + 1) {
            draw_cell({x:c,y:r});
        }
    }
    
    var start_cell_string = stringify_cell(mz.start_cell);
    var end_cell_string = stringify_cell(mz.end_cell);
    
    var path = [];
    var path_rects = {};
    var path_layer = new Kinetic.Layer();

    var mark_cell = function(cell, color, draggable) {
        var corners = get_cell_corners( cell );
        var pad = cell_size * 0.20;

        if( draggable ) {
            var diff_x = false;
            var diff_y = false;

            path_rects[start_cell_string] =
                new Kinetic.Rect({ x: corners.top_left.x + pad,
                                   y: corners.top_left.y + pad,
                                   width: cell_size - (pad*2),
                                   height: cell_size - (pad*2),
                                   fill: 'blue'
                                });

            path.push(start_cell_string);
            path_layer.add(path_rects[stringify_cell(mz.start_cell)]);
    
            // Bound by maze walls
            var group = new Kinetic.Group({
                draggable: true,
                dragBoundFunc: function(pos,evt) {
                    if( typeof evt == "undefined" ) {
                        return pos;
                    }
                    
                    if(diff_x===false) {
                        diff_x = evt.offsetX - pos.x;
                    }
                    if(diff_y===false) {
                        diff_y = evt.offsetY - pos.y;
                    }

                    var curr_cell = get_cell_from_coords( evt.offsetX, evt.offsetY );
                    var cell_string = stringify_cell(curr_cell);
                    
                    var curr_edges = maze[curr_cell.x][curr_cell.y];
                    var curr_corners = get_cell_corners( curr_cell );
                    var curr_pos = { x: curr_corners.top_left.x - diff_x + pad,
                                     y: curr_corners.top_left.y - diff_y + pad };
                     

                    var last_cell_string = path[ path.length - 1 ];
                    var last_cell = parse_cell_string( last_cell_string );
                    var last_corners = get_cell_corners( last_cell );
                    var last_edges = maze[last_cell.x][last_cell.y];
                    var last_pos = { x: last_corners.top_left.x - diff_x + pad*2,
                                     y: last_corners.top_left.y - diff_y + pad*2};
                    
                    if( in_array(end_cell_string,path) ) {
                        return last_pos;
                    }
                    
                    // See if this move is possible
                    if( ( curr_cell.x == last_cell.x && last_cell.y == ( curr_cell.y + 1 ) && // MOVING UP
                          !curr_edges.bottom && !last_edges.top ) ||
                        ( curr_cell.y == last_cell.y && last_cell.x == ( curr_cell.x - 1 ) && // MOVING RIGHT
                             !curr_edges.left && !last_edges.right ) ||
                        ( curr_cell.x == last_cell.x && last_cell.y == ( curr_cell.y - 1 ) && // MOVING DOWN
                             !curr_edges.top && !last_edges.bottom ) ||
                        ( curr_cell.y == last_cell.y && last_cell.x == ( curr_cell.x + 1 ) && // MOVING LEFT
                          !curr_edges.right && !last_edges.left ) )
                    {
                        if(in_array(cell_string,path)) {
                            old_rect = path_rects[last_cell_string];
                            old_rect.remove();
                            path_layer.draw();
                            path.pop(); // we're going back here
                        }
                        else {
                            var curr_rect = new Kinetic.Rect({
                                x: curr_corners.top_left.x + pad,
                                y: curr_corners.top_left.y + pad,
                                width: cell_size - (pad*2),
                                height: cell_size - (pad*2),
                                fill: 'blue'
                            });
                            path_layer.add(curr_rect);
                            path_layer.draw();
                            path.push(cell_string);
                            path_rects[cell_string] = curr_rect;
                            
                            if( cell_string == end_cell_string ) {
                                $("#" + id).trigger( "labyrinth_solved" );
                            }
                        }

                        return curr_pos;
                    }
                    else {
                        // stay put if there's a wall
                        return last_pos;
                    }
                }
            });
        }

        var rect = new Kinetic.Rect({
            x: corners.top_left.x + pad,
            y: corners.top_left.y + pad,
            width: cell_size - (pad*2),
            height: cell_size - (pad*2),
            fill: color
        });

        if( draggable ) {
            // add cursor styling
            rect.on('mouseover', function() {
                document.body.style.cursor = 'move';
            });

            rect.on('mouseout', function() {
                document.body.style.cursor = 'default';
            });
        }

        if(draggable) {
            group.add(rect);
            layer.add(group);
        }
        else {
            layer.add(rect);
        }
        
    };
    
    mark_cell(mz.end_cell, 'red', false);
    mark_cell(mz.start_cell, 'yellow', true);
    
    stage.add(path_layer);
    stage.add(layer);
};