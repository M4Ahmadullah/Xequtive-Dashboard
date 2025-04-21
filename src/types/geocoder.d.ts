declare module "@/components/GeocoderControl" {
  import { ReactNode } from "react";

  interface GeocoderControlProps {
    position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
    onResult?: (result: {
      result: {
        center: [number, number];
        place_name: string;
      };
    }) => void;
  }

  const GeocoderControl: (props: GeocoderControlProps) => ReactNode;
  export default GeocoderControl;
}
