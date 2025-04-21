import type { LatLngExpression } from "leaflet";

export interface ClientSideLeafletProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialPosition: LatLngExpression;
}

declare const ClientSideLeaflet: React.FC<ClientSideLeafletProps>;

export default ClientSideLeaflet;
