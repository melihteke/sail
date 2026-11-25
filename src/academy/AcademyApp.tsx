import { lazy, Suspense, type ComponentType } from "react";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./academy.css";
import { I18nProvider } from "./i18n";
import { Hub } from "./shell/Hub";
import { useReturnAfterSignIn } from "./games/radio/returnAfterSignIn";

/** Each module is loaded on demand so the hub opens fast. */
function load<K extends string>(factory: () => Promise<Record<K, ComponentType>>, name: K) {
  return lazy(() => factory().then((m) => ({ default: m[name] })));
}

const RoutePlannerHome = load(() => import("./games/route-planner/RoutePlannerHome"), "RoutePlannerHome");
const RoutePlannerGame = load(() => import("./games/route-planner/RoutePlannerGame"), "RoutePlannerGame");
const FreePlanner = load(() => import("./games/route-planner/FreePlanner"), "FreePlanner");
const NauticalMarks = load(() => import("./games/nautical-marks/NauticalMarks"), "NauticalMarks");
const PassageGame = load(() => import("./games/nautical-marks/PassageGame"), "PassageGame");
const NavPlanner = load(() => import("./games/navplan/NavPlanner"), "NavPlanner");
const ColregModule = load(() => import("./games/colreg/ColregModule"), "ColregModule");
const MobModule = load(() => import("./games/mob/MobModule"), "MobModule");
const TrimModule = load(() => import("./games/trim/TrimModule"), "TrimModule");
const SextantModule = load(() => import("./games/sextant/SextantModule"), "SextantModule");
const RaceModule = load(() => import("./games/race/RaceModule"), "RaceModule");
const RyaSyllabus = load(() => import("./games/rya/RyaSyllabus"), "RyaSyllabus");
const CourseModule = load(() => import("./games/rya/CourseModule"), "CourseModule");
const GameRoute = load(() => import("./games/rya/GameRoute"), "GameRoute");
const LessonIndex = load(() => import("./games/rya/lessons/LessonPage"), "LessonIndex");
const LessonRoute = load(() => import("./games/rya/lessons/LessonPage"), "LessonRoute");
const PassagePlanning = load(() => import("./games/rya/almanac/PassagePlanningPage"), "PassagePlanningPage");
const PassageScenario = load(() => import("./games/rya/almanac/PassagePlanningPage"), "ScenarioRoute");
const WeatherLesson = load(() => import("./games/rya/weather/WeatherPage"), "WeatherPage");

/** Small, eager: sends the visitor back to the module that started a Google sign-in. */
function ReturnAfterSignIn() {
  useReturnAfterSignIn();
  return null;
}

function AcademyLayout() {
  return (
    <div className="academy">
      <ReturnAfterSignIn />
      <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">…</div>}>
        <Outlet />
      </Suspense>
    </div>
  );
}

/** HashRouter keeps module deep links working on GitHub Pages without server rewrites. */
export default function AcademyApp() {
  return (
    <I18nProvider>
      <HashRouter>
        <Routes>
          <Route element={<AcademyLayout />}>
            <Route index element={<Hub />} />
            <Route path="route-planner" element={<RoutePlannerHome />} />
            <Route path="route-planner/free" element={<FreePlanner />} />
            <Route path="route-planner/:scenarioId" element={<RoutePlannerGame />} />
            <Route path="nautical-marks" element={<NauticalMarks />} />
            <Route path="nautical-marks/passage/:levelId" element={<PassageGame />} />
            <Route path="nav-planner" element={<NavPlanner />} />
            <Route path="colreg" element={<ColregModule />} />
            <Route path="man-overboard" element={<MobModule />} />
            <Route path="sail-trim" element={<TrimModule />} />
            <Route path="sextant" element={<SextantModule />} />
            <Route path="race" element={<RaceModule />} />
            <Route path="radio" element={<Navigate to="/rya/learn/radio" replace />} />
            <Route path="rya" element={<RyaSyllabus />} />
            <Route path="rya/learn" element={<LessonIndex />} />
            <Route path="rya/learn/passage-planning" element={<PassagePlanning />} />
            <Route path="rya/learn/passage-planning/:scenario" element={<PassageScenario />} />
            <Route path="rya/learn/weather" element={<WeatherLesson />} />
            <Route path="rya/learn/:lesson" element={<LessonRoute />} />
            <Route path="rya/:course" element={<CourseModule />} />
            <Route path="rya/:course/:game" element={<GameRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </I18nProvider>
  );
}
