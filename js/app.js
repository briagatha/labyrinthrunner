$(document).ready(function() {
    var load_page = function(pagename,data) {
        $.get('templates/'+pagename+'.html', function(templates) {
            var template = $(templates).filter('#tpl-'+pagename).html();
            $('#content').html(Mustache.render(template, data));
        });
    }
    
    load_page('welcome',{});
    
    $("#content").on('click','#start',function() {
        load_page("level",{level: 1});
    });

    $("#content").on('click','#complete_labyrinth',function() {
        var clevel = $(this).data('level');
        $.get('templates/next.html', function(templates) {
            var template = $(templates).filter('#tpl-next').html();
            $('#next_level_wrapper').html(Mustache.render(template, {level: clevel}));
        });
    });
    
    $("#content").on('click','#next_level',function() {
        var nlevel = parseInt($(this).data('level')) + 1;
        // TODO: Add logic for limiting the number of levels here
        load_page("level",{level: nlevel}); 
    });
});
