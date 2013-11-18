$(document).ready(function() {
    var load_page = function(pagename,data, success_function) {
        $.get('templates/'+pagename+'.html', function(templates) {
            var template = $(templates).filter('#tpl-'+pagename).html();
            $('#content').html(Mustache.render(template, data));
            success_function();
        });
    }
    
    load_page('welcome',{}, function() {});
    
    $("#content").on('click','#start',function() {
        load_page("level",{level: 1}, function() {
            var maze = generate_maze(13,13);
            draw_maze('labyrinth',maze,$('#content').width());
        });
    });

    $("#content").on('labyrinth_solved','#labyrinth',function() {
        var clevel = $(this).data('level');
        $.get('templates/next.html', function(templates) {
            var template = $(templates).filter('#tpl-next').html();
            $('#next_level_wrapper').html(Mustache.render(template, {level: clevel}));
        });
    });
    
    $("#content").on('click','#next_level',function() {
        var nlevel = parseInt($(this).data('level')) + 1;
        if(nlevel > 10) {
            load_page('winner');
        }
        else {
            load_page("level",{level: nlevel}, function() {
                var size = (parseInt(nlevel,10) * 3) + 10;
                var maze = generate_maze(size,size);
                draw_maze('labyrinth',maze,$('#content').width());
            }); 
        }
    });
});
