const fetch = (...args) => import('node-fetch').then(({ default: f }) => f(...args));

const getLocationFromIP = async (ip) => {
  try {
    // Skip for localhost / private IPs
    if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168') || ip.startsWith('10.')) {
      return {
        country: 'Unknown',
        countryCode: 'XX',
        city: 'Unknown',
        region: 'Unknown',
        isp: 'Local',
        isVpn: false,
        isProxy: false,
      };
    }

    const token = process.env.IPINFO_TOKEN;
    if (!token) {
      return { country: 'Unknown', countryCode: 'XX', city: 'Unknown', region: 'Unknown', isp: 'Unknown', isVpn: false, isProxy: false };
    }

    const response = await fetch(`https://ipinfo.io/${ip}?token=${token}`);
    const data = await response.json();

    return {
      country: data.country || 'Unknown',
      countryCode: data.country || 'XX',
      city: data.city || 'Unknown',
      region: data.region || 'Unknown',
      isp: data.org || 'Unknown',
      isVpn: data.privacy?.vpn || false,
      isProxy: data.privacy?.proxy || false,
    };
  } catch (error) {
    console.error('IPInfo lookup failed:', error.message);
    return { country: 'Unknown', countryCode: 'XX', city: 'Unknown', region: 'Unknown', isp: 'Unknown', isVpn: false, isProxy: false };
  }
};

module.exports = { getLocationFromIP };
