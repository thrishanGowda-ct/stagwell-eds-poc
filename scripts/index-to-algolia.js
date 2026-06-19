/* eslint-disable */
const algoliasearch = require('algoliasearch');

const APP_ID = process.env.ALGOLIA_APP_ID;
const ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY;

const client = algoliasearch(APP_ID, ADMIN_KEY);
const index = client.initIndex('stagwell-index');

async function pushDataToAlgolia() {
  try {
    console.log('Fetching Edge Delivery Services index data...');

    const response = await fetch('https://main--stagwell-eds-poc--thrishangowda-ct.aem.live/stagwell-index.json');

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();

    // Inject language and objectID into each record
    const records = data.data.map((item) => {
      const segments = item.path.split('/').filter(Boolean);
      const knownLangs = ['en', 'de', 'fr'];
      const langCode = knownLangs.includes(segments[0]) ? segments[0] : 'en';

      return {
        ...item,
        language: langCode,
        objectID: item.path,
      };
    });

    console.log(`Found ${records.length} records. Pushing to Algolia...`);
    await index.saveObjects(records);
    console.log('Success! Data pushed.');
  } catch (error) {
    console.error('Error pushing data to Algolia:', error);
    process.exit(1);
  }
}

pushDataToAlgolia();