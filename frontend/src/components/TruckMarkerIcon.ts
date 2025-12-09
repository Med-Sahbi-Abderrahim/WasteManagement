import L from 'leaflet';

export const createTruckMarkerIcon = (type: 'Benne' | 'Recyclage') => {
  const color = type === 'Benne' ? '#2563eb' : '#f97316';

  // Icône camion simple (SVG)
  const truckSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>`;

  const html = `
    <div style="
      background-color: ${color};
      width: 32px;
      height: 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      border: 1.5px solid white;
    ">
      ${truckSvg}
    </div>
  `;

  return L.divIcon({
    html: html,
    className: 'custom-truck-rect',
    iconSize: [32, 20],
    iconAnchor: [16, 10],
    popupAnchor: [0, -10]
  });
};
