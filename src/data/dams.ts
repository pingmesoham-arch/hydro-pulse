export interface DamMetadata {
  id: string;
  name: string;
  river: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  type: string;
  heightM: number;
  lengthM: number;
  grossStorageMcm: number;
}

export const dams: DamMetadata[] = [
  {
    id: "gangapur-dam",
    name: "Gangapur Dam",
    river: "Godavari River",
    state: "Maharashtra",
    district: "Nashik",
    latitude: 20.03535,
    longitude: 73.68311,
    type: "Earthfill",
    heightM: 36.59,
    lengthM: 3902,
    grossStorageMcm: 215.88
  },
  {
    id: "bhakra-dam",
    name: "Bhakra Dam",
    river: "Sutlej River",
    state: "Himachal Pradesh",
    district: "Bilaspur",
    latitude: 31.411,
    longitude: 76.438,
    type: "Concrete Gravity",
    heightM: 226,
    lengthM: 518,
    grossStorageMcm: 9621
  },
  {
    id: "hirakud-dam",
    name: "Hirakud Dam",
    river: "Mahanadi River",
    state: "Odisha",
    district: "Sambalpur",
    latitude: 21.524,
    longitude: 83.875,
    type: "Earthfill/Concrete",
    heightM: 60.96,
    lengthM: 4800,
    grossStorageMcm: 8136
  }
];
