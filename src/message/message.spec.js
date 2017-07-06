describe("Message", function() {

    var message;

    beforeEach(function() {
        message = new Message({text: "some text", type: Message.Type.ERROR});
    });

    afterEach(function() {
        message = null;
    });

    describe("getCssClasses", function() {

        it("should return type.colorClass plus message--visible if visible", function() {
            message.visible(true);

            expect(message.getCssClasses()).toBe("message--visible " + Message.Type.ERROR.colorClass);
        });

        it("should return type.colorClass if not visible", function() {
            message.visible(false);

            expect(message.getCssClasses()).toBe(Message.Type.ERROR.colorClass);
        });
    });
});