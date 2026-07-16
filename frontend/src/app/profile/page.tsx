"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge, Card, ErrorState, MetricCard, PageIntro, Section } from "@/components/ui";
import { authApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { humanizeValue } from "@/lib/presentation";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
});

const passwordSchema = z.object({
  current_password: z.string().min(8, "Current password is required."),
  new_password: z.string().min(8, "New password must be at least 8 characters."),
  confirm_password: z.string().min(8, "Confirm the new password."),
}).refine((values) => values.new_password === values.confirm_password, { message: "Passwords must match.", path: ["confirm_password"] });

export default function ProfilePage() {
  const { accessToken, status, user, setUser } = useAuth();
  const profileForm = useForm<z.infer<typeof profileSchema>>({ resolver: zodResolver(profileSchema), values: { first_name: user?.first_name ?? "", last_name: user?.last_name ?? "" } });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({ resolver: zodResolver(passwordSchema), defaultValues: { current_password: "", new_password: "", confirm_password: "" } });

  const submitProfile = profileForm.handleSubmit(async (values) => {
    if (!accessToken) return;
    const response = await authApi.updateProfile(accessToken, values);
    setUser(response.data);
  });

  const submitPassword = passwordForm.handleSubmit(async (values) => {
    if (!accessToken) return;
    await authApi.changePassword(accessToken, values);
    passwordForm.reset();
  });

  return (
    <Section>
      <div className="space-y-8">
        <PageIntro eyebrow="Profile settings" title="Update the customer profile and credential controls." description="These forms map directly to the backend profile and password endpoints, including server-side validation handling." />
        {status !== "authenticated" && <ErrorState title="Login required" message="Please sign in to manage profile settings." />}
        {user ? (
          <div className="grid gap-4 lg:grid-cols-3">
            <MetricCard label="Account" value={`${user.first_name} ${user.last_name}`.trim()} detail={user.email} />
            <MetricCard label="Role" value={humanizeValue(user.role)} detail="Role-based access is enforced by the backend permission layer." />
            <MetricCard label="Verification" value={user.is_verified ? "Verified" : "Pending"} detail="Email verification is already wired through the auth flow structure." />
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <Badge tone="accent">Identity</Badge>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Customer profile</p>
            </div>
            <h2 className="text-xl font-semibold">Profile</h2>
            <form className="mt-4 space-y-4" onSubmit={submitProfile}>
              <div><label htmlFor="profile-first-name" className="mb-1 block text-sm font-medium">First name</label><input id="profile-first-name" {...profileForm.register("first_name")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" /></div>
              <div><label htmlFor="profile-last-name" className="mb-1 block text-sm font-medium">Last name</label><input id="profile-last-name" {...profileForm.register("last_name")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" /></div>
              <button type="submit" className="rounded-full bg-[var(--accent)] px-4 py-3 text-white shadow-[0_14px_34px_rgba(159,79,45,0.18)]">Save profile</button>
            </form>
          </Card>
          <Card>
            <div className="mb-5 flex items-center justify-between">
              <Badge tone="accent">Credentials</Badge>
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Password controls</p>
            </div>
            <h2 className="text-xl font-semibold">Change password</h2>
            <form className="mt-4 space-y-4" onSubmit={submitPassword}>
              <div><label htmlFor="current-password" className="mb-1 block text-sm font-medium">Current password</label><input id="current-password" type="password" {...passwordForm.register("current_password")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" /></div>
              <div><label htmlFor="next-password" className="mb-1 block text-sm font-medium">New password</label><input id="next-password" type="password" {...passwordForm.register("new_password")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" /></div>
              <div><label htmlFor="confirm-next-password" className="mb-1 block text-sm font-medium">Confirm password</label><input id="confirm-next-password" type="password" {...passwordForm.register("confirm_password")} className="w-full rounded-full border border-[color:var(--border-strong)] bg-white px-4 py-3" /></div>
              <button type="submit" className="rounded-full border border-stone-900 px-4 py-3 text-stone-900 hover:-translate-y-0.5">Update password</button>
            </form>
          </Card>
        </div>
      </div>
    </Section>
  );
}
