//Create jQuery objects for commonly used DOM elements and default to-do element
var $itemEntry = $('#itemEntry'),
    $items = $('#items'),
    $statusBar = $('#statusBar'),
    $remaining = $('#remaining'),
    $selectors = $('#selector li'),
    $toDoItem = $('<li class="todo list-group-item"><label class="toDoText"></label><input class="toDoInput"></input><span class="remove glyphicon glyphicon-remove"></span></li>');

//Object to contain all app functions
var app = {
    init: function() {        
        $itemEntry.keydown(app.addItem);
        $items
            .on('click', '.remove', app.removeItem)
            .on('click', '.toDoText', app.toggleItem)
            .on('dblclick', '.todo', app.editItem);
        $selectors.click(app.selectItems);
    },
    
    //Retrieves input from entry field on pressing enter and adds a styled li element    
    addItem: function(ev) {
        var text = $itemEntry.val();
        
        //Checks that the key pressed was enter and the entry field is not blank
        if ((ev.which === 13) && (text !== '')) {
            $toDoItem
                .clone()
                .find('.toDoText')
                    .text(text)
                .end()
                .find('.toDoInput')
                    .val(text)
                .end()
                .appendTo($items);
            
            $itemEntry.val('');
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
    
    //Marks an item as completed/not completed when it is clicked
    toggleItem: function(ev) {
        var $target = $(ev.target);
        $target
            .toggleClass('completed')
            .closest('li')
                .toggleClass('completed');
        
        app.updateCount();
        app.updateVisibility($target);
    },
    
    //Allows editing an item on double click
    editItem: function(ev) {
        $(ev.target)
            .find('.toDoText')
            .hide()
            .siblings('.toDoInput')
                .show()
                .focus()
                .on('keypress blur', app.submitEdit);
    },
        
    //Submits a completed edit on an item
    submitEdit: function(ev) {
        //Check that the key pressed is enter
        if ((ev.which === 13) || (ev.type === 'blur')) {
            var $target = $(ev.target),
            text = $target.val();
            
            //Check whether there is any input
            if (text !== ''){
                $target
                    .hide()
                    .siblings('.toDoText')
                        .text(text)
                        .show();
            }
            //If no input, remove the item
            else {
            app.removeItem(ev);
            }
        }
    },
    
    //Updates the number of non-completed items and toggles visibility of the status bar
    updateCount: function() {
        var count,
            length = $items.find('li').length;
            notCompleted = length - $items.find('li.completed').length;
        
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
        $items.sortable();
    },
    
    //Dynamically updates item visibility based on current display settings
    updateVisibility: function($target) {
        var $targetLI = $target.closest('li'),
            completed = $targetLI.hasClass('completed'),
            selected = $selectors.filter('.selected').text();
        
        //Class is completed and only non-completed items are being shown
        if(completed && (selected === 'Active')) {
            $targetLI.hide();
        }
        //Class is not completed and only completed items are being shown
        else if (!completed && (selected === 'Completed')) {
            $targetLI.hide();
        }
    },
    
    //Toggles between all, non-completed, and completed items via click selection
    selectItems: function(ev) {
        var $todos = $items.find('li'),
            $target = $(ev.target);
        
        $todos.hide();
        $selectors.removeClass('selected');
        
        switch(ev.target.id) {
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