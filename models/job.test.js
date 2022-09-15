"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Company = require("./company.js");
const { findAll } = require("./job.js");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function() {
    const newJob = {
        id: expect.any(Number),
        title: "new",
        salary: 100000,
        equity: "1.0",
        company_handle: "c1"
    };

    test("works", async function() {
        let job = await Job.create(newJob);
        expect(job).toEqual(newJob);
    });
});


/***************************************findAll */

describe("findAll", function() {
    test("works: no filter", async function() {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "Job1",
                salary: 100,
                equity: '0.1',
                company_handle: 'c1'
            },
            {
                id: expect.any(Number),
                title: "Job2",
                salary: 200,
                equity: '0.2',
                company_handle: 'c1'
            },
            {
                id: expect.any(Number),
                title: "Job3",
                salary: 300,
                equity: '0',
                company_handle: 'c1'
            },
            {
                id: expect.any(Number),
                title: "Job4",
                salary: null,
                equity: null,
                company_handle: 'c1'
            }
        ])
    })
})


/********************************************* get specific job */

describe("get", function() {
    test("works", async function() {
        let job = await Job.get(testJobIds[0]);
        expect(job).toEqual({
            title: "Job1",
            salary: 100,
            equity: '0.1',
            company_handle: 'c1'
        })
    })
})

/******************************************************update */

describe("update", function() {
    const updateData = {
        title: "new",
        salary: 400,
        equity: '0.5',
    };

    test("works", async function(){
        let job = await Job.update(testJobIds[0], updateData);
        expect(job).toEqual({
            id: testJobIds[0],
            company_handle: 'c1',
            ...updateData
        })
    })

    test("works: null fields", async function () {
        const updateDataSetNulls = {
          title: "new2",
          salary: null,
          equity: null
        };
    
        let job = await Job.update(testJobIds[0], updateDataSetNulls);
        expect(job).toEqual({
            id: testJobIds[0],
            company_handle: 'c1',
          ...updateDataSetNulls,
        });
    });

    test("not found if no such job", async function () {
        try {
          await Job.update(0, updateData);
          fail();
        } catch (err) {
          expect(err instanceof NotFoundError).toBeTruthy();
        }
      });

    test("bad request with no data", async function () {
    try {
        await Job.update(0, {});
        fail();
    } catch (err) {
        expect(err instanceof BadRequestError).toBeTruthy();
    }
    });
});

/*****************************************************delete */
describe("delete", function() {
    test("works", async function() {
        await Job.remove(testJobIds[0]);
        const res = await db.query(
            `SELECT id FROM jobs WHERE id=${testJobIds[0]}`)
        expect(res.rows.length).toEqual(0);
    })

    test("no such company found", async function() {
        try {
            await Job.remove(0);
            fail(); 
        } catch(err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    })
})