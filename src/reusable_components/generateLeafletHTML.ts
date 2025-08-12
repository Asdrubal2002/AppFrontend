type Coord = { latitude: number; longitude: number };

export const escapeHTML = (text: string) =>
  text.replace(/'/g, "\\'").replace(/"/g, '\\"');

export const generateLeafletHTML = ({
  store,
  userLocation = null,
  showRoute = false,
}: {
  store: { name: string; latitude: number; longitude: number, logo?: string};
  userLocation?: Coord | null;
  showRoute?: boolean;
}) => {
  const escapedName = escapeHTML(store.name);

  const routeScripts = userLocation
    ? `
    const userIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [35, 35]
    });

    L.marker([${userLocation.latitude}, ${userLocation.longitude}], { icon: userIcon })
      .addTo(map)
      .bindPopup('Tu ubicación');

    L.polyline([
      [${store.latitude}, ${store.longitude}],
      [${userLocation.latitude}, ${userLocation.longitude}]
    ], {
      color: 'blue',
      weight: 3,
      dashArray: '5, 10'
    }).addTo(map);

    L.circle([${userLocation.latitude}, ${userLocation.longitude}], {
      color: '#005dcc',
      fillColor: '#005dcc',
      fillOpacity: 0.2,
      radius: 100
    }).addTo(map);

    function haversine(lat1, lon1, lat2, lon2) {
      const R = 6371e3;
      const toRad = deg => deg * Math.PI / 180;
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a = Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c);
    }

    const distancia = haversine(
      ${store.latitude}, ${store.longitude},
      ${userLocation.latitude}, ${userLocation.longitude}
    );

    L.popup()
      .setLatLng([
        (${store.latitude} + ${userLocation.latitude}) / 2,
        (${store.longitude} + ${userLocation.longitude}) / 2
      ])
      .setContent('Distancia aproximada: ' + distancia + ' metros')
      .openOn(map);
  ` : '';

  const routingScript = showRoute && userLocation ? `
    L.Routing.control({
      waypoints: [
        L.latLng(${userLocation.latitude}, ${userLocation.longitude}),
        L.latLng(${store.latitude}, ${store.longitude})
      ],
      router: new L.Routing.OSRMv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
        language: 'es'
      }),
      lineOptions: {
        styles: [{ color: '#005dcc', weight: 5 }]
      },
      createMarker: () => null,
      addWaypoints: false,
      draggableWaypoints: false
    }).addTo(map);
  ` : '';

  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
      ${showRoute ? `<link rel="stylesheet" href="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.css" />` : ''}
      <style>
        html, body, #map { height: 100%; margin: 0; padding: 0; }
        button { font-size: 14px; border: none; border-radius: 4px; cursor: pointer; }
        .store-logo-icon {
          border-radius: 50% !important;
          border: 2px solid black !important;
          background-color: white !important;
          object-fit: cover !important;
        }
      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
      ${showRoute ? `<script src="https://unpkg.com/leaflet-routing-machine@latest/dist/leaflet-routing-machine.min.js"></script>` : ''}
      <script>
        setTimeout(() => {
          const map = L.map('map').setView([${store.latitude}, ${store.longitude}], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          ${store.logo ? `
            const storeIcon = L.icon({
              iconUrl: '${store.logo}',
              iconSize: [50, 50],
              iconAnchor: [25, 50],
              popupAnchor: [0, -50],
              className: 'store-logo-icon'
            });

            L.marker([${store.latitude}, ${store.longitude}], { icon: storeIcon })
              .addTo(map)
              .bindPopup('${escapedName}')
              .openPopup();
            ` : `
            L.marker([${store.latitude}, ${store.longitude}])
              .addTo(map)
              .bindPopup('${escapedName}')
              .openPopup();
            `}


          ${routeScripts}
          ${routingScript}
        }, 500);
      </script>
    </body>
  </html>
  `;
};
