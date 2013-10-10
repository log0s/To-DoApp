//Create jQuery objects for commonly used DOM elements and default to-do element
var $itemEntry = $('#itemEntry'),
    $items = $('#items'),
    $statusBar = $('#statusBar'),
    $remaining = $('#remaining'),
    $selectors = $('#selector li'),
    $toDoItem = $('<li class="todo list-group-item"><span class="toDoText"></span><span class="remove glyphicon glyphicon-remove"></span></li>');

//Object to contain all app functions
var app = {
    init: function() {        
        $itemEntry.keydown(app.addItem);
        $items
            .on('click', '.remove', app.removeItem)
            .on('click', '.toDoText', app.toggleItem)
            .on('dblclick', 'toDoText', app.editItem);
        $selectors.click(app.selectItems);
        },
        
    getInput: function() {
        return $itemEntry.val();
    },
    
    clearInput: function() {
        $itemEntry.val('');
    },
    
    //Retrieves input from entry field on pressing enter and adds a styled li element    
    addItem: function(ev) {
        var text = app.getInput();
        
        //Checks that the key pressed was enter and the entry field is not blank
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
    
    //Removes an item upon clicking on the X glyphicon on its right
    removeItem: function(ev) {
        $(ev.target)
            .closest('li')
            .remove();
        
        app.updateCount();
    },
    
    //Marks an item as completed when it is clicked
    toggleItem: function(ev) {
        var $target = $(ev.target);
        $target
            .closest('li')
            .toggleClass('completed');
        
        app.updateCount();
        app.updateVisibility($target);
    },
    
    //Updates the number of non-completed items and toggles visibility of the status bar
    updateCount: function() {
        var count,
            length = $items.find('li').length;
            notCompleted = length - $items.find('.completed').length;
        
        //No items in the list
        if (length === 0) {
            $statusBar.toggle();
        }
        //Exactly one non-completed item in the list
        else if (notCompleted === 1) {
            count = '1 item left';
            if ($statusBar.css('display') === 'none') {
                $statusBar.toggle();
            }
        }
        //All other cases
        else {
            count = notCompleted.toString() + ' items left';
        }
        
        $remaining.text(count);
    },
    
    //Dynamically updates item visibility based on currently display settings
    updateVisibility: function($target) {
        var $targetLI = $target.closest('li'),
            check = $targetLI.hasClass('completed'),
            selected = $selectors.filter('.selected').text();
        
        //Class is completed and only non-completed items are being shown
        if(check && (selected === 'Active')) {
            $targetLI.hide();
        }
        //Class is not completed and only completed items are being shown
        else if (!check && (selected === 'Completed')) {
            $targetLI.hide();
        }
    },
    
    //Toggles between all, non-completed, and completed items via click selection
    selectItems: function(ev) {
        var $todos = $items.find('li'),
            $target = $(ev.target);
        
        $todos.hide();
        $selectors.removeClass('selected');
        
        switch($target.text()) {
                case 'All':
                    $todos.show();
                    $target.addClass('selected');
                    break;
                
                case 'Active':
                    $todos
                        .not('.completed')
                        .show();
                    $target.addClass('selected');
                    break;
                
                case 'Completed':
                    $todos
                        .filter('.completed')
                        .show();
                    $target.addClass('selected');
                    break;
        }
    }
};

$(function() {
    app.init();
});