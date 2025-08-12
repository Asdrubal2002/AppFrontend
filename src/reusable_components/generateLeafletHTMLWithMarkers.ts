// reusable_components/generateLeafletHTMLWithMarkers.ts
type Coord = { latitude: number; longitude: number };
type MarkerItem = {
  name: string;
  slug: string;
  id?: string;
  latitude: number;
  longitude: number;
  distance?: number;
  type?: 'store' | 'product';
};

export const escapeHTML = (text: string) =>
  text.replace(/'/g, "\\'").replace(/"/g, '\\"');

export const generateLeafletHTMLWithMarkers = ({
  markers,
  userLocation,
}: {
  markers: MarkerItem[];
  userLocation: Coord;
}) => {
  const userLat = userLocation.latitude;
  const userLng = userLocation.longitude;

  const markersHTML = markers
    .map((item, i) => {
      const name = escapeHTML(item.name);
      const distText = item.distance ? `<br><small>Distancia: ${item.distance} m</small>` : '';
      const iconVar = `customIcon${i}`;
      const iconCode = item.logo
        ? `
        const ${iconVar} = L.icon({
          iconUrl: '${item.logo}',
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          popupAnchor: [0, -40],
          className: 'store-logo-icon'
        });

        L.marker([${item.latitude}, ${item.longitude}], { icon: ${iconVar} })
          .addTo(map)
          .bindPopup("<strong>${name}</strong>${distText}<br><button onclick='handleClick(\\\"${item.slug}\\\", \\\"${item.type || 'store'}\\\", \\\"${item.id || ''}\\\")'>Visitar</button>");
      `
        : `
        L.marker([${item.latitude}, ${item.longitude}])
          .addTo(map)
          .bindPopup("<strong>${name}</strong>${distText}<br><button onclick='handleClick(\\\"${item.slug}\\\", \\\"${item.type || 'store'}\\\", \\\"${item.id || ''}\\\")'>Visitar</button>");
      `;

      return iconCode;
    })
    .join('\n');



  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.3/dist/leaflet.css" />
      <style>
        html, body { margin: 0; padding: 0; height: 100%; }
        #map { width: 100%; height: 100vh; }
        button {
          background-color: #005dcc;
          color: white;
          border: none;
          padding: 4px 8px;
          margin-top: 5px;
          border-radius: 4px;
          cursor: pointer;
        }

        .store-logo-icon {
          border-radius: 50% !important;
          border: 2px solid black !important;
          object-fit: cover !important;
          background-color: white !important;
        }


      </style>
    </head>
    <body>
      <div id="map"></div>
      <script src="https://unpkg.com/leaflet@1.9.3/dist/leaflet.js"></script>
      <script>
        document.addEventListener("DOMContentLoaded", function () {
          const map = L.map('map').setView([${userLat}, ${userLng}], 15);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
          }).addTo(map);

          const userIcon = L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [35, 35]
          });

          L.marker([${userLat}, ${userLng}], { icon: userIcon })
            .addTo(map)
            .bindPopup('Tu ubicación')
            .openPopup();

          L.circle([${userLat}, ${userLng}], {
            color: '#005dcc',
            fillColor: '#005dcc',
            fillOpacity: 0.2,
            radius: 100
          }).addTo(map);

          // Marcadores
          ${markersHTML}
        });

        function handleClick(slug, markerType, id) {
          console.log("📍 Clic en marcador:", slug, markerType, id); // 👈
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'markerClick',
            slug: slug,
            id: id,
            markerType: markerType
          }));
        }
      </script>
      
    </body>
    
  </html>
  `;
};
