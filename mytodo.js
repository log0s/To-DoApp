//Create jQuery objects for commonly used DOM elements and default to-do element
var $itemEntry = $('#itemEntry'),
    $items = $('#items'),
    $statusBar = $('#statusBar'),
    $remaining = $('#remaining'),
    $selector = $('#selector'),
    $toDoItem = $('<li class="todo list-group-item"></li>');

//Object to contain all app functions
var app = {
    init: function() {        
        $itemEntry.keydown(app.addItem);
        $items.on('click', '.remove', app.removeItem);
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
                .html(text + '<span class="remove glyphicon glyphicon-remove"></span>')
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
    
    updateCount: function() {
        var length = $items.find('li').length,
            count = '';
        
        if (length === 1) {
            count = '1 item left';
        }
        else {
            count = length.toString() + ' items left';
        }
        
        $remaining.text(count);
    }
};

$(function() {
    app.init();
});