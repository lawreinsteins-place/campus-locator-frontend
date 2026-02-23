import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { campusLocations } from '../utils/campusLocations';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons
const createIcon = (color, emoji) => {
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="transform: rotate(45deg); font-size: 14px;">${emoji}</span>
      </div>
    `,
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Category colors
const categoryColors = {
  Library: '#4CAF50',
  Food: '#FF9800',
  Academic: '#2196F3',
  Sports: '#F44336',
  Social: '#9C27B0',
  Health: '#00BCD4',
  Accommodation: '#795548',
  Entrance: '#607D8B',
};

function CampusMap({ onlineUsers = [], currentUser = null, onLocationSelect }) {
  // Center map on your campus (University of Ibadan example)
  const campusCenter = [7.4452, 3.8966];
  const zoomLevel = 16;

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={campusCenter}
        zoom={zoomLevel}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        {/* Map tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Campus location markers */}
        {campusLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.coordinates.lat, location.coordinates.lng]}
            icon={createIcon(
              categoryColors[location.category] || '#667eea',
              location.icon
            )}
            eventHandlers={{
              click: () => onLocationSelect && onLocationSelect(location),
            }}
          >
            <Popup>
              <div style={popupStyles.container}>
                <span style={popupStyles.icon}>{location.icon}</span>
                <strong style={popupStyles.name}>{location.name}</strong>
                <span style={{
                  ...popupStyles.badge,
                  background: categoryColors[location.category] || '#667eea'
                }}>
                  {location.category}
                </span>
                <p style={popupStyles.description}>{location.description}</p>
                <button
                  onClick={() => onLocationSelect && onLocationSelect(location)}
                  style={popupStyles.button}
                >
                  📍 Check In Here
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Online users markers */}
        {onlineUsers.map((user) => (
          user.currentLocation && (
            <Marker
              key={user.id}
              position={[
                user.currentLocation.coordinates.lat,
                user.currentLocation.coordinates.lng
              ]}
              icon={createIcon(
                user.id === currentUser?.id ? '#667eea' : '#4CAF50',
                user.id === currentUser?.id ? '👤' : '👥'
              )}
            >
              <Popup>
                <div style={popupStyles.container}>
                  <strong style={popupStyles.name}>
                    {user.id === currentUser?.id ? '📍 You' : `👤 ${user.name}`}
                  </strong>
                  <p style={popupStyles.description}>
                    📍 {user.currentLocation.name}
                  </p>
                  {user.status && (
                    <p style={popupStyles.status}>
                      💬 "{user.status}"
                    </p>
                  )}
                  <p style={popupStyles.time}>
                    🕐 {getTimeAgo(user.currentLocation.timestamp)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        ))}
      </MapContainer>
    </div>
  );
}

// Helper: Time ago
function getTimeAgo(timestamp) {
  if (!timestamp) return 'Just now';
  const diff = Math.floor((Date.now() - new Date(timestamp)) / 1000 / 60);
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${diff} min ago`;
  return `${Math.floor(diff / 60)} hr ago`;
}

const popupStyles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    minWidth: '150px',
    padding: '4px',
  },
  icon: {
    fontSize: '24px',
    textAlign: 'center',
  },
  name: {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#333',
  },
  badge: {
    display: 'inline-block',
    color: 'white',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '11px',
    width: 'fit-content',
  },
  description: {
    fontSize: '12px',
    color: '#666',
    margin: 0,
  },
  status: {
    fontSize: '12px',
    color: '#667eea',
    fontStyle: 'italic',
    margin: 0,
  },
  time: {
    fontSize: '11px',
    color: '#999',
    margin: 0,
  },
  button: {
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    marginTop: '4px',
    width: '100%',
  },
};

export default CampusMap;