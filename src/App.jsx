
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PaymentProvider } from "./context/PaymentContext";
import Index from "./pages/Index";
import Checkout from "./pages/Checkout";
import PaymentStatus from "./pages/PaymentStatus";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <PaymentProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/payment-status/:id/:status" element={<PaymentStatus />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </PaymentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
