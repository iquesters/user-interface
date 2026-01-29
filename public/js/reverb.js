// class ReverbClient {
//     constructor(config = {}) {
//         // Default configuration
//         this.config = {
//             host: config.host || '127.0.0.1',
//             port: config.port || 6001,
//             scheme: config.scheme || 'http',
//             appKey: config.appKey || 'reverb_key',
//             appId: config.appId || '1',
//             ...config
//         };
        
//         this.socket = null;
//         this.connected = false;
//         this.subscriptions = new Map();
//         this.eventHandlers = new Map();
//         this.reconnectAttempts = 0;
//         this.maxReconnect = 10;
//         this.pendingSubscriptions = new Set();
//     }

//     connect() {
//         try {
//             // Close existing connection if any
//             if (this.socket) {
//                 this.socket.close();
//             }
            
//             // Determine WebSocket protocol
//             const wsScheme = this.config.scheme === 'https' ? 'wss' : 'ws';
//             const url = `${wsScheme}://${this.config.host}:${this.config.port}/app/${this.config.appKey}`;
            
//             console.log('🔌 Connecting to Reverb:', url);
            
//             this.socket = new WebSocket(url);
            
//             this.socket.onopen = () => {
//                 console.log('✅ Connected to Reverb server');
//                 this.connected = true;
//                 this.reconnectAttempts = 0;
                
//                 // Send authentication
//                 this.sendAuth();
                
//                 // Subscribe to pending channels
//                 this.subscribePending();
                
//                 this.emit('connected');
//             };
            
//             this.socket.onmessage = (event) => {
//                 this.handleMessage(event.data);
//             };
            
//             this.socket.onclose = (event) => {
//                 console.log('🔌 Disconnected from Reverb:', event.code, event.reason);
//                 this.connected = false;
//                 this.emit('disconnected', { code: event.code, reason: event.reason });
//                 this.attemptReconnect();
//             };
            
//             this.socket.onerror = (error) => {
//                 console.error('❌ Reverb WebSocket error:', error);
//                 this.emit('error', error);
//             };
            
//         } catch (error) {
//             console.error('❌ Failed to create WebSocket:', error);
//             this.attemptReconnect();
//         }
//     }
    
//     sendAuth() {
//         if (!this.connected) return;
        
//         // For Reverb, we need to authenticate with the app key
//         const authMessage = {
//             event: 'pusher:subscribe',
//             data: {
//                 auth: this.config.appKey,
//                 channel_data: JSON.stringify({
//                     user_id: this.config.userId || 'anonymous'
//                 })
//             }
//         };
        
//         this.socket.send(JSON.stringify(authMessage));
//     }
    
//     handleMessage(rawData) {
//         try {
//             const data = JSON.parse(rawData);
//             console.log('📨 Reverb message:', data);
            
//             // Handle connection established
//             if (data.event === 'pusher:connection_established') {
//                 console.log('🔐 Reverb connection established');
//                 return;
//             }
            
//             // Handle subscription success
//             if (data.event === 'pusher_internal:subscription_succeeded') {
//                 console.log(`✅ Subscribed to channel: ${data.channel}`);
//                 return;
//             }
            
//             // Handle regular events
//             if (data.event && data.channel && data.data) {
//                 this.emit(data.event, {
//                     channel: data.channel,
//                     data: typeof data.data === 'string' ? JSON.parse(data.data) : data.data
//                 });
                
//                 // Also emit channel-specific events
//                 this.emit(`${data.channel}.${data.event}`, data.data);
//             }
            
//         } catch (error) {
//             console.error('❌ Error parsing Reverb message:', error, rawData);
//         }
//     }
    
//     subscribe(channel) {
//         if (!this.connected) {
//             console.log('⚠️ Not connected, queueing subscription to:', channel);
//             this.pendingSubscriptions.add(channel);
//             return false;
//         }
        
//         const message = {
//             event: 'pusher:subscribe',
//             data: {
//                 auth: this.config.appKey,
//                 channel: channel
//             }
//         };
        
//         console.log('📡 Subscribing to channel:', channel);
//         this.socket.send(JSON.stringify(message));
//         this.subscriptions.set(channel, {});
//         return true;
//     }
    
//     subscribePending() {
//         this.pendingSubscriptions.forEach(channel => {
//             this.subscribe(channel);
//         });
//         this.pendingSubscriptions.clear();
//     }
    
//     unsubscribe(channel) {
//         if (!this.connected) return;
        
//         const message = {
//             event: 'pusher:unsubscribe',
//             data: {
//                 channel: channel
//             }
//         };
        
//         this.socket.send(JSON.stringify(message));
//         this.subscriptions.delete(channel);
//         console.log('📡 Unsubscribed from:', channel);
//     }
    
//     on(event, handler) {
//         if (!this.eventHandlers.has(event)) {
//             this.eventHandlers.set(event, []);
//         }
//         this.eventHandlers.get(event).push(handler);
//     }
    
//     off(event, handler) {
//         if (this.eventHandlers.has(event)) {
//             const handlers = this.eventHandlers.get(event);
//             const index = handlers.indexOf(handler);
//             if (index > -1) {
//                 handlers.splice(index, 1);
//             }
//         }
//     }
    
//     emit(event, data = {}) {
//         if (this.eventHandlers.has(event)) {
//             this.eventHandlers.get(event).forEach(handler => {
//                 try {
//                     handler(data);
//                 } catch (error) {
//                     console.error(`❌ Error in ${event} handler:`, error);
//                 }
//             });
//         }
//     }
    
//     attemptReconnect() {
//         if (this.reconnectAttempts >= this.maxReconnect) {
//             console.error('❌ Max reconnection attempts reached');
//             return;
//         }
        
//         this.reconnectAttempts++;
//         const delay = Math.min(1000 * Math.pow(1.5, this.reconnectAttempts), 30000);
        
//         console.log(`🔄 Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnect})`);
        
//         setTimeout(() => {
//             console.log('🔄 Attempting reconnect...');
//             this.connect();
//         }, delay);
//     }
    
//     disconnect() {
//         if (this.socket) {
//             this.socket.close(1000, 'Client disconnected');
//             this.socket = null;
//         }
//         this.connected = false;
//         this.subscriptions.clear();
//         this.pendingSubscriptions.clear();
//         console.log('🔌 Disconnected from Reverb');
//     }
// }

// // Make it available globally
// if (typeof window !== 'undefined') {
//     window.ReverbClient = ReverbClient;
// }