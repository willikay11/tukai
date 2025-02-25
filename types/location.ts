export type Location = {
  id: string;
  name: string;
  pointLat: number;
  pointLong: number;
  point: { type: string; coordinates: [number, number] };
  formattedAddress: string;
  street: string;
  city: string;
  state: string;
  country: string;
};
