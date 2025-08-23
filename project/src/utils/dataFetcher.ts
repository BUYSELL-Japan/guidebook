// Utility for fetching data with retry logic and error handling
export async function fetchWithRetry(url: string, maxRetries: number = 3, delay: number = 1000): Promise<any> {
  let lastError: Error | undefined;
  
  // Validate input parameters
  if (maxRetries <= 0) {
    throw new Error('maxRetries must be greater than 0');
  }
  
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
  
  // Ensure lastError is defined before using it
  if (!lastError) {
    throw new Error(`Failed to fetch data after ${maxRetries} attempts. Unknown error occurred.`);
  }
  
  throw new Error(`Failed to fetch data after ${maxRetries} attempts. Last error: ${lastError.message}`);
}

export async function fetchGuideData() {
  try {
    const data = await fetchWithRetry('https://mop-guidebook.s3.ap-southeast-2.amazonaws.com/mop.guidenew.json');
    
    let guideItems = [];
    
    // Handle both array and object data structures
    if (Array.isArray(data)) {
      guideItems = data;
    } else if (data && typeof data === 'object') {
      guideItems = Object.values(data).filter(item => 
        item && typeof item === 'object' && 'item_id' in item
      );
    }
    
    return guideItems;
  } catch (error) {
    console.error('Failed to fetch guide data:', error);
    return [];
  }
}