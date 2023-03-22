const fetchMultipleUrls = require('../index');
const axios = require('axios');
const {responseBuilder, getTheDefaultRequestConfig} = require("./utils");
jest.mock('axios');


describe('fetchMultipleUrls', () => {

    beforeEach(() => {
        axios.request.mockReset();
    });

    it('fetches data from multiple URLs', async () => {
        axios.request
            .mockResolvedValueOnce({ data: { foo: 1 } })
            .mockResolvedValueOnce({ data: { bar: 2 } });

        const urls = [{url:'http://example.com/foo'}, {url:'http://example.com/bar'}];

        const responses = await fetchMultipleUrls(urls);
        expect(responses).toEqual([responseBuilder({ foo: 1 }), responseBuilder({ bar: 2 })]);
        expect(axios.request).toHaveBeenCalledTimes(2);
        expect(axios.request).toHaveBeenCalledWith(getTheDefaultRequestConfig(urls[0]));
        expect(axios.request).toHaveBeenCalledWith(getTheDefaultRequestConfig(urls[1]));
    });

    it('throws an error if there is a problem fetching data', async () => {
        axios.request.mockRejectedValue(new Error('Could not fetch data'));

        const urls = [{url:'http://example.com/foo'}];
        const responses = await fetchMultipleUrls(urls);
        expect(responses[0]).toEqual(responseBuilder({ error: 'Could not fetch data' }, "", "fail"));
    });

    it('throws an error if the number of threads is zero', async () => {
        const urls = ['http://example.com/foo'];

        await expect(fetchMultipleUrls(urls, {numThreads:0})).rejects.toThrow(/Number of threads must be greater than zero/);
    });
});