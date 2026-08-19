export type RiskResult = {
  risk: number;
  status: "NORMAL" | "WARNING" | "HIGH" | "CRITICAL";
};

export function calculateFireRisk(
  temperature: number,
  humidity: number,
  smoke: number,
  temperatureChange: number = 0
): RiskResult {
  let risk = 0;

  /*
   * TEMPERATURE
   *
   * Чем выше температура, тем сильнее её вклад
   * в общий Fire Risk.
   */

  if (temperature <= 25) {
    risk += 0;
  } else if (temperature <= 30) {
    risk += 5;
  } else if (temperature <= 35) {
    risk += 12;
  } else if (temperature <= 40) {
    risk += 20;
  } else if (temperature <= 45) {
    risk += 27;
  } else if (temperature <= 50) {
    risk += 34;
  } else {
    risk += 40;
  }

  /*
   * HUMIDITY
   *
   * Чем ниже влажность, тем выше риск.
   */

  if (humidity >= 60) {
    risk += 0;
  } else if (humidity >= 45) {
    risk += 5;
  } else if (humidity >= 35) {
    risk += 10;
  } else if (humidity >= 25) {
    risk += 15;
  } else if (humidity >= 15) {
    risk += 20;
  } else {
    risk += 25;
  }

  /*
   * SMOKE
   *
   * Дым является одним из самых сильных индикаторов
   * потенциального пожара.
   */

  if (smoke <= 5) {
    risk += 0;
  } else if (smoke <= 10) {
    risk += 5;
  } else if (smoke <= 20) {
    risk += 12;
  } else if (smoke <= 30) {
    risk += 20;
  } else if (smoke <= 50) {
    risk += 28;
  } else if (smoke <= 70) {
    risk += 35;
  } else if (smoke <= 85) {
    risk += 42;
  } else {
    risk += 50;
  }

  /*
   * TEMPERATURE DYNAMICS
   *
   * Учитываем не только абсолютную температуру,
   * но и насколько быстро она выросла.
   */

  if (temperatureChange >= 15) {
    risk += 10;
  } else if (temperatureChange >= 10) {
    risk += 8;
  } else if (temperatureChange >= 5) {
    risk += 5;
  } else if (temperatureChange >= 2) {
    risk += 2;
  }

  /*
   * Ограничиваем Risk Score диапазоном 0–100.
   */

  risk = Math.min(Math.round(risk), 100);

  /*
   * FINAL STATUS
   */

  let status: RiskResult["status"];

  if (risk >= 75) {
    status = "CRITICAL";
  } else if (risk >= 50) {
    status = "HIGH";
  } else if (risk >= 30) {
    status = "WARNING";
  } else {
    status = "NORMAL";
  }

  return {
    risk,
    status,
  };
}