import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-foreground">404</h1>
        <p className="mb-4 text-xl text-foreground/70">Oops! Page not found</p>
        <Link to="/" className="text-[#5B9C9E] underline hover:text-[#5B9C9E]/80 transition-colors">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
