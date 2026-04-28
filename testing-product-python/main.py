# import cloudscraper
# from bs4 import BeautifulSoup
# import time

# # --- CONFIGURATION ---
# BASE_URL = "https://www.paklap.pk/accessories/networks.html"
# API_ENDPOINT = "http://localhost:3000/api/test-upload" 
# TOTAL_PAGES_TO_SCRAPE = 3  # Change this to how many pages you want

# # Initialize scraper once
# scraper = cloudscraper.create_scraper(
#     browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True}
# )

# def get_product_details(product_url):
#     """Visits the actual product page to get deep details."""
#     try:
#         resp = scraper.get(product_url)
#         if resp.status_code != 200:
#             return "No description available", {}

#         detail_soup = BeautifulSoup(resp.text, 'html.parser')
        
#         # Extract Full Description
#         desc_div = detail_soup.select_one('.data.item.content')
#         full_description = desc_div.get_text(separator="\n", strip=True) if desc_div else "No detailed description"

#         # Extract Specifications Table
#         specs = {}
#         spec_table = detail_soup.select_one('#product-attribute-specs-table')
#         if spec_table:
#             for row in spec_table.find_all('tr'):
#                 label = row.find('th').get_text(strip=True) if row.find('th') else None
#                 value = row.find('td').get_text(strip=True) if row.find('td') else None
#                 if label and value:
#                     specs[label] = value

#         return full_description, specs
#     except Exception as e:
#         print(f"      ❌ Detail Error: {e}")
#         return "Error fetching description", {}

# def scrape_paklap_all_pages():
#     for page_num in range(1, TOTAL_PAGES_TO_SCRAPE + 1):
#         # Construct the URL for the current page
#         page_url = f"{BASE_URL}?p={page_num}"
#         print(f"\n🚀 STARTING PAGE {page_num}: {page_url}")
        
#         response = scraper.get(page_url)
#         if response.status_code != 200:
#             print(f"   ❌ Failed to load page {page_num}")
#             continue

#         soup = BeautifulSoup(response.text, 'html.parser')
#         products = soup.select('li.item.product.product-item')
#         print(f"   📦 Found {len(products)} products on page {page_num}")

#         for item in products:
#             try:
#                 title_tag = item.select_one('a.product-item-link')
#                 title = title_tag.get_text(strip=True) if title_tag else "N/A"
#                 product_url = title_tag['href'] if title_tag else ""

#                 price_tag = item.select_one('span.price')
#                 price = int("".join(filter(str.isdigit, price_tag.get_text()))) if price_tag else 0
                
#                 img_tag = item.select_one('img.product-image-photo')
#                 image_url = img_tag['src'] if img_tag else ""

#                 # Deep Scrape for each item
#                 full_desc, product_specs = get_product_details(product_url)

#                 payload = {
#                     "title": title,
#                     "description": full_desc[:500], # Sending first 500 chars as description
#                     "price": price,
#                     "images": [image_url],
#                     "brandId": 1, 
#                     "categoryId": 17, # Your Laptop Category ID
#                     "quantity": 10,
#                     "warranty": product_specs.get("Warranty", "1 Year Local"),
#                     "specifications": product_specs,
#                     "additionalInfo": full_desc
#                 }

#                 print(f"   ✨ Processing: {title[:30]}...")
                
#                 # Upload to Next.js
#                 res = scraper.post(API_ENDPOINT, json=payload)
#                 if res.status_code == 200:
#                     print(f"      📤 Uploaded Successfully")
#                 else:
#                     print(f"      ⚠️ Upload failed: {res.status_code}")

#                 # Be gentle to avoid getting banned
#                 time.sleep(1.5)

#             except Exception as e:
#                 print(f"   ❌ Item Error: {e}")

# if __name__ == "__main__":
#     scrape_paklap_all_pages()


import cloudscraper
from bs4 import BeautifulSoup
import time

# --- CONFIGURATION ---
# Base URL for Wise-Tech products (Shop page)
BASE_URL = "https://wise-tech.com.pk/shop/"
API_ENDPOINT = "http://localhost:3000/api/test-upload" 
TOTAL_PAGES_TO_SCRAPE = 123

scraper = cloudscraper.create_scraper(
    browser={'browser': 'chrome', 'platform': 'windows', 'desktop': True}
)

def get_product_details(product_url):
    """Deep scrapes individual Wise-Tech product pages."""
    try:
        resp = scraper.get(product_url)
        if resp.status_code != 200:
            return "No description", {}, []

        detail_soup = BeautifulSoup(resp.text, 'html.parser')
        
        desc_div = detail_soup.select_one('.woocommerce-Tabs-panel--description')
        description = desc_div.get_text(separator="\n", strip=True) if desc_div else "N/A"
        specs = {}
        spec_table = detail_soup.select_one('.woocommerce-product-attributes')
        if spec_table:
            for row in spec_table.find_all('tr'):
                label = row.find('th').get_text(strip=True) if row.find('th') else "Key"
                value = row.find('td').get_text(strip=True) if row.find('td') else "Value"
                specs[label] = value
        # 3. All Gallery Images
        images = []
        img_elements = detail_soup.select('.woocommerce-product-gallery__image img')
        for img in img_elements:
            img_src = img.get('data-large_image') or img.get('src')
            if img_src and img_src not in images:
                images.append(img_src)
        return description, specs, images
    except Exception as e:
        print(f" ❌ Error on detail page: {e}")
        return "Error", {}, []

def scrape_wise_tech():
    for page_num in range(1, TOTAL_PAGES_TO_SCRAPE + 1):
        # Wise-Tech pagination format: /page/2/
        url = f"{BASE_URL}page/{page_num}/" if page_num > 1 else BASE_URL
        print(f"\n🚀 SCRAPING PAGE {page_num}: {url}")
        
        response = scraper.get(url)
        if response.status_code != 200:
            print(f"   ❌ Could not load page {page_num}")
            continue

        soup = BeautifulSoup(response.text, 'html.parser')
        # Wise-Tech/WooCommerce standard product item selector
        products = soup.select('li.product')
        print(f"   📦 Found {len(products)} products.")

        for item in products:
            try:
                # Basic Listing Info
                title_tag = item.select_one('.mfn-woo-product-title ')
                title = title_tag.get_text(strip=True) if title_tag else "N/A"
                link_tag = item.select_one('h4.mfn-woo-product-title a')

                if link_tag:
                    product_url = link_tag['href']
                    print(f"🔗 Found URL: {product_url}")
                else:
                    print("❌ Link not found")
                price_tag = item.select_one('.price bdi') # WooCommerce price format
                price_text = "".join(filter(str.isdigit, price_tag.get_text())) if price_tag else "0"
                price = int(price_text)

                # Deep Scrape
                full_desc, specs, gallery_images = get_product_details(product_url)

                payload = {
                    "title": title,
                    "description": full_desc[:100], 
                    "price": price,
                    "images": gallery_images if gallery_images else [item.select_one('img')['src']],
                    "brandId": 1, 
                    "categoryId": 17, 
                    "quantity": 10,
                    "specifications": specs,
                    "additionalInfo": full_desc
                }

                print(f"   ✨ Uploading: {title[:40]}...")
                res = scraper.post(API_ENDPOINT, json=payload)
                print(f"      📤 Status: {res.status_code}")

                time.sleep(2) # Protect your IP from being banned

            except Exception as e:
                print(f" ❌ Item parse error: {e}")

if __name__ == "__main__":
    scrape_wise_tech()