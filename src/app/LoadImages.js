// docker-image-loader.js
const fs = require('fs');
const mysql = require('mysql2/promise');

async function loadImage() {
  // Read the image file
  const imageBuffer = fs.readFileSync('/var/www/html/nvrs-ts-v1/public/beer.jpg');
  console.log(`Read image file: ${imageBuffer.length} bytes`);

  // Connect to database
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // update with your password
    database: 'nvrs'
  });
  
  console.log('Connected to database');

  try {
    // Update the menu_item_images table
    const [result] = await connection.execute(
      'REPLACE INTO menu_item_images (menu_item_id, item_image) VALUES (?, ?)',
      [1, imageBuffer]
    );
    
    console.log('Image loaded successfully:', result);
    
    // Verify the image was loaded
    const [rows] = await connection.execute(
      'SELECT menu_item_id, LENGTH(item_image) AS image_size FROM menu_item_images WHERE menu_item_id = 1'
    );
    
    console.log('Verification:', rows[0]);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
    console.log('Connection closed');
  }
}

loadImage().catch(console.error);