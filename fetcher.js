const log = require("./logger");
const axios = require("axios");


async function request({url, method = 'get', headers = {}}) {
    log.debug("sending request", {url, method})
    return axios.request({url, method, headers, timeout: 200})
}

function responseParser(response) {
    //todo distinguish server from client errors
    return response.status == "fulfilled" ? {
        status: "success", code: response.value.status || 200, data: response.value.data
    } : {
        status: "fail",
        code: response.reason?.response?.status || response.reason.code || "",
        data: response.reason?.response?.data || {error: response.reason.message || ""}
    }
}

async function fetcher(urls) {
    try {
        log.info(`starting to prepare fetching requests for (${urls.length}) urls`)
        const promises = urls.map(url => request(url));
        const responses = await Promise.allSettled(promises);
        log.debug("got responses", responses)
        const result = []
        for (let key in responses) {
            result.push({id: urls[key].id, response: responseParser(responses[key])})
        }
        return result;
    } catch (e) {
        log.error(e)
    }

}

module.exports = fetcher