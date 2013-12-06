describe("App (xFace.app)", function () {
    it("should exist", function () {
        expect(xFace.app).toBeDefined();
    });

    it("should contain a addEventListener function", function () {
        expect(typeof xFace.app.addEventListener).toBeDefined();
        expect(typeof xFace.app.addEventListener == 'function').toBe(true);
    });

    it("should contain a sendMessage function", function () {
        expect(typeof xFace.app.sendMessage).toBeDefined();
        expect(typeof xFace.app.sendMessage == 'function').toBe(true);
    });

    it("should contain a close function", function() {
        expect(typeof xFace.app.close).toBeDefined();
        expect(typeof xFace.app.close == 'function').toBe(true);
    });
});
