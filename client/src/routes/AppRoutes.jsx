import { Route, Routes } from "react-router-dom";
import AdminRoute from "../components/admin/AdminRoute";
import Layout from "../components/Layout";
import About from "../pages/About";
import Admission from "../pages/Admission";
import AdminLogin from "../pages/AdminLogin";
import ContactUs from "../pages/ContactUs";
import Contests from "../pages/Contests";
import Curriculum from "../pages/Curriculum";
import FAQ from "../pages/FAQ";
import Founders from "../pages/Founders";
import Gallery from "../pages/Gallery";
import Gurukulam from "../pages/Gurukulam";
import Home from "../pages/Home";
import OnlineCourseRegistration from "../pages/OnlineCourseRegistration";
import OnlinePrograms from "../pages/OnlinePrograms";
import Programs from "../pages/Programs";
import SummerCampRegistration from "../pages/SummerCampRegistration";
import SummerCamp from "../pages/SummerCamp";
import SummerCampSchedule from "../pages/SummerCampSchedule";
import Terms from "../pages/Terms";
import ValmikiAshram from "../pages/ValmikiAshram";
import WinterCampRegistration from "../pages/WinterCampRegistration";
import WinterCamp from "../pages/WinterCamp";
import WinterCampSchedule from "../pages/WinterCampSchedule";

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="founders" element={<Founders />} />
        <Route path="valmiki-ashram" element={<ValmikiAshram />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="programs" element={<Programs />} />
        <Route path="winter-camp" element={<WinterCamp />} />
        <Route
          path="register/winter-camp"
          element={<WinterCampRegistration />}
        />
        <Route path="summer-camp" element={<SummerCamp />} />
        <Route
          path="register/summer-camp"
          element={<SummerCampRegistration />}
        />
        <Route path="online-programs" element={<OnlinePrograms />} />
        <Route
          path="register/online-course"
          element={<OnlineCourseRegistration />}
        />
        <Route path="gurukulam" element={<Gurukulam />} />
        <Route path="admission" element={<Admission />} />
        <Route path="contests" element={<Contests />} />
        <Route path="curriculum" element={<Curriculum />} />
        <Route path="contact" element={<ContactUs />} />
        <Route path="faq" element={<FAQ />} />
        <Route path="terms" element={<Terms />} />
        <Route path="winter-camp/schedule" element={<WinterCampSchedule />} />
        <Route path="summer-camp/schedule" element={<SummerCampSchedule />} />
        {/* <Route path="nri-summer" element={<NRI Summer Camp />} /> */}
      </Route>
      <Route path="admin-login" element={<AdminLogin />} />
      <Route element={<AdminRoute />}>
        <Route element={<Layout />}>
          <Route path="admin" element={<Home />} />
          <Route path="admin/about" element={<About />} />
          <Route path="admin/founders" element={<Founders />} />
          <Route path="admin/gallery" element={<Gallery />} />
          <Route path="admin/faq" element={<FAQ />} />
          <Route path="admin/programs" element={<Programs />} />
          <Route path="admin/winter-camp" element={<WinterCamp />} />
          <Route
            path="admin/winter-camp/schedule"
            element={<WinterCampSchedule />}
          />
          <Route
            path="admin/register/winter-camp"
            element={<WinterCampRegistration />}
          />
          <Route path="admin/summer-camp" element={<SummerCamp />} />
          <Route
            path="admin/summer-camp/schedule"
            element={<SummerCampSchedule />}
          />
          <Route path="admin/online-programs" element={<OnlinePrograms />} />
          <Route
            path="admin/register/summer-camp"
            element={<SummerCampRegistration />}
          />
          <Route path="admin/curriculum" element={<Curriculum />} />
        </Route>
      </Route>
    </Routes>
  );
}
