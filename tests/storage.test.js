import { beforeEach, describe, expect, it } from "vitest";
import {
  getEvents,
  saveEvent,
  getHistory,
  recordActivity,
} from "../src/services/storage.js";

const memoryStorage = () => {
  const data = new Map();

  return {
    getItem(key) {
      return data.has(key) ? data.get(key) : null;
    },
    setItem(key, value) {
      data.set(key, String(value));
    },
    removeItem(key) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
  };
};

beforeEach(() => {
  globalThis.localStorage = memoryStorage();
});

describe("Almacenamiento local de MIRAGE", () => {
  it("debe iniciar con una lista de eventos vacía", () => {
    expect(getEvents()).toEqual([]);
  });

  it("debe guardar un evento y devolverlo en la lista", () => {
    const event = {
      id: 1,
      name: "Evento de prueba",
      date: "2026-12-20",
    };

    expect(saveEvent(event)).toEqual([event]);
    expect(getEvents()).toEqual([event]);
  });

  it("debe colocar los eventos nuevos al principio", () => {
    const first = { id: 1, name: "Primer evento" };
    const second = { id: 2, name: "Segundo evento" };

    saveEvent(first);
    saveEvent(second);

    expect(getEvents()).toEqual([second, first]);
  });

  it("debe registrar una actividad en el historial", () => {
    const history = recordActivity("Evento creado");

    expect(history).toHaveLength(1);
    expect(history[0].action).toBe("Evento creado");
    expect(history[0].id).toBeTruthy();
    expect(Number.isNaN(Date.parse(history[0].date))).toBe(false);
    expect(getHistory()).toEqual(history);
  });

  it("debe recuperar una lista vacía si el JSON está dañado", () => {
    localStorage.setItem("mirage_events", "{texto no válido");

    expect(getEvents()).toEqual([]);
  });

  it("debe recuperar una lista vacía si el dato guardado no es una lista", () => {
    localStorage.setItem("mirage_history", JSON.stringify({ action: "Prueba" }));

    expect(getHistory()).toEqual([]);
  });
});
