describe('To-Do App Tests', function() {
    describe('Add Item Function', function() {
        
        beforeEach(function() {
            $('body')
                .append('<input id="itemEntry" value="Test item">')
                .append('<ul id="items">');
        });
        
        it('should add styled items to the list', function() {
            var spyV = sinon.spy(app.update, 'visibility'),
                spyR = sinon.spy(app.update, 'remaining');
            
            app.item.add( { which: 13 } );
            
            var $todo = $('#items.todo');
            
            expect($todo.length).to.equal(1);
            expect($todo.find('toDoText').text()).to.equal('Test item');
            
            expect(spyV.callCount).to.equal(1);
            expect(spyR.callCount).to.equal(1);
        });
        
                
        afterEach(function() {
            $('#itemEntry, #items').remove();
        });
    });
});