export type GeoResult = {
  lat: number;
  lng: number;
  displayName: string;
};

export async function geocodeLocation(query: string): Promise<GeoResult | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      query
    )}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "poimter-app",
      },
    });

    const data = await res.json();

    if (!data?.length) return null;

    return {
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
      displayName: data[0].display_name,
    };
  } catch (e) {
    console.error("Geocode error:", e);
    return null;
  }
}