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
     //Added backticks around the error message
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }

    const data = await response.json();

    // Create a new array of records, injecting a strict objectID
    const records = data.data.map((item) => {
      return {
        ...item,
        // We use the page path as the unique ID.
        // This ensures Algolia UPDATES existing records instead of duplicating them.
        objectID: item.path,
      };
    });

    //Added backticks around the console log
    console.log(`Found ${records.length} records. Pushing to Algolia...`);

    await index.saveObjects(records);

    console.log('Success! Your updated data is now in the cloud cabinet.');
  } catch (error) {
    console.error('Error pushing data to Algolia:', error);
    process.exit(1);
  }
}

pushDataToAlgolia();
