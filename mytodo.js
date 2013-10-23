//Create jQuery objects for commonly used DOM elements and default to-do element as well as variables to detect sorting state/target and lock status of help panel
var sorting = { state: false, target: {} },
    locked = false,
    $itemEntry = $('#itemEntry'),
    $items = $('#items'),
    $statusBar = $('#statusBar'),
    $remaining = $('#remaining'),
    $selectors = $('#selector li'),
    $help = $('#help'),
    $helpDisplay = $('#helpDisplay'),
    $toDoItem = $('<li class="todo list-group-item"><label class="toDoText"></label><input class="toDoInput"></input><span class="remove glyphicon glyphicon-remove"></span></li>');

//Object to contain all app functions
var app = {
    //Binds events to jQuery objects when the page is loaded and creates help display
    init: function() {
        //Create help display from JS to keep HTML cleaner
        $helpDisplay.append("<ul><li><span class='helpStrong'>Click</span> on an item's text to set it as completed or not completed</li><li><span class='helpStrong'>Double click</span> on an item to edit it</li><li><span class='helpStrong'>Click and hold</span> on an item to drag it and reorder your list</li><li><span class='helpStrong'>Click</span> on an item's <span class='glyphicon glyphicon-remove'></span> to remove the item</li><li><span class='helpStrong'>Click</span> on the <span class='helpStrong'>All/Active/Completed</span> selectors to display different item types</li><li><span class='helpStrong'>Click</span> on the help icon to lock this dialog open</li></ul>");
        
        $itemEntry.keydown(app.addItem);
        
        $selectors.click(app.selectItems);
        
        $help
            .hover(app.toggleHelp, app.toggleHelp)
            .click(app.lockHelp);
        
        $items
            .sortable( {containment: 'parent', 
                        cursor: '-webkit-grabbing',
                        opacity: '0.5'} )
            .on('sortstart sortstop', app.checkSort);
        
        $(document)
            .on('click', '.remove', app.removeItem)
            .on('click', '.toDoText', app.toggleItem)
            .on('dblclick', '.todo', app.editItem)
            .on('mouseenter mouseleave', '.todo', app.toggleRemove);
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
        //Checks that the key pressed is enter or that the item is no longer focused
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
    },
    
    //Dynamically updates item visibility based on current display settings
    updateVisibility: function($target) {
        var completed = $target.closest('li').hasClass('completed'),
            selected = $selectors.filter('.selected').attr('id');
        
        if((completed && (selected === 'Active')) || (!completed && (selected === 'Completed'))) {
            $target
                .closest('li')
                    .hide()
                .end()
                .siblings('.remove')
                    .hide();
        }
    },
    
    //Toggles visibility of help display when help button is moused over
    toggleHelp: function() {
        if(!locked) {
            $helpDisplay.toggle('fold');
        }
    },
    
    //Locks or unlocks the help display
    lockHelp: function() {
        locked = !locked;

        $help.css('color', locked ? '#d60000' : '#00a3a3');
    },
    
    //Toggles visibility of remove button when mousing over an item
    toggleRemove: function(ev) {
        var target = ev.target,
            eventType = ev.type,
            $target = $(target);

        if ((!sorting.state) || (target === sorting.target)) {
            if(eventType === 'mouseenter') {
                $target
                    .find('.remove')
                        .show();
            }
            else if (eventType === 'mouseleave') {
                $target
                    .find('.remove')
                        .hide();
            }
        }
    },
    
    //Changes boolean value of a variable if the items are being sorted
    checkSort: function(ev) {
        if (ev.type === 'sortstart') {
            sorting.state = true;
            sorting.target = ev.toElement;
        }
        else {
            sorting = false;
        }
    }
};

$(function() {
    app.init();
});