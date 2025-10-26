import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api';

interface AuthResponse {
  user: any;
  token: string;
}

async function testAPI() {
  console.log('🧪 Testing Maifead Backend API\n');

  try {
    // 1. Create a test user
    console.log('1️⃣  Creating test user...');
    const signupResponse = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@maifead.com',
        username: 'testuser',
        displayName: 'Test User',
        password: 'password123',
      }),
    });

    if (!signupResponse.ok) {
      const error = await signupResponse.json();
      console.log('⚠️  User might already exist, trying to login...');

      // Try logging in instead
      const loginResponse = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@maifead.com',
          password: 'password123',
        }),
      });

      if (!loginResponse.ok) {
        throw new Error('Failed to login');
      }

      const loginData = await loginResponse.json() as AuthResponse;
      var token = loginData.token;
      console.log('✅ Logged in as:', loginData.user.displayName);
    } else {
      const signupData = await signupResponse.json() as AuthResponse;
      var token = signupData.token;
      console.log('✅ User created:', signupData.user.displayName);
    }

    // 2. Add PC Gamer RSS feed
    console.log('\n2️⃣  Adding PC Gamer RSS feed...');
    const sourceResponse = await fetch(`${API_URL}/sources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'PC Gamer',
        url: 'https://www.pcgamer.com/rss/',
        category: 'Gaming',
      }),
    });

    if (!sourceResponse.ok) {
      const error = await sourceResponse.json();
      throw new Error(`Failed to add source: ${JSON.stringify(error)}`);
    }

    const source = await sourceResponse.json();
    console.log('✅ Source added:', source.name);
    console.log(`   URL: ${source.url}`);
    console.log(`   ID: ${source.id}`);

    // 3. Wait a moment for background fetch to complete
    console.log('\n3️⃣  Waiting for feed items to be fetched...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    // 4. Get feed items
    console.log('\n4️⃣  Fetching feed items...');
    const itemsResponse = await fetch(`${API_URL}/feed-items?limit=10`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!itemsResponse.ok) {
      throw new Error('Failed to fetch items');
    }

    const items = await itemsResponse.json();
    console.log(`✅ Retrieved ${items.length} feed items\n`);

    if (items.length > 0) {
      console.log('📰 Latest articles:');
      items.slice(0, 5).forEach((item: any, i: number) => {
        console.log(`\n${i + 1}. ${item.title}`);
        console.log(`   Author: ${item.author || 'Unknown'}`);
        console.log(`   Published: ${item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Unknown'}`);
        console.log(`   Link: ${item.link}`);
        if (item.excerpt) {
          console.log(`   Excerpt: ${item.excerpt.substring(0, 100)}...`);
        }
      });
    }

    // 5. Test marking an item as read
    if (items.length > 0) {
      console.log('\n\n5️⃣  Testing mark as read...');
      const firstItem = items[0];
      const markReadResponse = await fetch(`${API_URL}/feed-items/${firstItem.id}/read`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ read: true }),
      });

      if (markReadResponse.ok) {
        console.log('✅ Marked item as read:', firstItem.title);
      }
    }

    // 6. Test creating a collection
    console.log('\n6️⃣  Creating a test collection...');
    const collectionResponse = await fetch(`${API_URL}/collections`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        name: 'Gaming News',
        color: '#10b981',
        icon: 'gamepad',
      }),
    });

    if (!collectionResponse.ok) {
      throw new Error('Failed to create collection');
    }

    const collection = await collectionResponse.json();
    console.log('✅ Collection created:', collection.name);

    // 7. Add item to collection
    if (items.length > 0) {
      console.log('\n7️⃣  Adding item to collection...');
      const addItemResponse = await fetch(
        `${API_URL}/collections/${collection.id}/items/${items[0].id}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (addItemResponse.ok) {
        console.log('✅ Item added to collection');
      }
    }

    // 8. Get all sources
    console.log('\n8️⃣  Getting all sources...');
    const sourcesResponse = await fetch(`${API_URL}/sources`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    const sources = await sourcesResponse.json();
    console.log(`✅ Total sources: ${sources.length}`);

    console.log('\n\n✨ All tests passed successfully! ✨\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testAPI();
