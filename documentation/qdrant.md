import {QdrantClient} from '@qdrant/js-client-rest';

const client = new QdrantClient({
    url: 'https://1ab8e412-8310-4e7d-ad9f-e285b0f92609.us-east-1-0.aws.cloud.qdrant.io:6333',
    apiKey: 'key',
});

try {
    const result = await client.getCollections();
    console.log('List of collections:', result.collections);
} catch (err) {
    console.error('Could not get collections:', err);
}