describe('To-Do App Tests', function() {
    describe('Add Item Function', function() {
        
        beforeEach(function() {
            $('body')
                .append('<input id="itemEntry" value="Test item">')
                .append('<ul id="items">');
        });
        
        afterEach(function() {
            $('#itemEntry, #items').remove();
        });
        
        it('should add styled items to the list', function() {
            app.item.add( { which: 13 } );
            
            var $todo = $('#items.todo');
            
            expect($todo.length).to.equal(1);
            expect($todo.find('label').text()).to.equal('Test item');
        });
    });
});