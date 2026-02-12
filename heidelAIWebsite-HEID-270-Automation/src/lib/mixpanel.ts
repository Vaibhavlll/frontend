import mixpanel from "mixpanel-browser";

let initialized = false;

export function initMixpanel() {
    if (initialized) return;

    const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

    if (!token) {
        console.warn("Mixpanel token missing");
        return;
    }

    mixpanel.init(token, {
        debug: false,
        track_pageview: true,
        persistence: "localStorage",
        record_sessions_percent: 100, // Session Replay
        record_heatmap_data: true,    // Heatmaps
    });

    initialized = true;
}

export default mixpanel;
