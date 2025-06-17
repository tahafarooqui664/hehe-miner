const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function createBannerJPEG() {
    console.log('🚀 Starting banner creation process...');
    
    let browser;
    try {
        // Launch browser
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        
        // Set viewport to match banner dimensions
        await page.setViewport({
            width: 1200,
            height: 630,
            deviceScaleFactor: 2 // For high quality
        });

        // Read the HTML file
        const htmlPath = path.join(__dirname, 'create-promotional-banner.html');
        const htmlContent = fs.readFileSync(htmlPath, 'utf8');
        
        console.log('📄 Loading HTML content...');
        
        // Set the HTML content
        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0',
            timeout: 30000
        });

        // Wait for fonts to load
        await page.evaluateHandle('document.fonts.ready');
        
        // Wait for animations to start
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('📸 Taking screenshot...');
        
        // Take screenshot of the banner element
        const bannerElement = await page.$('.banner');
        
        if (!bannerElement) {
            throw new Error('Banner element not found');
        }

        // Take screenshot as JPEG with high quality
        const screenshot = await bannerElement.screenshot({
            type: 'jpeg',
            quality: 95,
            omitBackground: false
        });

        // Save the image
        const outputPath = path.join(__dirname, 'public', 'hehe-miner-promotional-banner.jpg');
        fs.writeFileSync(outputPath, screenshot);
        
        console.log('✅ Banner created successfully!');
        console.log(`📁 Saved to: ${outputPath}`);
        console.log('🎨 Banner features:');
        console.log('   - 1200x630px (perfect for social media)');
        console.log('   - High quality JPEG format');
        console.log('   - Animated miner character');
        console.log('   - Beautiful gradient backgrounds');
        console.log('   - All text clearly visible');
        console.log('   - Professional gaming theme');
        
        return outputPath;

    } catch (error) {
        console.error('❌ Error creating banner:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Run the function
if (require.main === module) {
    createBannerJPEG()
        .then((outputPath) => {
            console.log('\n🎉 BANNER CREATION COMPLETE!');
            console.log(`Your amazing promotional banner is ready at: ${outputPath}`);
        })
        .catch((error) => {
            console.error('\n💥 Failed to create banner:', error.message);
            process.exit(1);
        });
}

module.exports = createBannerJPEG;
