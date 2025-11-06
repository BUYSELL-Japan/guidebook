// Utility for fetching data with retry logic and error handling
export async function fetchWithRetry(url: string, maxRetries: number = 3, delay: number = 1000): Promise<any> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Fetching data (attempt ${attempt}/${maxRetries}): ${url}`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; MOP-Guide/1.0)',
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched data on attempt ${attempt}`);
      return data;
      
    } catch (error) {
      lastError = error as Error;
      console.error(`Fetch attempt ${attempt} failed:`, error);
      
      // Don't retry on the last attempt
      if (attempt === maxRetries) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw new Error(`Failed to fetch data after ${maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`);
}

export async function fetchGuideData() {
  try {
    const data = await fetchWithRetry('https://s3geojsonnew.s3.ap-southeast-2.amazonaws.com/Geojson3.23.geojson');

    let guideItems = [];

    if (data && data.type === 'FeatureCollection' && Array.isArray(data.features)) {
      guideItems = data.features
        .filter((feature: any) => {
          const props = feature.properties || {};
          return props.category === '1';
        })
        .map((feature: any) => {
          const props = feature.properties || {};
          return {
            item_id: props.item_id || '',
            name_ja: props['title.ja'] || props.title_ja || '',
            name_ko: props.title_ko || '',
            name_en: props.title || '',
            name_zh_tw: props.title_zh_tw || '',
            catchy_comment_ja: props.catchy_comment_ja || '',
            catchy_comment_ko: props.catchy_comment_ko || '',
            catchy_comment_en: props.catchy_comment_en || '',
            catchy_comment_zh_tw: props.catchy_comment_zh_tw || '',
            main_image_url: props.main_image_url || '',
            summary_ja: props.summary_ja || '',
            summary_ko: props.summary_ko || '',
            summary_en: props.summary_en || '',
            summary_zh_tw: props.summary_zh_tw || '',
            description_ja: props.guide_description_ja || '',
            description_ko: props.guide_description_ko || '',
            description_en: props.guide_description_en || '',
            description_zh_tw: props.guide_description_zh_tw || '',
            highlight_1_image_url: props.highlight_1_image_url || '',
            highlight_1_text_ja: props.highlight_1_text_ja || '',
            highlight_1_text_zh_tw: props.highlight_1_text_zh_tw || '',
            highlight_1_text_ko: props.highlight_1_text_ko || '',
            highlight_1_text_en: props.highlight_1_text_en || '',
            highlight_2_image_url: props.highlight_2_image_url || '',
            highlight_2_text_ja: props.highlight_2_text_ja || '',
            highlight_2_text_zh_tw: props.highlight_2_text_zh_tw || '',
            highlight_2_text_ko: props.highlight_2_text_ko || '',
            highlight_2_text_en: props.highlight_2_text_en || '',
            address_ja: props.address_ja || '',
            address_zh_tw: props['address_zh-tw'] || props.address_zh_tw || '',
            address_ko: props.address_ko || '',
            address_en: props.address || '',
            meta_title_zh_tw: props.meta_title_zh_tw || '',
            meta_title_en: props.meta_title_en || '',
            meta_description_zh_tw: props.meta_description_zh_tw || '',
            meta_description_en: props.meta_description_en || ''
          };
        });
    } else if (Array.isArray(data)) {
      guideItems = data.filter((item: any) => item.category === '1');
    } else if (data && typeof data === 'object') {
      guideItems = Object.values(data).filter(item =>
        item && typeof item === 'object' && 'item_id' in item && (item as any).category === '1'
      );
    }

    return guideItems;
  } catch (error) {
    console.error('Failed to fetch guide data:', error);
    return [];
  }
}