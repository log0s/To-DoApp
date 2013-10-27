'use strict';

//Create jQuery objects for commonly used DOM elements and app-wide variables
var sorting = { state: false, target: {} },
    todoItems = {},
    locked = false,
    clicks = 0,
    delay = 300,
    timer = null,
    $itemEntry = $('#itemEntry'),
    $items = $('#items'),
    $statusBar = $('#statusBar'),
    $remaining = $('#remaining'),
    $selectors = $('#selector li'),
    $help = $('#help'),
    $helpDisplay = $('#helpDisplay'),
    $toDoItem = $('<li class="todo"><label class="toDoText"></label><input class="toDoInput"></input><span class="remove" style="display: none"></span></li>');

//Object to contain all app functions
var app = {
    //Binds events to jQuery objects when the page is loaded and creates help display
    init: function() {
        //Create help display from JS to keep HTML cleaner
        $helpDisplay.append("<ul><li><span class='helpStrong'>Click</span> on an item's text to set it as completed or not completed</li><li><span class='helpStrong'>Double click</span> on an item's text to edit it</li><li><span class='helpStrong'>Click and hold</span> on an item to drag it and reorder your list</li><li><span class='helpStrong'>Click</span> on an item's <span class='glyphicon glyphicon-remove'></span> to remove the item</li><li><span class='helpStrong'>Click</span> on the <span class='helpStrong'>All/Active/Completed</span> selectors to display different item types</li><li><span class='helpStrong'>Click</span> on the help icon to lock this dialog open</li></ul>");
        
        $itemEntry.keydown(app.addItem);
        
        $selectors
            .click(app.selectItems)
            .mousedown(app.preventText);
        
        $help
            .hover(app.toggleHelp)
            .click(app.lockHelp)
            .mousedown(app.preventText);
        
        $items
            .sortable( {containment: 'parent', 
                        cursor: '-webkit-grabbing',
                        opacity: '0.5',
                        update: app.saveItems} )
            .on('sortstart sortstop', app.checkSort);
        
        $(document)
            .on('click', '.remove', app.removeItem)
            .on('click', '.toDoText', app.clickItem)
            .on('mouseenter mouseleave', '.todo', app.toggleRemove);
    },
    
    //Loads saved to-do items from local storage and adds them to the DOM
    loadItems: function() {
        todoItems = JSON.parse(localStorage.todos);
        
        for (var item in todoItems) {
            var newItem = app.createItem(todoItems[item]);
            
            //Add completed class if the saved item had it
            if (todoItems[item].completed) {
                newItem
                    .addClass('completed')
                    .find('.toDoText')
                        .addClass('completed')
                        .end()
            }
        
            newItem.appendTo($items);
        }
        
        app.updateCount();
    },
    
    //Stores all to-do items in local storage
    saveItems: function() {
        todoItems = {}; //clear previous data
        
        //Save the text and completed state of every item
        $('.todo').each(function(i) {
            var $this = $(this),
                key = 'todo' + i.toString(),
                current = { text: '', completed: false };
            
            if ($this.hasClass('completed')) {
                current.completed = true;
            }
            
            current.text = $this.find('.toDoText').text();
            
            todoItems[key] = current;
        });
                        
        localStorage.todos = JSON.stringify(todoItems);
    },
    
    //Creates styled li element for use in loadItems and addItem
    createItem: function(item) {
        var text = item.text,
            newItem = $toDoItem
                        .clone()
                        .find('.toDoText')
                            .text(text)
                            .end()
                        .find('.toDoInput')
                            .val(text)
                            .end();
        
        return newItem;
    },
                
    //Add styled li element after pressing enter    
    addItem: function(ev) {
        var entry = $itemEntry.val(),
            which = ev.which;
        
        //If key pressed was enter and entry field is not blank
        if ( (which === 13) && (entry !== '') ) {
            var callItem = { text: entry },
                newItem = app.createItem(callItem);
            
            newItem.appendTo($items);
            
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
    
    //Runs different functions depending on whether an item is clicked or double clicked
    clickItem: function(ev) {
        clicks++; //count number of clicks
        
        if (clicks === 1) {
            timer = setTimeout(function() {
                app.toggleItem(ev);
                clicks = 0; //reset counter if action is performed
            }, delay);
        }
        else {
            clearTimeout(timer);
            app.editItem(ev);
            clicks = 0; //reset counter if action is performed
        }
    },
            
    //Marks an item as completed/not completed when it is clicked
    toggleItem: function(ev) {
        var $target = $(ev.target);
        $target
            .toggleClass('completed')
            .closest('li')
                .toggleClass('completed');
        
        app.updateVisibility($target);
        app.updateCount();
    },
    
    //Allows editing an item on double click
    editItem: function(ev) {
        $(ev.target)
            .hide()
            .siblings('.toDoInput')
                .show()
                .focus()
                .on('keypress blur', app.submitEdit);
    },
        
    //Submits a completed edit on an item
    submitEdit: function(ev) {
        //Check that the key pressed is enter or that the item is no longer focused
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
            
            app.updateCount();
            app.saveItems();
        }
    },
        
    //Toggles between all, non-completed, and completed items via click selection
    selectItems: function(ev) {
        var $todos = $items.find('li');
        
        $todos.hide(); //hide all to-do items
        $selectors.removeClass('selected');
        $(ev.target).addClass('selected');
        
        switch(ev.target.id) {
                case 'All':
                    $todos.show();
                    break;
                
                case 'Active':
                    $todos
                        .not('.completed')
                            .show();
                    break;
                
                case 'Completed':
                    $todos
                        .filter('.completed')
                            .show();
                    break;
        }
    },
    
    //Updates the number of non-completed items and toggles visibility of the status bar
    updateCount: function() {
        var count,
            length = $items.find('li').length,
            notCompleted = length - $items.find('li.completed').length;
        
        //No items in the list
        if (length === 0) {
            $statusBar.hide();
        }
        //Exactly one non-completed item in the list
        else if (notCompleted === 1) {
            count = '1 item left';
        }
        //All other cases
        else {
            count = notCompleted.toString() + ' items left';
        }
        
        //Change status bar visibility based on items in the list
        if ( ($statusBar.css('display') === 'none') && (length >= 1) ) {
                $statusBar.show();
        }
        
        $remaining.text(count);
        app.saveItems();
    },
    
    //Dynamically updates item visibility based on current display settings
    updateVisibility: function($target) {
        var completed = $target.hasClass('completed'),
            selected = $selectors.filter('.selected').attr('id');
        //Item completed and Active selected or item not completed and Completed selected
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
            $helpDisplay.toggle();
        }
    },
    
    //Locks or unlocks the help display
    lockHelp: function() {
        locked = !locked;
    },
    
    //Toggles visibility of remove button when mousing over an item
    toggleRemove: function(ev) {
        var target = ev.target;
        
        //If list is not being sorted or event target is same as sorting target
        if ((!sorting.state) || (target === sorting.target)) {
            if(ev.type === 'mouseenter') {
                $(target)
                    .find('.remove')
                        .show();
            }
            else {
                $('.remove').hide();
            }
        }
    },
    
    //Detects if items are being sorted and assigns a sorting target if they are
    checkSort: function(ev) {
        if (ev.type === 'sortstart') {
            sorting.state = true;
            sorting.target = ev.toElement;
        }
        else {
            sorting = false;
        }
    },
    
    //Prevents the text cursor from showing on click
    preventText: function(ev) {
        ev.preventDefault();
    }
};

$(function() {
    app.init();
    app.loadItems();
});