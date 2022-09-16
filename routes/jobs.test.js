"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************************* POST /jobs */

describe("POST /jobs", function() {
    const newJob = {
        "title": "NEW JOB",
        "salary": 100,
        "equity": "0.5",
        "company_handle": "c1"
    };

    test("ok for admins", async function() {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(201);
        expect(resp.body).toEqual({
            job: {
                id: expect.any(Number),
                title: "NEW JOB",
                salary: 100,
                equity: "0.5",
                company_handle: "c1",
              },
        });
    });

    test("bad request with missing data", async function() {
        const resp = await request(app)
        .post("/jobs")
        .send({
          "title": "NEW JOB"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
    });

    test("bad request with invalid data", async function() {
        const resp = await request(app)
        .post("/jobs")
        .send({
          title: "NEW JOB",
          salary: "100000",
          equity: "0.3",
          company_handle: "c1"
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
    })

    test("unauth for non-admin", async function() {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
    });

    test("unauth for anon", async function() {
        const resp = await request(app)
            .post("/jobs")
            .send(newJob)
        expect(resp.statusCode).toEqual(401);
    })
});

/**************************************************GET /jobs */

describe("GET /jobs", function() {
    test("ok for anon and no filter", async function() {
        const resp = await request(app).get("/jobs");
        expect(resp.body).toEqual({
            jobs: [
                {
                    title: "new job 1",
                    salary: 100, 
                    equity: "0.3",
                    company_handle: "c1"
                },
                {
                    title: "new job 2",
                    salary: 200, 
                    equity: "0.4",
                    company_handle: "c2"
                },
            ]
        });
    });

    test("ok for anon with filter", async function() {
      const resp = await request(app).get("/jobs?minSalary=200");
        expect(resp.body).toEqual({
            jobs: [
                {
                    title: "new job 2",
                    salary: 200, 
                    equity: "0.4",
                    company_handle: "c2"
                },
            ]
        });
    });

});



/******************************************************GET /jobs/:id */

describe("GET /jobs/:id", function() {
    test("works for anon", async function() {
        const resp = await request(app).get(`/jobs/${testJobIds[0]}`);
        console.log(testJobIds[0])
        expect(resp.body).toEqual({ job: {
                title: "new job 1",
                salary: 100,
                equity: "0.3",
                company_handle: "c1"
            }
        });
    });

    test("not found for no such job", async function() {
        const resp = await request(app).get('/jobs/0');
        expect(resp.statusCode).toEqual(404);
    })
})

/***********************************************************PATCH /jobs/:id */

describe("PATCH /jobs/:id", function() {
    test("unauth for anon", async function() {
        const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
    });

    test("unauth for non-admin", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
              title: "C1-new",
            }).set("authorization", `Bearer ${u1Token}`);;
        expect(resp.statusCode).toEqual(401);
      });

      test("not found on no such job", async function () {
        const resp = await request(app)
            .patch(`/jobs/0`)
            .send({
              title: "new nope",
            }).set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
      });
    
      test("bad request on id change attempt", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
              id: 900000000,
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
      });

      test("bad request on invalid data", async function () {
        const resp = await request(app)
            .patch(`/jobs/${testJobIds[0]}`)
            .send({
              salary: "not-a-url",
            })
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(400);
      });

      test("works for admin", async function() {
        const resp = await request(app)
        .patch(`/jobs/${testJobIds[0]}`)
        .send({
          title: "C1-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({
            job: {
                id: testJobIds[0],
                title: "C1-new",
                salary: 100,
                equity: "0.3",
                company_handle: "c1"
                },
            });
        });
});


/***************************************************DELETE /jobs/:id */

describe("DELETE /jobs/:id", function() {
    test("works for admins", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.body).toEqual({ deleted: `${testJobIds[0]}` });
      });

      test("unauth for anon", async function () {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`);
        expect(resp.statusCode).toEqual(401);
      });

      test("unauth for non-admin", async function() {
        const resp = await request(app)
            .delete(`/jobs/${testJobIds[0]}`)
            .set("authorization", `Bearer ${u1Token}`);
        expect(resp.statusCode).toEqual(401);
      });

      test("not found for no such job", async function () {
        const resp = await request(app)
            .delete(`/jobs/0`)
            .set("authorization", `Bearer ${adminToken}`);
        expect(resp.statusCode).toEqual(404);
      });
    
})