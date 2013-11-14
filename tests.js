describe('To-Do App Tests', function() {
    describe('Add Item Function', function() {
        
        beforeEach(function() {
            $('body')
                .append('<input id="itemEntry" value="Test item">')
                .append('<ul id="items">');
            
            app.init();
        });
        
        it('should add styled items to the list', function() {
            var spyV = sinon.spy(app.update, 'visibility'),
                spyR = sinon.spy(app.update, 'remaining'),
                event = jQuery.Event('keydown', { 'which': 13 });
            
            console.log(JSON.stringify(event));
            $('#itemEntry').trigger(event);
            
            var $todo = $('.todo');
            
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