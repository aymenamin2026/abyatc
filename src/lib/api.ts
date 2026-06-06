import { env } from 'process';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.abyatc.com/api';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || '';
const SECRET_KEY = process.env.NEXT_PUBLIC_SECRET_KEY || '';

export function getImageUrl(path: string | undefined | null): string {
  if (!path) return '/no-image.jpg';
  
  // Replace local URLs with live domain if they exist in the path from database
  if (path.startsWith('http')) {
    // return path.replace(/http:\/\/127\.0\.0\.1:8000/g, 'https://api.luluh.sa')
    //            .replace(/http:\/\/localhost:8000/g, 'https://api.luluh.sa');
    return path.replace("https://api.abyatc.com/api/storage", "/storage/");

  }
  
  // const cleanPath = path.replace(/^\/?(storage\/)?/, '');
  // const imageBase = process.env.NEXT_PUBLIC_IMAGE_URL || 'https://api.luluh.sa/storage/';
  // return `${imageBase}${cleanPath}`;

  return path.startsWith("/") ? path : `/${path}`;
}

// Ensure safe token retrieval from cookies-next or native
import { getCookie } from 'cookies-next';

export function getHeaders() {
  const lang = getCookie('NEXT_LOCALE') || 'en';
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-KEY': API_KEY,
    'X-SECRET-KEY': SECRET_KEY,
    'X-Language': typeof lang === 'string' ? lang : 'en'
  };
}
export async function fetchOrderStatus(orderId: string | number) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/orders/${orderId}/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${token}` // أضف التوكن إذا كان المسار محمي في الباك آند
      },
    });
    if (!response.ok) throw new Error('فشل في جلب حالة الطلب');
    return await response.json(); // يتوقع إرجاع { status: 'processing' } مثلاً
  } catch (error) {
    console.error(error);
    return null;
  }
}
export async function fetchCustomerAddresses() {
  const token = getCookie('auth_token');
  if (!token) return [];

  try {
    const res = await fetch(`${API_URL}/customers/addresses`, {
      headers: {
        ...getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 0 } 
    });
    
    if (!res.ok) throw new Error('Failed to fetch user addresses');
    return res.json();
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
}

export async function fetchCustomerOrders() {
  const token = getCookie('auth_token');
  if (!token) return [];

  try {
    const res = await fetch(`${API_URL}/customers/orders`, {
      headers: {
        ...getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch user orders');
    return res.json();
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

export async function updateCustomerProfile(profileData: any) {
  const token = getCookie('auth_token');
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/auth/me`, {
    method: 'PUT',
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(profileData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update profile');
  return data;
}

export async function requestEmailChange(newEmail: string) {
  const token = getCookie('auth_token');
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/auth/request-email-change`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ new_email: newEmail })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to request email change');
  return data;
}

export async function verifyEmailChange(code: string) {
  const token = getCookie('auth_token');
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/auth/verify-email-change`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ code })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to verify email change');
  return data;
}

export async function createCustomerAddress(addressData: any) {
  const token = getCookie('auth_token');
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/customers/addresses`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(addressData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create address');
  return data;
}

export async function updateCustomerAddress(id: number | string, addressData: any) {
  const token = getCookie('auth_token');
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/customers/addresses/${id}`, {
    method: 'PUT',
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(addressData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update address');
  return data;
}

export async function deleteCustomerAddress(id: number | string) {
  const token = getCookie('auth_token');
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/customers/addresses/${id}`, {
    method: 'DELETE',
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to delete address');
  return data;
}

export async function fetchShippingRates(cartId: string, city: string, country: string, userToken?: string) {
  try {
    const requestHeaders: any = { ...getHeaders() };
    if (userToken) {
        requestHeaders['Authorization'] = `Bearer ${userToken}`;
    }
  
    const res = await fetch(`${API_URL}/shipping-rates`, {
      method: 'POST',
      headers: requestHeaders,
      body: JSON.stringify({ cart_id: cartId, city, country })
    });
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.success ? data.rates : [];
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return [];
  }
}

export async function fetchCategories() {
  try {
    const res = await fetch(`${API_URL}/categories`, { 
      headers: getHeaders(),
      next: { revalidate: 60 } // Cache for 60 seconds
    });
    
    if (!res.ok) throw new Error('Failed to fetch categories');
    return res.json();
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

export async function fetchTestimonials() {
  try {
    const res = await fetch(`${API_URL}/testimonials`, { 
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch testimonials');
    return res.json();
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export async function fetchProducts() {
  try {
    const res = await fetch(`${API_URL}/products`, { 
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch products');
    return res.json();
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/products/${slug}`, { 
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch product');
    return res.json();
  } catch (error) {
    console.error(`Error fetching product ${slug}:`, error);
    return null;
  }
}

export async function fetchSliders(position?: string) {
  try {
    const url = position ? `${API_URL}/sliders?position=${position}` : `${API_URL}/sliders`;
    const res = await fetch(url, { 
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch sliders');
    return res.json();
  } catch (error) {
    console.error('Error fetching sliders:', error);
    return [];
  }
}

export async function fetchSettings() {
  try {
    const res = await fetch(`${API_URL}/settings`, { 
      headers: getHeaders(),
      next: { revalidate: 0, tags: ['settings'] }
    });
    
    if (!res.ok) throw new Error('Failed to fetch settings');
    return res.json();
  } catch (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
}

export async function fetchAttributes() {
  try {
    const res = await fetch(`${API_URL}/attributes`, { 
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch attributes');
    return res.json();
  } catch (error) {
    console.error('Error fetching attributes:', error);
    return [];
  }
}

export async function fetchPaymentMethods() {
  try {
    const res = await fetch(`${API_URL}/payment-methods`, { 
      headers: getHeaders(),
      next: { revalidate: 0 } // Do not cache payment methods to always get active ones
    });
    
    if (!res.ok) throw new Error('Failed to fetch payment methods');
    return res.json();
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return [];
  }
}

export async function fetchShippingMethods() {
  try {
    const res = await fetch(`${API_URL}/shipping-methods`, { 
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch shipping methods');
    return res.json();
  } catch (error) {
    console.error('Error fetching shipping methods:', error);
    return [];
  }
}

export async function fetchCountries() {
  try {
    const res = await fetch(`${API_URL}/countries`, { 
      headers: getHeaders(),
      next: { revalidate: 0 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch countries');
    return res.json();
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

export async function fetchZones(countryId: string | number) {
  try {
    const res = await fetch(`${API_URL}/countries/${countryId}/zones`, { 
      headers: getHeaders(),
      next: { revalidate: 0 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch zones');
    return res.json();
  } catch (error) {
    console.error('Error fetching zones:', error);
    return [];
  }
}

export async function authLogin(credentials: any) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Login failed');
  return data;
}

export async function authRegister(credentials: any) {
  const res = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Registration failed');
  return data;
}

export async function verifyRegistration(email: string, code: string) {
  const res = await fetch(`${API_URL}/auth/verify-registration`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email, code })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Verification failed');
  return data;
}

export async function resendVerificationCode(email: string) {
  const res = await fetch(`${API_URL}/auth/resend-verification`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to resend code');
  return data;
}

export async function fetchReviews(productId: number | string) {
  try {
    const res = await fetch(`${API_URL}/products/${productId}/reviews`, { headers: getHeaders() });
    if (!res.ok) return [];
    return res.json();
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}

export async function checkReviewEligibility(productId: number | string) {
  const token = getCookie('auth_token');
  if (!token) return { can_review: false, reason: 'not_logged_in' };

  try {
    const res = await fetch(`${API_URL}/products/${productId}/review-eligibility`, {
      headers: {
        ...getHeaders(),
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return { can_review: false };
    return res.json();
  } catch (error) {
    console.error('Error checking review eligibility:', error);
    return { can_review: false };
  }
}

export async function submitReview(reviewData: any) {
  const token = getCookie('auth_token');
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/reviews`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(reviewData)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to submit review');
  return data;
}

export async function fetchArticles() {
  try {
    const res = await fetch(`${API_URL}/articles`, { 
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch articles');
    return res.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    return [];
  }
}

export async function fetchArticleBySlug(slug: string) {
  try {
    const res = await fetch(`${API_URL}/articles/${slug}`, { 
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch article');
    return res.json();
  } catch (error) {
    console.error(`Error fetching article ${slug}:`, error);
    return null;
  }
}

export async function submitComment(articleId: number | string, commentData: { comment: string, name?: string, email?: string, parent_id?: number | null, captcha_answer?: string, captcha_question_id?: string, g_recaptcha_response?: string | null }, tokenParam?: string | null) {
  const token = tokenParam || getCookie('auth_token');
  const requestHeaders: any = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-API-KEY': process.env.NEXT_PUBLIC_API_KEY || '',
    'X-SECRET-KEY': process.env.NEXT_PUBLIC_SECRET_KEY || '',
  };

  let endpointSuffix = '/comments-guest';

  if (token) {
    requestHeaders['Authorization'] = `Bearer ${token}`;
    endpointSuffix = '/comments';
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.abyatc.com/api'}/articles/${articleId}${endpointSuffix}`, {
    method: 'POST',
    headers: requestHeaders,
    body: JSON.stringify(commentData)
  });

  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.message || 'Failed to submit comment');
  }

  return res.json();
}

export async function validateCoupon(code: string, subtotal: number) {
  try {
    const res = await fetch(`${API_URL}/coupons/validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, subtotal })
    });
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Error validating coupon:', error);
    return { success: false, message: 'connection_error' };
  }
}

// ─── Wishlist ───────────────────────────────────────────────

export async function fetchWishlist() {
  const token = getCookie('auth_token');
  if (!token) return { items: [], count: 0 };

  try {
    const res = await fetch(`${API_URL}/wishlist`, {
      headers: {
        ...getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch wishlist');
    return res.json();
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return { items: [], count: 0 };
  }
}

export async function fetchWishlistIds() {
  const token = getCookie('auth_token');
  if (!token) return { product_ids: [], count: 0 };

  try {
    const res = await fetch(`${API_URL}/wishlist/ids`, {
      headers: {
        ...getHeaders(),
        'Authorization': `Bearer ${token}`
      },
      next: { revalidate: 0 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch wishlist ids');
    return res.json();
  } catch (error) {
    console.error('Error fetching wishlist ids:', error);
    return { product_ids: [], count: 0 };
  }
}

export async function toggleWishlistItem(productId: number) {
  const token = getCookie('auth_token');
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/wishlist/toggle`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ product_id: productId })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to toggle wishlist');
  return data;
}

export async function removeFromWishlist(productId: number) {
  const token = getCookie('auth_token');
  if (!token) throw new Error('Unauthorized');

  const res = await fetch(`${API_URL}/wishlist/${productId}`, {
    method: 'DELETE',
    headers: {
      ...getHeaders(),
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to remove from wishlist');
  return data;
}

// MyFatoorah Payment
export async function initiateMyFatoorahPayment(orderNumber: string, lang: string = 'en') {
  const res = await fetch(`${API_URL}/myfatoorah/initiate`, {
    method: 'POST',
    headers: {
      ...getHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ order_number: orderNumber, lang }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to initiate payment');
  return data;
}

export async function fetchPopups() {
  try {
    const res = await fetch(`${API_URL}/popups`, { 
      headers: getHeaders(),
      next: { revalidate: 60 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch popups');
    return res.json();
  } catch (error) {
    console.error('Error fetching popups:', error);
    return [];
  }
}
export async function cancelOrderOnBackend(orderNumber: string) {
  const token = getCookie('auth_token');
  try {
    const res = await fetch(`${API_URL}/checkout/cancel`, {
      method: "POST",
      headers: {
        ...getHeaders(),
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ order_number: orderNumber })
    });
    return res.ok;
  } catch (error) {
    console.error("Cancel order error:", error);
    return false;
  }
}
