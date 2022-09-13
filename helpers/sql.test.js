//Got help from solution

const {sqlForPartialUpdate} = require("./sql");

describe("sqlPartialUpdate test", function() {
    test("Enter 1 data item", function() {
        const result = sqlForPartialUpdate(
            {k1: "v1"},
            {firstName: "first_name"});
        expect(result).toEqual({
            setCols: "\"k1\"=$1",
            values: ["v1"]
        });
    });

    test("Enter 2 data items", function() {
        const result = sqlForPartialUpdate(
            {k1: "v1", k2: "v2"},
            {firstName: "first_name"})
            
        expect(result).toEqual({
            setCols: "\"k1\"=$1, \"k2\"=$2",
            values: ["v1", "v2"]
        });
    });
});


