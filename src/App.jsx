import { lazy, Suspense } from "react";
import { HashRouter, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { AppLayout } from "./layouts/AppLayout";
import { AdminLayout } from "./layouts/AdminLayout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Skeleton } from "./components/common/Skeleton";

const HomePage = lazy(() => import("./pages/HomePage"));
const ModulePage = lazy(() => import("./pages/ModulePage"));
const QuizPage = lazy(() => import("./pages/QuizPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const PostPage = lazy(() => import("./pages/PostPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const EbooksPage = lazy(() => import("./pages/EbooksPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const SupportersPage = lazy(() => import("./pages/SupportersPage"));
const RecommendationsPage = lazy(() => import("./pages/RecommendationsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminModulesPage = lazy(() => import("./pages/admin/AdminModulesPage"));
const AdminModuleEditorPage = lazy(() => import("./pages/admin/AdminModuleEditorPage"));
const AdminPostsPage = lazy(() => import("./pages/admin/AdminPostsPage"));
const AdminPostEditorPage = lazy(() => import("./pages/admin/AdminPostEditorPage"));
const AdminCollectionsPage = lazy(() => import("./pages/admin/AdminCollectionsPage"));

function PageFallback() {
  return (
    <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-52" />
      <Skeleton className="mt-5 h-28 w-full" />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
        <Skeleton className="h-56" />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <ErrorBoundary>
            <Suspense fallback={<PageFallback />}>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route index element={<HomePage />} />
                  <Route path="/modulos/:moduleId" element={<ModulePage />} />
                  <Route path="/modulos/:moduleId/quiz" element={<QuizPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:postId" element={<PostPage />} />
                  <Route path="/quem-somos" element={<AboutPage />} />
                  <Route path="/ebooks" element={<EbooksPage />} />
                  <Route path="/contato" element={<ContactPage />} />
                  <Route path="/apoiadores" element={<SupportersPage />} />
                  <Route path="/indicacoes" element={<RecommendationsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route
                    path="/perfil"
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="modulos" element={<AdminModulesPage />} />
                  <Route path="modulos/novo" element={<AdminModuleEditorPage />} />
                  <Route path="modulos/:moduleId" element={<AdminModuleEditorPage />} />
                  <Route path="posts" element={<AdminPostsPage />} />
                  <Route path="posts/novo" element={<AdminPostEditorPage />} />
                  <Route path="posts/:postId" element={<AdminPostEditorPage />} />
                  <Route path="biblioteca" element={<AdminCollectionsPage />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}
