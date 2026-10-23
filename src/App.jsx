import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import LoadingState from './components/LoadingState.jsx';
import Home from './pages/Home.jsx';
import Explore from './pages/Explore.jsx';
import InnovationDetail from './pages/InnovationDetail.jsx';
import Directory from './pages/Directory.jsx';
import Categories from './pages/Categories.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import CountryPage from './pages/CountryPage.jsx';
import SectorPage from './pages/SectorPage.jsx';
import Research from './pages/Research.jsx';
import Library from './pages/Library.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx';
import Courses from './pages/Courses.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import Experts from './pages/Experts.jsx';
import Community from './pages/Community.jsx';
import DiscussionDetail from './pages/DiscussionDetail.jsx';
import Startups from './pages/Startups.jsx';
import { StartupProfile, OrganizationProfile } from './pages/Profiles.jsx';
import Partnerships from './pages/Partnerships.jsx';
import Submit from './pages/Submit.jsx';
import SearchResults from './pages/SearchResults.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import LegalPage from './pages/LegalPage.jsx';
import { SignIn, Register, ForgotPassword, ResetPassword } from './pages/Auth.jsx';
import RequireAuth from './auth/RequireAuth.jsx';
import NotFound from './pages/NotFound.jsx';

// The user area and the admin interface are separate bundles: visitors who never open them do not download them.
const UserLayout = lazy(() => import('./pages/user/UserLayout.jsx'));
const Dashboard = lazy(() => import('./pages/user/Dashboard.jsx'));
const Profile = lazy(() => import('./pages/user/Profile.jsx'));
const Saved = lazy(() => import('./pages/user/Saved.jsx'));
const Settings = lazy(() => import('./pages/user/Settings.jsx'));
const Notifications = lazy(() => import('./pages/user/Notifications.jsx'));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'));
const AdminOverview = lazy(() => import('./pages/admin/AdminOverview.jsx'));
const AdminSection = lazy(() => import('./pages/admin/AdminSection.jsx'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.jsx'));

const later = (Page) => (
  <Suspense fallback={<div className="container section"><LoadingState rows={2} /></div>}>
    <Page />
  </Suspense>
);

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="explore" element={<Explore />} />
        <Route path="innovations/:id" element={<InnovationDetail />} />
        <Route path="directory" element={<Directory />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/:id" element={<CategoryPage />} />
        <Route path="countries/:id" element={<CountryPage />} />
        <Route path="smart-farming" element={<SectorPage sector="crop" />} />
        <Route path="livestock" element={<SectorPage sector="livestock" />} />
        <Route path="research" element={<Research />} />
        <Route path="library" element={<Library />} />
        <Route path="library/:id" element={<ArticleDetail />} />
        <Route path="courses" element={<Courses />} />
        <Route path="courses/:id" element={<CourseDetail />} />
        <Route path="experts" element={<Experts />} />
        <Route path="community" element={<Community />} />
        <Route path="community/:id" element={<DiscussionDetail />} />
        <Route path="startups" element={<Startups />} />
        <Route path="startups/:id" element={<StartupProfile />} />
        <Route path="organizations/:id" element={<OrganizationProfile />} />
        <Route path="partnerships" element={<Partnerships />} />
        <Route path="search" element={<SearchResults />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="privacy" element={<LegalPage kind="privacy" />} />
        <Route path="terms" element={<LegalPage kind="terms" />} />
        <Route path="signin" element={<SignIn />} />
        <Route path="register" element={<Register />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route element={<RequireAuth />}>
          <Route path="submit" element={<Submit />} />
          <Route element={later(UserLayout)}>
            <Route path="dashboard" element={later(Dashboard)} />
            <Route path="profile" element={later(Profile)} />
            <Route path="saved" element={later(Saved)} />
            <Route path="notifications" element={later(Notifications)} />
            <Route path="settings" element={later(Settings)} />
          </Route>
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route element={<RequireAuth admin />}>
        <Route path="/admin" element={later(AdminLayout)}>
          <Route index element={later(AdminOverview)} />
          <Route path="settings" element={later(AdminSettings)} />
          <Route path=":section" element={later(AdminSection)} />
        </Route>
      </Route>
    </Routes>
  );
}
