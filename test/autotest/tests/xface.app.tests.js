describe("App (xFace.app)", function () {
    it("xface.app.spec.1 should exist", function () {
        expect(xFace.app).toBeDefined();
    });

    it("xface.app.spec.2 should contain an addEventListener function", function () {
        expect(typeof xFace.app.addEventListener).toBeDefined();
        expect(typeof xFace.app.addEventListener == 'function').toBe(true);
    });

    it("xface.app.spec.3 should contain a sendMessage function", function () {
        expect(typeof xFace.app.sendMessage).toBeDefined();
        expect(typeof xFace.app.sendMessage == 'function').toBe(true);
    });

    it("xface.app.spec.4 should contain a close function", function() {
        expect(typeof xFace.app.close).toBeDefined();
        expect(typeof xFace.app.close == 'function').toBe(true);
    });
});
