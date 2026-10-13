import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const ACCESS_KEY = "teamo";
const STORE_EMAIL = "tienda@ecoland.app";
const STORE_PASSWORD = "EcolandTienda2026!";

const normalize = (v: string) => v.toLowerCase().replace(/\s+/g, "");

const Auth = () => {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (normalize(key) !== ACCESS_KEY) {
      toast.error("Clave incorrecta");
      return;
    }
    setLoading(true);
    try {
      let { error } = await supabase.auth.signInWithPassword({ email: STORE_EMAIL, password: STORE_PASSWORD });
      if (error) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: STORE_EMAIL,
          password: STORE_PASSWORD,
          options: { data: { full_name: "Ecoland" } },
        });
        if (signUpError) throw signUpError;
        ({ error } = await supabase.auth.signInWithPassword({ email: STORE_EMAIL, password: STORE_PASSWORD }));
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || "No se pudo entrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/30 px-4">
      <Card className="w-full max-w-sm border shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">N</span>
          </div>
          <CardTitle className="text-xl">NovaSystem</CardTitle>
          <CardDescription>Introduce la clave para entrar</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="password"
              autoFocus
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Clave"
              className="text-center text-lg h-12"
            />
            <Button type="submit" className="w-full h-11" disabled={loading || !key}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
