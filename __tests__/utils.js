function responseBuilder(data, code = 200, status = "success") {
    return {
        code, data, status
    }
}
function getTheDefaultRequestConfig(urlObj){
    return {
        headers:{},
        method: urlObj.method || "get",
        timeout: 200,
        url: urlObj.url
    }
}
module.exports = {
    responseBuilder,
    getTheDefaultRequestConfig
}