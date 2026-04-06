import browser from 'webextension-polyfill';

// Constants
const URL_PREFIX = "https://content-a.strava.com/identified/globalheat/";
const URL_SUFFIX = "/{zoom}/{x}/{y}.png";

/** @type {string[]} */
const VALID_COLORS = ['hot', 'blue', 'purple', 'gray', 'bluered', 'mobileblue', 'orange'];

/** @type {string[]} */
const REQUIRED_COOKIE_NAMES = [
    'CloudFront-Key-Pair-Id',
    'CloudFront-Policy',
    'CloudFront-Signature',
];

/** @type {string[]} */
const OPTIONAL_COOKIE_NAMES = [
    '_strava_idcf'
];

const ALL_COOKIE_NAMES = [...REQUIRED_COOKIE_NAMES, ...OPTIONAL_COOKIE_NAMES];

async function getHeatmapUrl(tabUrl, storeId)
{
    // Strava url format:  https://www.strava.com/maps/global-heatmap?style=dark&terrain=false&sport=Ride&gColor=blue
    let stravaUrl = new URL(tabUrl);

    // Attempt to set map type based on sport url parameter.
    const sport = stravaUrl.searchParams.get('sport');
    let mapType;
    if (!sport || sport === 'All') {
        mapType = 'all';
    } else if (sport.endsWith('Like')) {
        mapType = sport.replace('Like', '').toLowerCase();
    } else {
        mapType = 'sport_' + sport;
    }

    // Attempt to set map color based on gColor url parameter. Default to 'hot'.
    const gColor = stravaUrl.searchParams.get('gColor');
    const mapColor = VALID_COLORS.includes(gColor) ? gColor : 'hot';

    const cookieEntries = await Promise.all(
        ALL_COOKIE_NAMES.map(async name => [
            name,
            await getCookieValue(name, tabUrl, storeId)
        ])
    );
    const cookies = new Map(
        cookieEntries.filter(([_name, value]) => value !== null)
    );
    const cookieEntriesForMessage = Array.from(cookies.entries());

    const heatmapUrl = URL_PREFIX + mapType + '/' + mapColor + URL_SUFFIX;

    const hasRequiredCookies = REQUIRED_COOKIE_NAMES.every(name => cookies.has(name));

    return {
        error: !hasRequiredCookies,
        heatmapUrl,
        mapColor,
        mapType,
        cookies: cookieEntriesForMessage,
    };
}

async function getCookieValue(name, url, storeId)
{
    const details = { url, name };
    if (storeId) {
        details.storeId = storeId;
    }

    try {
        const cookie = await browser.cookies.get(details);
        return cookie ? cookie.value : null;
    } catch {
        return null;
    }
}

browser.runtime.onMessage.addListener(async function (_message, sender, _sendResponse) {
    return getHeatmapUrl(
        sender.tab.url,
        sender.tab.cookieStoreId
    )
});
