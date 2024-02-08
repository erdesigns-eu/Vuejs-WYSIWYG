const { parentPort, workerData } = require('worker_threads');

/**
 * @method fetchData
 * @description Fetches the data from the server and sends a message to the renderer with the new data.
 * @returns {Promise<void>}
 * @async
 */
async function fetchData() {
  try {
    const response = await fetch(`https://calendar.erdesigns.dev?key=${workerData.apiKey}` );

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const { lastChangeDate } = data;

    // Send a 'success' message to the renderer with the new last change date
    parentPort.postMessage({ event: 'success', lastChangeDate });
  } catch (error) {
    // Send an 'error' message to the renderer with the error message
    parentPort.postMessage({ event: 'error', error: error.message });
  }
}

// Start polling the server every 15 seconds
function startPolling() {
  // Fetch data immediately
  fetchData();
  // Set interval to fetch data every 15 seconds
  setInterval(fetchData, 15 * 1000);
}

// Start polling
startPolling();
