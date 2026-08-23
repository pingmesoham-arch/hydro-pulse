export interface InfrastructureAsset {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'bridge' | 'settlement' | 'road';
  latitude: number;
  longitude: number;
  elevationM: number;
}

export const mockInfrastructure: InfrastructureAsset[] = [
  {
    id: "inf-1",
    name: "Nashik Civil Hospital",
    type: "hospital",
    latitude: 20.0076,
    longitude: 73.7745,
    elevationM: 580
  },
  {
    id: "inf-2",
    name: "Godavari Bridge (Ahilya Bai Holkar)",
    type: "bridge",
    latitude: 20.0031,
    longitude: 73.7885,
    elevationM: 565
  },
  {
    id: "inf-3",
    name: "Gangapur Village Settlement",
    type: "settlement",
    latitude: 20.0210,
    longitude: 73.7150,
    elevationM: 575
  },
  {
    id: "inf-4",
    name: "Someshwar Waterfall Road",
    type: "road",
    latitude: 20.0150,
    longitude: 73.7380,
    elevationM: 570
  },
  {
    id: "inf-5",
    name: "Primary School Gangapur",
    type: "school",
    latitude: 20.0200,
    longitude: 73.7180,
    elevationM: 576
  }
];
