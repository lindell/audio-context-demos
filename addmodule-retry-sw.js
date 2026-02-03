const WORKLET_FILENAME = 'test-worklet.js';

// Internal state: 'ok', 'broken', 'timeout'
let serverStatus = 'broken';

self.addEventListener('install', (event) => {
    // skipWaiting ensures the new SW activates immediately
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // claim ensures the SW controls the page immediately
    event.waitUntil(clients.claim());
});

// Handle messages from the main page to toggle state
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SET_STATUS') {
        serverStatus = event.data.status;
        
        // Broadcast the new status back to all clients (for UI updates)
        self.clients.matchAll().then(clients => {
            clients.forEach(client => client.postMessage({
                type: 'STATUS_CHANGED',
                status: serverStatus
            }));
        });
    }
});

// Intercept network requests
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only intercept requests for our specific worklet file
    if (url.pathname.endsWith(WORKLET_FILENAME)) {
        console.log(`[ServiceWorker] Intercepting request for ${WORKLET_FILENAME}. Current Sim State: ${serverStatus}`);
        
        if (serverStatus === 'broken') {
            // Simulate a missing file
            event.respondWith(
                new Response('404 Not Found', { status: 404, statusText: 'Not Found' })
            );
        } else if (serverStatus === 'timeout') {
            // Simulate a real network error (Timeout)
            event.respondWith(
                new Promise(resolve => {
                    setTimeout(() => {
                        resolve(Response.error());
                    }, 2000); // 2 second delay
                })
            );
        } else {
            // Simulate a valid AudioWorkletProcessor file
            const workletCode = `
                class TestProcessor extends AudioWorkletProcessor {
                    process(inputs, outputs, parameters) {
                        return true;
                    }
                }
                registerProcessor('test-processor', TestProcessor);
                console.log("Processor loaded successfully inside AudioWorkletGlobalScope");
            `;
            
            event.respondWith(
                new Response(workletCode, {
                    status: 200,
                    headers: { 'Content-Type': 'application/javascript' }
                })
            );
        }
    }
});
