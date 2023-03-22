const Piscina = require('piscina')
const axios = require('axios')
const log = require('./logger')

const {resolve, join} = require('path')
const fetcher = require('./fetcher')
const os = require('os')


async function fetchMultipleUrls(urls, {numThreads = 1} = {}) {
    numThreads = Math.min(os.cpus().length, numThreads)
    log.info(`start processing, number of urls(${urls.length})`)
    if (numThreads <= 0) {
        throw new Error('Number of threads must be greater than zero');
    }
    if (!Array.isArray(urls)) {
        throw new Error('URLs must be provided as an array');
    }

    if (urls.length === 0) {
        return [];
    }

    if (urls.some(url => typeof url !== 'object' || typeof url.url !== 'string' || !url.url.trim())) {
        log.fatal(Error('Invalid URL object'))
    }
    let responses
    let identifier = 0
    for (let url of urls) {
        url.id = identifier
        identifier++;
    }
    if (numThreads === 1) {
        responses = await fetcher(urls);
    } else {
        log.info(`prepare patch processing with  ${numThreads} of threads`)

        const piscina = new Piscina({
            filename: resolve(__dirname, 'fetcher.js'), maxThreads: numThreads
        });

        const chunkSize = Math.ceil(urls.length / numThreads);
        const chunks = [];
        log.info(`chunking the data with rate (${chunkSize}) per thread`)
        for (let i = 0; i < urls.length; i += chunkSize) {
            chunks.push(urls.slice(i, i + chunkSize));
        }

        log.info("start the threads ")
        let workerPromises = chunks.map(chunk => piscina.run(chunk));
        workerPromises = await Promise.allSettled(workerPromises)
        log.debug(workerPromises)
        responses = []
        for (let promise of workerPromises) {
            responses = responses.concat(promise.value)
        }
        log.info("threads finished processing")
        await piscina.destroy();
        log.debug("responses", responses)
    }


    responses.sort((a, b) => (a.id > b.id ? 1 : -1))

    const result = []
    for (let key in responses) {
        result.push(responses[key].response)
    }
    log.info("sorted and mapped the responses")

    return result;
}


module.exports = fetchMultipleUrls
