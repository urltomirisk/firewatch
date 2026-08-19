"use client";

import { useEffect, useRef, useState } from "react";
import { stations as initialStations, Station } from "./data";
import { calculateFireRisk } from "./risk-engine";

type Language = "ru" | "en";

type EventType =
  | "SYSTEM"
  | "SENSOR"
  | "WARNING"
  | "DRONE"
  | "CRITICAL"
  | "RESET";

type EventLog = {
  id: number;
  time: string;
  station: string;
  type: EventType;
  message: string;
};

type SensorPoint = {
  time: string;
  temperature: number;
  humidity: number;
  smoke: number;
};

const translations = {
  ru: {
    systemOnline: "СИСТЕМА ОНЛАЙН",
    earlyDetection: "Система раннего обнаружения пожаров",

    smartCity: "Умный город • Мониторинг пожаров",
    dashboard: "Панель FireWatch",

    activeStations: "Активные станции",
    monitoringNow: "Мониторинг ведётся",
    normal: "Норма",
    noThreat: "Непосредственной угрозы нет",
    warnings: "Предупреждения",
    requiresAttention: "Требует внимания",
    critical: "Критические",
    immediateAttention: "Требуется немедленная реакция",

    monitoringMap: "Карта мониторинга",
    sensorNetwork: "Сеть сенсоров FireWatch",
    normalLegend: "Норма",
    warningLegend: "Предупреждение",
    highLegend: "Высокий риск",
    criticalLegend: "Критическая ситуация",
    monitoringZone: "Зона мониторинга Уральска",

    selectedStation: "Выбранная станция",

    temperature: "Температура",
    humidity: "Влажность",
    smoke: "Дым",
    fireRisk: "Риск пожара",

    riskScale: "Шкала риска",
    riskNormal: "0–29 • НОРМА",
    riskWarning: "30–59 • ПРЕДУПРЕЖДЕНИЕ",
    riskHigh: "60–74 • ВЫСОКИЙ РИСК",
    riskCritical: "75–100 • КРИТИЧЕСКИЙ",

    simulateFire: "СИМУЛИРОВАТЬ ПОЖАР",
    resetSimulation: "↺ Сбросить симуляцию",

    policeDrone: "Полицейский дрон",
    visualVerification: "Рекомендуется визуальная проверка.",
    droneInvestigating: "Дрон исследует территорию.",
    fireConfirmed: "Пожар подтверждён дроном.",
    sendDrone: "ОТПРАВИТЬ ДРОН",
    drone: "Дрон",

    fireAlert: "ТРЕВОГА: ПОЖАР",
    potentialFire:
      "Обнаружены признаки потенциального пожара на станции.",
    rapidResponse: "Рекомендуется немедленное реагирование.",
    droneConfirmed:
      "Полицейский дрон подтвердил наличие пожара.",
    simulationEvent: "Событие симуляции обнаружено только что.",

    sensorHistory: "История сенсоров",
    environmentalDynamics:
      "Динамика окружающей среды в реальном времени",
    currentTemperature: "Текущая температура",
    currentHumidity: "Текущая влажность",
    currentSmoke: "Текущий уровень дыма",

    temperatureChart: "Температура",
    humidityChart: "Влажность",
    smokeChart: "Дым",

    sensorDescription:
      "Система анализирует динамику показаний сенсоров во времени. Быстрое повышение температуры, снижение влажности и рост концентрации дыма увеличивают рассчитанный риск пожара.",

    eventLog: "Журнал событий",
    eventDescription:
      "Автоматическая регистрация активности системы и чрезвычайных событий",
    clearLog: "Очистить журнал",
    noEvents: "События ещё не зарегистрированы.",

    system: "СИСТЕМА",
    sensor: "СЕНСОР",
    warning: "ПРЕДУПРЕЖДЕНИЕ",
    droneEvent: "ДРОН",
    criticalEvent: "КРИТИЧЕСКОЕ",
    reset: "СБРОС",

    initialized: "Система мониторинга FireWatch запущена.",
    simulationStarted:
      "🔥 Симуляция пожара запущена. Система отслеживает динамику сенсоров.",
    sensorsUpdated: "Сенсоры обновлены",
    warningIncreased: "⚠️ Риск пожара повысился до",
    statusWarning: "Статус изменён на ПРЕДУПРЕЖДЕНИЕ.",
    highRisk: "⚠️ Обнаружен высокий риск пожара:",
    criticalRisk: "🚨 ОБНАРУЖЕН КРИТИЧЕСКИЙ РИСК ПОЖАРА:",
    fireActivated:
      "🔥 ТРЕВОГА ПОЖАРА активирована. Требуется немедленное реагирование.",
    simulationMaximum:
      "🔥 Симуляция достигла максимального уровня опасности.",

    droneDispatched:
      "🚁 Полицейский дрон отправлен для проверки территории.",
    droneConfirmedMessage:
      "🚁 Дрон подтвердил признаки пожара. Визуальная проверка завершена.",

    resetMessage:
      "↺ Симуляция сброшена. Все станции возвращены к исходным значениям.",

    language: "Язык",

    fireDetected: "ПОЖАР ОБНАРУЖЕН",
    fireZone: "ОЧАГ ПОЖАРА",
  },

  en: {
    systemOnline: "SYSTEM ONLINE",
    earlyDetection: "Early Fire Detection System",

    smartCity: "Smart City • Fire Monitoring",
    dashboard: "FireWatch Dashboard",

    activeStations: "Active Stations",
    monitoringNow: "Monitoring now",
    normal: "Normal",
    noThreat: "No immediate threat",
    warnings: "Warnings",
    requiresAttention: "Requires attention",
    critical: "Critical",
    immediateAttention: "Immediate attention required",

    monitoringMap: "Monitoring Map",
    sensorNetwork: "FireWatch sensor network",
    normalLegend: "Normal",
    warningLegend: "Warning",
    highLegend: "High risk",
    criticalLegend: "Critical",
    monitoringZone: "Uralsk monitoring zone",

    selectedStation: "Selected Station",

    temperature: "Temperature",
    humidity: "Humidity",
    smoke: "Smoke",
    fireRisk: "Fire Risk",

    riskScale: "Risk Scale",
    riskNormal: "0–29 • NORMAL",
    riskWarning: "30–59 • WARNING",
    riskHigh: "60–74 • HIGH RISK",
    riskCritical: "75–100 • CRITICAL",

    simulateFire: "SIMULATE FIRE",
    resetSimulation: "↺ Reset Simulation",

    policeDrone: "Police Drone",
    visualVerification: "Visual verification recommended.",
    droneInvestigating: "Drone is investigating the area.",
    fireConfirmed: "Fire confirmed by drone.",
    sendDrone: "SEND DRONE",
    drone: "Drone",

    fireAlert: "FIRE ALERT",
    potentialFire: "Potential fire detected at this station.",
    rapidResponse: "Rapid response recommended.",
    droneConfirmed: "Police drone confirmed the fire.",
    simulationEvent: "Simulation event detected just now.",

    sensorHistory: "Sensor History",
    environmentalDynamics:
      "Real-time environmental dynamics",
    currentTemperature: "Current Temperature",
    currentHumidity: "Current Humidity",
    currentSmoke: "Current Smoke",

    temperatureChart: "Temperature",
    humidityChart: "Humidity",
    smokeChart: "Smoke",

    sensorDescription:
      "The system analyzes sensor dynamics over time. A rapid temperature increase, decreasing humidity and rising smoke concentration can increase the calculated fire risk.",

    eventLog: "Event Log",
    eventDescription:
      "Automatic system activity and emergency events",
    clearLog: "Clear Log",
    noEvents: "No events recorded yet.",

    system: "SYSTEM",
    sensor: "SENSOR",
    warning: "WARNING",
    droneEvent: "DRONE",
    criticalEvent: "CRITICAL",
    reset: "RESET",

    initialized: "FireWatch monitoring system initialized.",
    simulationStarted:
      "🔥 Fire simulation started. Monitoring sensor dynamics.",
    sensorsUpdated: "Sensors updated",
    warningIncreased: "⚠️ Fire risk increased to",
    statusWarning: "Status changed to WARNING.",
    highRisk: "⚠️ High fire risk detected:",
    criticalRisk: "🚨 CRITICAL fire risk detected:",
    fireActivated:
      "🔥 FIRE ALERT activated. Immediate response recommended.",
    simulationMaximum:
      "🔥 Fire simulation reached maximum severity.",

    droneDispatched:
      "🚁 Police drone dispatched to investigate the area.",
    droneConfirmedMessage:
      "🚁 Drone confirmed signs of fire. Emergency verification complete.",

    resetMessage:
      "↺ Simulation reset. All stations returned to baseline values.",

    language: "Language",

    fireDetected: "FIRE DETECTED",
    fireZone: "FIRE ZONE",
  },
};

export default function Home() {
  const [language, setLanguage] =
    useState<Language>("en");

  const t = translations[language];

  const [stations, setStations] =
    useState<Station[]>(initialStations);

  const [selectedStationId, setSelectedStationId] =
    useState(4);

  const [fireSimulated, setFireSimulated] =
    useState(false);

  const [simulationStep, setSimulationStep] =
    useState(0);

  const [droneDispatched, setDroneDispatched] =
    useState<Record<number, boolean>>({});

  const [droneConfirmed, setDroneConfirmed] =
    useState<Record<number, boolean>>({});

  const [events, setEvents] = useState<EventLog[]>([
    {
      id: 1,
      time: new Date().toLocaleTimeString(),
      station: "SYSTEM",
      type: "SYSTEM",
      message: translations.en.initialized,
    },
  ]);

  const [sensorHistory, setSensorHistory] =
    useState<Record<number, SensorPoint[]>>(() => {
      const history: Record<number, SensorPoint[]> = {};

      initialStations.forEach((station) => {
        history[station.id] = [
          {
            time: new Date().toLocaleTimeString(),
            temperature: station.temperature,
            humidity: station.humidity,
            smoke: station.smoke,
          },
        ];
      });

      return history;
    });

  const simulationInterval =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const eventId = useRef(2);

  const selectedStation =
    stations.find(
      (station) => station.id === selectedStationId
    ) ?? stations[3];

  const selectedHistory =
    sensorHistory[selectedStation.id] ?? [];

  /*
   * VISUAL RISK LEVEL
   *
   * Здесь цвет определяется именно числом Risk Score.
   *
   * 0–29   = GREEN
   * 30–59  = YELLOW
   * 60–74  = ORANGE
   * 75–100 = RED
   *
   * Поэтому, например, 59 всегда будет ЖЁЛТЫМ.
   */

  const getRiskLevel = (risk: number) => {
    if (risk >= 75) {
      return "CRITICAL";
    }

    if (risk >= 60) {
      return "HIGH";
    }

    if (risk >= 30) {
      return "WARNING";
    }

    return "NORMAL";
  };

  const getRiskTextColor = (risk: number) => {
    const level = getRiskLevel(risk);

    if (level === "CRITICAL") {
      return "text-red-400";
    }

    if (level === "HIGH") {
      return "text-orange-400";
    }

    if (level === "WARNING") {
      return "text-yellow-400";
    }

    return "text-emerald-400";
  };

  const getRiskBackground = (risk: number) => {
    const level = getRiskLevel(risk);

    if (level === "CRITICAL") {
      return "border-red-500/20 bg-red-500/5";
    }

    if (level === "HIGH") {
      return "border-orange-500/20 bg-orange-500/5";
    }

    if (level === "WARNING") {
      return "border-yellow-500/20 bg-yellow-500/5";
    }

    return "border-emerald-500/20 bg-emerald-500/5";
  };

  const getRiskBarColor = (risk: number) => {
    const level = getRiskLevel(risk);

    if (level === "CRITICAL") {
      return "bg-red-500";
    }

    if (level === "HIGH") {
      return "bg-orange-500";
    }

    if (level === "WARNING") {
      return "bg-yellow-500";
    }

    return "bg-emerald-500";
  };

  const statusStyles = {
    NORMAL:
      "bg-emerald-500 border-emerald-400/30 shadow-emerald-500/20",

    WARNING:
      "bg-yellow-500 border-yellow-400/30 shadow-yellow-500/20",

    HIGH:
      "bg-orange-500 border-orange-400/30 shadow-orange-500/20",

    CRITICAL:
      "bg-red-500 border-red-400/30 shadow-red-500/30",
  };

  const getEventTypeLabel = (
    type: EventType
  ) => {
    const labels = {
      SYSTEM: t.system,
      SENSOR: t.sensor,
      WARNING: t.warning,
      DRONE: t.droneEvent,
      CRITICAL: t.criticalEvent,
      RESET: t.reset,
    };

    return labels[type];
  };

  const addEvent = (
    station: string,
    type: EventType,
    message: string
  ) => {
    const newEvent: EventLog = {
      id: eventId.current++,
      time: new Date().toLocaleTimeString(),
      station,
      type,
      message,
    };

    setEvents((currentEvents) =>
      [newEvent, ...currentEvents].slice(0, 30)
    );
  };

  const addSensorPoint = (
    stationId: number,
    temperature: number,
    humidity: number,
    smoke: number
  ) => {
    const point: SensorPoint = {
      time: new Date().toLocaleTimeString(),
      temperature,
      humidity,
      smoke,
    };

    setSensorHistory((currentHistory) => ({
      ...currentHistory,
      [stationId]: [
        ...(currentHistory[stationId] ?? []),
        point,
      ].slice(-20),
    }));
  };

  const dispatchDrone = (stationId: number) => {
    const station = stations.find(
      (item) => item.id === stationId
    );

    if (!station) {
      return;
    }

    if (droneDispatched[stationId]) {
      return;
    }

    setDroneDispatched((current) => ({
      ...current,
      [stationId]: true,
    }));

    addEvent(
      station.name,
      "DRONE",
      t.droneDispatched
    );

    if (station.status === "CRITICAL") {
      setTimeout(() => {
        setDroneConfirmed((current) => ({
          ...current,
          [stationId]: true,
        }));

        addEvent(
          station.name,
          "DRONE",
          t.droneConfirmedMessage
        );
      }, 1500);
    }
  };

  const simulateFire = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
    }

    const stationAtStart = stations.find(
      (station) => station.id === selectedStationId
    );

    if (!stationAtStart) {
      return;
    }

    setFireSimulated(true);
    setSimulationStep(0);

    addEvent(
      stationAtStart.name,
      "SYSTEM",
      t.simulationStarted
    );

    const simulation = [
      {
        temperature: stationAtStart.temperature,
        humidity: stationAtStart.humidity,
        smoke: stationAtStart.smoke,
      },
      {
        temperature:
          stationAtStart.temperature + 4,
        humidity: Math.max(
          stationAtStart.humidity - 7,
          0
        ),
        smoke:
          stationAtStart.smoke + 6,
      },
      {
        temperature:
          stationAtStart.temperature + 8,
        humidity: Math.max(
          stationAtStart.humidity - 15,
          0
        ),
        smoke:
          stationAtStart.smoke + 18,
      },
      {
        temperature:
          stationAtStart.temperature + 12,
        humidity: Math.max(
          stationAtStart.humidity - 24,
          0
        ),
        smoke:
          stationAtStart.smoke + 41,
      },
      {
        temperature:
          stationAtStart.temperature + 16,
        humidity: Math.max(
          stationAtStart.humidity - 34,
          0
        ),
        smoke:
          stationAtStart.smoke + 83,
      },
    ];

    const updateStation = (
      currentStep: number
    ) => {
      const values = simulation[currentStep];

      setStations((currentStations) =>
        currentStations.map((station) => {
          if (
            station.id !== selectedStationId
          ) {
            return station;
          }

          const previousStatus =
            station.status;

          const previousTemperature =
            station.temperature;

          const temperatureChange =
            values.temperature -
            previousTemperature;

          const result = calculateFireRisk(
            values.temperature,
            values.humidity,
            values.smoke,
            temperatureChange
          );

          if (currentStep > 0) {
            addEvent(
              station.name,
              "SENSOR",
              `${t.sensorsUpdated}: ${values.temperature}°C ${t.temperature.toLowerCase()}, ${values.humidity}% ${t.humidity.toLowerCase()}, ${values.smoke}% ${t.smoke.toLowerCase()}.`
            );
          }

          addSensorPoint(
            station.id,
            values.temperature,
            values.humidity,
            values.smoke
          );

          if (
            previousStatus !== result.status &&
            result.status === "WARNING"
          ) {
            addEvent(
              station.name,
              "WARNING",
              `${t.warningIncreased} ${result.risk}/100. ${t.statusWarning}`
            );

            setTimeout(() => {
              dispatchDrone(station.id);
            }, 300);
          }

          if (
            previousStatus !== result.status &&
            result.status === "HIGH"
          ) {
            addEvent(
              station.name,
              "WARNING",
              `${t.highRisk} ${result.risk}/100.`
            );
          }

          if (
            previousStatus !== result.status &&
            result.status === "CRITICAL"
          ) {
            addEvent(
              station.name,
              "CRITICAL",
              `${t.criticalRisk} ${result.risk}/100.`
            );

            addEvent(
              station.name,
              "CRITICAL",
              t.fireActivated
            );

            setTimeout(() => {
              dispatchDrone(station.id);
            }, 300);
          }

          return {
            ...station,
            temperature:
              values.temperature,
            humidity:
              values.humidity,
            smoke:
              values.smoke,
            risk: result.risk,
            status: result.status,
          };
        })
      );

      setSimulationStep(currentStep);
    };

    updateStation(0);

    let step = 0;

    simulationInterval.current =
      setInterval(() => {
        step += 1;

        if (
          step >= simulation.length
        ) {
          if (
            simulationInterval.current
          ) {
            clearInterval(
              simulationInterval.current
            );

            simulationInterval.current =
              null;
          }

          addEvent(
            stationAtStart.name,
            "SYSTEM",
            t.simulationMaximum
          );

          return;
        }

        updateStation(step);
      }, 2000);
  };

  const resetStation = () => {
    if (simulationInterval.current) {
      clearInterval(simulationInterval.current);
      simulationInterval.current = null;
    }

    setStations(initialStations);
    setFireSimulated(false);
    setSimulationStep(0);
    setDroneDispatched({});
    setDroneConfirmed({});

    const resetHistory: Record<
      number,
      SensorPoint[]
    > = {};

    initialStations.forEach((station) => {
      resetHistory[station.id] = [
        {
          time: new Date().toLocaleTimeString(),
          temperature: station.temperature,
          humidity: station.humidity,
          smoke: station.smoke,
        },
      ];
    });

    setSensorHistory(resetHistory);

    addEvent(
      "SYSTEM",
      "RESET",
      t.resetMessage
    );
  };

  const clearEvents = () => {
    setEvents([]);
    eventId.current = 1;
  };

  useEffect(() => {
    return () => {
      if (simulationInterval.current) {
        clearInterval(
          simulationInterval.current
        );
      }
    };
  }, []);

  const normalCount = stations.filter(
    (station) =>
      station.status === "NORMAL"
  ).length;

  const warningCount = stations.filter(
    (station) =>
      station.risk >= 30 &&
      station.risk < 60
  ).length;

  const criticalCount = stations.filter(
    (station) =>
      station.risk >= 75
  ).length;

  const eventTypeStyles: Record<
    EventType,
    string
  > = {
    SYSTEM:
      "bg-slate-500/10 text-slate-400",

    SENSOR:
      "bg-blue-500/10 text-blue-400",

    WARNING:
      "bg-yellow-500/10 text-yellow-400",

    DRONE:
      "bg-purple-500/10 text-purple-400",

    CRITICAL:
      "bg-red-500/10 text-red-400",

    RESET:
      "bg-slate-500/10 text-slate-400",
  };

  /*
   * GRAPH
   */

  const chartWidth = 760;
  const chartHeight = 260;

  const chartPadding = {
    top: 25,
    right: 20,
    bottom: 35,
    left: 45,
  };

  const innerWidth =
    chartWidth -
    chartPadding.left -
    chartPadding.right;

  const innerHeight =
    chartHeight -
    chartPadding.top -
    chartPadding.bottom;

  const getX = (index: number) => {
    if (
      selectedHistory.length <= 1
    ) {
      return chartPadding.left;
    }

    return (
      chartPadding.left +
      (index /
        (selectedHistory.length - 1)) *
        innerWidth
    );
  };

  const getY = (value: number) => {
    return (
      chartPadding.top +
      innerHeight -
      (Math.min(
        Math.max(value, 0),
        100
      ) /
        100) *
        innerHeight
    );
  };

  const createPath = (
    values: number[]
  ) => {
    if (values.length === 0) {
      return "";
    }

    return values
      .map((value, index) => {
        const x = getX(index);
        const y = getY(value);

        return `${
          index === 0 ? "M" : "L"
        } ${x} ${y}`;
      })
      .join(" ");
  };

  const temperaturePath =
    createPath(
      selectedHistory.map((point) =>
        Math.min(
          point.temperature,
          100
        )
      )
    );

  const humidityPath =
    createPath(
      selectedHistory.map(
        (point) => point.humidity
      )
    );

  const smokePath =
    createPath(
      selectedHistory.map(
        (point) => point.smoke
      )
    );

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-950/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 text-xl">
              🔥
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                FIREWATCH
              </h1>

              <p className="text-xs text-slate-400">
                {t.earlyDetection}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* LANGUAGE SWITCHER */}

            <div className="flex items-center rounded-full border border-slate-700 bg-slate-900 p-1">
              <button
                onClick={() =>
                  setLanguage("ru")
                }
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  language === "ru"
                    ? "bg-orange-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                RU
              </button>

              <button
                onClick={() =>
                  setLanguage("en")
                }
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  language === "en"
                    ? "bg-orange-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                EN
              </button>
            </div>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-sm font-medium text-emerald-400">
                {t.systemOnline}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* TITLE */}

        <div className="mb-8">
          <p className="mb-2 text-sm font-medium uppercase tracking-widest text-orange-400">
            {t.smartCity}
          </p>

          <h2 className="text-4xl font-bold tracking-tight">
            {t.dashboard}
          </h2>
        </div>

        {/* STATISTICS */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">
              {t.activeStations}
            </p>

            <p className="mt-2 text-3xl font-bold">
              {stations.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {t.monitoringNow}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <p className="text-sm text-slate-400">
              {t.normal}
            </p>

            <p className="mt-2 text-3xl font-bold text-emerald-400">
              {normalCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {t.noThreat}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-5">
            <p className="text-sm text-slate-400">
              {t.warnings}
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              {warningCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {t.requiresAttention}
            </p>
          </div>

          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <p className="text-sm text-slate-400">
              {t.critical}
            </p>

            <p className="mt-2 text-3xl font-bold text-red-400">
              {criticalCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {t.immediateAttention}
            </p>
          </div>
        </section>

        {/* DASHBOARD */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* MAP */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  {t.monitoringMap}
                </h3>

                <p className="text-sm text-slate-500">
                  {t.sensorNetwork}
                </p>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-slate-400">
                <span>
                  🟢 {t.normalLegend}
                </span>

                <span>
                  🟡 {t.warningLegend}
                </span>

                <span>
                  🟠 {t.highLegend}
                </span>

                <span>
                  🔴 {t.criticalLegend}
                </span>
              </div>
            </div>

            <div className="relative h-[420px] overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
              {/* MAP GRID */}

              <div className="absolute inset-0 opacity-20">
                <div className="h-full w-full bg-[linear-gradient(rgba(148,163,184,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />
              </div>

              {/* ROADS */}

              <div className="absolute left-0 top-1/2 h-px w-full rotate-[-8deg] bg-slate-700" />

              <div className="absolute left-1/2 top-0 h-full w-px rotate-[12deg] bg-slate-700" />

              {/* STATIONS */}

              {stations.map(
                (station, index) => {
                  const positions = [
                    "left-[25%] top-[30%]",
                    "left-[62%] top-[24%]",
                    "left-[48%] top-[58%]",
                    "left-[78%] top-[65%]",
                  ];

                  const isSelected =
                    selectedStationId ===
                    station.id;

                  const isCritical =
                    station.risk >= 75;

                  const visualRisk =
                    getRiskLevel(
                      station.risk
                    );

                  return (
                    <div
                      key={station.id}
                      className={`absolute ${positions[index]} flex flex-col items-center`}
                    >
                      {/* FIRE ZONE */}

                      {isCritical && (
                        <>
                          <div className="pointer-events-none absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500/10 blur-xl" />

                          <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-red-500/30 animate-ping" />

                          <div className="pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-500/40" />
                        </>
                      )}

                      <button
                        onClick={() =>
                          setSelectedStationId(
                            station.id
                          )
                        }
                        className="relative z-10 flex flex-col items-center"
                      >
                        {/* FIRE ALERT */}

                        {isCritical && (
                          <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                            <div className="flex items-center gap-1 rounded-full border border-red-500/40 bg-red-950/90 px-2.5 py-1 text-[10px] font-bold text-red-300 shadow-lg shadow-red-500/30">
                              🚨 {t.fireDetected}
                            </div>
                          </div>
                        )}

                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full border-4 text-lg shadow-lg transition ${
                            visualRisk ===
                            "CRITICAL"
                              ? "border-red-300 bg-red-600 shadow-red-500/70"
                              : visualRisk ===
                                  "HIGH"
                                ? "border-orange-300 bg-orange-500 shadow-orange-500/50"
                                : visualRisk ===
                                    "WARNING"
                                  ? "border-yellow-300 bg-yellow-500 shadow-yellow-500/40"
                                  : statusStyles.NORMAL
                          } ${
                            isSelected
                              ? "scale-125 ring-2 ring-white/40"
                              : "hover:scale-110"
                          }`}
                        >
                          {isCritical
                            ? "🔥"
                            : "●"}
                        </div>

                        <span
                          className={`mt-2 rounded-md px-2 py-1 text-xs ${
                            isCritical
                              ? "bg-red-950/90 text-red-200"
                              : "bg-slate-900 text-slate-300"
                          }`}
                        >
                          {station.name}
                        </span>
                      </button>

                      {/* FIRE ZONE LABEL */}

                      {isCritical && (
                        <div className="relative z-10 mt-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-red-400">
                          {t.fireZone}
                        </div>
                      )}

                      {/* DRONE */}

                      {droneDispatched[
                        station.id
                      ] && (
                        <div className="relative z-10 mt-2 flex items-center gap-1 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-1 text-[10px] text-purple-300">
                          🚁 {t.drone}

                          {droneConfirmed[
                            station.id
                          ] && " ✓"}
                        </div>
                      )}
                    </div>
                  );
                }
              )}

              {/* MAP LOCATION */}

              <div className="absolute bottom-4 left-4 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-xs text-slate-400">
                📍 {t.monitoringZone}
              </div>
            </div>
          </div>

          {/* SELECTED STATION */}

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">
                  {t.selectedStation}
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  {selectedStation.name}
                </h3>

                <p className="text-sm text-slate-400">
                  {selectedStation.location}
                </p>
              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  getRiskLevel(
                    selectedStation.risk
                  ) === "CRITICAL"
                    ? "bg-red-500/10 text-red-400"
                    : getRiskLevel(
                          selectedStation.risk
                        ) === "HIGH"
                      ? "bg-orange-500/10 text-orange-400"
                      : getRiskLevel(
                            selectedStation.risk
                          ) === "WARNING"
                        ? "bg-yellow-500/10 text-yellow-400"
                        : "bg-emerald-500/10 text-emerald-400"
                }`}
              >
                {selectedStation.status}
              </span>
            </div>

            {/* SENSOR VALUES */}

            <div className="space-y-4">
              <div className="rounded-xl bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    🌡️ {t.temperature}
                  </span>

                  <span className="text-xl font-bold">
                    {selectedStation.temperature}°C
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    💧 {t.humidity}
                  </span>

                  <span className="text-xl font-bold">
                    {selectedStation.humidity}%
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">
                    💨 {t.smoke}
                  </span>

                  <span
                    className={`text-xl font-bold ${
                      selectedStation.smoke >
                      30
                        ? "text-red-400"
                        : "text-white"
                    }`}
                  >
                    {selectedStation.smoke}%
                  </span>
                </div>
              </div>
            </div>

            {/* RISK */}

            <div
              className={`mt-6 rounded-xl border p-5 ${getRiskBackground(
                selectedStation.risk
              )}`}
            >
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-slate-400">
                    {t.fireRisk}
                  </p>

                  <p
                    className={`mt-1 text-4xl font-bold ${getRiskTextColor(
                      selectedStation.risk
                    )}`}
                  >
                    {selectedStation.risk}

                    <span className="text-lg text-slate-500">
                      /100
                    </span>
                  </p>
                </div>

                <span className="text-3xl">
                  🔥
                </span>
              </div>

              {/* RISK BAR */}

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getRiskBarColor(
                    selectedStation.risk
                  )}`}
                  style={{
                    width: `${selectedStation.risk}%`,
                  }}
                />
              </div>

              {/* RISK SCALE */}

              <div className="mt-4 border-t border-slate-800 pt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  {t.riskScale}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] font-medium">
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {t.riskNormal}
                  </span>

                  <span className="flex items-center gap-1.5 text-yellow-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                    {t.riskWarning}
                  </span>

                  <span className="flex items-center gap-1.5 text-orange-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />
                    {t.riskHigh}
                  </span>

                  <span className="flex items-center gap-1.5 text-red-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                    {t.riskCritical}
                  </span>
                </div>
              </div>
            </div>

            {/* DRONE */}

            {(selectedStation.risk >=
              30 ||
              selectedStation.status ===
                "WARNING" ||
              selectedStation.status ===
                "HIGH" ||
              selectedStation.status ===
                "CRITICAL") && (
              <div className="mt-4 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-purple-300">
                      🚁 {t.policeDrone}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {droneDispatched[
                        selectedStation.id
                      ]
                        ? droneConfirmed[
                            selectedStation.id
                          ]
                          ? t.fireConfirmed
                          : t.droneInvestigating
                        : t.visualVerification}
                    </p>
                  </div>

                  {!droneDispatched[
                    selectedStation.id
                  ] && (
                    <button
                      onClick={() =>
                        dispatchDrone(
                          selectedStation.id
                        )
                      }
                      className="rounded-lg bg-purple-500 px-3 py-2 text-xs font-semibold text-white transition hover:bg-purple-400"
                    >
                      {t.sendDrone}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* SIMULATION */}

            <button
              onClick={simulateFire}
              className="mt-4 w-full rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-400 active:scale-[0.98]"
            >
              🔥 {t.simulateFire}
            </button>

            <button
              onClick={resetStation}
              className="mt-2 w-full rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800"
            >
              {t.resetSimulation}
            </button>

            {/* ALERT */}

            {selectedStation.risk >=
              75 && (
              <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                <p className="font-semibold text-red-400">
                  🚨 {t.fireAlert}
                </p>

                <p className="mt-1 text-xs leading-relaxed text-slate-400">
                  {t.potentialFire}{" "}
                  {selectedStation.name}.
                  <br />
                  {t.rapidResponse}
                </p>

                {droneConfirmed[
                  selectedStation.id
                ] && (
                  <p className="mt-2 text-xs font-medium text-purple-300">
                    🚁 {t.droneConfirmed}
                  </p>
                )}

                {fireSimulated && (
                  <p className="mt-2 text-xs font-medium text-red-300">
                    {t.simulationEvent}
                  </p>
                )}
              </div>
            )}
          </div>
        </section>

        {/* SENSOR HISTORY */}

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {t.sensorHistory}
              </h3>

              <p className="text-sm text-slate-500">
                {t.environmentalDynamics} •{" "}
                {selectedStation.name}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 text-xs">
              <span className="flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                {t.temperatureChart}
              </span>

              <span className="flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-400" />
                {t.humidityChart}
              </span>

              <span className="flex items-center gap-2 text-slate-300">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                {t.smokeChart}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-4">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-[300px] min-w-[700px] w-full"
              preserveAspectRatio="none"
            >
              {[0, 25, 50, 75, 100].map(
                (value) => {
                  const y = getY(value);

                  return (
                    <g key={value}>
                      <line
                        x1={chartPadding.left}
                        y1={y}
                        x2={
                          chartWidth -
                          chartPadding.right
                        }
                        y2={y}
                        stroke="currentColor"
                        className="text-slate-800"
                        strokeWidth="1"
                      />

                      <text
                        x="8"
                        y={y + 4}
                        className="fill-slate-600"
                        fontSize="11"
                      >
                        {value}
                      </text>
                    </g>
                  );
                }
              )}

              <line
                x1={chartPadding.left}
                y1={
                  chartHeight -
                  chartPadding.bottom
                }
                x2={
                  chartWidth -
                  chartPadding.right
                }
                y2={
                  chartHeight -
                  chartPadding.bottom
                }
                stroke="currentColor"
                className="text-slate-700"
              />

              <path
                d={temperaturePath}
                fill="none"
                stroke="currentColor"
                className="text-orange-400"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={humidityPath}
                fill="none"
                stroke="currentColor"
                className="text-blue-400"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              <path
                d={smokePath}
                fill="none"
                stroke="currentColor"
                className="text-red-400"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {selectedHistory.map(
                (point, index) => (
                  <g key={index}>
                    <circle
                      cx={getX(index)}
                      cy={getY(
                        Math.min(
                          point.temperature,
                          100
                        )
                      )}
                      r="3"
                      className="fill-orange-400"
                    />

                    <circle
                      cx={getX(index)}
                      cy={getY(
                        point.humidity
                      )}
                      r="3"
                      className="fill-blue-400"
                    />

                    <circle
                      cx={getX(index)}
                      cy={getY(
                        point.smoke
                      )}
                      r="3"
                      className="fill-red-400"
                    />
                  </g>
                )
              )}

              {selectedHistory.map(
                (point, index) => {
                  if (
                    index !== 0 &&
                    index !==
                      selectedHistory.length -
                        1 &&
                    index % 4 !== 0
                  ) {
                    return null;
                  }

                  return (
                    <text
                      key={`label-${index}`}
                      x={getX(index)}
                      y={
                        chartHeight - 10
                      }
                      textAnchor="middle"
                      className="fill-slate-600"
                      fontSize="10"
                    >
                      {point.time}
                    </text>
                  );
                }
              )}
            </svg>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">
                {t.currentTemperature}
              </p>

              <p className="mt-1 text-xl font-bold text-orange-400">
                {selectedStation.temperature}°C
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">
                {t.currentHumidity}
              </p>

              <p className="mt-1 text-xl font-bold text-blue-400">
                {selectedStation.humidity}%
              </p>
            </div>

            <div className="rounded-xl bg-slate-950 p-4">
              <p className="text-xs text-slate-500">
                {t.currentSmoke}
              </p>

              <p className="mt-1 text-xl font-bold text-red-400">
                {selectedStation.smoke}%
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs leading-relaxed text-slate-500">
              {t.sensorDescription}
            </p>
          </div>
        </section>

        {/* EVENT LOG */}

        <section className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {t.eventLog}
              </h3>

              <p className="text-sm text-slate-500">
                {t.eventDescription}
              </p>
            </div>

            <button
              onClick={clearEvents}
              className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              {t.clearLog}
            </button>
          </div>

          <div className="max-h-[360px] overflow-y-auto pr-2">
            {events.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-700 p-8 text-center text-sm text-slate-500">
                {t.noEvents}
              </div>
            ) : (
              <div className="space-y-2">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex gap-4 rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <div className="w-20 shrink-0 text-xs text-slate-600">
                      {event.time}
                    </div>

                    <div className="flex min-w-0 flex-1 items-start gap-3">
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase ${eventTypeStyles[event.type]}`}
                      >
                        {getEventTypeLabel(
                          event.type
                        )}
                      </span>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-300">
                          {event.station}
                        </p>

                        <p className="mt-1 text-sm leading-relaxed text-slate-400">
                          {event.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}