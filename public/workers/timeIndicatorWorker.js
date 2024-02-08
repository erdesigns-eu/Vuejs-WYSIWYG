
const updateTimeIndicator = () => {
  // Current time
  const currentTime = new Date();
  // Post message to main thread with current time as payload
  self.postMessage(currentTime);
}

// Set interval to update time indicator every 15 seconds
setInterval(() => {
  updateTimeIndicator();
}, 15000);
