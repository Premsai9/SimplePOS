import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import POS from "@/pages/pos";
import TransactionHistory from "@/pages/transactions";

function Router() {
  return (
    <Switch>
      <Route path="/" component={POS} />
      <Route path="/pos" component={POS} />
      <Route path="/transactions" component={TransactionHistory} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <>
      <Router />
      <Toaster />
    </>
  );
}

export default App;
