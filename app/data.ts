import { calculateFireRisk } from "./risk-engine";

export type StationStatus = "NORMAL" | "WARNING" | "HIGH" | "CRITICAL";

export type Station = {
  id: number;
  name: string;
  location: string;
  temperature: number;
  humidity: number;
  smoke: number;
  risk: number;
  status: StationStatus;
  latitude: number;
  longitude: number;
};

export const stations: Station[] = [
  {
    id: 1,
    name: "Station #01",
    location: "Ханская роща",
    temperature: 27,
    humidity: 46,
    smoke: 8,
    ...calculateFireRisk(27, 46, 8),
    latitude: 51.17,
    longitude: 51.37,
  },
  {
    id: 2,
    name: "Station #02",
    location: "Городской парк",
    temperature: 29,
    humidity: 42,
    smoke: 11,
    ...calculateFireRisk(29, 42, 11),
    latitude: 51.18,
    longitude: 51.35,
  },
  {
    id: 3,
    name: "Station #03",
    location: "Лесной массив",
    temperature: 39,
    humidity: 19,
    smoke: 4,
    ...calculateFireRisk(39, 19, 4),
    latitude: 51.16,
    longitude: 51.39,
  },
  {
    id: 4,
    name: "Station #04",
    location: "Ханская роща",
    temperature: 43.7,
    humidity: 17,
    smoke: 87,
    ...calculateFireRisk(43.7, 17, 87),
    latitude: 51.15,
    longitude: 51.41,
  },
];