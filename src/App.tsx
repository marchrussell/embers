import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { PageSkeleton } from "@/components/skeletons/PageSkeleton";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { usePrefetchRoute } from "@/hooks/usePrefetchRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";

// Eagerly load Auth and Index (critical for interactivity)
import Auth from "./pages/Auth";
import Index from "./pages/Index";

// Signup page (eager load for invite flow)
const Signup = lazy(() => import("./pages/Signup"));

// Lazy load all other pages
const Experiences = lazy(() => import("./pages/Experiences"));
const RiseMethod = lazy(() => import("./pages/RiseMethod"));
const ArcWelcomeCallConfirmed = lazy(() => import("./pages/ArcWelcomeCallConfirmed"));
const SafetyDisclosure = lazy(() => import("./pages/SafetyDisclosure"));
const PasswordReset = lazy(() => import("./pages/PasswordReset"));
const SharedSession = lazy(() => import("./pages/SharedSession"));

// App pages (lazy loaded)
const OnlinePage = lazy(() => import("./pages/app/Studio"));
const OnlineProgram = lazy(() => import("./pages/app/StudioProgram"));
const StartHere = lazy(() => import("./pages/app/StartHere"));
const Library = lazy(() => import("./pages/app/Library"));
const ClassPlayer = lazy(() => import("./pages/app/ClassPlayer"));
const Profile = lazy(() => import("./pages/app/Profile"));
const AppAbout = lazy(() => import("./pages/app/About"));
const Favourites = lazy(() => import("./pages/app/Favourites"));
const LiveSession = lazy(() => import("./pages/app/LiveSession"));
const LiveSessionRoom = lazy(() => import("./pages/app/LiveSessionRoom"));

// Admin pages (lazy loaded)
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminClasses = lazy(() => import("./pages/admin/Classes"));
const AdminPrograms = lazy(() => import("./pages/admin/Programs"));
const AdminCategories = lazy(() => import("./pages/admin/Categories"));
const AdminLiveSessions = lazy(() => import("./pages/admin/LiveSessions"));

const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminGuestTeachers = lazy(() => import("./pages/admin/GuestTeachers"));
const AdminArcApplications = lazy(() => import("./pages/admin/ArcApplications"));
const AdminEventBookings = lazy(() => import("./pages/admin/EventBookings"));

// Onboarding (lazy loaded)
const PaymentSuccess = lazy(() => import("./pages/PaymentSuccess"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));

// March (lazy loaded)
const MarchOnboarding = lazy(() => import("./pages/MarchOnboarding"));
const MarchDashboard = lazy(() => import("./pages/app/MarchDashboard"));
const MarchChat = lazy(() => import("./pages/app/MarchChat"));

// Legal pages (lazy loaded)
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));

// Newsletter
const NewsletterUnsubscribe = lazy(() => import("./pages/NewsletterUnsubscribe"));

// Optimized query client for better caching and performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
      gcTime: 30 * 60 * 1000, // 30 minutes - keep in cache longer
      refetchOnWindowFocus: false, // Avoid unnecessary refetches
      refetchOnMount: false, // Use cached data when possible
      refetchOnReconnect: false, // Don't refetch on reconnect
      retry: 1, // Reduce retry attempts for faster failure
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </Router>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Separate component to use hooks inside Router context
function AppContent() {
  // Enable route prefetching for instant navigation
  usePrefetchRoute();

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<PageSkeleton />}>
        <div className="animate-in fade-in duration-300">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/experiences" element={<Experiences />} />
            <Route path="/rise-arc-method" element={<RiseMethod />} />
            <Route path="/arc/welcome-call-confirmed" element={<ArcWelcomeCallConfirmed />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route path="/safety-disclosure" element={<SafetyDisclosure />} />
            <Route path="/shared-session/:sessionId" element={<SharedSession />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribe />} />
            <Route path="/library" element={<Library />} />
        
            {/* Payment Success & Onboarding */}
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
            <Route path="/onboarding/march" element={<ProtectedRoute><MarchOnboarding /></ProtectedRoute>} />
            <Route path="/online/march-dashboard" element={<ProtectedRoute><MarchDashboard /></ProtectedRoute>} />
            <Route path="/online/march-chat" element={<ProtectedRoute><MarchChat /></ProtectedRoute>} />
            
            {/* Online routes - Library and About are public, others protected */}
            <Route path="/online" element={<OnlinePage />} />
            <Route path="/online/start-here" element={<StartHere />} />
            <Route path="/online/program/:slug" element={<OnlineProgram />} />
            <Route path="/online/about" element={<AppAbout />} />
            <Route path="/online/favourites" element={<ProtectedRoute><Favourites /></ProtectedRoute>} />
            <Route path="/online/class/:id" element={<ProtectedRoute><ClassPlayer /></ProtectedRoute>} />
            <Route path="/online/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/online/live/:sessionId" element={<ProtectedRoute><LiveSession /></ProtectedRoute>} />
            
            {/* Live Session Room - supports guest access via token */}
            <Route path="/live/:sessionId" element={<LiveSessionRoom />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/classes" element={<AdminClasses />} />
            <Route path="/admin/programs" element={<AdminPrograms />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/live-sessions" element={<AdminLiveSessions />} />
            
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/guest-teachers" element={<AdminGuestTeachers />} />
            <Route path="/admin/arc-applications" element={<AdminArcApplications />} />
            <Route path="/admin/event-bookings" element={<AdminEventBookings />} />
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Suspense>
      {/* <CommandPalette /> */}
      <Toaster />
      <Sonner />
    </>
  );
}

export default App;