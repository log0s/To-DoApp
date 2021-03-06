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
    $toDoItem = $('<li class="todo"><span class="grab invisible"></span><label class="toDoText"></label><input class="toDoInput"></input><span class="remove" style="display: none"></span></li>');

var app = {
    init: function() {
        //$helpDisplay.append("<ul><li><span class='helpStrong'>Click</span> on an item's text to set it as completed or not completed</li><li><span class='helpStrong'>Double click</span> on an item's text to edit it</li><li><span class='helpStrong'>Click and hold</span> on an item to drag it and reorder your list</li><li><span class='helpStrong'>Click</span> on an item's <span class='glyphicon glyphicon-remove'></span> to remove the item</li><li><span class='helpStrong'>Click</span> on the <span class='helpStrong'>All/Active/Completed</span> selectors to display different item types</li><li><span class='helpStrong'>Click</span> on the help icon to lock this dialog open</li></ul>");  //create help display from JS to keep HTML cleaner
        
        $itemEntry.keydown(app.item.add);
        
        $selectors
            .click(app.item.filter)
            .mousedown(function(ev){ ev.preventDefault(); }); //prevent cursor from changing to text when clicking these items
        
        /*
        Removed help display functionality
        $help
            .hover(app.help.toggleDisplay)
            .click(app.help.toggleLock)
            .mousedown(function(ev) { ev.preventDefault(); }); //prevent cursor from changing to text when clicking this item
        */
        
        $items
            .on('sortstart sortstop', app.update.sortState)
            .delegate('.remove', 'click', app.item.remove)
            .delegate('.toDoText', 'click', app.item.click)
            .delegate('.todo', 'mouseenter mouseleave', app.update.iconState)
            .delegate('.todo', 'dblclick', app.item.startEdit)
            .sortable( {containment: 'parent', 
                        cursor: '-webkit-grabbing',
                        opacity: '0.8',
                        update: app.storage.save} );
    },
    
    storage: {
        load: function() {
            todoItems = JSON.parse(localStorage.todos);
        
            for (var item in todoItems) {
                var newItem = app.item.create(todoItems[item]);
            
                if (todoItems[item].completed)
                    newItem.addClass('completed'); 
        
                newItem.appendTo($items);
            }
        
            app.update.remaining();
        },
    
        save: function() {
            todoItems = {}; //clear previous data
        
            $('.todo').each(function(i) {
                var $this = $(this),
                    key = 'todo' + i.toString(),
                    current = { text: '', completed: false };
            
                if ($this.hasClass('completed')) { current.completed = true; }
            
                current.text = $this.find('.toDoText').text();
            
                todoItems[key] = current;
            });
                        
            localStorage.todos = JSON.stringify(todoItems);
        }
    },
    
    item: {
        create: function(object) {
            return $toDoItem
                        .clone()
                        .find('.toDoText, .toDoInput')
                            .val(object.text)
                            .text(object.text)
                        .end();
        },
                   
        add: function(ev) {
            var entry = $itemEntry.val();
            
            if ((ev.which === 13) && (entry !== '')) {
                var newItem = app.item.create( { text: entry } ).appendTo($items);
            
                $itemEntry.val('');
                
                app.update.visibility(newItem);
                app.update.remaining();
            }
        },
    
        remove: function(ev) {
            $(ev.target).closest('li').remove();
        
            app.update.remaining();
        },
    
        click: function(ev) {
            clicks++;
        
            if (clicks === 1) {
                timer = setTimeout(function() {
                    app.item.toggle(ev);
                    clicks = 0; //reset counter if action is performed
                }, delay);
            }
            else {
                clearTimeout(timer);
                app.item.startEdit(ev);
                clicks = 0; //reset counter if action is performed
            }
        },
            
        toggle: function(ev) {
            var $target = $(ev.target).closest('li').toggleClass('completed');
        
            app.update.visibility($target);
            app.update.remaining();
        },
    
        startEdit: function(ev) {
            var $target = $(ev.target),
                label = 'toDoText';

            app.update.hideIcons();

            if (!$target.hasClass(label))
                $target = $target.hasClass('todo') ? $target.find('.' + label) : $target.siblings('.' + label);

            $target
                .hide()
                .siblings('.toDoInput')
                    .show()
                    .focus()
                    .on('keypress blur', app.item.submitEdit);
        },
        
        submitEdit: function(ev) {
            if ((ev.which === 13) || (ev.type === 'blur')) {
                var $target = $(ev.target),
                    text = $target.val();
            
                if (text === ''){
                    app.item.remove(ev); //remove item if all text is deleted
                }
                else {
                    $target
                        .hide()
                        .siblings('.toDoText')
                            .text(text)
                            .show();
                }
            
                app.update.remaining();
                app.storage.save();
            }
        },
        
        filter: function(ev) {
            var $todos = $items.find('li');
        
            $todos.hide();
            
            $selectors.removeClass('selected');
            $(ev.target).addClass('selected');
        
            switch(ev.target.id) {
                    case 'All':
                        $todos.show();
                        break;
                
                    case 'Active':
                        $todos.not('.completed').show();
                        break;
                
                    case 'Completed':
                        $todos.filter('.completed').show();
                        break;
            }
        }
    },
    
    update: {
        remaining: function() {
            var count,
                length = $items.find('li').length,
                notCompleted = length - $items.find('li.completed').length;
        
            if (length === 0) {
                $statusBar.hide();
            }
            else if (notCompleted === 1) {
                count = '1 item left';
            }
            else {
                count = notCompleted.toString() + ' items left';
            }
        
            if (($statusBar.css('display') === 'none') && (length >= 1)) {
                $statusBar.show();
            }
        
            $remaining.text(count);
            
            app.storage.save();
        },
    
        visibility: function($target) {
            var completed = $target.hasClass('completed'),
                selected = $selectors.filter('.selected').attr('id');
            
            if((completed && (selected === 'Active')) || (!completed && (selected === 'Completed'))) {
                $target.closest('li').hide();
            }
        },
        
        sortState: function(ev) {
            if (ev.type === 'sortstart') {
                sorting.state = true;
                sorting.target = ev.toElement;
            }
            else {
                sorting = false;
            }
        },
        
        iconState: function(ev) {
            var target = ev.target,
                $target = $(target);

            if ((!sorting.state) || (target === sorting.target)) {
                if(ev.type === 'mouseenter') {
                    if($target.hasClass('toDoText')) {
                        $target
                            .siblings('.remove')
                                .show()
                            .end()
                            .siblings('.grab')
                                .removeClass('invisible');
                    }
                    else {
                        $target
                            .find('.remove')
                                .show()
                            .end()
                            .find('.grab')
                                .removeClass('invisible');
                    }
                }
                else {
                    app.update.hideIcons();
                }
            }
        },

        hideIcons: function() {
            $('.remove').hide();
            $('.grab').addClass('invisible');
        }
    }

    /*
    Removed help menu functionality

    help: {
        toggleDisplay: function() {
            if(!locked)
                $helpDisplay.toggle();
        },
    
        toggleLock: function() {
            locked = !locked;
        
            var icon = locked ? 'images/help-lock.png' : 'images/help.png';
            $help.css('background-image', 'url(' + icon + ')');
        },
    }
    */
};

$(function() {
    app.init();
    app.storage.load();
});