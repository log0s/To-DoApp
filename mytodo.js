var app = {
    init: function() {
        //Create jQuery objects for commonly used DOM elements and default to-do element
        var $itemEntry = $('#itemEntry'),
            $items = $('#items'),
            $statusBar = $('#statusBar'),
            $remaining = $('#remaining'),
            $selector = $('#selector'),
            $toDoItem = $('<li class="todo list-group-item"></li>');
        
        $itemEntry.keydown(app.addItem);
        $items.on('click', '.remove', app.removeItem);
        },
        
        getItem: function() {
            return $itemEntry.val();
        },
        
        addItem: function(ev) {
            if (ev.which === 13) {
                $toDoItem
                    .clone()
                    .html(app.getItem + '<span class="remove glyphicon glyphicon-remove"></span>')
                    .appendTo($items);
            }
        },
        
        removeItem: function(ev) {
            $(ev.target)
                .parent()
                .remove();
        }
});