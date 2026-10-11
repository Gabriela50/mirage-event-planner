import { describe, it, expect } from "vitest";
import { translations } from "../src/i18n/translations.js";

describe("Traducciones de MIRAGE", () => {
  it("debe tener traducciones en español e inglés", () => {
    expect(translations).toHaveProperty("es");
    expect(translations).toHaveProperty("en");
  });

  it("debe incluir los textos principales en español", () => {
    expect(translations.es.dashboard).toBe("Panel principal");
    expect(translations.es.events).toBe("Eventos");
    expect(translations.es.guests).toBe("Invitados");
    expect(translations.es.budget).toBe("Presupuesto");
  });

  it("debe incluir los textos principales en inglés", () => {
    expect(translations.en.dashboard).toBe("Dashboard");
    expect(translations.en.events).toBe("Events");
    expect(translations.en.guests).toBe("Guests");
    expect(translations.en.budget).toBe("Budget");
  });

  it("debe tener traducciones principales no vacías en ambos idiomas", () => {
    const keys = [
      "brand",
      "subtitle",
      "dashboard",
      "events",
      "guests",
      "budget",
      "assistant",
      "history",
      "create",
      "save",
      "cancel",
    ];

    for (const language of ["es", "en"]) {
      for (const key of keys) {
        expect(translations[language][key], `${language}.${key}`).toBeTruthy();
        expect(typeof translations[language][key]).toBe("string");
      }
    }
  });
});
