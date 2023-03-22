const axios = require("axios");
const express = require('express');
const fetchMultipleUrls = require('../index');
const app = express();
const port = 3000;

function responseBuilder(data, code = 200, status = "success") {
    return {
        code, data, status
    }
}

async function startServer() {
    return new Promise((resolve, reject) => {
        app.get('/api/users/:id', async (req, res) => {
            const {id} = req.params;
            return res.status(200).json({
                data: {
                    user_id: id
                }
            })
        })
        app.get('/api/slow/:delay', (req, res) => {
            const {delay} = req.params;
            setTimeout(() => {
                res.send(`Response delayed by ${delay}ms`);
            }, delay);
        });
        app.get('/api/fail', (req, res) => {
            return res.status(500).json({
                error: "failed to process the request"
            })
        });
        app.get('/api/health', (req, res) => {
            return res.status(200).json({})
        });
        server = app.listen(port, (err) => {
            if (err) {
                reject(err);
            } else {
                console.log(`Server listening on port ${port}`);
                resolve();
            }
        });
    });

}

describe('fetchMultipleUrls with concurrency', () => {
    let server;

    beforeAll(async () => {
        await startServer()
        let i = 0
        let result
        while (i < 5) {
            result = await fetch("http://localhost:" + port + "/api/health")
            console.log("waiting for the server to start")
            if (result.status === 200) {
                break
            }
            await new Promise((resolve, reject) => setTimeout(resolve, (i + 1) * 1000))
            i++
        }
        expect(result.status).toEqual(200)
    }, 10000);

    afterAll(() => {
        return new Promise((resolve, reject) => {
            server.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('Server closed');
                    resolve();
                }
            });
        });
    });

    it('fetches data from multiple URLs with multiple threads', async () => {

        const urls = [{url: `http://localhost:${port}/api/users/1`}, {url: `http://localhost:${port}/api/slow/8000`}, {url: `http://localhost:${port}/api/users/20`}, {url: `http://localhost:${port}/api/fail`}, {url: `http://localhost:${port}/api/users/3000`},];

        const responses = await fetchMultipleUrls(urls, {numThreads: 2});
        expect(responses[0]).toEqual(responseBuilder({
            data: {"user_id": "1"}
        }))
        expect(responses[1]).toEqual(responseBuilder({error: 'timeout of 200ms exceeded'}, 'ECONNABORTED', 'fail'))
        expect(responses[2]).toEqual(responseBuilder({
            data: {"user_id": "20"}
        }))
        expect(responses[3]).toEqual(responseBuilder({error: "failed to process the request"}, 500, 'fail'))
        expect(responses[4]).toEqual(responseBuilder({
            data: {"user_id": "3000"}
        }))
    }, 90000);
})