import { getFeed } from './backend/controllers/postController.js';
import { getMyFollowingsStatuses } from './backend/controllers/connectionController.js';

const mockRes = {
    status: function(code) { 
        this.statusCode = code; 
        return this; 
    },
    json: function(data) { 
        console.log(`Status: ${this.statusCode || 200}`);
        console.log('Data:', JSON.stringify(data, null, 2));
    }
};

const test = async () => {
    console.log('Testing getMyFollowingsStatuses...');
    await getMyFollowingsStatuses({ user: { id: 1 } }, mockRes);

    console.log('\nTesting getFeed...');
    await getFeed({ user: { id: 1 }, query: { page: 1, limit: 10 } }, mockRes);
    
    process.exit(0);
};

test();
