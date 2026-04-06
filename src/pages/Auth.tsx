import { Suspense, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthSignInModal } from "@/components/AuthSignInModal";
import { SubscriptionModal } from "@/components/modals/LazyModals";

const Auth = () => {
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Suspense fallback={null}>
        <SubscriptionModal
          open={showSubscriptionModal}
          onClose={() => setShowSubscriptionModal(false)}
        />
      </Suspense>
      <AuthSignInModal
        open={true}
        onClose={() => navigate("/")}
        onSuccess={() => navigate("/online")}
        footerVariant="signup"
        onOpenSubscription={() => setShowSubscriptionModal(true)}
      />
    </>
  );
};

export default Auth;
