# fetchMultipleUrls(urls, numThreads)
Fetches an array of URLs which contain JSON data and returns their contents in a promise.

## Parameters
- **urls (array)**: An array of object to fetch.
  - URL Object consist of the following:
    - url (string)
    - headers (object)
    - httpMethod (string)
- **config (object)**: Contains configurations for the package such as:
  - numThreads (integer) the maximum number of threads to fetch the data with.


Returns
A promise that resolves to an array of the JSON data fetched from the URLs.

## Errors
Throws an error if there is a problem with fetching the data from any of the URLs.
Throws an error if the number of threads is less than or equal to zero.

## Future improvements