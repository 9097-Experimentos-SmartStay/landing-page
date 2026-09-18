/**
 * US-26 — Success stories.
 *
 * IMPORTANT: these are ILLUSTRATIVE cases, not real customers. SmartStay has no
 * published customer results yet, so the cases describe anonymous, typical
 * properties and their metrics mirror the impact targets of the report's Lean UX
 * hypotheses (H1: +20% satisfaction, H2: +15% productivity, H3: -40% check-in
 * time). The UI labels every card as illustrative. Replace them with real,
 * authorised cases (set `illustrative: false`) as soon as they exist.
 */

import { ACCOMMODATION_TYPES } from '../../domain.js';

export const HOTEL_TYPES = ACCOMMODATION_TYPES;

/** @typedef {'boutique' | 'alternative' | 'chain'} HotelType */

export const STORIES = Object.freeze([
  {
    id: 'boutique-cusco',
    hotelType: 'boutique',
    illustrative: true,
    metrics: { costReduction: '−18%', satisfaction: '+22%', timeSaved: '−40%' },
    content: {
      es: {
        title: 'Hotel boutique de 24 habitaciones',
        location: 'Cusco, Perú',
        summary: 'Unificó reservas, housekeeping y check-in en una sola plataforma móvil.',
        challenge:
          'Usaban tres sistemas distintos para reservas, limpieza y facturación, y el check-in generaba colas en horas pico.',
        solution: 'Check-in digital con llave en el celular y tablero de habitaciones en tiempo real para el personal.',
        timeSavedDetail: 'en el check-in',
        quote:
          'Ahora dedicamos más tiempo a los huéspedes y menos a la administración: todo está en un solo lugar.',
        quoteAuthor: 'Gerente general',
      },
      en: {
        title: '24-room boutique hotel',
        location: 'Cusco, Peru',
        summary: 'Brought bookings, housekeeping and check-in together in one mobile platform.',
        challenge:
          'They used three different systems for bookings, housekeeping and billing, and check-in created queues at peak hours.',
        solution: 'Digital check-in with a phone key and a real-time room board for the staff.',
        timeSavedDetail: 'at check-in',
        quote: 'We now spend more time with guests and less on admin: everything is in one place.',
        quoteAuthor: 'General manager',
      },
    },
  },
  {
    id: 'ecolodge-tarapoto',
    hotelType: 'alternative',
    illustrative: true,
    metrics: { costReduction: '−25%', satisfaction: '+18%', timeSaved: '6 h' },
    content: {
      es: {
        title: 'Ecolodge de 12 cabañas',
        location: 'Tarapoto, Perú',
        summary: 'Redujo el consumo energético de cabañas vacías con control IoT de climatización e iluminación.',
        challenge:
          'Las cabañas quedaban con el aire acondicionado y las luces encendidas, y coordinar la limpieza entre cabañas dispersas tomaba horas.',
        solution: 'Sensores IoT con apagado remoto y asignación de tareas de limpieza desde el celular.',
        timeSavedDetail: 'por semana en coordinación de limpieza',
        quote: 'Por primera vez sabemos cuánto consume cada cabaña y podemos actuar a tiempo.',
        quoteAuthor: 'Administradora',
      },
      en: {
        title: '12-cabin ecolodge',
        location: 'Tarapoto, Peru',
        summary: 'Cut the energy use of empty cabins with IoT climate and lighting control.',
        challenge:
          'Cabins were left with the air conditioning and lights on, and coordinating housekeeping across scattered cabins took hours.',
        solution: 'IoT sensors with remote switch-off and housekeeping tasks assigned from a phone.',
        timeSavedDetail: 'per week coordinating housekeeping',
        quote: 'For the first time we know how much each cabin consumes and can act in time.',
        quoteAuthor: 'Manager',
      },
    },
  },
  {
    id: 'boutique-lima',
    hotelType: 'boutique',
    illustrative: true,
    metrics: { costReduction: '−12%', satisfaction: '+20%', timeSaved: '−30%' },
    content: {
      es: {
        title: 'Hotel boutique de 40 habitaciones',
        location: 'Lima, Perú',
        summary: 'Las solicitudes de los huéspedes llegan en tiempo real al equipo correcto.',
        challenge: 'Las solicitudes de room service y limpieza se tomaban por teléfono y se perdían entre turnos.',
        solution: 'App para huéspedes con solicitudes y limpieza programada, conectada al panel del personal.',
        timeSavedDetail: 'al responder solicitudes',
        quote: 'Los huéspedes sienten que el hotel se adapta a ellos, y el equipo responde más rápido.',
        quoteAuthor: 'Jefe de operaciones',
      },
      en: {
        title: '40-room boutique hotel',
        location: 'Lima, Peru',
        summary: 'Guest requests reach the right team in real time.',
        challenge: 'Room service and housekeeping requests were taken by phone and got lost between shifts.',
        solution: 'Guest app with requests and scheduled housekeeping, connected to the staff dashboard.',
        timeSavedDetail: 'responding to requests',
        quote: 'Guests feel the hotel adapts to them, and the team responds faster.',
        quoteAuthor: 'Operations manager',
      },
    },
  },
  {
    id: 'chain-five-hotels',
    hotelType: 'chain',
    illustrative: true,
    metrics: { costReduction: '−15%', satisfaction: '+16%', timeSaved: '−20%' },
    content: {
      es: {
        title: 'Cadena de 5 hoteles',
        location: 'Perú (varias ciudades)',
        summary: 'Una operación unificada para todas las sedes, con indicadores comparables.',
        challenge: 'Cada sede operaba con procesos y herramientas propios, sin visibilidad central del estado de las habitaciones.',
        solution: 'Tablero central de habitaciones y tareas, con roles y permisos por sede.',
        timeSavedDetail: 'al asignar tareas',
        quote: 'Por fin comparamos el desempeño de nuestras sedes con los mismos datos.',
        quoteAuthor: 'Director de tecnología',
      },
      en: {
        title: '5-hotel chain',
        location: 'Peru (several cities)',
        summary: 'Unified operations across all properties, with comparable KPIs.',
        challenge: 'Each property ran its own processes and tools, with no central view of room status.',
        solution: 'Central room and task dashboard, with roles and permissions per property.',
        timeSavedDetail: 'assigning tasks',
        quote: 'We can finally compare our properties using the same data.',
        quoteAuthor: 'Technology director',
      },
    },
  },
]);

/**
 * Returns the stories matching `hotelType` ('all' returns every story).
 * @param {typeof STORIES} stories
 * @param {HotelType | 'all'} hotelType
 */
export function filterStories(stories, hotelType) {
  if (hotelType === 'all' || !HOTEL_TYPES.includes(hotelType)) return [...stories];
  return stories.filter((story) => story.hotelType === hotelType);
}

/** Localised content of a story, falling back to Spanish. */
export function storyContent(story, lang) {
  return story.content[lang] ?? story.content.es;
}
