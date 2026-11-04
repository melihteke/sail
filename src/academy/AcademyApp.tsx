import { lazy, Suspense, type ComponentType } from "react";
import { HashRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import "./academy.css";
import { I18nProvider, useI18n } from "./i18n";
import { Hub } from "./shell/Hub";

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

function AcademyLayout() {
  const { t } = useI18n();
  return (
    <div className="academy">
      <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">…</div>}>
        <Outlet />
      </Suspense>
      <p className="mx-auto mt-12 max-w-3xl border-t border-border pt-4 text-center text-xs text-muted-foreground">
        {t("academy.disclaimer")}
      </p>
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </HashRouter>
    </I18nProvider>
  );
}
