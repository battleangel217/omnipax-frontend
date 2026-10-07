"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ApiUnreachable, api, getRole, loadTokens, type Role } from "@/lib/api";

/** Route gate. No token → login (with return path), unless the backend
 *  itself is unreachable — then render anyway so offline demo still works. */
export default function RequireAuth({
  roles,
  children,
}: {
  roles?: Role[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    let live = true;
    // Deferred a tick so state updates land in async context.
    void Promise.resolve().then(() => {
      if (!live) return;
      if (!loadTokens()) {
        router.replace(`/login?next=${pathname}`);
        return;
      }
      if (roles && roles.length > 0) {
        const role = getRole();
        if (role && !roles.includes(role)) {
          router.replace(role === "driver" ? "/driver" : "/passenger");
          return;
        }
      }
      setOk(true);
    });
    return () => {
      live = false;
    };
  }, [router, pathname, roles]);

  if (!ok) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-surface">
        <div className="flex items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined animate-spin text-[20px] text-secondary">
            sync
          </span>
          <span className="text-[14px] font-medium">Checking access…</span>
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
