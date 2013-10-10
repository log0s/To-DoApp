//Create jQuery objects for commonly used DOM elements and default to-do element
var $itemEntry = $('#itemEntry'),
    $items = $('#items'),
    $statusBar = $('#statusBar'),
    $remaining = $('#remaining'),
    $selector = $('#selector'),
    $toDoItem = $('<li class="todo list-group-item"><span class="toDoText"></span><span class="remove glyphicon glyphicon-remove"></span></li>');

//Object to contain all app functions
var app = {
    init: function() {        
        $itemEntry.keydown(app.addItem);
        $items
            .on('click', '.remove', app.removeItem)
            .on('click', '.toDoText', app.completeItem);
        
        },
        
    getInput: function() {
        return $itemEntry.val();
    },
    
    clearInput: function() {
        $itemEntry.val('');
    },
        
    addItem: function(ev) {
        var text = app.getInput();
        
        if ((ev.which === 13) && (text !== '')) {
            $toDoItem
                .clone()
                .find('.toDoText')
                    .text(text)
                .end()
                .appendTo($items);
            
            app.clearInput();
            app.updateCount();
        }
    },
        
    removeItem: function(ev) {
        $(ev.target)
            .closest('li')
            .remove();
        
        app.updateCount();
    },
    
    completeItem: function(ev) {
        var $target = $(ev.target);
        
        if($target.hasClass('completed')) {
            $target.removeClass('completed');
        }
        else {
            $target.addClass('completed');
        }
        
        app.updateCount();
    },
    
    updateCount: function() {
        var count,
            length = $items.find('li').length;
            notCompleted = length - $items.find('.completed').length;
        
        if (length === 0) {
            $statusBar.toggle();
        }
        else if ((length === 1) && (notCompleted === 1)) {
            count = '1 item left';
            if ($statusBar.css('display') === 'none') {
                $statusBar.toggle();
            }
        }
        else {
            count = notCompleted.toString() + ' items left';
        }
        
        $remaining.text(count);
    }
};

$(function() {
    app.init();
});